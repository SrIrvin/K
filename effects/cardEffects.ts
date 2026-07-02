import { GameState, Card, Unit, Player } from '@/types';
import logger from '../utils/logger';
import * as mutators from '../services/stateMutators';

export const applyQueenAbility = (
    state: GameState, 
    cardInHand: Card, 
    unitOnBoard: Unit, 
    currentPlayer: Player, 
    opponentPlayer: Player
): GameState => {
    if (unitOnBoard.color !== currentPlayer.color) {
        return mutators.addLog(state, "Queen can only target friendly units.");
    }
    if (unitOnBoard.currentDamage >= unitOnBoard.baseDamage) {
        return mutators.addLog(state, "Queen can only target damaged units.");
    }

    const stackedCardsToDiscard = unitOnBoard.stackedAttackers;

    const healedUnit = { 
        ...unitOnBoard, 
        currentDamage: unitOnBoard.baseDamage, 
        stackedAttackers: [] 
    };

    let updatedState = mutators.placeUnitOnBoard(state, unitOnBoard.position.row, unitOnBoard.position.col, healedUnit);
    
    const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
    const newCurrentPlayerDiscard = [...currentPlayer.discard, cardInHand];
    const newOpponentDiscard = [...opponentPlayer.discard, ...stackedCardsToDiscard];

    updatedState = mutators.updatePlayer(updatedState, currentPlayer.id, { hand: newHand, discard: newCurrentPlayerDiscard });
    updatedState = mutators.updatePlayer(updatedState, opponentPlayer.id, { discard: newOpponentDiscard });

    const logMsg = `QUEEN healed ${unitOnBoard.rank} to full health.`;
    const withActionSpent = mutators.spendAction(updatedState);
    return mutators.addLog(withActionSpent, logMsg);
};

export const applyJokerAbility = (
    state: GameState, 
    cardInHand: Card, 
    unitOnBoard: Unit, 
    currentPlayer: Player, 
    opponentPlayer: Player
): GameState => {
    if (unitOnBoard.color === currentPlayer.color) {
        return mutators.addLog(state, "Joker can only target enemy units.");
    }

    let updatedState = mutators.placeUnitOnBoard(state, unitOnBoard.position.row, unitOnBoard.position.col, null);
    
    const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
    const newCurrentPlayerDiscard = [...currentPlayer.discard, cardInHand, ...unitOnBoard.stackedAttackers];
    const newOpponentDiscard = [...opponentPlayer.discard, mutators.unitToCard(unitOnBoard)];

    updatedState = mutators.updatePlayer(updatedState, currentPlayer.id, { hand: newHand, discard: newCurrentPlayerDiscard });
    updatedState = mutators.updatePlayer(updatedState, opponentPlayer.id, { discard: newOpponentDiscard });

    const logMsg = `JOKER eliminated ${unitOnBoard.rank}.`;
    const withActionSpent = mutators.spendAction(updatedState);
    return mutators.addLog(withActionSpent, logMsg);
};

export const applyJackAbility = (
    state: GameState, 
    cardInHand: Card, 
    unitOnBoard: Unit, 
    currentPlayer: Player
): GameState => {
    if (unitOnBoard.color !== currentPlayer.color) {
        return mutators.addLog(state, "Jack can only target friendly units.");
    }
    if (unitOnBoard.boosterCard) {
        return mutators.addLog(state, "Unit already has a booster card.");
    }

    const boostedUnit = { ...unitOnBoard, boosterCard: cardInHand };
    let updatedState = mutators.placeUnitOnBoard(state, unitOnBoard.position.row, unitOnBoard.position.col, boostedUnit);
    
    const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
    updatedState = mutators.updatePlayer(updatedState, currentPlayer.id, { hand: newHand });

    const logMsg = `JACK boosted ${unitOnBoard.rank}.`;
    const withActionSpent = mutators.spendAction(updatedState);
    return mutators.addLog(withActionSpent, logMsg);
};
