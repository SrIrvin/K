import React, { useContext, useEffect } from 'react';
import { GameContext } from './context/GameContext';
import MainMenu from './components/MainMenu';
import GameUI from './components/GameUI';
import OnlineLobby from './components/OnlineLobby';
import ErrorBoundary from './components/ErrorBoundary';
import AudioSettings from './components/AudioSettings';
import { TutorialUI } from './components/TutorialUI';
import { AdventureMap } from './components/AdventureMap';
import { 
  addPeerListener, 
  removePeerListener, 
  cleanupPeer,
  setIncomingActionFlag 
} from './services/peerService';

function AppContent() {
  const { state, dispatch } = useContext(GameContext);

  useEffect(() => {
    const handleSocketMessage = (data: any) => {
      switch (data.type) {
        case 'game_action':
          console.log('[Peer Incoming Action] Applying action:', data.payload.action);
          setIncomingActionFlag(true);
          dispatch(data.payload.action);
          setIncomingActionFlag(false);
          break;
          
        case 'sync_state':
          console.log('[Peer Incoming State] Applying sync state:', data.payload.gameState);
          setIncomingActionFlag(true);
          dispatch({ type: 'SET_FULL_STATE', payload: data.payload.gameState });
          setIncomingActionFlag(false);
          break;
          
        default:
          break;
      }
    };

    addPeerListener(handleSocketMessage);
    return () => {
      removePeerListener(handleSocketMessage);
    };
  }, [dispatch]);

  // Redirect to Online Lobby if invite room is in the URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      dispatch({ type: 'SET_GAME_MODE', payload: 'online_lobby' });
    }
  }, [dispatch]);

  const handleGameJoined = (roomId: string, localPlayerId: number) => {
    // Handled automatically inside peerService
  };

  const renderContent = () => {
    switch (state.gameMode) {
      case 'menu':
        return (
          <MainMenu 
            onOnlineMode={() => dispatch({ type: 'SET_GAME_MODE', payload: 'online_lobby' })} 
          />
        );
      case 'online_lobby':
        return (
          <OnlineLobby 
            onBack={() => {
              cleanupPeer();
              const wasPortal = !!state.hostedPortalLevel;
              dispatch({ type: 'SET_HOSTED_PORTAL_LEVEL', payload: { level: null } });
              dispatch({ type: 'SET_GAME_MODE', payload: wasPortal ? 'adventure_map' : 'menu' });
            }}
            onGameJoined={handleGameJoined}
          />
        );
      case 'adventure_map':
        return (
          <AdventureMap 
            onBack={() => dispatch({ type: 'SET_GAME_MODE', payload: 'menu' })} 
            dispatch={dispatch}
            state={state}
          />
        );
      case 'playing':
      case 'switch_turn':
      case 'game_over':
        return <GameUI />;
      case 'tutorial':
        return <TutorialUI />;
      default:
        return (
          <MainMenu 
            onOnlineMode={() => dispatch({ type: 'SET_GAME_MODE', payload: 'online_lobby' })} 
          />
        );
    }
  };

  return (
    <>
      {renderContent()}
      <AudioSettings />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

