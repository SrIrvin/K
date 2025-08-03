export enum Suit {
  Hearts = '♥',
  Diamonds = '♦',
  Clubs = '♣',
  Spades = '♠',
  Joker = 'Joker'
}

export enum CardColor {
  Red = 'Red',
  Black = 'Black'
}

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'Joker';

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
  color: CardColor;
}

export interface Unit extends Card {
  baseDamage: number;
  currentDamage: number;
  speed: number;
  position: { row: number; col: number };
  hasMoved: boolean;
  boosterCard: Card | null; // For Jack's effect
  stackedAttackers: Card[]; // For new combat rules
}

export interface Player {
  id: number;
  name: string;
  color: CardColor;
  damage: number;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  scored: Card[];
}

export interface GameState {
  board: (Unit | null)[][];
  players: Player[];
  currentPlayerId: number;
  actionsRemaining: number;
  log: string[];
  selectedCardIdInHand: string | null;
  selectedUnitIdOnBoard: string | null;
  isTargeting: 'joker' | 'queen' | 'jack' | null;
  winner: Player | null;
  gameMode: 'menu' | 'playing' | 'switch_turn' | 'game_over';
  gameType: 'ai' | 'p2' | null;
  kingMoveState: {
    isMoving: boolean;
    unitsToMove: string[];
    movedUnits: string[];
    selectedUnitId: string | null;
  } | null;
  cardInfoModal: Card | null;
}

export type MoveDirection = 'up' | 'down' | 'left' | 'right';

export type Action =
  | { type: 'START_GAME'; payload: { gameType: 'ai' | 'p2' } }
  | { type: 'BEGIN_NEW_TURN' }
  | { type: 'END_TURN' }
  | { type: 'SELECT_CARD_IN_HAND'; payload: { cardId: string | null } }
  | { type: 'SELECT_UNIT_ON_BOARD'; payload: { unitId: string | null } }
  | { type: 'PLACE_UNIT'; payload: { row: number; col: number } }
  | { type: 'MOVE_UNIT'; payload: { to: { row: number; col: number } } }
  | { type: 'USE_ABILITY_ON_TARGET'; payload: { targetUnit: Unit } }
  | { type: 'SCORE_UNIT' }
  | { type: 'PLAY_SPECIAL_CARD'; payload: { card: Card } }
  | { type: 'DRAW_CARD' }
  | { type: 'SET_CARD_INFO_MODAL'; payload: { card: Card | null } }
  | { type: 'RESET_TO_MENU' }
  // King move actions
  | { type: 'MOVE_UNIT_DURING_KING_EFFECT'; payload: { to: { row: number, col: number } } }
  | { type: 'FINISH_KING_MOVE' };