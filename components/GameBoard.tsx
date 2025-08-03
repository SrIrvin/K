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
}

const GoalZone: React.FC<{ player: Player, isOpponent?: boolean, canScoreDirectly?: boolean }> = ({ player, isOpponent = false, canScoreDirectly = false }) => {
    const { dispatch } = useContext(GameContext);

    const handleDirectScore = () => {
        if (canScoreDirectly) {
            dispatch({ type: 'MOVE_UNIT', payload: { to: { row: -1, col: -1 } } });
        }
    };

    return (
        <div 
            className={`w-full h-24 md:h-28 bg-black/20 my-1 p-2 rounded-lg border-2 border-dashed ${isOpponent ? 'border-red-500/50' : 'border-green-500/50'} flex-shrink-0 relative`}
            onClick={handleDirectScore}
        >
            {canScoreDirectly && isOpponent && (
                <div className="absolute inset-0 bg-yellow-500/30 border-4 border-yellow-400 rounded-lg animate-pulse flex items-center justify-center cursor-pointer">
                    <p className="text-white font-orbitron text-lg font-bold">SCORE DIRECTLY (1)</p>
                </div>
            )}
            <div className="flex items-center space-x-2 h-full overflow-x-auto">
                {player.scored.length === 0 && !canScoreDirectly && (
                    <div className="flex items-center justify-center w-full h-full">
                        <p className="text-gray-500 font-orbitron text-sm">GOAL ZONE</p>
                    </div>
                )}
                {player.scored.map(card => (
                    <div key={card.id} className="h-full flex-shrink-0" style={{ aspectRatio: '5/7' }}>
                        <GameCard card={card} isUnitOnBoard={true} unit={card as Unit}/>
                    </div>
                ))}
            </div>
        </div>
    );
};


const GameBoard: React.FC<GameBoardProps> = ({ board, currentPlayer, opponentPlayer, validMoves }) => {
    const { state, dispatch } = useContext(GameContext);
    const { selectedCardIdInHand, selectedUnitIdOnBoard, currentPlayerId, isTargeting, actionsRemaining, kingMoveState } = state;
    const playerStartRow = currentPlayerId === 0 ? BOARD_ROWS - 1 : 0;

    const handleCellInteraction = (row: number, col: number) => {
        const unitInCell = board[row][col];
        
        // During King's Move, logic is different
        if (kingMoveState?.isMoving) {
            // If a unit is selected, try to move it
            if (kingMoveState.selectedUnitId) {
                 const isKingMoveValid = validMoves.some(m => m.row === row && m.col === col);
                 if (isKingMoveValid) {
                     dispatch({ type: 'MOVE_UNIT_DURING_KING_EFFECT', payload: { to: { row, col } } });
                 } else {
                     // Clicked an invalid spot, deselect
                     dispatch({ type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: null } });
                 }
            } else if (unitInCell) {
                // If no unit is selected, try to select one that needs to be moved
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
                // If clicking an invalid square, deselect unit
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
        if (selectedCardIdInHand && !kingMoveState?.isMoving) {
            dispatch({ type: 'PLACE_UNIT', payload: { row, col } });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const canScoreDirectly = validMoves.some(m => m.row === -1 && m.col === -1);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center overflow-hidden p-1 sm:p-2">
            <GoalZone player={opponentPlayer} isOpponent={true} canScoreDirectly={canScoreDirectly} />
            
            <div className="w-full max-w-lg mx-auto flex-grow" style={{aspectRatio: '4 / 5'}}>
              <div className="grid grid-cols-4 grid-rows-5 gap-1 sm:gap-2 w-full h-full">
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

                    let selectionClass = '';
                    if (isKingMoveActive) {
                        if (selectedUnitIdOnBoard === unit?.id) {
                            selectionClass = 'scale-110 ring-4 ring-yellow-400 z-10';
                        } else if (isUnitToBeMovedByKing) {
                            selectionClass = 'animate-pulse ring-2 ring-red-500';
                        }
                    } else if (selectedUnitIdOnBoard === unit?.id) {
                        selectionClass = 'scale-110';
                    }

                    return (
                      <div 
                        key={`${rowIndex}-${colIndex}`}
                        className="w-full h-full relative transition-transform duration-200 hover:scale-105"
                        onClick={() => handleCellInteraction(rowIndex, colIndex)}
                        onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                        onDragOver={handleDragOver}
                      >
                        <div className={`absolute inset-0 rounded-lg transition-colors border-2 border-dashed ${isMovable ? 'bg-green-500/40 border-green-400' : isPlaceable ? 'bg-blue-500/30 border-blue-400 cursor-pointer' : 'bg-black/20 border-gray-700'}`}></div>
                        
                        {unit && (
                          <div 
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${selectionClass}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellInteraction(rowIndex, colIndex);
                            }}
                          >
                            <GameCard unit={unit} isUnitOnBoard={true} card={unit} isSelected={selectedUnitIdOnBoard === unit.id && !isKingMoveActive} />
                            {unit.id === selectedUnitIdOnBoard && canUnitScore && actionsRemaining > 0 && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SCORE_UNIT' })}}
                                 className="absolute -bottom-2.5 z-20 px-2 py-0.5 text-xs font-bold text-black bg-yellow-400 rounded-lg shadow-lg hover:bg-yellow-300 animate-pulse">
                                 SCORE (1)
                               </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                ))}
              </div>
            </div>

            <GoalZone player={currentPlayer} />
        </div>
    );
}

export default GameBoard;