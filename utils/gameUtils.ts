// getUnitSpeed: devuelve la velocidad según el rango
import { Rank } from '../models/types';
export const getUnitSpeed = (rank: Rank): number => {
  const value = parseInt(rank, 10);
  if (value >= 2 && value <= 4) return 3;
  if (value >= 5 && value <= 7) return 2;
  if (value >= 8 && value <= 10) return 1;
  return 0;
};
