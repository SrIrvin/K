import React from 'react';
import { Card, Unit, CardColor, Suit, Rank } from '../types';

interface GameCardProps {
  card: Card | null;
  isSelected?: boolean;
  onClick?: () => void;
  onInfoClick?: () => void;
  isUnitOnBoard?: boolean;
  unit?: Unit;
}

export const GameCard: React.FC<GameCardProps> = ({ card, isSelected, onClick, onInfoClick, isUnitOnBoard = false, unit }) => {
  if (!card) return <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg bg-gray-700/50 flex-shrink-0"></div>;

  const colorClass = card.color === CardColor.Red ? 'text-red-400' : 'text-gray-300';
  const borderClass = isSelected ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-gray-500';
  const suitIcon = card.suit === Suit.Joker ? '🤡' : card.suit;

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInfoClick?.();
  };

  return (
    <div
      className={`relative w-full h-full rounded-lg p-1 flex flex-col justify-between shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${borderClass} ${card.color === CardColor.Red ? 'bg-red-900/50' : 'bg-black/50'} flex-shrink-0`}
      onClick={onClick}
    >
      {!isUnitOnBoard && onInfoClick && (
         <button onClick={handleInfoClick} className="absolute top-1 right-1 z-10 w-4 h-4 bg-gray-800/80 text-white rounded-full flex items-center justify-center font-bold text-[10px] hover:bg-yellow-500">i</button>
      )}
      <div className={`flex justify-between items-start ${colorClass}`}>
        <span className="font-orbitron text-sm sm:text-base md:text-lg font-bold">{card.rank === 'Joker' ? 'J' : card.rank}</span>
        <span className="text-sm sm:text-base md:text-lg">{suitIcon}</span>
      </div>
      {isUnitOnBoard && unit && (
        <div className="text-center text-white text-[9px] sm:text-[10px] bg-black/30 rounded-md p-0.5">
          {/* Check if the card in the goal zone is a full unit or just a scored card like an Ace */}
          {(typeof unit.currentDamage === 'number' && typeof unit.baseDamage === 'number') ? (
            <>
              <p className="font-bold text-xs sm:text-sm">{unit.currentDamage} / {unit.baseDamage}</p>
              <p className="text-[9px] sm:text-[10px]">Spd: {unit.speed + (unit.boosterCard ? 1 : 0)}</p>
            </>
          ) : <p className="font-bold text-xs sm:text-sm">SCORED</p> }
          <div className="flex justify-center items-center space-x-1 mt-0.5">
            {unit.boosterCard && <span title="Speed Boost from Jack" className="text-xs md:text-sm">🚀</span>}
            {/* Safely access stackedAttackers, as it may not exist on a simple scored card */}
            {unit.stackedAttackers && unit.stackedAttackers.length > 0 && <span title={`${unit.stackedAttackers.length} stacked attacker(s)`} className="text-[9px] sm:text-[10px] bg-red-600 px-1.5 rounded-full">⚔️ {unit.stackedAttackers.length}</span>}
          </div>
        </div>
      )}
      <div className={`flex justify-between items-end ${colorClass} transform rotate-180`}>
        <span className="font-orbitron text-sm sm:text-base md:text-lg font-bold">{card.rank === 'Joker' ? 'J' : card.rank}</span>
        <span className="text-sm sm:text-base md:text-lg">{suitIcon}</span>
      </div>
    </div>
  );
};

export const CardBack: React.FC<{ count: number; type?: 'deck' | 'discard' | 'scored' }> = ({ count, type = 'deck' }) => {
  const gradient = {
    deck: 'from-blue-700 to-purple-800',
    discard: 'from-gray-600 to-gray-800',
    scored: 'from-yellow-600 to-yellow-800'
  }[type];

  const border = {
    deck: 'border-blue-400',
    discard: 'border-gray-500',
    scored: 'border-yellow-400'
  }[type];

  return (
    <div className="relative w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 flex-shrink-0">
      {count > 0 && Array.from({ length: Math.min(count, 5) }).map((_, i) => (
         <div key={i} className={`absolute w-full h-full rounded-lg bg-gradient-to-br ${gradient} shadow-lg border ${border} flex items-center justify-center`} style={{ top: `${i * 2}px`, left: `${i * 2}px` }}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-black/30 flex items-center justify-center font-orbitron text-blue-300 text-base sm:text-lg">E21</div>
         </div>
      ))}
      {count > 0 && <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center font-bold font-orbitron text-xs z-10">{count}</div>}
    </div>
  );
}