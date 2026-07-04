import React, { useContext, useState, useRef } from 'react';
import { GameContext } from '../context/GameContext';
import { Unit, Player, Card, Rank } from '../types';
import { GameCard } from './GameCard';
import { GoalZone } from './GoalZone';
import { BOARD_ROWS } from '../constants';
import { getKingValidMoves } from '../services/gameService';

interface GameBoardProps {
  board: (Unit | null)[][];
  currentPlayer: Player;
  opponentPlayer: Player;
  validMoves: { row: number, col: number }[];
  showHints: boolean;
}



const GameBoard: React.FC<GameBoardProps> = ({ board, currentPlayer, opponentPlayer, validMoves, showHints }) => {
    const { state, dispatch } = useContext(GameContext);
    const { selectedCardIdInHand, selectedUnitIdOnBoard, currentPlayerId, isTargeting, actionsRemaining, kingMoveState } = state;
    const playerStartRow = currentPlayerId === 0 ? BOARD_ROWS - 1 : 0;

    // Zoom & Pan States
    const [zoom, setZoom] = useState<number>(1.0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (zoom <= 1.0 || !containerRef.current) {
            if (pan.x !== 0 || pan.y !== 0) {
                setPan({ x: 0, y: 0 });
            }
            return;
        }
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pctX = x / rect.width;
        const pctY = y / rect.height;

        // Pan range based on container sizes
        const maxPanX = ((zoom - 1) * rect.width) / 2;
        const maxPanY = ((zoom - 1) * rect.height) / 2;

        // Edge-Scrolling with Deadzone logic:
        // No movement in the middle 50% of the board (from 25% to 75%).
        // Moving mouse near the edges smoothly slides the board.
        let factorX = 0;
        if (pctX < 0.25) {
            // Map pctX from [0.25 to 0] to [0 to 1]
            factorX = (0.25 - pctX) / 0.25;
        } else if (pctX > 0.75) {
            // Map pctX from [0.75 to 1.0] to [0 to -1]
            factorX = -(pctX - 0.75) / 0.25;
        }

        let factorY = 0;
        if (pctY < 0.25) {
            // Map pctY from [0.25 to 0] to [0 to 1] (slides board DOWN, showing the TOP)
            factorY = (0.25 - pctY) / 0.25;
        } else if (pctY > 0.75) {
            // Map pctY from [0.75 to 1.0] to [0 to -1] (slides board UP, showing the BOTTOM)
            factorY = -(pctY - 0.75) / 0.25;
        }

        // Apply smooth clamping
        const finalFactorX = Math.min(1, Math.max(-1, factorX));
        const finalFactorY = Math.min(1, Math.max(-1, factorY));

        setPan({
            x: finalFactorX * maxPanX,
            y: finalFactorY * maxPanY
        });
    };

    const handleMouseLeave = () => {
        setPan({ x: 0, y: 0 });
    };

    const isLocalTurn = state.gameType === 'online'
        ? state.localPlayerId === state.currentPlayerId
        : (state.gameType === 'ai' ? state.currentPlayerId === 0 : true);

    const handleCellInteraction = (row: number, col: number) => {
        if (!isLocalTurn) return;
        const unitInCell = board[row][col];
        
        // During King's Move, logic is different
        if (kingMoveState?.isMoving) {
            if (kingMoveState.selectedUnitId) {
                 const isKingMoveValid = validMoves.some(m => m.row === row && m.col === col);
                 if (isKingMoveValid) {
                     dispatch({ type: 'MOVE_UNIT_DURING_KING_EFFECT', payload: { to: { row, col } } });
                 } else {
                     dispatch({ type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: null } });
                 }
            } else if (unitInCell) {
                dispatch({ type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: unitInCell.id }});
            }
            return;
        }

        if (actionsRemaining <= 0 && !isTargeting) return;

        // Action 1: Use a special ability on a target
        if (isTargeting) {
            if (unitInCell) {
                dispatch({ type: 'USE_ABILITY_ON_TARGET', payload: { unitId: unitInCell.id } });
            }
            return;
        }

        // Action 2: Place a unit from hand
        if (selectedCardIdInHand) {
            dispatch({ type: 'PLACE_UNIT', payload: { row, col } });
            return;
        }

        // Action 3: Move or attack with a selected unit
        if (selectedUnitIdOnBoard) {
            const isMoveValid = validMoves.some(m => m.row === row && m.col === col);
            if (!isMoveValid) {
                dispatch({ type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: null } });
                return;
            }

            dispatch({ type: 'MOVE_UNIT', payload: { to: { row, col } } });
            return;
        }

        // Action 4: Select a unit on the board
        if (unitInCell) {
            if (unitInCell.color === currentPlayer.color && !unitInCell.hasMoved) {
                 dispatch({ type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: unitInCell.id } });
            }
        }
    };

    const handleDrop = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault();
        if (!isLocalTurn) return;
        const draggedCardId = e.dataTransfer.getData('cardId');
        const draggedUnitId = e.dataTransfer.getData('unitId');

        if (draggedUnitId || selectedUnitIdOnBoard) {
            // Dragged a unit on board to a destination
            const isMoveValid = validMoves.some(m => m.row === row && m.col === col);
            if (isMoveValid) {
                dispatch({ type: 'MOVE_UNIT', payload: { to: { row, col } } });
            }
        } else if (draggedCardId || selectedCardIdInHand) {
            // Dragged a card from hand to a board cell
            if (isTargeting) {
                const unitInCell = board[row][col];
                if (unitInCell) {
                    dispatch({ type: 'USE_ABILITY_ON_TARGET', payload: { unitId: unitInCell.id } });
                }
            } else {
                if (!kingMoveState?.isMoving) {
                    dispatch({ type: 'PLACE_UNIT', payload: { row, col } });
                }
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const canScoreDirectly = validMoves.some(m => m.row === -1 && m.col === -1);

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full relative overflow-hidden flex flex-col justify-center items-center select-none"
        >
            {/* 🔎 Floating Ancient Zoom Controls */}
            <div className="absolute top-2 right-2 z-30 flex items-center gap-1 bg-[#1e1a14]/95 border border-[#8A6938] rounded-lg p-1.5 shadow-[0_5px_15px_rgba(0,0,0,0.8)] text-xs font-runic-text">
                <button 
                  onClick={() => setZoom(prev => Math.max(0.3, parseFloat((prev - 0.1).toFixed(1))))}
                  className="w-7 h-7 flex items-center justify-center bg-[#2A2A2A] hover:bg-[#8A6938] hover:text-[#1e1a14] border border-[#574d3c] rounded text-[#D8C49A] font-black transition-all cursor-pointer text-base"
                  title="Alejar (Zoom Out)"
                >
                  -
                </button>
                <button 
                  onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
                  className="px-2 h-7 flex items-center justify-center bg-[#2A2A2A] hover:bg-[#8A6938] hover:text-[#1e1a14] border border-[#574d3c] rounded text-[#D8C49A] text-[10px] font-bold tracking-wider transition-all cursor-pointer font-orbitron"
                  title="Restablecer (100%)"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button 
                  onClick={() => setZoom(prev => Math.min(2.0, parseFloat((prev + 0.1).toFixed(1))))}
                  className="w-7 h-7 flex items-center justify-center bg-[#2A2A2A] hover:bg-[#8A6938] hover:text-[#1e1a14] border border-[#574d3c] rounded text-[#D8C49A] font-black transition-all cursor-pointer text-base"
                  title="Acercar (Zoom In)"
                >
                  +
                </button>
            </div>

            {/* Zoomable & Pannable Board Wrapper */}
            <div 
                className="w-full h-full flex flex-col justify-center items-center p-1 sm:p-2"
                style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transformOrigin: 'center center',
                    transition: zoom === 1.0 
                        ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                        : 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Opponent's Goal Zone (Top) */}
                <GoalZone player={opponentPlayer} isOpponent={true} canScoreDirectly={canScoreDirectly} />
                
                {/* The altar containing the board */}
                <div className="w-full max-w-lg mx-auto flex-grow my-1 p-3 bg-[#40382d]/50 border-4 border-[#8A6938] rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.1)] relative" style={{ aspectRatio: '4 / 5' }}>
                  
                  {/* Inner sand background layer */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_rgba(0,0,0,0.65)_90%)] z-0 pointer-events-none rounded-lg" />
                  
                  <div className="grid grid-cols-4 grid-rows-5 gap-1.5 sm:gap-2.5 w-full h-full relative z-10">
                    {board.map((row, rowIndex) => (
                      row.map((unit, colIndex) => {
                        const isMovable = validMoves.some(m => m.row === rowIndex && m.col === colIndex);
                        const selectedRank = currentPlayer.hand.find(c => c.id === selectedCardIdInHand)?.rank;
                        const isNumberCardSelected = selectedRank && !(['J','Q','K','A','Joker'] as Rank[]).includes(selectedRank);
                        
                        const isKingMoveActive = !!kingMoveState?.isMoving;
                        const isPlaceable = !isKingMoveActive && isNumberCardSelected && rowIndex === playerStartRow && !unit;
                        
                        const goalRow = currentPlayerId === 0 ? 0 : BOARD_ROWS - 1;
                        const selectedUnit = board.flat().find(u => u?.id === selectedUnitIdOnBoard);
                        const canUnitScore = !isKingMoveActive && selectedUnit && selectedUnit.position.row === goalRow && !selectedUnit.hasMoved;

                        const isUnitToBeMovedByKing = isKingMoveActive && unit && kingMoveState.unitsToMove.includes(unit.id);

                        let cellStateClass = '';
                        if (isMovable) {
                          cellStateClass = 'stone-cell-valid';
                        } else if (isTargeting && unit) {
                          cellStateClass = 'stone-cell-target';
                        } else if (isPlaceable) {
                          // Light yellow/bronze pulse for placing spots
                          cellStateClass = 'border-[#8A6938] bg-[#D8C49A]/15 cursor-pointer shadow-[0_0_12px_rgba(216,196,154,0.3)] animate-pulse';
                        } else {
                          cellStateClass = 'stone-cell-cracked';
                        }

                        let selectionClass = '';
                        if (isKingMoveActive) {
                            if (selectedUnitIdOnBoard === unit?.id) {
                                selectionClass = 'scale-105 ring-4 ring-[#4facfe] z-10';
                            } else if (isUnitToBeMovedByKing) {
                                selectionClass = 'animate-pulse ring-2 ring-[#82443A]';
                            }
                        } else if (selectedUnitIdOnBoard === unit?.id) {
                            selectionClass = 'scale-105';
                        }

                        return (
                          <div 
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-full h-full relative stone-cell transition-all duration-300 hover:brightness-110 ${cellStateClass}`}
                            onClick={() => handleCellInteraction(rowIndex, colIndex)}
                            onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                            onDragOver={handleDragOver}
                          >
                            
                            {unit && (() => {
                              const isUnitHinted = showHints && 
                                                   actionsRemaining > 0 &&
                                                   !selectedUnitIdOnBoard && 
                                                   !selectedCardIdInHand && 
                                                   !isKingMoveActive &&
                                                   unit.color === currentPlayer.color && 
                                                   !unit.hasMoved;

                              return (
                                <div 
                                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 p-1 ${selectionClass} ${actionsRemaining > 0 && !isKingMoveActive && unit.color === currentPlayer.color && !unit.hasMoved ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCellInteraction(rowIndex, colIndex);
                                  }}
                                  draggable={actionsRemaining > 0 && !isKingMoveActive && unit.color === currentPlayer.color && !unit.hasMoved}
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData('unitId', unit.id);
                                    dispatch({ type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: unit.id } });
                                  }}
                                  onDragEnd={() => {
                                    setTimeout(() => {
                                      dispatch({ type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: null } });
                                    }, 100);
                                  }}
                                >
                                  <div className={`w-full h-full stone-piece ${selectedUnitIdOnBoard === unit.id && !isKingMoveActive ? 'stone-piece-selected' : ''} ${isUnitHinted ? 'idle-unit-glow' : ''}`}>
                                    <GameCard 
                                      unit={unit} 
                                      isUnitOnBoard={true} 
                                      card={unit} 
                                      isSelected={selectedUnitIdOnBoard === unit.id && !isKingMoveActive} 
                                      onInfoClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card: unit } })}
                                    />
                                  </div>

                                  {unit.id === selectedUnitIdOnBoard && canUnitScore && actionsRemaining > 0 && (
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SCORE_UNIT' })}}
                                       className={`absolute -bottom-2.5 z-20 px-3 py-1 text-[9px] sm:text-[10px] font-ancient-header font-bold text-white bg-[#8A6938] rounded-lg border border-[#D8C49A] shadow-[0_4px_8px_rgba(0,0,0,0.8)] hover:bg-[#a57f49] active:translate-y-0.5 transition-all ${showHints ? 'shadow-[0_0_15px_rgba(216,196,154,0.8)] animate-pulse' : ''}`}>
                                       ANOTAR (1)
                                     </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )
                      })
                    ))}
                  </div>
                </div>

                {/* Current Player's Goal Zone (Bottom) */}
                <GoalZone player={currentPlayer} />
            </div>
        </div>
    );
}

export default GameBoard;