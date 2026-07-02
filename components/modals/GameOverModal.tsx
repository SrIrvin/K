import React, { useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import { Player } from '@/types';

interface GameOverModalProps {
    winner: Player;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner }) => {
    const { dispatch } = useContext(GameContext);

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 md:p-8 rounded-lg text-center shadow-2xl border border-yellow-500">
                <h2 className="text-2xl md:text-4xl font-orbitron text-yellow-400 mb-4">Game Over!</h2>
                <p className="text-lg md:text-2xl mb-8">{winner.name} wins!</p>
                <button onClick={() => dispatch({type: 'RESET_TO_MENU'})} className="px-4 py-2 md:px-6 md:py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">Main Menu</button>
            </div>
        </div>
    );
};