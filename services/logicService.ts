import { GameState, Action, Player, Card, CardColor, Unit, Rank } from '../types';
import { BOARD_ROWS, BOARD_COLS, INITIAL_ACTIONS, INITIAL_DRAW, WIN_DAMAGE } from '../constants';
import { createDeck, createUnitFromCard, getValidMoves, getKingValidMoves } from './gameService';

// #region Core Helpers
const addLog = (state: GameState, message: string): GameState => {
    const playerName = state.players[state.currentPlayerId]?.name || 'Game';
    return { ...state, log: [`[${playerName}] ${message}`, ...state.log.slice(0, 9)] };
};

const spendAction = (state: GameState, cost: number = 1): GameState => {
    return { 
        ...state, 
        actionsRemaining: state.actionsRemaining - cost,
        selectedCardIdInHand: null,
        selectedUnitIdOnBoard: null,
        isTargeting: null
    };
};

const checkForWinner = (state: GameState): GameState => {
    const opponent = state.players[1 - state.currentPlayerId];
    if (opponent && opponent.damage >= WIN_DAMAGE) {
        return { ...state, winner: state.players[state.currentPlayerId], gameMode: 'game_over' };
    }
    const currentPlayer = state.players[state.currentPlayerId];
     if (currentPlayer && currentPlayer.damage >= WIN_DAMAGE) {
        return { ...state, winner: state.players[1-state.currentPlayerId], gameMode: 'game_over' };
    }
    return state;
};

const updatePlayer = (players: Player[], playerId: number, updates: Partial<Player>): Player[] => {
    return players.map(p => p.id === playerId ? { ...p, ...updates } : p);
};

const unitToCard = (unit: Unit): Card => {
    const { 
        baseDamage, currentDamage, speed, position, 
        hasMoved, boosterCard, stackedAttackers, ...card 
    } = unit;
    return card;
};

// #endregion

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
            return {...unit, hasMoved: false};
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
    if(!currentPlayer) return state;

    const startRow = state.currentPlayerId === 0 ? BOARD_ROWS - 1 : 0;
    const cardInHand = currentPlayer.hand.find(c => c.id === state.selectedCardIdInHand);

    if (!cardInHand || state.board[row][col] || row !== startRow) {
        return { ...state, selectedCardIdInHand: null }; // Invalid placement, deselect card
    }

    const newUnit = createUnitFromCard(cardInHand, { row, col });
    if (!newUnit) return state;

    const newBoard = state.board.map((r, rIndex) => r.map((c, cIndex) => (rIndex === row && cIndex === col) ? newUnit : c));
    const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
    const newPlayers = updatePlayer(state.players, state.currentPlayerId, { hand: newHand });

    const withActionSpent = spendAction({ ...state, board: newBoard, players: newPlayers });
    return addLog(withActionSpent, `Placed ${cardInHand.rank} of ${cardInHand.suit}.`);
};

const handleCombat = (state: GameState, attacker: Unit, defender: Unit): GameState => {
    const newBoard = state.board.map(r => r.map(c => c));
    let players = [...state.players];
    
    const attackerOwner = players.find(p => p.color === attacker.color);
    const defenderOwner = players.find(p => p.color === defender.color);
    if (!attackerOwner || !defenderOwner) return state; // Guard

    let attackerDiscard = [...attackerOwner.discard];
    let defenderDiscard = [...defenderOwner.discard];
    let logMsg = `ATTACK! ${attacker.rank} vs ${defender.rank}.`;

    if (attacker.baseDamage > defender.baseDamage) {
        logMsg += ` Both units destroyed!`;
        attackerDiscard.push(unitToCard(attacker));
        defenderDiscard.push(unitToCard(defender));
        defenderDiscard.push(...defender.stackedAttackers); // Stacked attackers go to defender's discard
        newBoard[defender.position.row][defender.position.col] = null;
    } else {
        const newDefender = {
          ...defender,
          currentDamage: defender.currentDamage - attacker.baseDamage,
          stackedAttackers: [...defender.stackedAttackers, unitToCard(attacker)], // Attacker becomes a stacked card
        };
        logMsg += ` ${defender.rank} takes ${attacker.baseDamage} damage.`;

        if (newDefender.currentDamage <= 0) {
            logMsg += ` Defender destroyed!`;
            defenderDiscard.push(unitToCard(newDefender));
            defenderDiscard.push(...newDefender.stackedAttackers); // Stacked attackers go to defender's discard
            newBoard[defender.position.row][defender.position.col] = null;
        } else {
            newBoard[defender.position.row][defender.position.col] = newDefender;
        }
    }
    
    players = updatePlayer(players, attackerOwner.id, { discard: attackerDiscard });
    players = updatePlayer(players, defenderOwner.id, { discard: defenderDiscard });

    return addLog({ ...state, board: newBoard, players: players }, logMsg);
};

