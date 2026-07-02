import { GameState } from '@/types';
import * as mutators from '../stateMutators';

export const selectCardInHand = (state: GameState, payload: { cardId: string | null }): GameState => {
  if (state.actionsRemaining <= 0 || state.isTargeting || state.kingMoveState?.isMoving) {
    if (payload.cardId !== null) return state;
  }
  return mutators.selectCardInHand(state, payload.cardId);
};

export const selectUnitOnBoard = (state: GameState, payload: { unitId: string | null }): GameState => {
  // During king move, selection logic is different
  if (state.kingMoveState?.isMoving) {
    if (!payload.unitId) { // Deselecting
      return mutators.updateKingMoveState(
        mutators.selectUnitOnBoard(state, null), 
        { selectedUnitId: null }
      );
    }
    
    const unit = state.board.flat().find(u => u?.id === payload.unitId);
    // Can only select a unit that has not yet been moved by the king
    if (unit && state.kingMoveState.unitsToMove.includes(unit.id)) {
      return mutators.updateKingMoveState(
        mutators.selectUnitOnBoard(state, payload.unitId),
        { selectedUnitId: payload.unitId }
      );
    }
    return state; // Invalid selection during king move
  }

  if (state.actionsRemaining <= 0 || state.isTargeting) {
    if (payload.unitId !== null) return state;
  }

  if (payload.unitId === null) {
    return mutators.selectUnitOnBoard(state, null);
  }

  const unit = state.board.flat().find(u => u?.id === payload.unitId);
  const currentPlayer = state.players[state.currentPlayerId];
  
  if (!unit || unit.hasMoved || unit.color !== currentPlayer?.color) {
    return state;
  }

  const isAlreadySelected = state.selectedUnitIdOnBoard === payload.unitId;
  return mutators.selectUnitOnBoard(state, isAlreadySelected ? null : payload.unitId);
};
