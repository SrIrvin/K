import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';

interface ActionBarProps {
    canAct: boolean;
    actionsRemaining: number;
    isKingMoveActive: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({ canAct, actionsRemaining, isKingMoveActive }) => {
    const { dispatch } = useContext(GameContext);

    return (
        <div className="flex-shrink-0 py-2 px-2 sm:px-4 bg-black/30 rounded-lg my-1 flex items-center justify-center gap-4">
            <div className="text-base md:text-lg font-orbitron">Actions: <span className="text-yellow-400 font-bold">{actionsRemaining}</span></div>
            <button onClick={() => dispatch({ type: 'DRAW_CARD'})} disabled={!canAct} className="px-3 py-2 text-sm md:text-base bg-blue-600 rounded disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 font-semibold">Draw (1)</button>
            <button onClick={() => dispatch({ type: 'END_TURN'})} disabled={isKingMoveActive} className="px-3 py-2 text-sm md:text-base bg-green-600 rounded hover:bg-green-500 disabled:bg-gray-600 font-semibold">End Turn</button>
        </div>
    );
};