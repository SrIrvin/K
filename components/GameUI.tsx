import React, { useContext, useEffect, useMemo, useCallback, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { GameState, Card, Unit, Player, CardColor, Suit, MoveDirection, Rank, Action } from '../types';
import { getValidMoves, createUnitFromCard, getKingValidMoves } from '../services/gameService';
import { getAiBestAction } from '../ai/aiService';
import { GameCard, CardBack } from './GameCard';
import { BOARD_ROWS, BOARD_COLS, WIN_DAMAGE } from '../constants';
import GameBoard from './GameBoard';

// #region CARD DESCRIPTIONS
const CARD_DESCRIPTIONS: Record<Rank, string> = {
    '2': "A Light Unit. Can be placed on your starting row. Its number is its Base Damage. Speed: 3.",
    '3': "A Light Unit. Can be placed on your starting row. Its number is its Base Damage. Speed: 3.",
    '4': "A Light Unit. Can be placed on your starting row. Its number is its Base Damage. Speed: 3.",
    '5': "A Medium Unit. Can be placed on your starting row. Its number is its Base Damage. Speed: 2.",
    '6': "A Medium Unit. Can be placed on your starting row. Its number is its Base Damage. Speed: 2.",
    '7': "A Medium Unit. Can be placed on your starting row. Its number is its Base Damage. Speed: 2.",
    '8': "A Heavy Unit. Can be placed on your starting row. Its number is its Base Damage. Speed: 1.",
    '9': "A Heavy Unit. Can be placed on your starting row. Its number is its Base Damage. Speed: 1.",
    '10': "A Heavy Unit. Can be placed on your starting row. Its number is its Base Damage. Speed: 1.",
    'J': "The Turbo. Target a friendly unit to give it +1 Speed for its next move. The Jack is discarded after the move.",
    'Q': "The Healer. Target a damaged friendly unit to restore it to its Base Damage. This also removes all stacked attacker cards from it.",
    'K': "The Mad Dictator. Activate to move each of your units one orthogonal space. You must move each unit. Any units not moved by the time you end the action are discarded.",
    'A': "The Kamikaze Missile. Deal 1 direct damage to your opponent. This card is then moved to your scored pile.",
    'Joker': "The Shadow Assassin. Instantly eliminate any enemy unit from the board. The unit is sent to the discard pile."
};
// #endregion

const PlayerArea: React.FC<{ player?: Player; isOpponent?: boolean; canAct: boolean; }> = ({ player, isOpponent = false, canAct }) => {
    const { state, dispatch } = useContext(GameContext);
    if(!player) return <div className="h-24 flex-shrink-0"></div>;
    
    const isCurrentPlayer = state.currentPlayerId === player.id;
    const specialCards = player.hand.filter(c => ['J', 'Q', 'K', 'A', 'Joker'].includes(c.rank));
    const unitCards = player.hand.filter(c => !['J', 'Q', 'K', 'A', 'Joker'].includes(c.rank)).sort((a,b) => parseInt(a.rank) - parseInt(b.rank));

    const onInfoClick = (card: Card) => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card } });

    const handleSelectCard = (cardId: string | null) => {
        if (canAct || state.selectedCardIdInHand === cardId) { // Allow deselecting
            dispatch({ type: 'SELECT_CARD_IN_HAND', payload: { cardId } });
        }
    };
    
    const handleDragStart = (cardId: string) => {
        if (canAct) {
            if (state.selectedCardIdInHand !== cardId) {
                dispatch({ type: 'SELECT_CARD_IN_HAND', payload: { cardId } });
            }
        }
    };

    return (
        <div className={`p-1 sm:p-2 bg-black/30 rounded-lg border-2 ${isCurrentPlayer && state.gameMode === 'playing' ? 'border-yellow-500' : 'border-gray-700'} flex-shrink-0`}>
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center space-x-2 md:space-x-3">
                    <h2 className="text-sm sm:text-base font-orbitron">{player.name}</h2>
                    <div className="text-xs sm:text-sm font-bold flex items-center">
                      <span className="text-gray-400 mr-1">Dmg:</span>
                      <div className="w-24 h-4 bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-full" style={{width: `${Math.min(100, (player.damage / WIN_DAMAGE) * 100)}%`}}></div>
                      </div>
                      <span className="ml-2 text-red-500">{player.damage}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="text-center"><CardBack count={player.scored.length} type="scored" /><div className="mt-1 text-[9px] sm:text-[11px]">Scored</div></div>
                    <div className="text-center"><CardBack count={player.discard.length} type="discard" /><div className="mt-1 text-[9px] sm:text-[11px]">Discard</div></div>
                    <div className="text-center"><CardBack count={player.deck.length} type="deck" /><div className="mt-1 text-[9px] sm:text-[11px]">Deck</div></div>
                </div>
            </div>

            <div className={`mt-1 flex space-x-2 h-[92px] sm:h-[104px] md:h-[144px] items-center overflow-x-auto p-1 bg-black/20 rounded ${isOpponent ? 'justify-end' : ''}`}>
              {isOpponent ? (
                  Array.from({length: player.hand.length}).map((_, i) => <CardBack key={i} count={1} type="deck" />)
              ) : (
                <>
                  <div className="flex space-x-2 pr-2 md:pr-3 border-r-2 border-gray-600 h-full">
                  {unitCards.map(card => (
                      <div 
                        key={card.id}
                        className="h-full"
                        style={{aspectRatio: '5/7'}}
                        draggable={canAct}
                        onDragStart={() => handleDragStart(card.id)}
                        onDragEnd={() => handleSelectCard(null)}
                      >
                        <GameCard 
                            card={card}
                            isSelected={state.selectedCardIdInHand === card.id}
                            onClick={() => handleSelectCard(state.selectedCardIdInHand === card.id ? null : card.id)}
                            onInfoClick={() => onInfoClick(card)}
                        />
                      </div>
                  ))}
                  </div>
                  <div className="flex space-x-2 pl-2 md:pl-3 h-full">
                  {specialCards.map(card => (
                      <div key={card.id} className="h-full flex flex-col items-center justify-around" style={{aspectRatio: '5/7'}}>
                        <GameCard card={card} onInfoClick={() => onInfoClick(card)} />
                        <button onClick={() => dispatch({ type: 'PLAY_SPECIAL_CARD', payload: { card } })} disabled={!canAct} className="text-[9px] sm:text-[11px] px-2 py-0.5 bg-purple-600 rounded hover:bg-purple-500 disabled:bg-gray-600 w-full flex-shrink-0 mt-1">Play (1)</button>
                      </div>
                  ))}
                  </div>
                </>
              )}
            </div>
            
            {!isOpponent && isCurrentPlayer && state.log.length > 0 && (
              <div className="text-xs sm:text-sm text-gray-400 h-5 overflow-hidden flex-grow w-full bg-black/20 px-2 rounded mt-1">
                <p className="whitespace-nowrap">
                    <span className="font-bold text-yellow-400">&gt; </span>
                    {state.log[0]}
                </p>
              </div>
            )}
        </div>
    );
};

