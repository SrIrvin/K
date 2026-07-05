import { describe, it, expect } from 'vitest';
import { createDeck, createUnitFromCard, getKingValidMoves } from './gameService';
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
});
