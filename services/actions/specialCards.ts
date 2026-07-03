import { GameState, Card, Unit } from '@/types';
import logger from '@/utils/logger';
import { getKingValidMoves } from '../gameService';
import { handleCombat } from '../combatService';
import * as mutators from '../stateMutators';
import { applyQueenAbility, applyJokerAbility, applyJackAbility } from '../../effects/cardEffects';

export const playSpecialCard = (state: GameState, payload: { card: Card }): GameState => {
  logger.info({ timestamp: new Date().toISOString(), event: 'playSpecialCard', card: payload.card.rank });
  if (state.actionsRemaining <= 0 || state.kingMoveState?.isMoving) return state;

  const { card } = payload;
  const rank = card.rank;
  
  const currentPlayer = state.players[state.currentPlayerId];
  if (!currentPlayer) return state;
  const opponentPlayer = state.players[1 - state.currentPlayerId];

  // Case 1: Ace (Kamikaze Missile) - 1 direct damage
  if (rank === 'A') {
    if (!opponentPlayer) return state;
    const newHand = currentPlayer.hand.filter(c => c.id !== card.id);
    
    let updatedState = mutators.removeCardFromHand(state, currentPlayer.id, card.id);
    updatedState = mutators.addCardToScored(updatedState, currentPlayer.id, card);
    updatedState = mutators.updatePlayer(updatedState, opponentPlayer.id, { damage: opponentPlayer.damage + 1 });
    
    updatedState = mutators.checkForWinner(updatedState);
    const withActionSpent = mutators.spendAction(updatedState);
    return mutators.addLog(withActionSpent, 'ACE played! 1 direct damage to opponent.');
  }

  // Case 2: J, Q, Joker - Set targeting mode
  if (rank === 'Joker' || rank === 'Q' || rank === 'J') {
    logger.info({ timestamp: new Date().toISOString(), event: 'playSpecialCard:set_targeting', card: rank });
    const targetingRank = rank === 'J' ? 'jack' : rank === 'Q' ? 'queen' : 'joker';
    
    let updatedState = mutators.setTargeting(state, targetingRank);
    updatedState = mutators.selectCardInHand(updatedState, card.id);
    return mutators.addLog(updatedState, `Select a target for ${card.rank}.`);
  }

  // Case 3: King (Dictador Loco) - Move all units
  if (rank === 'K') {
    const unitsOnBoard = state.board.flat().filter((u): u is Unit => u?.color === currentPlayer.color);
    if (unitsOnBoard.length === 0) {
      return mutators.addLog(state, "King has no units to command!");
    }

    let updatedState = mutators.removeCardFromHand(state, currentPlayer.id, card.id);
    updatedState = mutators.addCardToDiscard(updatedState, currentPlayer.id, card);

    const kingState = {
      isMoving: true,
      unitsToMove: unitsOnBoard.map(u => u.id),
      movedUnits: [],
      selectedUnitId: null
    };

    updatedState = mutators.updateKingMoveState(updatedState, kingState);
    const withActionSpent = mutators.spendAction(updatedState);
    return mutators.addLog(withActionSpent, "KING's Command! Move your units.");
  }

  return state;
};

export const useAbilityOnTarget = (state: GameState, payload: { unitId: string; position?: { row: number, col: number } }): GameState => {
  logger.info({ timestamp: new Date().toISOString(), event: 'useAbilityOnTarget', targeting: state.isTargeting, unitId: payload.unitId, position: payload.position });
  if (!state.isTargeting || !state.selectedCardIdInHand) return state;

  const currentPlayer = state.players[state.currentPlayerId];
  const opponentPlayer = state.players[1 - state.currentPlayerId];
  if (!currentPlayer || !opponentPlayer) return state;

  const cardInHand = currentPlayer.hand.find(c => c.id === state.selectedCardIdInHand);
  if (!cardInHand) {
    logger.error({ timestamp: new Date().toISOString(), event: 'useAbilityOnTarget:error', reason: 'Card not in hand' });
    return state;
  }

  const { unitId, position } = payload;
  const unitOnBoard = state.board.flat().find(u => u?.id === unitId);
  if (!unitOnBoard && !(state.isTargeting === 'queen' && position)) {
    logger.error({ timestamp: new Date().toISOString(), event: 'useAbilityOnTarget:error', reason: 'Target unit not on board' });
    return state;
  }

  switch (state.isTargeting) {
    case 'queen':
      return applyQueenAbility(state, cardInHand, unitOnBoard || null, currentPlayer, opponentPlayer, position);
    case 'joker':
      if (!unitOnBoard) return state;
      return applyJokerAbility(state, cardInHand, unitOnBoard, currentPlayer, opponentPlayer);
    case 'jack':
      if (!unitOnBoard) return state;
      return applyJackAbility(state, cardInHand, unitOnBoard, currentPlayer);
    default:
      let resetState = mutators.setTargeting(state, null);
      return mutators.selectCardInHand(resetState, null);
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
  let updatedState = mutators.placeUnitOnBoard(state, attacker.position.row, attacker.position.col, null);

  let postState: GameState;
  if (defender) { // Combat
    postState = handleCombat(updatedState, attacker, defender);
  } else { // Simple move
    const movedUnit = { ...attacker, position: { row: toRow, col: toCol } };
    postState = mutators.placeUnitOnBoard(updatedState, toRow, toCol, movedUnit);
  }

  const newKingState = {
    ...kingMoveState,
    unitsToMove: kingMoveState.unitsToMove.filter(id => id !== attacker.id),
    movedUnits: [...kingMoveState.movedUnits, attacker.id],
    selectedUnitId: null
  };

  const stateWithUpdatedKing = mutators.updateKingMoveState(postState, newKingState);
  const stateWithDeselectedUnit = mutators.selectUnitOnBoard(stateWithUpdatedKing, null);

  if (newKingState.unitsToMove.length === 0) {
    return finishKingMove(stateWithDeselectedUnit);
  }

  return stateWithDeselectedUnit;
};

export const finishKingMove = (state: GameState): GameState => {
  const { kingMoveState } = state;
  if (!kingMoveState) return state;

  const unmovedIds = kingMoveState.unitsToMove;
  if (unmovedIds.length === 0) {
    return mutators.addLog(
      mutators.updateKingMoveState(state, null), 
      "King's command complete."
    );
  }

  let updatedState = state;
  const currentPlayer = state.players[state.currentPlayerId];
  let newDiscard = [...currentPlayer.discard];

  const unmovedUnits = state.board.flat().filter(u => u && unmovedIds.includes(u.id)) as Unit[];
  for (const unit of unmovedUnits) {
    updatedState = mutators.placeUnitOnBoard(updatedState, unit.position.row, unit.position.col, null);
    newDiscard.push(mutators.unitToCard(unit));
    newDiscard.push(...unit.stackedAttackers);
  }

  updatedState = mutators.updatePlayer(updatedState, currentPlayer.id, { discard: newDiscard });
  updatedState = mutators.updateKingMoveState(updatedState, null);
  updatedState = mutators.selectUnitOnBoard(updatedState, null);

  return mutators.addLog(
    updatedState, 
    `King discarded ${unmovedUnits.length} unmoved unit(s).`
  );
};
