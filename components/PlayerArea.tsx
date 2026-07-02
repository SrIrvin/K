import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { Player, Card } from '@/types';
import { WIN_DAMAGE } from '@/utils/constants';
import { CardBack } from './CardBack';
import { GameCard } from './GameCard';

interface PlayerAreaProps {
    player?: Player;
    isOpponent?: boolean;
    canAct: boolean;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({ player, isOpponent = false, canAct }) => {
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

            <div className={`mt-1 flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 lg:h-auto lg:overflow-y-auto p-1 bg-black/20 rounded ${isOpponent ? 'justify-end lg:justify-start' : ''}`}>
              {isOpponent ? (
                  Array.from({length: player.hand.length}).map((_, i) => <CardBack key={i} count={1} type="deck" />)
              ) : (
                <>
                  <div className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 pr-2 md:pr-3 lg:pr-0 lg:pb-2 border-r-2 lg:border-r-0 lg:border-b-2 border-gray-600 h-full lg:w-full">
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
                  <div className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 pl-2 md:pl-3 lg:pl-0 lg:pt-2 h-full lg:w-full">
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