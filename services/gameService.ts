import { Card, Suit, CardColor, Unit } from '../types';
import { RANKS, SUITS, BOARD_ROWS, BOARD_COLS } from '../utils/constants';
import { shuffle } from '../utils/arrayUtils';
import { getUnitSpeed } from '../utils/gameUtils';

export const createDeck = (color: CardColor): Card[] => {
  const baseDeck: Card[] = [];
  const relevantSuits = color === CardColor.Red 
    ? [Suit.Hearts, Suit.Diamonds] 
    : [Suit.Clubs, Suit.Spades];

  for (const suit of relevantSuits) {
    for (const rank of RANKS) {
      baseDeck.push({ id: `${suit}${rank}`, rank, suit, color });
    }
  }

  for (let i = 0; i < 4; i++) { // 4 jokers per player
    const jokerId = `Joker-${color}-${i + 1}`;
    baseDeck.push({ id: jokerId, rank: 'Joker', suit: Suit.Joker, color });
  }

  return shuffle(baseDeck);
};

export const createUnitFromCard = (card: Card, position: { row: number; col: number }): Unit | null => {
  const rankNumber = parseInt(card.rank, 10);
  if (isNaN(rankNumber) || rankNumber < 2 || rankNumber > 10) return null;

  return {
    ...card,
    baseDamage: rankNumber,
    currentDamage: rankNumber,
    speed: getUnitSpeed(card.rank),
    position,
    hasMoved: false, // Can move the turn it's placed
    boosterCard: null,
    stackedAttackers: [],
  };
};

export const getValidMoves = (unit: Unit, board: (Unit | null)[][], playerId: number): { row: number; col: number }[] => {
  const goalRow = playerId === 0 ? 0 : BOARD_ROWS - 1;

  if (unit.position.row === goalRow) {
    return []; // Unit is already on the last row, can only score via button, not move.
  }

  const validMoves: { row: number; col: number }[] = [];
  const { row, col } = unit.position;
  const speed = unit.speed + (unit.boosterCard ? 1 : 0);

  const queue: { pos: { row: number; col: number }; dist: number }[] = [{ pos: { row, col }, dist: 0 }];
  const visited = new Set<string>([`${row},${col}`]);
  let canScoreDirectly = false;

  while (queue.length > 0) {
    const { pos, dist } = queue.shift()!;

    const directions = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];

    for (const { dr, dc } of directions) {
      const nextDist = dist + 1;
      if (nextDist > speed) continue;

      const newRow = pos.row + dr;
      const newCol = pos.col + dc;
      const newPosKey = `${newRow},${newCol}`;

      if (newRow >= 0 && newRow < BOARD_ROWS && newCol >= 0 && newCol < BOARD_COLS && !visited.has(newPosKey)) {
        visited.add(newPosKey);
        const targetCell = board[newRow][newCol];
        const friendlyColor = playerId === 0 ? CardColor.Black : CardColor.Red;

        if (targetCell && targetCell.color === friendlyColor) {
          continue; // Cannot move into a friendly unit's space
        }

        // Add the move regardless of whether it's empty or an enemy
        validMoves.push({ row: newRow, col: newCol });

        // If the path is clear, continue the search from this new spot
        if (!targetCell) {
          if (newRow === goalRow && nextDist < speed) {
            canScoreDirectly = true;
          }
          queue.push({ pos: { row: newRow, col: newCol }, dist: nextDist });
        }
      }
    }
  }

  if (canScoreDirectly) {
    validMoves.push({ row: -1, col: -1 });
  }

  return validMoves;
};

export const getKingValidMoves = (unit: Unit, board: (Unit | null)[][]): { row: number; col: number }[] => {
  const moves: { row: number; col: number }[] = [];
  const { row, col } = unit.position;
  const directions = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];

  for (const { dr, dc } of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < BOARD_ROWS && newCol >= 0 && newCol < BOARD_COLS) {
      const targetCell = board[newRow][newCol];
      // King's move cannot target a friendly unit's space
      if (targetCell && targetCell.color === unit.color) {
        continue;
      }
      moves.push({ row: newRow, col: newCol });
    }
  }
  return moves;
};