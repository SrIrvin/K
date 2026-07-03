import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { Unit, Player, Card, Rank } from '../types';
import { GameCard } from './GameCard';
import { BOARD_ROWS } from '../constants';
import { getKingValidMoves } from '../services/gameService';

interface GameBoardProps {
  board: (Unit | null)[][];
  currentPlayer: Player;
  opponentPlayer: Player;
  validMoves: { row: number, col: number }[];
  showHints: boolean;
}

const GoalZone: React.FC<{ player: Player, isOpponent?: boolean, canScoreDirectly?: boolean }> = ({ player, isOpponent = false, canScoreDirectly = false }) => {
    const { dispatch } = useContext(GameContext);

    const handleDirectScore = () => {
        if (canScoreDirectly) {
            dispatch({ type: 'MOVE_UNIT', payload: { to: { row: -1, col: -1 } } });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (canScoreDirectly && isOpponent) {
            e.preventDefault();
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (canScoreDirectly && isOpponent) {
            dispatch({ type: 'MOVE_UNIT', payload: { to: { row: -1, col: -1 } } });
        }
    };

    return (
        <div 
            className={`w-full h-20 sm:h-24 md:h-28 bg-[#2A2A2A]/70 my-1.5 p-2 rounded-lg border-2 border-[#574d3c] flex-shrink-0 relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.9)]`}
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


const GameBoard: React.FC<GameBoardProps> = ({ board, currentPlayer, opponentPlayer, validMoves, showHints }) => {
    const { state, dispatch } = useContext(GameContext);
    const { selectedCardIdInHand, selectedUnitIdOnBoard, currentPlayerId, isTargeting, actionsRemaining, kingMoveState } = state;
    const playerStartRow = currentPlayerId === 0 ? BOARD_ROWS - 1 : 0;

    const handleCellInteraction = (row: number, col: number) => {
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
        <div className="w-full h-full flex flex-col justify-center items-center overflow-hidden p-1 sm:p-2 select-none">
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
    );
}

export default GameBoard;