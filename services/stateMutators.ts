import { GameState, Player, Card, Unit } from '@/types';
import { WIN_DAMAGE } from '@/utils/constants';

/**
 * Pure helper to convert a Unit back to a standard Card representation
 */
export const unitToCard = (unit: Unit): Card => {
  const { 
    speed, position, 
    hasMoved, boosterCard, stackedAttackers, ...card 
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

  // Rule: A player wins when their opponent accumulates target or more points of damage.
  if (player2.damage >= target) {
    return { ...state, winner: player1, gameMode: 'game_over' };
  }
  if (player1.damage >= target) {
    return { ...state, winner: player2, gameMode: 'game_over' };
  }
  
  return state;
};
