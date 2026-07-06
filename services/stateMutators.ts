import { GameState, Player, Card, Unit } from '@/types';
import { WIN_DAMAGE } from '@/utils/constants';
import { calculatePlayerGold } from '@/utils/gameUtils';

/**
 * Pure helper to convert a Unit back to a standard Card representation
 */
export const unitToCard = (unit: Unit): Card => {
  const { 
    speed, position, 
    hasMoved, boosterCard, boosterCards, stackedAttackers, ...card 
  } = unit;
  return { ...card, baseDamage: unit.baseDamage, currentDamage: unit.currentDamage };
};

/**
 * Atomic State Mutators
 * These functions take a GameState and return a new GameState with a specific, isolated change.
 * They are designed to be composed together to form complex game actions.
 */

export const addLog = (state: GameState, message: string): GameState => {
  const playerName = state.players[state.currentPlayerId]?.name || 'Game';
  return { 
    ...state, 
    log: [`[${playerName}] ${message}`, ...state.log.slice(0, 9)] 
  };
};

export const spendAction = (state: GameState, cost: number = 1): GameState => {
  return { 
    ...state, 
    actionsRemaining: Math.max(0, state.actionsRemaining - cost),
    selectedCardIdInHand: null,
    selectedUnitIdOnBoard: null,
    isTargeting: null
  };
};

export const updatePlayer = (state: GameState, playerId: number, updates: Partial<Player>): GameState => {
  const players = state.players.map(p => p.id === playerId ? { ...p, ...updates } : p);
  return { ...state, players };
};

export const removeCardFromHand = (state: GameState, playerId: number, cardId: string): GameState => {
  const player = state.players[playerId];
  if (!player) return state;
  const hand = player.hand.filter(c => c.id !== cardId);
  return updatePlayer(state, playerId, { hand });
};

export const addCardToDiscard = (state: GameState, playerId: number, card: Card): GameState => {
  const player = state.players[playerId];
  if (!player) return state;
  const discard = [...player.discard, card];
  return updatePlayer(state, playerId, { discard });
};

export const addCardToScored = (state: GameState, playerId: number, card: Card): GameState => {
  const player = state.players[playerId];
  if (!player) return state;
  const scored = [...player.scored, card];
  return updatePlayer(state, playerId, { scored });
};

export const placeUnitOnBoard = (state: GameState, row: number, col: number, unit: Unit | null): GameState => {
  const board = state.board.map((r, rIdx) => 
    r.map((c, cIdx) => (rIdx === row && cIdx === col) ? unit : c)
  );
  return { ...state, board };
};

export const selectCardInHand = (state: GameState, cardId: string | null): GameState => {
  return {
    ...state,
    selectedCardIdInHand: cardId,
    selectedUnitIdOnBoard: null
  };
};

export const selectUnitOnBoard = (state: GameState, unitId: string | null): GameState => {
  return {
    ...state,
    selectedUnitIdOnBoard: unitId,
    selectedCardIdInHand: null
  };
};

export const setGameMode = (state: GameState, gameMode: GameState['gameMode']): GameState => {
  return { ...state, gameMode };
};

export const setTargeting = (state: GameState, isTargeting: GameState['isTargeting']): GameState => {
  return { ...state, isTargeting };
};

export const updateKingMoveState = (
  state: GameState, 
  updates: Partial<NonNullable<GameState['kingMoveState']>> | null
): GameState => {
  if (updates === null) {
    return { ...state, kingMoveState: null };
  }
  const currentKingState = state.kingMoveState || {
    isMoving: false,
    unitsToMove: [],
    movedUnits: [],
    selectedUnitId: null
  };
  return {
    ...state,
    kingMoveState: { ...currentKingState, ...updates }
  };
};

