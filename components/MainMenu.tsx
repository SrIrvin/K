import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';

const MainMenu: React.FC = () => {
  const { dispatch } = useContext(GameContext);

  const startGame = (gameType: 'ai' | 'p2') => {
    dispatch({ type: 'START_GAME', payload: { gameType } });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-orbitron mb-2 text-yellow-400 text-center">EdgePlay21</h1>
      <p className="text-lg sm:text-xl mb-8 sm:mb-12 text-gray-400 text-center">Strategic Card Duel</p>
      <div className="space-y-4 w-full max-w-xs sm:max-w-none sm:w-auto">
        <button onClick={() => startGame('p2')} className="w-full sm:w-64 px-4 py-3 sm:px-6 sm:py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors text-lg sm:text-xl">2-Player Hot-Seat</button>
        <button onClick={() => startGame('ai')} className="w-full sm:w-64 px-4 py-3 sm:px-6 sm:py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors text-lg sm:text-xl">vs AI Opponent</button>
      </div>
    </div>
  );
};

export default MainMenu;
