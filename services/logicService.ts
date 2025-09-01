import { GameState, Action, Player, Card, CardColor, Unit, Rank } from '@/models/types';
import { BOARD_ROWS, BOARD_COLS, INITIAL_ACTIONS, INITIAL_DRAW } from '@/utils/constants';
import { createDeck, createUnitFromCard, getValidMoves, getKingValidMoves } from './gameService';
import logger from '@/utils/logger';
import { applyQueenAbility, applyJokerAbility, applyJackAbility } from '../effects/cardEffects';
import { addLog, spendAction, checkForWinner, updatePlayer, unitToCard } from './coreLogic';
import { handleCombat } from './combatService';

// #region Action Logic
export const startGame = (initialState: GameState, payload: { gameType: 'ai' | 'p2' }): GameState => {
    const { gameType } = payload;
    const blackDeck = createDeck(CardColor.Black);
    const redDeck = createDeck(CardColor.Red);

    let player1: Player = { id: 0, name: 'Player 1 (Black)', color: CardColor.Black, damage: 0, deck: [], hand: [], discard: [], scored: [] };
    let player2: Player = { id: 1, name: gameType === 'ai' ? 'AI Opponent (Red)' : 'Player 2 (Red)', color: CardColor.Red, damage: 0, deck: [], hand: [], discard: [], scored: [] };

    player1.deck = blackDeck;
    player2.deck = redDeck;

    for(let i=0; i < INITIAL_DRAW; i++) {
        if(player1.deck.length > 0) player1.hand.push(player1.deck.pop()!);
        if(player2.deck.length > 0) player2.hand.push(player2.deck.pop()!);
    }

    return {
        ...initialState,
        board: Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null)),
        players: [player1, player2],
        currentPlayerId: 0,
        actionsRemaining: INITIAL_ACTIONS,
        log: ["Game started! Player 1's turn."],
        gameMode: 'playing' as const,
        gameType,
    };
};

export const beginNewTurn = (state: GameState): GameState => {
    const nextPlayerId = 1 - state.currentPlayerId;
    const nextPlayer = state.players[nextPlayerId];
    if (!nextPlayer) return state;

    const newBoard = state.board.map(row => row.map(unit => {
        if (!unit) return null;
        // Reset hasMoved for the new current player's units
        if (unit.color === nextPlayer.color) {
            return {...unit, hasMoved: false };
        }
        return unit;
    }));
    
    let intermediateState: GameState = {
        ...state,
        gameMode: 'playing',
        board: newBoard,
        currentPlayerId: nextPlayerId,
        actionsRemaining: INITIAL_ACTIONS,
        selectedCardIdInHand: null,
        selectedUnitIdOnBoard: null,
        isTargeting: null,
    };
    return addLog(intermediateState, `Turn Start.`);
};

export const endTurn = (state: GameState): GameState => {
    if (state.kingMoveState?.isMoving) return state; // Can't end turn during King move
    if (state.gameType === 'p2') {
        return { ...state, gameMode: 'switch_turn' };
    }
    return beginNewTurn(state);
};

export const selectCardInHand = (state: GameState, payload: { cardId: string | null }): GameState => {
  if (state.actionsRemaining <= 0 || state.isTargeting || state.kingMoveState?.isMoving) {
      if(payload.cardId !== null) return state;
  }
  return {
    ...state,
    selectedCardIdInHand: payload.cardId,
    selectedUnitIdOnBoard: null
  };
};

export const selectUnitOnBoard = (state: GameState, payload: { unitId: string | null }): GameState => {
    // During king move, selection logic is different
    if (state.kingMoveState?.isMoving) {
      if (!payload.unitId) { // Deselecting
          return { ...state, kingMoveState: {...state.kingMoveState, selectedUnitId: null}, selectedUnitIdOnBoard: null };
      }
      const unit = state.board.flat().find(u => u?.id === payload.unitId);
      // Can only select a unit that has not yet been moved by the king
      if (unit && state.kingMoveState.unitsToMove.includes(unit.id)) {
        return { 
          ...state,
          selectedUnitIdOnBoard: payload.unitId,
          kingMoveState: {...state.kingMoveState, selectedUnitId: payload.unitId }
        };
      }
      return state; // Invalid selection during king move
    }
    
    if (state.actionsRemaining <= 0 || state.isTargeting) {
        if(payload.unitId !== null) return state;
    }
    
    if (payload.unitId === null) {
        return { ...state, selectedUnitIdOnBoard: null };
    }
    
    const unit = state.board.flat().find(u => u?.id === payload.unitId);
    if (!unit || unit.hasMoved || unit.color !== state.players[state.currentPlayerId]?.color) {
        return state;
    }
    return {
        ...state,
        selectedUnitIdOnBoard: state.selectedUnitIdOnBoard === payload.unitId ? null : payload.unitId,
        selectedCardIdInHand: null,
    };
};

