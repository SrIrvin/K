import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { Card, Unit, Player, CardColor, Suit, Rank } from '../types';
import { getValidMoves, getKingValidMoves } from '../services/gameService';
import { getAiBestAction } from '../ai/aiService';
import { GameCard, CardBack } from './GameCard';
import { BOARD_ROWS } from '../constants';
import GameBoard from './GameBoard';

// #region CARD DESCRIPTIONS
const CARD_DESCRIPTIONS: Record<Rank, string> = {
    '2': "Unidad Ligera. Daño Base: 2. Velocidad: 3. Se invoca en tu fila de inicio.",
    '3': "Unidad Ligera. Daño Base: 3. Velocidad: 3. Se invoca en tu fila de inicio.",
    '4': "Unidad Ligera. Daño Base: 4. Velocidad: 3. Se invoca en tu fila de inicio.",
    '5': "Unidad Media. Daño Base: 5. Velocidad: 2. Se invoca en tu fila de inicio.",
    '6': "Unidad Media. Daño Base: 6. Velocidad: 2. Se invoca en tu fila de inicio.",
    '7': "Unidad Media. Daño Base: 7. Velocidad: 2. Se invoca en tu fila de inicio.",
    '8': "Unidad Pesada. Daño Base: 8. Velocidad: 1. Se invoca en tu fila de inicio.",
    '9': "Unidad Pesada. Daño Base: 9. Velocidad: 1. Se invoca en tu fila de inicio.",
    '10': "Unidad Pesada. Daño Base: 10. Velocidad: 1. Se invoca en tu fila de inicio.",
    'J': "El Turbo. Otorga +1 de velocidad a una unidad para su siguiente movimiento. Se descarta después de usar.",
    'Q': "La Curandera. Restaura los puntos de daño de una unidad a su valor original y elimina las cartas enemigas apiladas encima.",
    'K': "El Dictador Loco. Obliga a avanzar 1 casilla ortogonal a todas tus unidades. Las que omitas serán eliminadas.",
    'A': "El Mísil Kamikaze. Inflige 1 de daño directo al rival y se va a tu pila de anotación.",
    'Joker': "El Sicario de las Sombras. Elimina instantáneamente del tablero a cualquier unidad enemiga seleccionada."
};
// #endregion