export const moveUnit = (state: GameState, payload: { to: { row: number; col: number } }): GameState => {
    if (state.actionsRemaining <= 0 || !state.selectedUnitIdOnBoard) return state;
    
    const attacker = state.board.flat().find(u => u?.id === state.selectedUnitIdOnBoard);
    const currentPlayer = state.players[state.currentPlayerId];
    if (!attacker || !currentPlayer) return state;

    const { row: toRow, col: toCol } = payload.to;
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
         return addLog({ ...state, isTargeting: rank.toLowerCase() as 'joker' | 'queen' | 'jack', selectedCardIdInHand: card.id }, `Select a target for ${card.rank}.`);
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

export const useAbilityOnTarget = (state: GameState, payload: { targetUnit: Unit }): GameState => {
    if (!state.isTargeting || !state.selectedCardIdInHand) return state;

    const currentPlayer = state.players[state.currentPlayerId];
    const opponentPlayer = state.players[1 - state.currentPlayerId];
    if (!currentPlayer || !opponentPlayer) return state;

    const cardInHand = currentPlayer.hand.find(c => c.id === state.selectedCardIdInHand);
    if (!cardInHand) return state;

    const { targetUnit } = payload;
    const newBoard = state.board.map(r => r.map(c => c));
    const unitOnBoard = newBoard[targetUnit.position.row]?.[targetUnit.position.col];
    if (!unitOnBoard) return state;

    let logMsg = '';
    let players = [...state.players];
    let currentPlayerDiscard = [...currentPlayer.discard];
    let opponentPlayerDiscard = [...opponentPlayer.discard];

    switch(state.isTargeting) {
        case 'joker':
            if (unitOnBoard.color === currentPlayer.color) return state; // Must target enemy
            opponentPlayerDiscard.push(unitToCard(unitOnBoard));
            currentPlayerDiscard.push(...unitOnBoard.stackedAttackers);
            newBoard[targetUnit.position.row][targetUnit.position.col] = null;
            logMsg = `JOKER eliminated ${targetUnit.rank}.`;
            break;
        case 'queen':
            if (unitOnBoard.color !== currentPlayer.color) return state; // Must be friendly
            if (unitOnBoard.currentDamage >= unitOnBoard.baseDamage) return state; // Must be damaged
            const healedUnit = { ...unitOnBoard, currentDamage: unitOnBoard.baseDamage, stackedAttackers: [] };
            newBoard[targetUnit.position.row][targetUnit.position.col] = healedUnit;
            opponentPlayerDiscard.push(...unitOnBoard.stackedAttackers);
            logMsg = `QUEEN healed ${targetUnit.rank}.`;
            break;
        case 'jack':
            if (unitOnBoard.color !== currentPlayer.color || unitOnBoard.boosterCard) return state; // Must be friendly, not boosted
            const boostedUnit = { ...unitOnBoard, boosterCard: cardInHand };
            newBoard[targetUnit.position.row][targetUnit.position.col] = boostedUnit;
            logMsg = `JACK boosted ${targetUnit.rank}.`;
            break;
    }

    if(logMsg){
        const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
        if(state.isTargeting !== 'jack') {
            currentPlayerDiscard.push(cardInHand);
        }
        players = updatePlayer(players, currentPlayer.id, { hand: newHand, discard: currentPlayerDiscard });
        players = updatePlayer(players, opponentPlayer.id, { discard: opponentPlayerDiscard });
        const withActionSpent = spendAction({ ...state, board: newBoard, players });
        return addLog(withActionSpent, logMsg);
    }
    
    return { ...state, isTargeting: null, selectedCardIdInHand: null }; 
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

    const defender = state.board[toRow][toCol];
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