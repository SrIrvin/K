import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { Unit, Player } from '../types';
import { GameCard } from './GameCard';

interface GoalZoneProps {
  player: Player;
  isOpponent?: boolean;
  canScoreDirectly?: boolean;
}

export const GoalZone: React.FC<GoalZoneProps> = ({ player, isOpponent = false, canScoreDirectly = false }) => {
  const { state, dispatch } = useContext(GameContext);
  
  const isLocalTurn = state.gameType === 'online'
      ? state.localPlayerId === state.currentPlayerId
      : ((state.gameType === 'ai' || state.gameType === 'adventure') ? state.currentPlayerId === 0 : true);

  const handleDirectScore = () => {
      if (canScoreDirectly && isLocalTurn) {
          if (state.kingMoveState?.isMoving) {
              dispatch({ type: 'MOVE_UNIT_DURING_KING_EFFECT', payload: { to: { row: -1, col: -1 } } });
          } else {
              dispatch({ type: 'MOVE_UNIT', payload: { to: { row: -1, col: -1 } } });
          }
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      if (canScoreDirectly && isOpponent && isLocalTurn) {
          e.preventDefault();
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (canScoreDirectly && isOpponent && isLocalTurn) {
          if (state.kingMoveState?.isMoving) {
              dispatch({ type: 'MOVE_UNIT_DURING_KING_EFFECT', payload: { to: { row: -1, col: -1 } } });
          } else {
              dispatch({ type: 'MOVE_UNIT', payload: { to: { row: -1, col: -1 } } });
          }
      }
  };

  return (
      <div 
          className="w-full h-20 sm:h-24 md:h-28 bg-[#2A2A2A]/70 my-1.5 p-2 rounded-lg border-2 border-[#574d3c] flex-shrink-0 relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.9)]"
          onClick={handleDirectScore}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            borderRadius: '12px 10px 14px 8px / 8px 12px 9px 11px',
            borderStyle: 'double',
            borderWidth: '3px'
          }}
      >
          {canScoreDirectly && isOpponent && (
              <div className="absolute inset-0 bg-[#8A6938]/40 border-4 border-[#D8C49A] rounded-lg animate-pulse flex items-center justify-center cursor-pointer shadow-[0_0_25px_rgba(216,196,154,0.5)] z-20">
                  <p className="text-[#D8C49A] font-orbitron text-base sm:text-lg font-black tracking-widest text-shadow-lg">
                    𐎫 REGISTRAR PUNTOS (1) 𐎫
                  </p>
              </div>
          )}
          <div className="flex items-center space-x-2 h-full overflow-x-auto">
              {player.scored.length === 0 && !canScoreDirectly && (
                  <div className="flex items-center justify-center w-full h-full select-none">
                      <p className="text-[#9A8B72]/45 font-orbitron text-xs sm:text-sm tracking-widest uppercase">
                        Altar de Sacrificio (Anotación)
                      </p>
                  </div>
              )}
              {player.scored.map(card => (
                  <div key={card.id} className="h-full flex-shrink-0" style={{ aspectRatio: '5/7' }}>
                      <GameCard 
                          card={card} 
                          isUnitOnBoard={true} 
                          unit={card as Unit}
                          onInfoClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card } })}
                      />
                  </div>
              ))}
          </div>
      </div>
  );
};
