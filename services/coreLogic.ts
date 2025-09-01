import { GameState, Player, Card, Unit } from '@/models/types';
import { WIN_DAMAGE } from '@/utils/constants';

export const addLog = (state: GameState, message: string): GameState => {
    const playerName = state.players[state.currentPlayerId]?.name || 'Game';
    return { ...state, log: [`[${playerName}] ${message}`, ...state.log.slice(0, 9)] };
};

export const spendAction = (state: GameState, cost: number = 1): GameState => {
    return { 
        ...state, 
        actionsRemaining: state.actionsRemaining - cost,
        selectedCardIdInHand: null,
        selectedUnitIdOnBoard: null,
        isTargeting: null
    };
};

export const checkForWinner = (state: GameState): GameState => {
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

export const updatePlayer = (players: Player[], playerId: number, updates: Partial<Player>): Player[] => {
    return players.map(p => p.id === playerId ? { ...p, ...updates } : p);
};

export const unitToCard = (unit: Unit): Card => {
    const { 
        speed, position, 
        hasMoved, boosterCard, stackedAttackers, ...card 
    } = unit;
    return { ...card, baseDamage: unit.baseDamage, currentDamage: unit.currentDamage };
};