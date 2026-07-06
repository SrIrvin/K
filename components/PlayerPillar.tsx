import React from 'react';
import { Player } from '../types';
import { CardBack } from './GameCard';

interface PlayerPillarProps {
  player: Player;
  isOpponent?: boolean;
  title: string;
  winTarget?: number;
  guardianQuote?: string;
}

export const PlayerPillar: React.FC<PlayerPillarProps> = ({ player, isOpponent = false, title, winTarget = 21, guardianQuote }) => {
  const damagePercentage = Math.min(100, (player.damage / winTarget) * 100);

  return (
    <div className="flex flex-col h-full justify-between p-4 text-[#D8C49A] font-runic-text">
      <div className="text-center">
        <h3 className="font-ancient-header text-sm tracking-wider border-b border-[#8A6938] pb-1 mb-2">
          {title}
        </h3>

        {isOpponent && ['Piscina De La Muerte', 'Solar', 'IrwingElSabio', 'Shinigami', 'Moon', 'Katty', 'King21'].includes(player.name) && (
          <div className="mb-2 flex justify-center">
            <img 
              src={`images/history/${player.name}.png`} 
              alt={player.name} 
              className="w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-[#8A6938] object-cover shadow-[0_0_12px_rgba(138,105,56,0.4)] bg-[#1e1a14] animate-fade-in" 
            />
          </div>
        )}

        <p className="text-base font-extrabold font-orbitron text-[#D8C49A] truncate mb-1">{player.name}</p>
        
        {isOpponent && guardianQuote && (
          <div className="mb-4 bg-[#241c14] border border-[#8A6938]/40 p-2.5 rounded-lg text-left shadow-inner relative z-10 animate-fade-in">
            {/* Bubble pointer */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#241c14] border-t border-l border-[#8A6938]/40 rotate-45" />
            <p className="text-[10px] text-[#D8C49A]/80 italic font-runic-text leading-relaxed text-center">
              "{guardianQuote}"
            </p>
          </div>
        )}
        
        {/* Damage Indicator */}
        <div className="mb-2">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-[#9A8B72] uppercase font-bold tracking-widest text-[10px]">Daño Recibido</span>
            <span className="text-[#82443A] font-extrabold font-orbitron">{player.damage} / {winTarget}</span>
          </div>
          <div className="bg-black/40 h-2.5 rounded-full p-0.5 border border-[#574d3c]/50 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#82443A] to-[#ab3e30] h-full shadow-[0_0_8px_#82443A] transition-all duration-500" 
              style={{ width: `${damagePercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center justify-center py-4 my-auto border-y border-[#574d3c]/30">
        <div className="text-center">
          <CardBack count={player.deck.length} type="deck" />
          <div className="mt-1 text-[10px] tracking-widest text-[#9A8B72] uppercase">Mazo ({player.deck.length})</div>
        </div>
        <div className="flex gap-2 justify-center w-full">
          <div className="text-center">
            <CardBack count={player.discard.length} type="discard" />
            <div className="mt-1 text-[9px] tracking-widest text-[#9A8B72] uppercase">Descarte ({player.discard.length})</div>
          </div>
          <div className="text-center">
            <CardBack count={player.scored.length} type="scored" />
            <div className="mt-1 text-[9px] tracking-widest text-[#9A8B72] uppercase">Anote ({player.scored.length})</div>
          </div>
        </div>
      </div>
    </div>
  );
};
