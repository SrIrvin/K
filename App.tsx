import React, { useContext } from 'react';
import { GameContext } from './context/GameContext';
import MainMenu from './components/MainMenu';
import GameUI from './components/GameUI';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