const CardInfoModal: React.FC = () => {
    const { state, dispatch } = useContext(GameContext);
    const card = state.cardInfoModal;
    if (!card) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card: null } })}>
            <div className="bg-gray-800 p-6 rounded-lg text-center shadow-2xl border border-yellow-500 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-center mb-4 h-48">
                    <GameCard card={card} />
                </div>
                <h3 className="text-2xl font-orbitron text-yellow-400 mb-2">{card.rank} of {card.suit}</h3>
                <p className="text-base text-gray-300">{CARD_DESCRIPTIONS[card.rank]}</p>
                <button onClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card: null } })} className="mt-6 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">Close</button>
            </div>
        </div>
    );
};


const GameUI: React.FC = () => {
    const { state, dispatch } = useContext(GameContext);
    const { players, currentPlayerId, board, selectedUnitIdOnBoard, gameMode, winner, selectedCardIdInHand, kingMoveState, actionsRemaining } = state;
    
    const [isOpponentHandVisible, setIsOpponentHandVisible] = useState(true);
    const [isPlayerHandVisible, setIsPlayerHandVisible] = useState(true);
    const [showKingInfo, setShowKingInfo] = useState(false);

    const currentPlayer = useMemo(() => players?.[currentPlayerId], [players, currentPlayerId]);
    const opponentPlayer = useMemo(() => players?.[1 - currentPlayerId], [players, currentPlayerId]);
    
    const isPlacingCard = !!selectedCardIdInHand && !kingMoveState?.isMoving;
    const isCurrentPlayerTurn = useMemo(() => currentPlayerId === state.currentPlayerId, [currentPlayerId, state.currentPlayerId]);
    const canAct = useMemo(() => actionsRemaining > 0 && !state.isTargeting && !kingMoveState?.isMoving && isCurrentPlayerTurn, [actionsRemaining, state.isTargeting, kingMoveState, isCurrentPlayerTurn]);

    useEffect(() => {
        if (gameMode === 'playing' && state.gameType === 'ai' && currentPlayerId === 1 && !winner && actionsRemaining > 0 && !kingMoveState?.isMoving) {
            const timer = setTimeout(() => {
                const bestAction = getAiBestAction(state);
                if (bestAction) {
                    dispatch(bestAction);
                } else {
                    dispatch({ type: 'END_TURN' });
                }
            }, 1000);
            return () => clearTimeout(timer);
        } else if (gameMode === 'playing' && state.gameType === 'ai' && currentPlayerId === 1 && !winner && actionsRemaining <= 0 && !kingMoveState?.isMoving) {
             const timer = setTimeout(() => dispatch({ type: 'END_TURN' }), 1000);
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
    
    if (!currentPlayer || !opponentPlayer) {
      return <div className="h-screen w-screen flex items-center justify-center bg-gray-900 font-orbitron">Loading Game...</div>;
    }

    return (
        <div className="flex flex-col h-screen max-h-screen bg-gray-900 text-gray-200 p-1 sm:p-2">
            {/* Opponent Panel */}
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${!isOpponentHandVisible || isPlacingCard ? 'max-h-0 opacity-0' : 'max-h-[300px] opacity-100'}`}>
                <PlayerArea player={opponentPlayer} isOpponent={true} canAct={false} />
            </div>

            {/* Toggle Button for Opponent Panel */}
            {!isPlacingCard && (
                <div className="flex-shrink-0 flex justify-center py-1">
                    <button
                        onClick={() => setIsOpponentHandVisible(!isOpponentHandVisible)}
                        className="w-full max-w-xs py-1 text-xs text-gray-400 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        aria-label={isOpponentHandVisible ? "Hide opponent's area" : "Show opponent's area"}
                        aria-expanded={isOpponentHandVisible}
                    >
                        <span>{opponentPlayer.name}'s Area</span>
                        {isOpponentHandVisible ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )}
                    </button>
                </div>
            )}
            
            {/* Game Board */}
            <div className="flex-grow flex flex-col min-h-0">
                <GameBoard 
                  board={board}
                  currentPlayer={currentPlayer}
                  opponentPlayer={opponentPlayer}
                  validMoves={validMoves}
                />
            </div>

            {/* Action Bar */}
            {isCurrentPlayerTurn && gameMode === 'playing' && (
                <div className="flex-shrink-0 py-2 px-2 sm:px-4 bg-black/30 rounded-lg my-1 flex items-center justify-center gap-4">
                    <div className="text-base md:text-lg font-orbitron">Actions: <span className="text-yellow-400 font-bold">{actionsRemaining}</span></div>
                    <button onClick={() => dispatch({ type: 'DRAW_CARD'})} disabled={!canAct} className="px-3 py-2 text-sm md:text-base bg-blue-600 rounded disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 font-semibold">Draw (1)</button>
                    <button onClick={() => dispatch({ type: 'END_TURN'})} disabled={kingMoveState?.isMoving} className="px-3 py-2 text-sm md:text-base bg-green-600 rounded hover:bg-green-500 disabled:bg-gray-600 font-semibold">End Turn</button>
                </div>
            )}
            
            {/* Toggle Button for Player Panel */}
            {!isPlacingCard && (
                <div className="flex-shrink-0 flex justify-center py-1">
                    <button
                        onClick={() => setIsPlayerHandVisible(!isPlayerHandVisible)}
                        className="w-full max-w-xs py-1 text-xs text-gray-400 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        aria-label={isPlayerHandVisible ? "Hide your area" : "Show your area"}
                        aria-expanded={isPlayerHandVisible}
                    >
                        <span>{currentPlayer.name}'s Area</span>
                        {isPlayerHandVisible ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        )}
                    </button>
                </div>
            )}

            {/* Current Player Panel */}
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${!isPlayerHandVisible || isPlacingCard ? 'max-h-0 opacity-0' : 'max-h-[300px] opacity-100'}`}>
              <PlayerArea player={currentPlayer} canAct={canAct} />
            </div>

            <CardInfoModal />
            
            {kingMoveState?.isMoving && (
              <div className="absolute top-0 left-0 right-0 bg-black/60 z-40 p-2 text-center pointer-events-none">
                <div className="bg-gray-800 p-2 rounded-lg shadow-2xl border border-yellow-500 pointer-events-auto flex flex-col items-center">
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-lg font-orbitron text-yellow-400 animate-pulse">King's Command!</h2>
                    <button
                      onClick={() => setShowKingInfo(!showKingInfo)}
                      className="ml-2 p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-xs"
                      aria-label={showKingInfo ? "Hide King's Command info" : "Show King's Command info"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  {showKingInfo && (
                    <>
                      <p className="text-sm mt-1">Move each of your units one space.</p>
                      <p className="text-xs text-red-400">Unmoved units will be discarded!</p>
                    </>
                  )}
                  <button
                    onClick={() => dispatch({type: 'FINISH_KING_MOVE'})}
                    className="mt-2 px-3 py-1 text-xs bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors">
                      Finish King's Move ({kingMoveState.unitsToMove.length} remaining)
                  </button>
                </div>
              </div>
            )}

            {gameMode === 'game_over' && winner && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-800 p-6 md:p-8 rounded-lg text-center shadow-2xl border border-yellow-500">
                    <h2 className="text-2xl md:text-4xl font-orbitron text-yellow-400 mb-4">Game Over!</h2>
                    <p className="text-lg md:text-2xl mb-8">{winner.name} wins!</p>
                    <button onClick={() => dispatch({type: 'RESET_TO_MENU'})} className="px-4 py-2 md:px-6 md:py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">Main Menu</button>
                  </div>
                </div>
            )}
            {gameMode === 'switch_turn' && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 p-6 md:p-12 rounded-lg text-center shadow-2xl border border-yellow-500">
                  <h2 className="text-2xl md:text-4xl font-orbitron text-yellow-400 mb-4">Pass the Device!</h2>
                  <p className="text-lg md:text-2xl mb-6 md:mb-8">It's now <span className="font-bold">{opponentPlayer?.name}</span>'s turn.</p>
                  <button onClick={() => dispatch({type: 'BEGIN_NEW_TURN'})} className="px-6 py-3 md:px-8 md:py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors text-base md:text-xl">Start Turn</button>
                </div>
              </div>
            )}
        </div>
    );
}

export default GameUI;
