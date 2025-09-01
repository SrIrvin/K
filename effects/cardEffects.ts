import { GameState, Card, Unit, Player, CardColor, Rank } from '@/models/types';
import logger from '../utils/logger';

// These helper functions will be passed from logicService.ts
type AddLogFn = (state: GameState, message: string) => GameState;
type SpendActionFn = (state: GameState, cost?: number) => GameState;
type UpdatePlayerFn = (players: Player[], playerId: number, updates: Partial<Player>) => Player[];
type UnitToCardFn = (unit: Unit) => Card;

interface CardEffectDependencies {
    addLog: AddLogFn;
    spendAction: SpendActionFn;
    updatePlayer: UpdatePlayerFn;
    unitToCard: UnitToCardFn;
}

export const applyQueenAbility = (
    state: GameState, 
    cardInHand: Card, 
    unitOnBoard: Unit, 
    currentPlayer: Player, 
    opponentPlayer: Player,
    deps: CardEffectDependencies
): GameState => {
    const { addLog, spendAction, updatePlayer, unitToCard } = deps;

    if (unitOnBoard.color !== currentPlayer.color) {
        return addLog(state, "Queen can only target friendly units.");
    }
    if (unitOnBoard.currentDamage >= unitOnBoard.baseDamage) {
        return addLog(state, "Queen can only target damaged units.");
    }

    const stackedCardsToDiscard = unitOnBoard.stackedAttackers;

    const healedUnit = { 
        ...unitOnBoard, 
        currentDamage: unitOnBoard.baseDamage, 
        stackedAttackers: [] 
    };

    const newBoard = state.board.map(row => row.map(cell => cell?.id === unitOnBoard.id ? healedUnit : cell));
    
    const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
    const newCurrentPlayerDiscard = [...currentPlayer.discard, cardInHand];
    const newOpponentDiscard = [...opponentPlayer.discard, ...stackedCardsToDiscard];

    const newPlayers = state.players.map(p => {
        if (p.id === currentPlayer.id) {
            return { ...p, hand: newHand, discard: newCurrentPlayerDiscard };
        }
        if (p.id === opponentPlayer.id) {
            return { ...p, discard: newOpponentDiscard };
        }
        return p;
    });

    const logMsg = `QUEEN healed ${unitOnBoard.rank} to full health.`;
    const stateWithUpdates = { ...state, board: newBoard, players: newPlayers };
    const withActionSpent = spendAction(stateWithUpdates);
    return addLog(withActionSpent, logMsg);
};

export const applyJokerAbility = (
    state: GameState, 
    cardInHand: Card, 
    unitOnBoard: Unit, 
    currentPlayer: Player, 
    opponentPlayer: Player,
    deps: CardEffectDependencies
): GameState => {
    const { addLog, spendAction, updatePlayer, unitToCard } = deps;

    if (unitOnBoard.color === currentPlayer.color) {
        return addLog(state, "Joker can only target enemy units.");
    }

    const newBoard = state.board.map(row => row.map(cell => cell?.id === unitOnBoard.id ? null : cell));
    
    const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
    const newCurrentPlayerDiscard = [...currentPlayer.discard, cardInHand, ...unitOnBoard.stackedAttackers];
    const newOpponentDiscard = [...opponentPlayer.discard, unitToCard(unitOnBoard)];

    const newPlayers = state.players.map(p => {
        if (p.id === currentPlayer.id) {
            return { ...p, hand: newHand, discard: newCurrentPlayerDiscard };
        }
        if (p.id === opponentPlayer.id) {
            return { ...p, discard: newOpponentDiscard };
        }
        return p;
    });

    const logMsg = `JOKER eliminated ${unitOnBoard.rank}.`;
    const stateWithUpdates = { ...state, board: newBoard, players: newPlayers };
    const withActionSpent = spendAction(stateWithUpdates);
    return addLog(withActionSpent, logMsg);
};

export const applyJackAbility = (
    state: GameState, 
    cardInHand: Card, 
    unitOnBoard: Unit, 
    currentPlayer: Player,
    deps: CardEffectDependencies
): GameState => {
    const { addLog, spendAction, updatePlayer } = deps;

    if (unitOnBoard.color !== currentPlayer.color) {
        return addLog(state, "Jack can only target friendly units.");
    }
    if (unitOnBoard.boosterCard) {
        return addLog(state, "Unit already has a booster card.");
    }

    const boostedUnit = { ...unitOnBoard, boosterCard: cardInHand };
    const newBoard = state.board.map(row => row.map(cell => cell?.id === unitOnBoard.id ? boostedUnit : cell));
    const newHand = currentPlayer.hand.filter(c => c.id !== cardInHand.id);
    const newPlayers = updatePlayer(state.players, currentPlayer.id, { hand: newHand });

    const logMsg = `JACK boosted ${unitOnBoard.rank}.`;
    const stateWithUpdates = { ...state, board: newBoard, players: newPlayers };
    const withActionSpent = spendAction(stateWithUpdates);
    return addLog(withActionSpent, logMsg);
};