export const placeUnit = (state: GameState, payload: { row: number, col: number }): GameState => {
    const { row, col } = payload;
    if (state.actionsRemaining <= 0 || !state.selectedCardIdInHand || state.kingMoveState?.isMoving) return state;

    const currentPlayer = state.players[state.currentPlayerId];
    if (!currentPlayer) return state;

    const startRow = state.currentPlayerId === 0 ? BOARD_ROWS - 1 : 0;
    if (row !== startRow) {
        return addLog({ ...state, selectedCardIdInHand: null }, "Can only place units in your start zone.");
    }

    const cardInHand = currentPlayer.hand.find(c => c.id === state.selectedCardIdInHand);
    if (!cardInHand) return state;

    const newUnit = createUnitFromCard(cardInHand, { row, col });
    if (!newUnit) return state; // Should only fail for special cards, which is handled elsewhere

    const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
    const playersWithCardRemoved = updatePlayer(state.players, state.currentPlayerId, { hand: newHand });

    const targetCell = state.board[row][col];

    // Case 1: Cell is empty
    if (!targetCell) {
        const newBoard = state.board.map((r, rIndex) => r.map((c, cIndex) => (rIndex === row && cIndex === col) ? newUnit : c));
        const withActionSpent = spendAction({ ...state, board: newBoard, players: playersWithCardRemoved });
        return addLog(withActionSpent, `Placed ${cardInHand.rank} of ${cardInHand.suit}.`);
    }

    // Case 2: Cell is occupied by an enemy
    if (targetCell.color !== currentPlayer.color) {
        const intermediateState = { ...state, players: playersWithCardRemoved };
        // Temporarily place the attacker for combat calculation, handleCombat will manage board state
        const postCombatState = handleCombat(intermediateState, newUnit, targetCell);
        // After combat, the attacker (newUnit) is either discarded or stacked, so we don't place it on the board again.
        // We just need to remove it from hand.
        return spendAction(postCombatState);
    }
    
    // Case 3: Cell is occupied by a friendly unit
    return addLog({ ...state, selectedCardIdInHand: null }, "Cannot place a unit on a friendly unit.");
};

export const moveUnit = (state: GameState, payload: { to: { row: number; col: number } }): GameState => {
    if (state.actionsRemaining <= 0 || !state.selectedUnitIdOnBoard) return state;
    
    const attacker = state.board.flat().find(u => u?.id === state.selectedUnitIdOnBoard);
    const currentPlayer = state.players[state.currentPlayerId];
    if (!attacker || !currentPlayer) return state;

    const { row: toRow, col: toCol } = payload.to;

    // Handle direct scoring move
    if (toRow === -1 && toCol === -1) {
        const validMoves = getValidMoves(attacker, state.board, currentPlayer.id);
        if (validMoves.some(m => m.row === -1 && m.col === -1)) {
            // This is a valid scoring move, so we will treat it as such.
            const newBoard = state.board.map(r => r.map(c => c?.id === attacker.id ? null : c));
            const opponentPlayer = state.players[1 - state.currentPlayerId];
            if (!opponentPlayer) return state;

            const newOpponentDamage = opponentPlayer.damage + attacker.currentDamage;
            const newScored = [...currentPlayer.scored, unitToCard(attacker)];

            let players = updatePlayer(state.players, opponentPlayer.id, { damage: newOpponentDamage });
            players = updatePlayer(players, currentPlayer.id, { scored: newScored });
            
            let postState = { ...state, board: newBoard, players };
            postState = checkForWinner(postState);
            const withActionSpent = spendAction(postState);
            return addLog(withActionSpent, `TOUCHDOWN! ${attacker.rank} scores ${attacker.currentDamage} damage directly!`);
        }
    }

    const defender = state.board[toRow]?.[toCol];

    const validMoves = getValidMoves(attacker, state.board, currentPlayer.id);
    if (!validMoves.some(m => m.row === toRow && m.col === toCol)) {
        return { ...state, selectedUnitIdOnBoard: null };
    }
    
    const newBoard = state.board.map(r => r.map(c => c));
    newBoard[attacker.position.row][attacker.position.col] = null;

    let attackerUnit = { ...attacker, hasMoved: true };
    let players = [...state.players];

    if (attackerUnit.boosterCard) {
        const newDiscard = [...currentPlayer.discard, attackerUnit.boosterCard];
        players = updatePlayer(players, currentPlayer.id, { discard: newDiscard });
        attackerUnit.boosterCard = null;
    }
    
    let intermediateState = { ...state, board: newBoard, players };

    if (defender && defender.color !== attacker.color) {
        const postCombatState = handleCombat(intermediateState, attackerUnit, defender);
        return spendAction(postCombatState);
    } else {
        newBoard[toRow][toCol] = { ...attackerUnit, position: { row: toRow, col: toCol } };
        const withActionSpent = spendAction({ ...intermediateState, board: newBoard });
        return addLog(withActionSpent, `Moved ${attacker.rank} to ${toRow},${toCol}.`);
    }
};

