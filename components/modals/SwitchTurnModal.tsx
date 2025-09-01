import React, { useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import { Player } from '@/models/types';

interface SwitchTurnModalProps {
    opponentPlayer: Player | undefined;
}

export const SwitchTurnModal: React.FC<SwitchTurnModalProps> = ({ opponentPlayer }) => {
    const { dispatch } = useContext(GameContext);

    return (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 md:p-12 rounded-lg text-center shadow-2xl border border-yellow-500">
                <h2 className="text-2xl md:text-4xl font-orbitron text-yellow-400 mb-4">Pass the Device!</h2>
                <p className="text-lg md:text-2xl mb-6 md:mb-8">It's now <span className="font-bold">{opponentPlayer?.name}</span>'s turn.</p>
                <button onClick={() => dispatch({type: 'BEGIN_NEW_TURN'})} className="px-6 py-3 md:px-8 md:py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors text-base md:text-xl">Start Turn</button>
            </div>
        </div>
    );
};