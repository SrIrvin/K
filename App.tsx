import React, { useContext } from 'react';
import { GameContext } from './context/GameContext';
import MainMenu from './components/MainMenu';
import GameUI from './components/GameUI';

export default function App() {
  const { state } = useContext(GameContext);

  switch (state.gameMode) {
    case 'menu':
      return <MainMenu />;
    case 'playing':
    case 'switch_turn':
    case 'game_over':
      return <GameUI />;
    default:
      return <MainMenu />;
  }
}