export const scoreUnit = (state: GameState): GameState => {
    if (!state.selectedUnitIdOnBoard || state.actionsRemaining <= 0) return state;

    const unit = state.board.flat().find(u => u?.id === state.selectedUnitIdOnBoard);
    const currentPlayer = state.players[state.currentPlayerId];
    const opponentPlayer = state.players[1 - state.currentPlayerId];

    if (!unit || !currentPlayer || !opponentPlayer) return state;

    const goalRow = state.currentPlayerId === 0 ? 0 : BOARD_ROWS - 1;
    if (unit.position.row !== goalRow) return state;

    const newOpponentDamage = opponentPlayer.damage + unit.currentDamage;
    const newScored = [...currentPlayer.scored, unitToCard(unit)];

    let players = updatePlayer(state.players, opponentPlayer.id, { damage: newOpponentDamage });
    players = updatePlayer(players, currentPlayer.id, { scored: newScored });
    
    const newBoard = state.board.map(r => r.map(c => c?.id === unit.id ? null : c));

    let postState = { ...state, board: newBoard, players };
    postState = checkForWinner(postState);
    const withActionSpent = spendAction(postState);
    return addLog(withActionSpent, `TOUCHDOWN! ${unit.rank} scores ${unit.currentDamage} damage!`);
};

export const drawCard = (state: GameState): GameState => {
    if (state.actionsRemaining <= 0) return state;

    const currentPlayer = state.players[state.currentPlayerId];
    if (!currentPlayer) {
        return state;
    }
    
    if (currentPlayer.deck.length === 0) {
        return addLog(state, 'Deck is empty!');
    }

    const newDeck = [...currentPlayer.deck];
    const drawnCard = newDeck.pop()!;
    const newHand = [...currentPlayer.hand, drawnCard];
    
    const newPlayers = updatePlayer(state.players, state.currentPlayerId, {
        deck: newDeck,
        hand: newHand,
    });

    const withActionSpent = spendAction({ ...state, players: newPlayers });
    return addLog(withActionSpent, 'Drew a card.');
};

export const playSpecialCard = (state: GameState, payload: { card: Card }): GameState => {
    logger.info({ timestamp: new Date().toISOString(), event: 'playSpecialCard', card: payload.card.rank });
    if (state.actionsRemaining <= 0 || state.kingMoveState?.isMoving) return state;
    const { card } = payload;
    const rank = card.rank;
    
    const currentPlayer = state.players[state.currentPlayerId];
    if(!currentPlayer) return state;
    const opponentPlayer = state.players[1 - state.currentPlayerId];

    if (rank === 'A') {
        if (!opponentPlayer) return state;
        const newHand = currentPlayer.hand.filter(c => c.id !== card.id);
        const newScored = [...currentPlayer.scored, card];
        let players = updatePlayer(state.players, currentPlayer.id, { hand: newHand, scored: newScored });
        players = updatePlayer(players, opponentPlayer.id, { damage: opponentPlayer.damage + 1 });
        let postState = { ...state, players };
        postState = checkForWinner(postState);
        const withActionSpent = spendAction(postState);
        return addLog(withActionSpent, 'ACE played! 1 direct damage to opponent.');
    }
    
    if (rank === 'Joker' || rank === 'Q' || rank === 'J') {
        logger.info({ timestamp: new Date().toISOString(), event: 'playSpecialCard:set_targeting', card: rank });
        const targetingRank = rank === 'J' ? 'jack' : rank === 'Q' ? 'queen' : 'joker';
        return addLog({ ...state, isTargeting: targetingRank, selectedCardIdInHand: card.id }, `Select a target for ${card.rank}.`);
    }

    if (rank === 'K') {
        const unitsOnBoard = state.board.flat().filter((u): u is Unit => u?.color === currentPlayer.color);
        if (unitsOnBoard.length === 0) {
            return addLog(state, "King has no units to command!");
        }

        const newHand = currentPlayer.hand.filter(c => c.id !== card.id);
        const newDiscard = [...currentPlayer.discard, card];
        const players = updatePlayer(state.players, currentPlayer.id, { hand: newHand, discard: newDiscard });
        
        const kingState = {
            isMoving: true,
            unitsToMove: unitsOnBoard.map(u => u.id),
            movedUnits: [],
            selectedUnitId: null
        };
        
        const withActionSpent = spendAction({ ...state, players, kingMoveState: kingState });
        return addLog(withActionSpent, "KING's Command! Move your units.");
    }

    return state;
};

