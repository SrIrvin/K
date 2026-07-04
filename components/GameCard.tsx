import React from 'react';
import { Card, Unit, CardColor, Suit, Rank } from '../types';
import { getCardImagePath } from '../utils/cardUtils';

interface GameCardProps {
  card: Card | null;
  isSelected?: boolean;
  onClick?: () => void;
  onInfoClick?: () => void;
  isUnitOnBoard?: boolean;
  unit?: Unit;
  isPreview?: boolean;
}

export const GameCard = React.memo<GameCardProps>(({ card, isSelected, onClick, onInfoClick, isUnitOnBoard = false, unit, isPreview = false }) => {
  if (!card) {
    return (
      <div className="w-full h-full border-4 border-dashed border-[#574d3c] rounded-lg bg-[#2A2A2A]/40 flex-shrink-0 flex items-center justify-center">
        <span className="text-[#9A8B72]/40 text-xs font-bold tracking-widest uppercase">Vacío</span>
      </div>
    );
  }

  const isRed = card.color === CardColor.Red;
  
  const isSpecial = ['J', 'Q', 'K', 'A', 'Joker'].includes(card.rank);
  const darkFantasyAura = isSelected 
    ? '' 
    : isSpecial 
      ? 'glow-necrotic levitate-spell' 
      : (card.rank && parseInt(card.rank, 10) >= 8) 
        ? 'glow-void' 
        : (unit && unit.boosterCard ? 'glow-mystic' : '');
  
  // Custom borders, backgrounds, gradients and text colors to clearly differentiate Red (Hearts/Diamonds) and Black (Clubs/Spades)
  const borderClass = isSelected
    ? 'border-[#4facfe] ring-4 ring-[#4facfe]/40 shadow-[0_0_20px_rgba(79,172,254,0.6)] scale-105 z-10'
    : isRed
      ? 'border-[#82443A]/85 hover:border-[#c25a4d]'
      : 'border-[#574d3c] hover:border-[#9A8B72]';

  const cardBgClass = isRed ? 'bg-[#361e1a]' : 'bg-[#1c1a17]';
  const textClass = isRed ? 'text-[#c25a4d]' : 'text-[#D8C49A]';
  const suitTextClass = isRed ? 'text-[#e07567] bg-[#361e1a]/95' : 'text-[#9A8B72] bg-[#1c1a17]/95';

  const suitIcon = card.suit === Suit.Joker ? '𐎫' : card.suit; // Runic representation for Joker

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInfoClick?.();
  };

  return (
    <div
      className={`relative w-full h-full rounded-lg border-2 p-1.5 flex flex-col justify-between shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${borderClass} ${cardBgClass} ${darkFantasyAura} overflow-hidden flex-shrink-0`}
      onClick={onClick}
      style={{
        boxShadow: isSelected ? '0 0 20px rgba(79,172,254,0.5)' : 'inset 0 0 10px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)',
        borderRadius: '8px 6px 9px 5px / 6px 9px 5px 8px' // Imperfect hand-carved look
      }}
    >
      {/* 🖼️ Card Illustration Layer (WebP optimized asset) */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src={getCardImagePath(card)} 
          alt="" 
          className={`w-full h-full object-cover contrast-[1.1] ${
            isPreview 
              ? 'opacity-95 brightness-[1.05]' 
              : `opacity-55 brightness-[0.7] ${isRed ? 'sepia-[0.4] saturate-[1.4] hue-rotate-[-10deg]' : 'sepia-[0.2]'}`
          }`} 
        />
        {/* Subtle stone texture overlay with red/dark color tinting */}
        <div className={`absolute inset-0 bg-gradient-to-t ${isRed ? 'from-[#361e1a] via-[#82443A]/25 to-transparent' : 'from-[#1c1a17] via-transparent to-transparent'} ${isPreview ? 'opacity-30' : 'opacity-90'}`} />
      </div>

      {/* Info Button Overlay */}
      {onInfoClick && (
         <button 
           onClick={handleInfoClick} 
           className="absolute top-[32px] right-1.5 z-20 w-4 h-4 bg-[#8A6938]/90 text-white rounded-full flex items-center justify-center font-bold text-[9px] hover:bg-[#D8C49A] hover:text-[#2A2A2A] shadow-md border border-[#D8C49A]/30 transition-colors"
           title="Info"
         >
           i
         </button>
      )}

      {/* Top Header Row (z-10 to render over image) */}
      <div className="flex justify-between items-start z-10 select-none">
        <span className={`font-orbitron text-sm sm:text-base md:text-lg font-black tracking-tighter ${textClass}`}>
          {card.rank === 'Joker' ? '🃏' : card.rank}
        </span>
        <span className={`text-xs sm:text-sm md:text-base font-bold px-1.5 py-0.5 rounded border ${isRed ? 'border-[#82443A]/50' : 'border-[#574d3c]/50'} ${suitTextClass}`}>
          {suitIcon}
        </span>
      </div>

      {/* Center Details Layer for Units on Board */}
      {isUnitOnBoard && unit && (
        <div className="text-center text-[#D8C49A] text-[9px] sm:text-[10px] bg-[#2A2A2A]/90 rounded-md p-1 border border-[#574d3c] z-10 shadow-lg mx-0.5">
          {/* Check if the card in the goal zone is a full unit or just a scored card */}
          {(typeof unit.currentDamage === 'number' && typeof unit.baseDamage === 'number') ? (
            <>
              {/* Damage Display */}
              <div className="flex justify-center items-center space-x-1 mb-0.5">
                <span className="text-[10px] sm:text-xs font-extrabold text-[#D8C49A] font-orbitron">
                  {unit.currentDamage}
                </span>
                <span className="text-[#9A8B72] text-[8px] sm:text-[9px]">/</span>
                <span className="text-[#9A8B72] text-[9px] sm:text-[10px] font-medium">
                  {unit.baseDamage}
                </span>
              </div>
              
              {/* Speed Display */}
              <div className="text-[8px] sm:text-[9px] text-[#9A8B72] border-t border-[#574d3c]/50 pt-0.5 font-runic-text">
                Spd: <span className="text-[#D8C49A] font-bold">{unit.speed + (unit.boosterCard ? 1 : 0)}</span>
              </div>
            </>
          ) : (
            <p className="font-bold text-[8px] sm:text-[10px] tracking-wider text-[#8A6938]">TOUCHDOWN</p>
          )}

          {/* Boosters & Attackers Indicators */}
          {(unit.boosterCard || (unit.stackedAttackers && unit.stackedAttackers.length > 0)) && (
            <div className="flex justify-center items-center space-x-1.5 mt-1 pt-0.5 border-t border-[#574d3c]/30">
              {unit.boosterCard && (
                <span title="Jack Speed Boost" className="text-[10px] animate-pulse">⚡</span>
              )}
              {unit.stackedAttackers && unit.stackedAttackers.length > 0 && (
                <span 
                  title={`${unit.stackedAttackers.length} stacked attacker(s)`} 
                  className="text-[8px] font-bold bg-[#82443A] text-white px-1.5 py-0.2 rounded-full border border-[#D8C49A]/20"
                >
                  ⚔️ {unit.stackedAttackers.length}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Row (Upside down, traditional card style) */}
      <div className="flex justify-between items-end z-10 select-none transform rotate-180">
        <span className={`font-orbitron text-sm sm:text-base md:text-lg font-black tracking-tighter ${textClass}`}>
          {card.rank === 'Joker' ? '🃏' : card.rank}
        </span>
        <span className={`text-xs sm:text-sm md:text-base font-bold px-1.5 py-0.5 rounded border ${isRed ? 'border-[#82443A]/50' : 'border-[#574d3c]/50'} ${suitTextClass}`}>
          {suitIcon}
        </span>
      </div>
    </div>
  );
},
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isUnitOnBoard === nextProps.isUnitOnBoard &&
      prevProps.isPreview === nextProps.isPreview &&
      prevProps.card?.id === nextProps.card?.id &&
      prevProps.card?.rank === nextProps.card?.rank &&
      prevProps.card?.suit === nextProps.card?.suit &&
      prevProps.card?.color === nextProps.card?.color &&
      prevProps.unit?.id === nextProps.unit?.id &&
      prevProps.unit?.currentDamage === nextProps.unit?.currentDamage &&
      prevProps.unit?.baseDamage === nextProps.unit?.baseDamage &&
      prevProps.unit?.speed === nextProps.unit?.speed &&
      prevProps.unit?.hasMoved === nextProps.unit?.hasMoved &&
      prevProps.unit?.boosterCard?.id === nextProps.unit?.boosterCard?.id &&
      (prevProps.unit?.stackedAttackers || []).length === (nextProps.unit?.stackedAttackers || []).length
    );
  }
);

export const CardBack = React.memo<{ count: number; type?: 'deck' | 'discard' | 'scored' }>(({ count, type = 'deck' }) => {
  const gradientClass = {
    deck: 'from-[#446881] to-[#2A2A2A]',
    discard: 'from-[#60584b] to-[#2A2A2A]',
    scored: 'from-[#8A6938] to-[#2A2A2A]'
  }[type];

  const borderClass = {
    deck: 'border-[#385B74]/80',
    discard: 'border-[#9A8B72]/60',
    scored: 'border-[#8A6938]/80'
  }[type];

  const badgeBg = {
    deck: 'bg-[#385B74]',
    discard: 'bg-[#9A8B72]',
    scored: 'bg-[#8A6938]'
  }[type];

  return (
    <div className="relative w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 flex-shrink-0">
      {count > 0 && Array.from({ length: Math.min(count, 4) }).map((_, i) => (
         <div 
           key={i} 
           className={`absolute w-full h-full rounded-lg bg-gradient-to-br ${gradientClass} shadow-xl border-2 ${borderClass} flex items-center justify-center transition-all duration-300`} 
           style={{ 
             top: `${i * 2.5}px`, 
             left: `${i * 2.5}px`,
             boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8), 0 4px 6px rgba(0,0,0,0.5)',
             borderRadius: '8px 6px 9px 5px / 6px 9px 5px 8px' // Imperfect hand-carved
           }}
         >
           {/* Center Ancient Symbol */}
           <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-black/40 border border-[#D8C49A]/20 flex items-center justify-center font-ancient-header text-[#D8C49A] text-xs sm:text-sm">
             𐎫
           </div>
         </div>
      ))}
      {count > 0 && (
        <div className={`absolute -bottom-1 -right-1 ${badgeBg} text-[#D8C49A] border border-[#D8C49A]/30 rounded-full w-5 h-5 flex items-center justify-center font-bold font-orbitron text-xs z-10 shadow-lg`}>
          {count}
        </div>
      )}
    </div>
  );
});