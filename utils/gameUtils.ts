// getUnitSpeed: devuelve la velocidad según el rango
import { Rank, Player, Unit } from '../types';
export const getUnitSpeed = (rank: Rank): number => {
  const value = parseInt(rank, 10);
  if (value >= 2 && value <= 4) return 3;
  if (value >= 5 && value <= 7) return 2;
  if (value >= 8 && value <= 10) return 1;
  return 0;
};

export interface GoldBreakdown {
  total: number;
  conservedUnitsGold: number;
  effectsGold: number;
  conservedCount: number;
  effectsCount: number;
  conservedJokersCount: number;
  conservedJokersGold: number;
  conservedKingsCount: number;
  conservedKingsGold: number;
}

export const calculatePlayerGold = (player: Player, board: (Unit | null)[][]): GoldBreakdown => {
  // Count conserved units (units belonging to the player's color currently on the board)
  const conservedUnits = board.flat().filter((u): u is Unit => u !== null && u.color === player.color);
  const conservedCount = conservedUnits.length;
  const conservedUnitsGold = conservedCount * 3;

  // Count effect/special cards played: 'A', 'J', 'Q', 'K', 'Joker' in discard, scored, or attached as boosters
  const discardedEffects = player.discard.filter(card => ['A', 'J', 'Q', 'K', 'Joker'].includes(card.rank));
  const scoredEffects = player.scored.filter(card => ['A', 'J', 'Q', 'K', 'Joker'].includes(card.rank));
  
  // Boosters on board
  const boosterEffects = conservedUnits.flatMap(u => u.boosterCards || (u.boosterCard ? [u.boosterCard] : [])).filter(card => ['A', 'J', 'Q', 'K', 'Joker'].includes(card.rank));

  const effectsCount = discardedEffects.length + scoredEffects.length + boosterEffects.length;
  const effectsGold = effectsCount * 7;

  // Conserved Jokers (in hand or deck): 13 gold each
  const conservedJokersCount = [...player.hand, ...player.deck].filter(card => card.rank === 'Joker').length;
  const conservedJokersGold = conservedJokersCount * 13;

  // Conserved Kings (in hand or deck): 21 gold each
  const conservedKingsCount = [...player.hand, ...player.deck].filter(card => card.rank === 'K').length;
  const conservedKingsGold = conservedKingsCount * 21;

  return {
    total: conservedUnitsGold + effectsGold + conservedJokersGold + conservedKingsGold,
    conservedUnitsGold,
    effectsGold,
    conservedCount,
    effectsCount,
    conservedJokersCount,
    conservedJokersGold,
    conservedKingsCount,
    conservedKingsGold
  };
};

export const formatGold = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absValue >= 1_000_000) {
    const formatted = (absValue / 1_000_000).toFixed(1);
    return `${sign}${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}M`;
  }
  if (absValue >= 1_000) {
    const formatted = (absValue / 1_000).toFixed(1);
    return `${sign}${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}K`;
  }
  return `${sign}${absValue}`;
};