export const useAbilityOnTarget = (state: GameState, payload: { unitId: string }): GameState => {
    logger.info({ timestamp: new Date().toISOString(), event: 'useAbilityOnTarget', targeting: state.isTargeting, unitId: payload.unitId });
    if (!state.isTargeting || !state.selectedCardIdInHand) return state;

    const currentPlayer = state.players[state.currentPlayerId];
    const opponentPlayer = state.players[1 - state.currentPlayerId];
    if (!currentPlayer || !opponentPlayer) return state;

    const cardInHand = currentPlayer.hand.find(c => c.id === state.selectedCardIdInHand);
    if (!cardInHand) {
        logger.error({ timestamp: new Date().toISOString(), event: 'useAbilityOnTarget:error', reason: 'Card not in hand' });
        return state;
    }

    const { unitId } = payload;
    const unitOnBoard = state.board.flat().find(u => u?.id === unitId);
    if (!unitOnBoard) {
        logger.error({ timestamp: new Date().toISOString(), event: 'useAbilityOnTarget:error', reason: 'Target unit not on board' });
        return state;
    }

    const deps = { addLog, spendAction, updatePlayer, unitToCard };

    switch (state.isTargeting) {
        case 'queen':
            return applyQueenAbility(state, cardInHand, unitOnBoard, currentPlayer, opponentPlayer, deps);
        case 'joker':
            return applyJokerAbility(state, cardInHand, unitOnBoard, currentPlayer, opponentPlayer, deps);
        case 'jack':
            return applyJackAbility(state, cardInHand, unitOnBoard, currentPlayer, deps);
        default:
            return { ...state, isTargeting: null, selectedCardIdInHand: null };
    }
};

export const moveUnitDuringKingEffect = (state: GameState, payload: { to: { row: number, col: number } }): GameState => {
    const { kingMoveState } = state;
    if (!kingMoveState?.isMoving || !kingMoveState.selectedUnitId) return state;

    const attacker = state.board.flat().find(u => u?.id === kingMoveState.selectedUnitId);
    if (!attacker) return state;
    
    const validMoves = getKingValidMoves(attacker, state.board);
    const { row: toRow, col: toCol } = payload.to;
    if (!validMoves.some(m => m.row === toRow && m.col === toCol)) {
        return state; // Invalid move
    }

    const defender = state.board[toRow]?.[toCol];
    let newBoard = state.board.map(r => r.map(c => c));
    newBoard[attacker.position.row][attacker.position.col] = null;

    let postState: GameState;
    if (defender) { // Combat
        postState = handleCombat({ ...state, board: newBoard }, attacker, defender);
    } else { // Simple move
        newBoard[toRow][toCol] = { ...attacker, position: { row: toRow, col: toCol } };
        postState = { ...state, board: newBoard };
    }

    const newKingState = {
        ...kingMoveState,
        unitsToMove: kingMoveState.unitsToMove.filter(id => id !== attacker.id),
        movedUnits: [...kingMoveState.movedUnits, attacker.id],
        selectedUnitId: null
    };

    if (newKingState.unitsToMove.length === 0) {
        return finishKingMove({ ...postState, kingMoveState: newKingState, selectedUnitIdOnBoard: null });
    }
    
    return { ...postState, kingMoveState: newKingState, selectedUnitIdOnBoard: null };
};

export const finishKingMove = (state: GameState): GameState => {
    const { kingMoveState } = state;
    if (!kingMoveState) return state;

    const unmovedIds = kingMoveState.unitsToMove;
    if (unmovedIds.length === 0) {
        return addLog({ ...state, kingMoveState: null }, "King's command complete.");
    }
    
    let newBoard = state.board.map(r => r.map(c => c));
    let currentPlayer = state.players[state.currentPlayerId];
    let newDiscard = [...currentPlayer.discard];

    const unmovedUnits = newBoard.flat().filter(u => u && unmovedIds.includes(u.id)) as Unit[];
    for (const unit of unmovedUnits) {
        newBoard[unit.position.row][unit.position.col] = null;
        newDiscard.push(unitToCard(unit));
        newDiscard.push(...unit.stackedAttackers);
    }

    const newPlayers = updatePlayer(state.players, currentPlayer.id, { discard: newDiscard });

    return addLog({
        ...state,
        board: newBoard,
        players: newPlayers,
        kingMoveState: null,
        selectedUnitIdOnBoard: null
    }, `King discarded ${unmovedUnits.length} unmoved unit(s).`);
};
// #endregion