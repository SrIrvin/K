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
    
    let targetMode = 'menu';
    if (room || page === 'lobby' || page === 'online_lobby') {
      targetMode = 'online_lobby';
    } else if (page === 'adventure' || page === 'adventure_map') {
      targetMode = 'adventure_map';
    } else if (page === 'tutorial') {
      targetMode = 'tutorial';
    } else if (page === 'game' || page === 'playing') {
      targetMode = 'playing';
    }

    if (targetMode !== 'menu') {
      dispatch({ type: 'SET_GAME_MODE', payload: targetMode as any });
    }
  }, [dispatch]);

  // Synchronize state.gameMode with the URL (Bidirectional Sync)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get('page');
    const currentRoom = params.get('room');
    
    let expectedPage = 'menu';
    if (state.gameMode === 'online_lobby') expectedPage = 'lobby';
    else if (state.gameMode === 'adventure_map') expectedPage = 'adventure';
    else if (state.gameMode === 'tutorial') expectedPage = 'tutorial';
    else if (['playing', 'switch_turn', 'game_over'].includes(state.gameMode)) expectedPage = 'game';

    if (currentPage !== expectedPage) {
      const newParams = new URLSearchParams();
      newParams.set('page', expectedPage);
      if (state.gameMode === 'online_lobby' && currentRoom) {
        newParams.set('room', currentRoom);
      }
      const newSearch = newParams.toString();
      window.history.pushState(null, '', `${window.location.pathname}?${newSearch}`);
    }
  }, [state.gameMode]);

  // Listen to browser Back/Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      const room = params.get('room');
      
      let targetMode = 'menu';
      if (room || page === 'lobby' || page === 'online_lobby') {
        targetMode = 'online_lobby';
      } else if (page === 'adventure' || page === 'adventure_map') {
        targetMode = 'adventure_map';
      } else if (page === 'tutorial') {
        targetMode = 'tutorial';
      } else if (page === 'game' || page === 'playing') {
        targetMode = 'playing';
      }
      
      if (state.gameMode !== targetMode) {
        dispatch({ type: 'SET_GAME_MODE', payload: targetMode as any });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [state.gameMode, dispatch]);

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

