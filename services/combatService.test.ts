import { describe, it, expect } from 'vitest';
import { handleCombat } from './combatService';
import { GameState, Unit, CardColor, Suit } from '../types';
import { BOARD_ROWS, BOARD_COLS } from '../utils/constants';

const createMockState = (): GameState => ({
  board: Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null)),
  players: [
    { id: 0, name: 'Player 1', color: CardColor.Black, damage: 0, deck: [], hand: [], discard: [], scored: [] },
    { id: 1, name: 'Player 2', color: CardColor.Red, damage: 0, deck: [], hand: [], discard: [], scored: [] }
  ],
  currentPlayerId: 0,
  actionsRemaining: 3,
  log: [],
  selectedCardIdInHand: null,
  selectedUnitIdOnBoard: null,
  isTargeting: null,
  winner: null,
  gameMode: 'playing',
  gameType: 'p2',
  kingMoveState: null,
  cardInfoModal: null
});

describe('combatService tests', () => {
  it('should destroy both units if attacker is stronger than defender (Case A)', () => {
    const state = createMockState();
    
    const attacker: Unit = {
      id: 'Club10', rank: '10', suit: Suit.Clubs, color: CardColor.Black,
      baseDamage: 10, currentDamage: 10, speed: 1, position: { row: 2, col: 2 },
      hasMoved: false, boosterCard: null, stackedAttackers: []
    };

    const defender: Unit = {
      id: 'Heart5', rank: '5', suit: Suit.Hearts, color: CardColor.Red,
      baseDamage: 5, currentDamage: 5, speed: 2, position: { row: 2, col: 3 },
      hasMoved: false, boosterCard: null, stackedAttackers: []
    };

    state.board[2][2] = attacker;
    state.board[2][3] = defender;

    const nextState = handleCombat(state, attacker, defender);

    // Defender should be removed from board
    expect(nextState.board[2][3]).toBeNull();

    const player1 = nextState.players[0]; // Black
    const player2 = nextState.players[1]; // Red

    expect(player1.discard.some(c => c.id === 'Club10')).toBe(true);
    expect(player2.discard.some(c => c.id === 'Heart5')).toBe(true);

    expect(nextState.log[0]).toContain('Attacker is stronger. Both units destroyed!');
  });

  it('should damage defender and stack attacker card on top if defender survives (Case B)', () => {
    const state = createMockState();

    const attacker: Unit = {
      id: 'Spade4', rank: '4', suit: Suit.Spades, color: CardColor.Black,
      baseDamage: 4, currentDamage: 4, speed: 3, position: { row: 2, col: 2 },
      hasMoved: false, boosterCard: null, stackedAttackers: []
    };

    const defender: Unit = {
      id: 'Heart10', rank: '10', suit: Suit.Hearts, color: CardColor.Red,
      baseDamage: 10, currentDamage: 10, speed: 1, position: { row: 2, col: 3 },
      hasMoved: false, boosterCard: null, stackedAttackers: []
    };

    state.board[2][2] = attacker;
    state.board[2][3] = defender;

    const nextState = handleCombat(state, attacker, defender);

    const finalDefender = nextState.board[2][3];
    expect(finalDefender).not.toBeNull();
    expect(finalDefender?.currentDamage).toBe(6);
    expect(finalDefender?.stackedAttackers.some(c => c.id === 'Spade4')).toBe(true);
  });

  it('should destroy both units if attacker damage is equal to defender damage (Case B1)', () => {
    const state = createMockState();

    const attacker: Unit = {
      id: 'Club5', rank: '5', suit: Suit.Clubs, color: CardColor.Black,
      baseDamage: 5, currentDamage: 5, speed: 2, position: { row: 2, col: 2 },
      hasMoved: false, boosterCard: null, stackedAttackers: []
    };

    const defender: Unit = {
      id: 'Heart5', rank: '5', suit: Suit.Hearts, color: CardColor.Red,
      baseDamage: 5, currentDamage: 5, speed: 2, position: { row: 2, col: 3 },
      hasMoved: false, boosterCard: null, stackedAttackers: []
    };

    state.board[2][2] = attacker;
    state.board[2][3] = defender;

    const nextState = handleCombat(state, attacker, defender);

    // Defender should be removed from board
    expect(nextState.board[2][3]).toBeNull();

    const player1 = nextState.players[0]; // Black
    const player2 = nextState.players[1]; // Red

    expect(player1.discard.some(c => c.id === 'Club5')).toBe(true);
    expect(player2.discard.some(c => c.id === 'Heart5')).toBe(true);
    expect(nextState.log[0]).toContain('Defender destroyed!');
  });
});
