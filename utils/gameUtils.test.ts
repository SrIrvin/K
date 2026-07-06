import { describe, it, expect } from 'vitest';
import { formatGold, getUnitSpeed, calculatePlayerGold } from './gameUtils';
import { Player, Unit, CardColor, Suit } from '../types';
import { BOARD_ROWS, BOARD_COLS } from '../utils/constants';

describe('formatGold', () => {
  it('should format values under 1000 without changes', () => {
    expect(formatGold(0)).toBe('0');
    expect(formatGold(50)).toBe('50');
    expect(formatGold(999)).toBe('999');
  });

  it('should format thousands using K', () => {
    expect(formatGold(1000)).toBe('1K');
    expect(formatGold(1500)).toBe('1.5K');
    expect(formatGold(10500)).toBe('10.5K');
    expect(formatGold(999900)).toBe('999.9K');
  });

  it('should format millions using M', () => {
    expect(formatGold(1000000)).toBe('1M');
    expect(formatGold(1200000)).toBe('1.2M');
    expect(formatGold(15000000)).toBe('15M');
  });

  it('should support negative numbers', () => {
    expect(formatGold(-50)).toBe('-50');
    expect(formatGold(-1500)).toBe('-1.5K');
    expect(formatGold(-2500000)).toBe('-2.5M');
  });
});

describe('getUnitSpeed', () => {
  it('should return speed 3 for ranks 2, 3, 4', () => {
    expect(getUnitSpeed('2')).toBe(3);
    expect(getUnitSpeed('3')).toBe(3);
    expect(getUnitSpeed('4')).toBe(3);
  });

  it('should return speed 2 for ranks 5, 6, 7', () => {
    expect(getUnitSpeed('5')).toBe(2);
    expect(getUnitSpeed('6')).toBe(2);
    expect(getUnitSpeed('7')).toBe(2);
  });

  it('should return speed 1 for ranks 8, 9, 10', () => {
    expect(getUnitSpeed('8')).toBe(1);
    expect(getUnitSpeed('9')).toBe(1);
    expect(getUnitSpeed('10')).toBe(1);
  });

  it('should return speed 0 for non-numerical or special ranks', () => {
    expect(getUnitSpeed('J')).toBe(0);
    expect(getUnitSpeed('Q')).toBe(0);
    expect(getUnitSpeed('K')).toBe(0);
    expect(getUnitSpeed('A')).toBe(0);
    expect(getUnitSpeed('Joker')).toBe(0);
  });
});

describe('calculatePlayerGold', () => {
  const createEmptyBoard = (): (Unit | null)[][] =>
    Array(5).fill(null).map(() => Array(5).fill(null));

  it('should calculate gold correctly with zero units and empty lists', () => {
    const player: Player = {
      id: 0,
      name: 'Test Player',
      color: CardColor.Black,
      damage: 0,
      deck: [],
      hand: [],
      discard: [],
      scored: []
    };
    const board = createEmptyBoard();
    const result = calculatePlayerGold(player, board);
    expect(result.total).toBe(0);
    expect(result.conservedUnitsGold).toBe(0);
    expect(result.effectsGold).toBe(0);
    expect(result.conservedJokersGold).toBe(0);
    expect(result.conservedKingsGold).toBe(0);
  });

  it('should calculate gold correctly for conserved units and effects/special cards', () => {
    const player: Player = {
      id: 0,
      name: 'Test Player',
      color: CardColor.Black,
      damage: 0,
      deck: [
        { id: 'ClubK', rank: 'K', suit: Suit.Clubs, color: CardColor.Black },
        { id: 'Club2', rank: '2', suit: Suit.Clubs, color: CardColor.Black }
      ],
      hand: [
        { id: 'SpadeJoker', rank: 'Joker', suit: Suit.Spades, color: CardColor.Black }
      ],
      discard: [
        { id: 'ClubA', rank: 'A', suit: Suit.Clubs, color: CardColor.Black }
      ],
      scored: [
        { id: 'ClubQ', rank: 'Q', suit: Suit.Clubs, color: CardColor.Black }
      ]
    };

    const board = createEmptyBoard();
    // 2 conserved units on board (Black color)
    board[0][0] = {
      id: 'Club5',
      rank: '5',
      suit: Suit.Clubs,
      color: CardColor.Black,
      baseDamage: 5,
      currentDamage: 5,
      speed: 2,
      position: { row: 0, col: 0 },
      hasMoved: false,
      boosterCard: { id: 'ClubJ', rank: 'J', suit: Suit.Clubs, color: CardColor.Black },
      stackedAttackers: []
    };
    board[1][1] = {
      id: 'Spade6',
      rank: '6',
      suit: Suit.Spades,
      color: CardColor.Black,
      baseDamage: 6,
      currentDamage: 6,
      speed: 2,
      position: { row: 1, col: 1 },
      hasMoved: false,
      boosterCard: null,
      stackedAttackers: []
    };

    const result = calculatePlayerGold(player, board);
    // Conserved units = 2 -> 2 * 3 = 6 Gold
    expect(result.conservedCount).toBe(2);
    expect(result.conservedUnitsGold).toBe(6);

    // Effect cards ('A', 'J', 'Q', 'K', 'Joker') in discard, scored, or attached as boosters
    // - player.discard has 'A' (1)
    // - player.scored has 'Q' (1)
    // - board has boosterCard 'J' (1)
    // Total effects = 3 -> 3 * 7 = 21 Gold
    expect(result.effectsCount).toBe(3);
    expect(result.effectsGold).toBe(21);

    // Conserved Jokers (in hand or deck)
    // - hand has 1 Joker
    // - deck has 0 Jokers
    // Total Jokers = 1 -> 1 * 13 = 13 Gold
    expect(result.conservedJokersCount).toBe(1);
    expect(result.conservedJokersGold).toBe(13);

    // Conserved Kings (in hand or deck)
    // - deck has 1 King ('ClubK')
    // - hand has 0 Kings
    // Total Kings = 1 -> 1 * 21 = 21 Gold
    expect(result.conservedKingsCount).toBe(1);
    expect(result.conservedKingsGold).toBe(21);

    // Total = 6 + 21 + 13 + 21 = 61 Gold
    expect(result.total).toBe(61);
  });
});
