import { describe, it, expect } from 'vitest';
import { createDeck, createUnitFromCard, getKingValidMoves, getValidMoves } from './gameService';
import { CardColor, Suit, Card } from '../types';
import { BOARD_ROWS, BOARD_COLS } from '../utils/constants';

describe('gameService tests', () => {
  describe('createDeck', () => {
    it('should create a deck of 30 cards for Red color (2 suits of 13 cards + 4 Jokers)', () => {
      const deck = createDeck(CardColor.Red);
      expect(deck).toHaveLength(30);

      const jokers = deck.filter(c => c.rank === 'Joker');
      expect(jokers).toHaveLength(4);

      const heartsOrDiamonds = deck.filter(c => c.suit === Suit.Hearts || c.suit === Suit.Diamonds);
      expect(heartsOrDiamonds).toHaveLength(26);

      deck.forEach(card => {
        expect(card.color).toBe(CardColor.Red);
      });
    });

    it('should create a deck of 30 cards for Black color (2 suits of 13 cards + 4 Jokers)', () => {
      const deck = createDeck(CardColor.Black);
      expect(deck).toHaveLength(30);

      const jokers = deck.filter(c => c.rank === 'Joker');
      expect(jokers).toHaveLength(4);

      const clubsOrSpades = deck.filter(c => c.suit === Suit.Clubs || c.suit === Suit.Spades);
      expect(clubsOrSpades).toHaveLength(26);

      deck.forEach(card => {
        expect(card.color).toBe(CardColor.Black);
      });
    });
  });

  describe('createUnitFromCard', () => {
    it('should correctly convert a numerical card into a unit', () => {
      const card: Card = { id: 'Heart5', rank: '5', suit: Suit.Hearts, color: CardColor.Red };
      const position = { row: 3, col: 2 };
      const unit = createUnitFromCard(card, position);

      expect(unit).not.toBeNull();
      expect(unit?.baseDamage).toBe(5);
      expect(unit?.currentDamage).toBe(5);
      expect(unit?.position).toEqual(position);
    });

    it('should return null for non-numerical or special cards (like J, Q, K, A, Joker)', () => {
      const jackCard: Card = { id: 'ClubJ', rank: 'J', suit: Suit.Clubs, color: CardColor.Black };
      const unit = createUnitFromCard(jackCard, { row: 0, col: 0 });
      expect(unit).toBeNull();
    });
  });

  describe('getKingValidMoves', () => {
    it('should allow valid moves in all 4 cardinal directions when in the center of an empty board', () => {
      const kingCard: Card = { id: 'ClubK', rank: 'K', suit: Suit.Clubs, color: CardColor.Black };
      const kingUnit = {
        ...kingCard,
        baseDamage: 10,
        currentDamage: 10,
        speed: 1,
        position: { row: 2, col: 2 },
        hasMoved: false,
        boosterCard: null,
        stackedAttackers: []
      };

      const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));

      const moves = getKingValidMoves(kingUnit, board);
      expect(moves).toHaveLength(4);
      expect(moves).toContainEqual({ row: 1, col: 2 });
      expect(moves).toContainEqual({ row: 3, col: 2 });
      expect(moves).toContainEqual({ row: 2, col: 1 });
      expect(moves).toContainEqual({ row: 2, col: 3 });
    });
  });

  describe('getValidMoves', () => {
    it('should return empty list when unit is already on the goal row', () => {
      const card: Card = { id: 'Heart5', rank: '5', suit: Suit.Hearts, color: CardColor.Red };
      const unit = {
        ...card,
        baseDamage: 5,
        currentDamage: 5,
        speed: 2,
        position: { row: 4, col: 2 }, // Red's goal row (Player 1) is 4
        hasMoved: false,
        boosterCard: null,
        stackedAttackers: []
      };

      const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
      const moves = getValidMoves(unit, board, 1); // Player 1 (Red) goal row is row 4
      expect(moves).toHaveLength(0);
    });

    it('should restrict movement if blocked by a friendly unit', () => {
      const card: Card = { id: 'Club8', rank: '8', suit: Suit.Clubs, color: CardColor.Black };
      const unit = {
        ...card,
        baseDamage: 8,
        currentDamage: 8,
        speed: 1,
        position: { row: 2, col: 2 },
        hasMoved: false,
        boosterCard: null,
        stackedAttackers: []
      };

      const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
      // Place a friendly unit directly above the moving unit
      board[1][2] = {
        id: 'Club5',
        rank: '5',
        suit: Suit.Clubs,
        color: CardColor.Black,
        baseDamage: 5,
        currentDamage: 5,
        speed: 2,
        position: { row: 1, col: 2 },
        hasMoved: false,
        boosterCard: null,
        stackedAttackers: []
      };

      const moves = getValidMoves(unit, board, 0); // Player 0 (Black)
      // Since speed is 1, it should normally have 4 directions, but up {row: 1, col: 2} is blocked by friendly unit
      expect(moves).toHaveLength(3);
      expect(moves).not.toContainEqual({ row: 1, col: 2 });
      expect(moves).toContainEqual({ row: 3, col: 2 });
      expect(moves).toContainEqual({ row: 2, col: 1 });
      expect(moves).toContainEqual({ row: 2, col: 3 });
    });

    it('should allow landing on an enemy unit for combat, but not passing through it', () => {
      const card: Card = { id: 'Club8', rank: '8', suit: Suit.Clubs, color: CardColor.Black };
      const unit = {
        ...card,
        baseDamage: 8,
        currentDamage: 8,
        speed: 2,
        position: { row: 2, col: 2 },
        hasMoved: false,
        boosterCard: null,
        stackedAttackers: []
      };

      const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
      // Place an enemy unit directly to the right (row: 2, col: 3)
      board[2][3] = {
        id: 'Heart5',
        rank: '5',
        suit: Suit.Hearts,
        color: CardColor.Red,
        baseDamage: 5,
        currentDamage: 5,
        speed: 2,
        position: { row: 2, col: 3 },
        hasMoved: false,
        boosterCard: null,
        stackedAttackers: []
      };

      const moves = getValidMoves(unit, board, 0); // Player 0 (Black)
      
      // We can land on the enemy at { row: 2, col: 3 } (combat)
      expect(moves).toContainEqual({ row: 2, col: 3 });
      
      // But we cannot pass through it to reach { row: 2, col: 4 } (which requires 2 steps through the enemy)
      expect(moves).not.toContainEqual({ row: 2, col: 4 });
    });
  });
});
