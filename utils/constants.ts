import { CardColor, Rank, Suit } from '@/models/types';

export const BOARD_ROWS = 5;
export const BOARD_COLS = 4;
export const INITIAL_ACTIONS = 3;
export const INITIAL_DRAW = 3;
export const WIN_DAMAGE = 21;

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUITS: Suit[] = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];

export const CARD_COLORS: Record<Suit, CardColor> = {
  [Suit.Hearts]: CardColor.Red,
  [Suit.Diamonds]: CardColor.Red,
  [Suit.Clubs]: CardColor.Black,
  [Suit.Spades]: CardColor.Black,
  [Suit.Joker]: CardColor.Red // Or assign dynamically, player 1 gets black jokers, player 2 gets red
};

