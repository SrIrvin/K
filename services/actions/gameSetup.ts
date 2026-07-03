import { GameState, Player, CardColor } from '@/types';
import { BOARD_ROWS, BOARD_COLS, INITIAL_ACTIONS, INITIAL_DRAW } from '@/utils/constants';
import { createDeck } from '../gameService';
import * as mutators from '../stateMutators';

export const startGame = (initialState: GameState, payload: { gameType: 'ai' | 'p2'; playerName?: string }): GameState => {
  const { gameType } = payload;
  const blackDeck = createDeck(CardColor.Black);
  const redDeck = createDeck(CardColor.Red);

  const player1: Player = { 
    id: 0, 
    name: payload.playerName || 'Player 1 (Black)', 
    color: CardColor.Black, 
    damage: 0, 
    deck: blackDeck, 
    hand: [], 
    discard: [], 
    scored: [] 
  };
  
  const player2: Player = { 
    id: 1, 
    name: gameType === 'ai' ? 'AI Opponent (Red)' : 'Player 2 (Red)', 
    color: CardColor.Red, 
    damage: 0, 
    deck: redDeck, 
    hand: [], 
    discard: [], 
    scored: [] 
  };

  // Draw initial cards
  for (let i = 0; i < INITIAL_DRAW; i++) {
    if (player1.deck.length > 0) player1.hand.push(player1.deck.pop()!);
    if (player2.deck.length > 0) player2.hand.push(player2.deck.pop()!);
  }

  return {
    ...initialState,
    board: Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null)),
    players: [player1, player2],
    currentPlayerId: 0,
    actionsRemaining: INITIAL_ACTIONS,
    log: ["Game started! Player 1's turn."],
    gameMode: 'playing',
    gameType,
  };
};

export const beginNewTurn = (state: GameState): GameState => {
  const nextPlayerId = 1 - state.currentPlayerId;
  const nextPlayer = state.players[nextPlayerId];
  if (!nextPlayer) return state;

  const newBoard = state.board.map(row => row.map(unit => {
    if (!unit) return null;
    // Reset hasMoved for the new current player's units
    if (unit.color === nextPlayer.color) {
      return { ...unit, hasMoved: false };
    }
    return unit;
  }));

  const intermediateState: GameState = {
    ...state,
    gameMode: 'playing',
    board: newBoard,
    currentPlayerId: nextPlayerId,
    actionsRemaining: INITIAL_ACTIONS,
    selectedCardIdInHand: null,
    selectedUnitIdOnBoard: null,
    isTargeting: null,
  };
  
  return mutators.addLog(intermediateState, `Turn Start.`);
};

export const endTurn = (state: GameState): GameState => {
  if (state.kingMoveState?.isMoving) return state; // Can't end turn during King move
  if (state.gameType === 'p2') {
    return mutators.setGameMode(state, 'switch_turn');
  }
  return beginNewTurn(state);
};
