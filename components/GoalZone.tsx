import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { Unit, Player } from '@/models/types';
import { GameCard } from './GameCard';

interface GoalZoneProps {
    player: Player;
    isOpponent?: boolean;
    canScoreDirectly?: boolean;
}

export const GoalZone: React.FC<GoalZoneProps> = ({ player, isOpponent = false, canScoreDirectly = false }) => {
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
