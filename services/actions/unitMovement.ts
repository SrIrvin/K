import { GameState, Unit } from '@/types';
import { BOARD_ROWS } from '@/utils/constants';
import { getValidMoves } from '../gameService';
import { handleCombat } from '../combatService';
import * as mutators from '../stateMutators';

export const moveUnit = (state: GameState, payload: { to: { row: number; col: number } }): GameState => {
  if (state.actionsRemaining <= 0 || !state.selectedUnitIdOnBoard) return state;

  const attacker = state.board.flat().find(u => u?.id === state.selectedUnitIdOnBoard);
  const currentPlayer = state.players[state.currentPlayerId];
  if (!attacker || !currentPlayer) return state;

  const { row: toRow, col: toCol } = payload.to;

  // Handle direct scoring move (touchdown)
  if (toRow === -1 && toCol === -1) {
    const validMoves = getValidMoves(attacker, state.board, currentPlayer.id);
    if (validMoves.some(m => m.row === -1 && m.col === -1)) {
      const stateWithClearedBoard = mutators.placeUnitOnBoard(state, attacker.position.row, attacker.position.col, null);
      
      const opponentPlayer = state.players[1 - state.currentPlayerId];
      if (!opponentPlayer) return state;

      const newOpponentDamage = opponentPlayer.damage + attacker.currentDamage;
      const cardRepresentation = mutators.unitToCard(attacker);

      let updatedState = mutators.updatePlayer(stateWithClearedBoard, opponentPlayer.id, { damage: newOpponentDamage });
      updatedState = mutators.addCardToScored(updatedState, currentPlayer.id, cardRepresentation);
      
      updatedState = mutators.checkForWinner(updatedState);
      const withActionSpent = mutators.spendAction(updatedState);
      return mutators.addLog(withActionSpent, `TOUCHDOWN! ${attacker.rank} scores ${attacker.currentDamage} damage directly!`);
    }
  }

  const defender = state.board[toRow]?.[toCol];

  const validMoves = getValidMoves(attacker, state.board, currentPlayer.id);
  if (!validMoves.some(m => m.row === toRow && m.col === toCol)) {
    return mutators.selectUnitOnBoard(state, null);
  }

  // Clear current position
  let updatedState = mutators.placeUnitOnBoard(state, attacker.position.row, attacker.position.col, null);

  let attackerUnit = { ...attacker, hasMoved: true };

  // Discard booster cards if present
  if (attackerUnit.boosterCards && attackerUnit.boosterCards.length > 0) {
    for (const card of attackerUnit.boosterCards) {
      updatedState = mutators.addCardToDiscard(updatedState, currentPlayer.id, card);
    }
    attackerUnit.boosterCards = [];
    attackerUnit.boosterCard = null;
  } else if (attackerUnit.boosterCard) {
    updatedState = mutators.addCardToDiscard(updatedState, currentPlayer.id, attackerUnit.boosterCard);
    attackerUnit.boosterCard = null;
  }

  if (defender && defender.color !== attacker.color) {
    const postCombatState = handleCombat(updatedState, attackerUnit, defender);
    return mutators.spendAction(postCombatState);
  } else {
    attackerUnit.position = { row: toRow, col: toCol };
    const stateWithPlacedUnit = mutators.placeUnitOnBoard(updatedState, toRow, toCol, attackerUnit);
    const withActionSpent = mutators.spendAction(stateWithPlacedUnit);
    return mutators.addLog(withActionSpent, `Moved ${attacker.rank} to ${toRow},${toCol}.`);
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
  const cardRepresentation = mutators.unitToCard(unit);

  let updatedState = mutators.placeUnitOnBoard(state, unit.position.row, unit.position.col, null);
  updatedState = mutators.updatePlayer(updatedState, opponentPlayer.id, { damage: newOpponentDamage });
  updatedState = mutators.addCardToScored(updatedState, currentPlayer.id, cardRepresentation);

  updatedState = mutators.checkForWinner(updatedState);
  const withActionSpent = mutators.spendAction(updatedState);
  return mutators.addLog(withActionSpent, `TOUCHDOWN! ${unit.rank} scores ${unit.currentDamage} damage!`);
};

export const drawCard = (state: GameState): GameState => {
  if (state.actionsRemaining <= 0) return state;

  const currentPlayer = state.players[state.currentPlayerId];
  if (!currentPlayer) return state;

  if (currentPlayer.deck.length === 0) {
    return mutators.addLog(state, 'Deck is empty!');
  }

  const newDeck = [...currentPlayer.deck];
  const drawnCard = newDeck.pop()!;
  const newHand = [...currentPlayer.hand, drawnCard];

  const updatedState = mutators.updatePlayer(state, state.currentPlayerId, {
    deck: newDeck,
    hand: newHand,
  });

  const withActionSpent = mutators.spendAction(updatedState);
  return mutators.addLog(withActionSpent, 'Drew a card.');
};
