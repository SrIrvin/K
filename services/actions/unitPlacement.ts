import { GameState } from '@/types';
import { BOARD_ROWS } from '@/utils/constants';
import { createUnitFromCard } from '../gameService';
import { handleCombat } from '../combatService';
import * as mutators from '../stateMutators';

export const placeUnit = (state: GameState, payload: { row: number, col: number }): GameState => {
  const { row, col } = payload;
  
  // Guard conditions
  if (state.actionsRemaining <= 0 || !state.selectedCardIdInHand || state.kingMoveState?.isMoving) {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerId];
  if (!currentPlayer) return state;

  // Validate starting zone
  const startRow = state.currentPlayerId === 0 ? BOARD_ROWS - 1 : 0;
  if (row !== startRow) {
    const stateWithDeselect = mutators.selectCardInHand(state, null);
    return mutators.addLog(stateWithDeselect, "Can only place units in your start zone.");
  }

  const cardInHand = currentPlayer.hand.find(c => c.id === state.selectedCardIdInHand);
  if (!cardInHand) return state;

  const newUnit = createUnitFromCard(cardInHand, { row, col });
  if (!newUnit) return state; // Should only fail for special cards (handled elsewhere)

  // Remove card from hand first
  const stateWithRemovedCard = mutators.removeCardFromHand(state, state.currentPlayerId, cardInHand.id);

  const targetCell = state.board[row][col];

  // Case 1: Cell is empty
  if (!targetCell) {
    const stateWithPlacedUnit = mutators.placeUnitOnBoard(stateWithRemovedCard, row, col, newUnit);
    const withActionSpent = mutators.spendAction(stateWithPlacedUnit);
    const withLog = mutators.addLog(withActionSpent, `Placed ${cardInHand.rank} of ${cardInHand.suit}.`);
    return mutators.checkForWinner(withLog);
  }

  // Case 2: Cell is occupied by an enemy
  if (targetCell.color !== currentPlayer.color) {
    // Combat takes care of the board state updates
    const postCombatState = handleCombat(stateWithRemovedCard, newUnit, targetCell);
    const withActionSpent = mutators.spendAction(postCombatState);
    return mutators.checkForWinner(withActionSpent);
  }

  // Case 3: Cell is occupied by a friendly unit
  const stateWithDeselect = mutators.selectCardInHand(state, null);
  return mutators.addLog(stateWithDeselect, "Cannot place a unit on a friendly unit.");
};
