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
import { 
  getInitialGraphicsSetting, 
  applyGraphicsSettings, 
  applySmartphoneMode 
} from './utils/graphicsSettings';

// Helper to map URL page and room parameters to internal game mode
const getGameModeFromUrl = (page: string | null, room: string | null): 'menu' | 'online_lobby' | 'adventure_map' | 'tutorial' | 'playing' => {
  if (room || page === 'lobby' || page === 'online_lobby') {
    return 'online_lobby';
  }
  if (page === 'adventure' || page === 'adventure_map') {
    return 'adventure_map';
  }
  if (page === 'tutorial') {
    return 'tutorial';
  }
  if (page === 'game' || page === 'playing') {
    return 'playing';
  }
  return 'menu';
};

// Helper to map internal game mode to external URL page value
const getUrlPageFromGameMode = (gameMode: string): string => {
  if (gameMode === 'online_lobby') return 'lobby';
  if (gameMode === 'adventure_map') return 'adventure';
  if (gameMode === 'tutorial') return 'tutorial';
  if (['playing', 'switch_turn', 'game_over'].includes(gameMode)) return 'game';
  return 'menu';
};

function AppContent() {
  const { state, dispatch } = useContext(GameContext);

  // Initialize graphics quality and smartphone mode
  useEffect(() => {
    const initGraphicsAndMobile = () => {
      const initialGraphics = getInitialGraphicsSetting();
      applyGraphicsSettings(initialGraphics);
      applySmartphoneMode();
    };

    initGraphicsAndMobile();

    // Re-check smartphone mode on window resize
    window.addEventListener('resize', applySmartphoneMode);
    return () => {
      window.removeEventListener('resize', applySmartphoneMode);
    };
  }, []);

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

  // Initialize state from URL on mount (Deep Linking)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const room = params.get('room');
    
    const targetMode = getGameModeFromUrl(page, room);

    if (targetMode !== 'menu') {
      dispatch({ type: 'SET_GAME_MODE', payload: targetMode as any });
    }
  }, [dispatch]);

  // Synchronize state.gameMode with the URL (Bidirectional Sync)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get('page');
    const currentRoom = params.get('room');
    
    const expectedPage = getUrlPageFromGameMode(state.gameMode);

    if (currentPage !== expectedPage) {
      const newParams = new URLSearchParams();
      newParams.set('page', expectedPage);
      if (state.gameMode === 'online_lobby' && currentRoom) {
        newParams.set('room', currentRoom);
      }
      const newSearch = newParams.toString();
      window.history.replaceState(null, '', `${window.location.pathname}?${newSearch}`);
    }
  }, [state.gameMode]);

  // Keep a ref of gameMode to avoid popstate listener re-registration / race conditions
  const gameModeRef = React.useRef(state.gameMode);
  useEffect(() => {
    gameModeRef.current = state.gameMode;
  }, [state.gameMode]);

  // Listen to browser Back/Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      const room = params.get('room');
      
      const targetMode = getGameModeFromUrl(page, room);
      
      if (gameModeRef.current !== targetMode) {
        dispatch({ type: 'SET_GAME_MODE', payload: targetMode as any });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