// 🕯️ Ancient Pillar Column - Player Stats & Decks
const PlayerPillar: React.FC<{ player: Player; isOpponent?: boolean; title: string }> = ({ player, isOpponent = false, title }) => {
  const damagePercentage = Math.min(100, (player.damage / 21) * 100);
  
  return (
    <div className="flex flex-col h-full justify-between p-4 text-[#D8C49A] font-runic-text">
      {/* Pillar Header */}
      <div className="text-center">
        <h3 className="font-ancient-header text-sm tracking-wider border-b border-[#8A6938] pb-1 mb-2">
          {title}
        </h3>
        <p className="text-base font-extrabold font-orbitron text-[#D8C49A] truncate mb-2">{player.name}</p>
        
        {/* Damage Indicator */}
        <div className="bg-[#2A2A2A] p-2 rounded border border-[#574d3c] shadow-inner mb-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-[#9A8B72] uppercase font-bold tracking-widest text-[10px]">Daño Recibido</span>
            <span className="text-[#82443A] font-extrabold font-orbitron">{player.damage} / 21</span>
          </div>
          <div className="w-full h-3 bg-[#1e1a14] rounded-full border border-[#574d3c] overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#82443A] to-[#ab3e30] h-full shadow-[0_0_8px_#82443A] transition-all duration-500" 
              style={{ width: `${damagePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Piles (Graves/Decks) */}
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

      {/* Runic decoration at bottom */}
      <div className="text-center text-[#8A6938] font-ancient-header text-sm opacity-50 select-none">
        𐎠 𐎢 𐎤 𐎧
      </div>
    </div>
  );
};

const CardInfoModal: React.FC = () => {
    const { state, dispatch } = useContext(GameContext);
    const card = state.cardInfoModal;
    if (!card) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card: null } })}>
            <div className="stone-modal p-6 text-center max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
              
              {/* Cuneiform designs in modal */}
              <div className="absolute top-2 left-2 text-[#8A6938] text-xs opacity-40">𐎫 𐎬</div>
              <div className="absolute top-2 right-2 text-[#8A6938] text-xs opacity-40">𐎭 𐎮</div>

              <div className="flex justify-center mb-5 h-44">
                  <GameCard card={card} />
              </div>
              
              <h3 className="text-xl font-ancient-header text-[#D8C49A] mb-3 border-b border-[#8A6938] pb-1">
                {card.rank === 'Joker' ? 'El Joker' : `${card.rank} de ${card.suit}`}
              </h3>
              
              <p className="text-sm text-[#D8C49A]/80 font-runic-text leading-relaxed px-2 mb-6">
                {CARD_DESCRIPTIONS[card.rank]}
              </p>
              
              <button 
                onClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card: null } })} 
                className="stone-button w-full text-sm py-2.5"
              >
                Cerrar Tablilla
              </button>
            </div>
        </div>
    );
};


const GameUI: React.FC = () => {
    const { state, dispatch } = useContext(GameContext);
    const { players, currentPlayerId, board, selectedUnitIdOnBoard, gameMode, winner, selectedCardIdInHand, kingMoveState, actionsRemaining } = state;
    
    const [showKingInfo, setShowKingInfo] = useState(false);
    const [showHints, setShowHints] = useState(false);

    const currentPlayer = useMemo(() => players?.[currentPlayerId], [players, currentPlayerId]);
    const opponentPlayer = useMemo(() => players?.[1 - currentPlayerId], [players, currentPlayerId]);
    
    const isPlacingCard = !!selectedCardIdInHand && !kingMoveState?.isMoving;
    const isCurrentPlayerTurn = useMemo(() => currentPlayerId === state.currentPlayerId, [currentPlayerId, state.currentPlayerId]);
    const canAct = useMemo(() => actionsRemaining > 0 && !state.isTargeting && !kingMoveState?.isMoving && isCurrentPlayerTurn, [actionsRemaining, state.isTargeting, kingMoveState, isCurrentPlayerTurn]);

    // 🕯️ Idle timer UX - Highlights options if player is inactive for 20 seconds
    useEffect(() => {
        setShowHints(false);

        // Do not highlight hints if game is over or if it's the AI's turn
        if (gameMode !== 'playing' || (state.gameType === 'ai' && currentPlayerId === 1)) {
            return;
        }

        const timer = setTimeout(() => {
            setShowHints(true);
        }, 20000); // 20 seconds

        return () => clearTimeout(timer);
    }, [
        board, 
        currentPlayerId, 
        actionsRemaining, 
        selectedCardIdInHand, 
        selectedUnitIdOnBoard, 
        state.isTargeting, 
        gameMode
    ]);

    // AI thinking effect trigger
    useEffect(() => {
        if (gameMode === 'playing' && state.gameType === 'ai' && currentPlayerId === 1 && !winner && actionsRemaining > 0 && !kingMoveState?.isMoving) {
            const timer = setTimeout(() => {
                const bestAction = getAiBestAction(state);
                if (bestAction) {
                    dispatch(bestAction);
                } else {
                    dispatch({ type: 'END_TURN' });
                }
            }, 1200); // Slower, more deliberate AI actions
            return () => clearTimeout(timer);
        } else if (gameMode === 'playing' && state.gameType === 'ai' && currentPlayerId === 1 && !winner && actionsRemaining <= 0 && !kingMoveState?.isMoving) {
             const timer = setTimeout(() => dispatch({ type: 'END_TURN' }), 1200);
             return () => clearTimeout(timer);
        }
    }, [state, gameMode, currentPlayerId, winner, actionsRemaining, kingMoveState, dispatch]);

    const selectedUnit = useMemo(() => board.flat().find(u => u?.id === selectedUnitIdOnBoard), [board, selectedUnitIdOnBoard]);
    
    const validMoves = useMemo(() => {
      if (!selectedUnit) return [];
      if (kingMoveState?.isMoving) {
        return getKingValidMoves(selectedUnit, board);
      }
      return getValidMoves(selectedUnit, board, currentPlayerId);
    }, [selectedUnit, board, currentPlayerId, kingMoveState]);

    // Generate 15 dust particles for background animation
    const dustParticles = useMemo(() => {
      return Array.from({ length: 15 }).map((_, i) => {
        const size = Math.random() * 3 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = Math.random() * 15 + 20;
        return (
          <div
            key={i}
            className="dust-particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      });
    }, []);

    if (!currentPlayer || !opponentPlayer) {
      return <div className="h-screen w-screen flex items-center justify-center bg-[#2A2A2A] text-[#D8C49A] font-ancient-header text-xl">Invocando el altar...</div>;
    }

    // Split hand cards for better visual spacing
    const specialCards = currentPlayer.hand.filter(c => ['J', 'Q', 'K', 'A', 'Joker'].includes(c.rank));
    const unitCards = currentPlayer.hand.filter(c => !['J', 'Q', 'K', 'A', 'Joker'].includes(c.rank)).sort((a,b) => parseInt(a.rank) - parseInt(a.rank));

    const handleSelectCard = (cardId: string | null) => {
        if (canAct || selectedCardIdInHand === cardId) {
            dispatch({ type: 'SELECT_CARD_IN_HAND', payload: { cardId } });
        }
    };

    const resetIdleTimer = () => {
        if (showHints) {
            setShowHints(false);
        }
    };

    return (
        <div 
          className="ancient-bg flex h-screen w-screen overflow-hidden text-white relative" 
          onClick={resetIdleTimer}
        >
            {/* Visual Overlays */}
            <div className="archaeological-vignette" />
            <div className="rune-overlay" />
            <div className="dust-container">{dustParticles}</div>

            {/* 🏛️ Layout: Widescreen Landscape Altar (3 columns: Left Pillar, Center Altar, Right Pillar) */}
            <div className="flex flex-col md:flex-row w-full h-full relative z-20 overflow-hidden">
                
                {/* 1. LEFT SIDEBAR PILLAR: Opponent Stats */}
                <div className="hidden md:flex flex-col w-[18%] lg:w-[15%] h-full bg-[#1e1a14]/90 border-r-4 border-[#8A6938] shadow-[10px_0_30px_rgba(0,0,0,0.8)] z-10">
                    <PlayerPillar 
                      player={opponentPlayer} 
                      isOpponent={true} 
                      title={state.gameType === 'ai' ? "Fuerza AI" : "Rival"} 
                    />
                </div>

                {/* 2. CENTER AREA: The Altar Floor (GameBoard & Active Hand) */}
                <div className="flex-grow flex flex-col h-full min-w-0 p-2 justify-between items-center relative">
                    
                    {/* Tiny header for mobile/portrait backup */}
                    <div className="md:hidden flex justify-between items-center w-full px-2 py-1 bg-[#1e1a14]/80 border-b border-[#8A6938] rounded-md text-[#D8C49A] text-xs">
                        <span className="font-extrabold font-orbitron">{currentPlayer.name} (Dmg: {currentPlayer.damage})</span>
                        <span className="text-yellow-500 font-bold font-orbitron">Acciones: {actionsRemaining}</span>
                        <span className="font-extrabold font-orbitron">{opponentPlayer.name} (Dmg: {opponentPlayer.damage})</span>
                    </div>

                    {/* Game board takes about 70% of the screen height */}
                    <div className="flex-grow flex items-center justify-center w-full min-h-0 py-1 md:py-2">
                        <GameBoard 
                          board={board}
                          currentPlayer={currentPlayer}
                          opponentPlayer={opponentPlayer}
                          validMoves={validMoves}
                          showHints={showHints}
                        />
                    </div>

                    {/* Current Player's Active Hand (tactile slots) */}
                    {state.gameMode === 'playing' && (
                        <div className="w-full max-w-2xl bg-[#1e1a14]/60 p-2 rounded-lg border-2 border-[#574d3c] flex flex-col gap-2 relative shadow-inner shadow-black mb-1.5 flex-shrink-0">
                            {/* Hand Header */}
                            <div className="flex justify-between items-center px-1 text-[10px] sm:text-xs text-[#9A8B72] font-runic-text">
                              <span className="uppercase tracking-widest font-bold">Tus Unidades (Desplegar)</span>
                              <span className="uppercase tracking-widest font-bold">Habilidades Especiales</span>
                            </div>

                            {/* Hand Cards */}
                            {(() => {
                              const isCardHinted = showHints && actionsRemaining > 0 && !selectedCardIdInHand && !selectedUnitIdOnBoard;
                              return (
                                <div className="flex justify-between items-center gap-4 h-[86px] sm:h-[96px] md:h-[120px]">
                                    {/* Unit Cards Area (Left) */}
                                    <div className="flex-grow flex gap-2 overflow-x-auto h-full pr-3 border-r border-[#574d3c]/40">
                                        {unitCards.length === 0 ? (
                                            <div className="flex items-center justify-center w-full h-full text-xs text-[#9A8B72]/40 italic">
                                              Sin cartas de unidad
                                            </div>
                                        ) : (
                                            unitCards.map(card => (
                                                <div 
                                                  key={card.id} 
                                                  className="h-full flex-shrink-0"
                                                  style={{ aspectRatio: '5/7' }}
                                                  onClick={() => handleSelectCard(selectedCardIdInHand === card.id ? null : card.id)}
                                                >
                                                    <div className={`w-full h-full ${selectedCardIdInHand === card.id ? 'stone-card-selected' : 'stone-card-container'} ${isCardHinted ? 'idle-hint-glow' : ''}`}>
                                                        <GameCard 
                                                            card={card}
                                                            isSelected={selectedCardIdInHand === card.id}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Special Cards Area (Right) */}
                                    <div className="flex gap-2 overflow-x-auto h-full pl-1 max-w-[45%]">
                                        {specialCards.length === 0 ? (
                                            <div className="flex items-center justify-center w-40 h-full text-xs text-[#9A8B72]/40 italic">
                                              Sin habilidades
                                            </div>
                                        ) : (
                                            specialCards.map(card => (
                                                <div 
                                                  key={card.id} 
                                                  className="h-full flex flex-col items-center justify-between"
                                                  style={{ aspectRatio: '5/7' }}
                                                >
                                                    <div className={`flex-grow w-full max-h-[80%] stone-card-container ${isCardHinted ? 'idle-hint-glow' : ''}`}>
                                                        <GameCard card={card} onInfoClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card } })} />
                                                    </div>
                                                    <button 
                                                      onClick={() => dispatch({ type: 'PLAY_SPECIAL_CARD', payload: { card } })} 
                                                      disabled={!canAct} 
                                                      className={`stone-button stone-button-blue text-[8px] sm:text-[9px] py-0.5 px-2 mt-1 w-full ${isCardHinted ? 'idle-hint-glow' : ''}`}
                                                    >
                                                      Activar (1)
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                              );
                            })()}
                        </div>
                    )}
                </div>

                {/* 3. RIGHT SIDEBAR PILLAR: Current Player Details & Action Center */}
                <div className="hidden md:flex flex-col w-[18%] lg:w-[15%] h-full bg-[#1e1a14]/90 border-l-4 border-[#8A6938] shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-10 justify-between">
                    {/* Current Player Stats */}
                    <div className="flex-shrink-0">
                      <PlayerPillar 
                        player={currentPlayer} 
                        title="Tu Guardián" 
                      />
                    </div>

                    {/* Action Hub / Control Panel */}
                    <div className="flex-grow flex flex-col justify-end p-4 border-t border-[#574d3c]/30">
                        {isCurrentPlayerTurn && gameMode === 'playing' ? (
                          <div className="flex flex-col gap-3 w-full bg-[#2A2A2A]/50 p-3 rounded-lg border border-[#574d3c] shadow-inner mb-3 text-center">
                            <div className="text-[#D8C49A] font-runic-text font-bold text-xs uppercase tracking-widest">
                              Acciones Libres
                            </div>
                            <div className="text-4xl font-extrabold font-orbitron text-[#D8C49A] tracking-tighter my-1">
                              {actionsRemaining}
                            </div>
                            
                            <button 
                              onClick={() => dispatch({ type: 'DRAW_CARD'})} 
                              disabled={!canAct} 
                              className={`stone-button w-full py-2.5 text-xs text-[#1e1a14] ${showHints && actionsRemaining > 0 && !selectedCardIdInHand && !selectedUnitIdOnBoard ? 'idle-hint-glow' : ''}`}
                            >
                              Robar (1 Act)
                            </button>
                            
                            <button 
                              onClick={() => dispatch({ type: 'END_TURN'})} 
                              disabled={kingMoveState?.isMoving} 
                              className={`stone-button stone-button-red w-full py-2.5 text-xs ${showHints && actionsRemaining === 0 ? 'idle-hint-glow' : ''}`}
                            >
                              Terminar Turno
                            </button>
                          </div>
                        ) : (
                          <div className="w-full bg-[#2A2A2A]/20 p-3 rounded-lg border border-[#574d3c]/40 text-center mb-3">
                            <p className="text-xs text-[#9A8B72] italic uppercase tracking-wider animate-pulse">
                              Esperando al rival...
                            </p>
                          </div>
                        )}

                        {/* Recent History log */}
                        <div className="h-20 bg-[#120f0b] rounded border border-[#574d3c] p-2 overflow-y-auto text-[9px] sm:text-[10px] text-[#9A8B72] font-mono shadow-inner">
                          {state.log.slice(0, 3).map((l, index) => (
                            <div key={index} className="truncate border-b border-[#574d3c]/10 pb-0.5 mb-0.5">
                              <span className="text-[#8A6938] font-bold">&gt; </span>
                              {l}
                            </div>
                          ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals & Overlays */}
            <CardInfoModal />
            
            {/* King Command Floating HUD Alert (Non-blocking) */}
            {kingMoveState?.isMoving && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 max-w-sm w-[90%] pointer-events-none">
                <div className="stone-modal p-4 flex flex-col items-center border-2 border-[#8A6938] shadow-2xl pointer-events-auto bg-[#1e1a14]/95 text-center">
                  <h2 className="text-base font-ancient-header text-[#D8C49A] animate-pulse tracking-widest flex items-center gap-1.5 mb-1">
                    👑 MANDO DEL REY 👑
                  </h2>
                  <div className="h-0.5 w-12 bg-[#8A6938] mb-2" />
                  <p className="text-xs text-[#D8C49A] font-runic-text leading-snug">
                    Avanza tus unidades (ortogonal). Las unidades no movidas serán destruidas al finalizar la orden.
                  </p>
                  
                  <button
                    onClick={() => dispatch({type: 'FINISH_KING_MOVE'})}
                    className="stone-button stone-button-red text-xs py-1.5 px-6 mt-3 shadow-md"
                  >
                    Terminar Orden ({kingMoveState.unitsToMove.length} pendientes)
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Modal overlay (Runic celebration) */}
            {gameMode === 'game_over' && winner && (
                <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
                  <div className="stone-modal p-8 text-center border-4 border-[#8A6938] max-w-md w-full shadow-[0_0_50px_rgba(216,196,154,0.4)] relative">
                    {/* Glowing golden light animation effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#8A6938]/10 to-transparent animate-pulse pointer-events-none rounded-lg" />
                    
                    <h2 className="text-3xl md:text-5xl font-ancient-header text-[#D8C49A] mb-4 tracking-widest animate-bounce">
                      ¡JUICIO FINAL!
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#8A6938] to-transparent mx-auto mb-6" />
                    
                    <p className="text-lg text-[#9A8B72] tracking-wider mb-2">Victoria del Protector</p>
                    <p className="text-2xl md:text-3xl font-extrabold font-ancient-header text-[#D8C49A] mb-8 drop-shadow-md">
                      {winner.name}
                    </p>
                    
                    <button 
                      onClick={() => dispatch({type: 'RESET_TO_MENU'})} 
                      className="stone-button text-base py-3 px-8 shadow-2xl"
                    >
                      Volver al Templo (Menú)
                    </button>
                  </div>
                </div>
            )}

            {/* Switch Turn device passing modal (Local 2 player) */}
            {gameMode === 'switch_turn' && (
              <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
                <div className="stone-modal p-8 text-center max-w-sm w-full border-4 border-[#8A6938] shadow-2xl">
                  <h2 className="text-2xl md:text-3xl font-ancient-header text-[#D8C49A] mb-3 tracking-widest">
                    ENTREGAR TABLILLA
                  </h2>
                  <div className="h-0.5 w-16 bg-[#8A6938] mx-auto mb-4" />
                  
                  <p className="text-sm text-[#9A8B72] uppercase tracking-wider mb-2">Siguiente Turno de</p>
                  <p className="text-xl md:text-2xl font-bold font-ancient-header text-[#D8C49A] mb-8">
                    {opponentPlayer?.name}
                  </p>
                  
                  <button 
                    onClick={() => dispatch({type: 'BEGIN_NEW_TURN'})} 
                    className="stone-button stone-button-blue text-sm py-3 px-8 w-full shadow-lg"
                  >
                    Tomar Tablilla (Iniciar Turno)
                  </button>
                </div>
              </div>
            )}
        </div>
    );
}

export default GameUI;
