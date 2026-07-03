import { GameState, Card, Unit, Player } from '@/types';
import logger from '../utils/logger';
import * as mutators from '../services/stateMutators';
import { createUnitFromCard } from '../services/gameService';
import { BOARD_ROWS } from '../utils/constants';

export const applyQueenAbility = (
    state: GameState, 
    cardInHand: Card, 
    unitOnBoard: Unit | null, 
    currentPlayer: Player, 
    opponentPlayer: Player,
    position?: { row: number; col: number }
): GameState => {
    // Case 1: Resurrection of a unit from discard pile
    if (!unitOnBoard) {
        if (!position) {
            return mutators.addLog(state, "Queen needs a target unit or empty start cell.");
        }

        const startRow = currentPlayer.id === 0 ? BOARD_ROWS - 1 : 0;
        if (position.row !== startRow) {
            return mutators.addLog(state, "Can only resurrect in your starting zone.");
        }

        const targetCell = state.board[position.row][position.col];
        if (targetCell !== null) {
            return mutators.addLog(state, "Target cell must be empty.");
        }

        // Find the last unit card in discard
        let unitCardIndex = -1;
        for (let i = currentPlayer.discard.length - 1; i >= 0; i--) {
            const card = currentPlayer.discard[i];
            const rankVal = parseInt(card.rank, 10);
            if (!isNaN(rankVal) && rankVal >= 2 && rankVal <= 10) {
                unitCardIndex = i;
                break;
            }
        }

        if (unitCardIndex === -1) {
            return mutators.addLog(state, "No units in discard to resurrect.");
        }

        const cardToResurrect = currentPlayer.discard[unitCardIndex];
        const resurrectedUnit = createUnitFromCard(cardToResurrect, position);
        if (!resurrectedUnit) return state;

        let updatedState = mutators.placeUnitOnBoard(state, position.row, position.col, resurrectedUnit);

        const newDiscard = currentPlayer.discard.filter((_, idx) => idx !== unitCardIndex);
        const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
        newDiscard.push(cardInHand); // Queen is spent and discarded

        updatedState = mutators.updatePlayer(updatedState, currentPlayer.id, {
            hand: newHand,
            discard: newDiscard
        });

        const withActionSpent = mutators.spendAction(updatedState);
        return mutators.addLog(withActionSpent, `QUEEN resurrected ${cardToResurrect.rank} of ${cardToResurrect.suit} to cell ${position.row},${position.col}.`);
    }

    // Case 2: Heal or Buff a friendly unit on board
    if (unitOnBoard.color !== currentPlayer.color) {
        return mutators.addLog(state, "Queen can only target friendly units.");
    }

    let updatedUnit: Unit;
    let logMsg = '';
    let stackedCardsToDiscard: Card[] = [];

    if (unitOnBoard.currentDamage < unitOnBoard.baseDamage) {
        // Option 1: Heals unit to full damage and discards stacked cards
        stackedCardsToDiscard = unitOnBoard.stackedAttackers;
        updatedUnit = { 
            ...unitOnBoard, 
            currentDamage: unitOnBoard.baseDamage, 
            stackedAttackers: [] 
        };
        logMsg = `QUEEN healed ${unitOnBoard.rank} of ${unitOnBoard.suit} to full health and cleared stacked cards.`;
    } else {
        // Option 2: Unit is undamaged, increase base and current damage by +1
        updatedUnit = {
            ...unitOnBoard,
            baseDamage: unitOnBoard.baseDamage + 1,
            currentDamage: unitOnBoard.currentDamage + 1
        };
        logMsg = `QUEEN boosted undamaged ${unitOnBoard.rank} of ${unitOnBoard.suit} attack by +1 (Now ${updatedUnit.baseDamage} base damage).`;
    }

    let updatedState = mutators.placeUnitOnBoard(state, unitOnBoard.position.row, unitOnBoard.position.col, updatedUnit);
    
    const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
    const newCurrentPlayerDiscard = [...currentPlayer.discard, cardInHand];
    const newOpponentDiscard = [...opponentPlayer.discard, ...stackedCardsToDiscard];

    updatedState = mutators.updatePlayer(updatedState, currentPlayer.id, { hand: newHand, discard: newCurrentPlayerDiscard });
    updatedState = mutators.updatePlayer(updatedState, opponentPlayer.id, { discard: newOpponentDiscard });

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