export const checkForWinner = (state: GameState): GameState => {
  const player1 = state.players[0];
  const player2 = state.players[1];
  
  if (!player1 || !player2) return state;

  const target = state.winTarget || WIN_DAMAGE;

  const isGameOverTriggered = 
    player2.damage >= target || 
    player1.damage >= target ||
    (player1.deck.length === 0 && player1.hand.length === 0) ||
    (player2.deck.length === 0 && player2.hand.length === 0);

  if (isGameOverTriggered) {
    const gold1 = calculatePlayerGold(player1, state.board);
    const gold2 = calculatePlayerGold(player2, state.board);

    let winner: Player;
    const becauseOfCards = (player1.deck.length === 0 && player1.hand.length === 0) || (player2.deck.length === 0 && player2.hand.length === 0);

    const p1ReachedTarget = player1.damage >= target;
    const p2ReachedTarget = player2.damage >= target;

    if (p1ReachedTarget && !p2ReachedTarget) {
      winner = player2;
    } else if (p2ReachedTarget && !p1ReachedTarget) {
      winner = player1;
    } else {
      // End due to lack of cards, or both (unlikely) reached target: determine by gold
      if (gold1.total > gold2.total) {
        winner = player1;
      } else if (gold2.total > gold1.total) {
        winner = player2;
      } else {
        // Tie in gold, use damage / standard fallback
        let standardWinner = player1;
        if (player1.damage > player2.damage) {
          // Player 1 has more damage (i.e. has suffered more damage, so player 2 wins)
          standardWinner = player2;
        } else if (player2.damage > player1.damage) {
          standardWinner = player1;
        } else {
          // Tied in damage, the one with remaining cards wins, otherwise player 1
          const p1OutOfCards = player1.deck.length === 0 && player1.hand.length === 0;
          standardWinner = p1OutOfCards ? player2 : player1;
        }
        winner = standardWinner;
      }
    }

    const loser = state.players.find(p => p.id !== winner.id)!;
    const isWinnerP1 = winner.id === player1.id;
    const wGoldDetails = isWinnerP1 ? gold1 : gold2;
    const lGoldDetails = isWinnerP1 ? gold2 : gold1;

    let winnerBonusGold = 0;
    let loserBonusGold = 0;
    let bonusReason = '';

    if (state.gameType === 'ai') {
      if (winner.id === 0) { // Human won against AI
        if (state.aiDifficulty === 'easy') {
          winnerBonusGold = 50;
          bonusReason = ' (Bono Victoria IA Fácil +50)';
        } else if (state.aiDifficulty === 'hard') {
          winnerBonusGold = 70;
          bonusReason = ' (Bono Victoria IA Difícil +70)';
        }
      }
    } else if (state.gameType === 'adventure') {
      if (winner.id === 0) { // Human won Campaign level
        const level = state.storyLevel || state.hostedPortalLevel || 1;
        winnerBonusGold = 100 + level * 30;
        bonusReason = ` (Bono Victoria Campaña Nvl ${level} +${winnerBonusGold})`;
      }
    } else if (state.gameType === 'online') {
      // Betting >100 gold -> let's make it a 100 gold bet
      winnerBonusGold = 100;
      loserBonusGold = -100;
      bonusReason = ' (Apuesta Multijugador +100)';
    }

    const netWinnerGold = wGoldDetails.total + winnerBonusGold;
    const netLoserGold = lGoldDetails.total + loserBonusGold;

    const endReason = becauseOfCards 
      ? `Falta de cartas` 
      : `Límite de daño alcanzado (${player2.damage >= target ? player2.name : player1.name} llegó a ${target} de daño)`;

    const winTypeStr = becauseOfCards ? "GANA POR ORO" : "GANA LA BATALLA";
    const logMsg = `¡Fin de la batalla! (${endReason}) ¡${winner.name} ${winTypeStr}! Oros de ${winner.name}: ${netWinnerGold}${bonusReason}. Oros de ${loser.name}: ${netLoserGold}${state.gameType === 'online' ? ' (Apuesta Multijugador -100)' : ''}.`;

    return { 
      ...state, 
      winner, 
      gameMode: 'game_over', 
      winnerGold: netWinnerGold,
      loserGold: netLoserGold,
      winnerGoldDetails: { 
        conserved: wGoldDetails.conservedCount, 
        effects: wGoldDetails.effectsCount,
        jokers: wGoldDetails.conservedJokersCount,
        kings: wGoldDetails.conservedKingsCount,
        bonus: winnerBonusGold
      },
      loserGoldDetails: { 
        conserved: lGoldDetails.conservedCount, 
        effects: lGoldDetails.effectsCount,
        jokers: lGoldDetails.conservedJokersCount,
        kings: lGoldDetails.conservedKingsCount,
        bonus: loserBonusGold
      },
      log: [...state.log, logMsg]
    };
  }
  
  return state;
};
