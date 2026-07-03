import React, { createContext, useReducer, ReactNode, useCallback } from 'react';
import { GameState, Action } from '../types';
import { gameReducer, initialState } from '../reducers/gameReducer';
import { sendGameAction, activeRoomId, isIncomingAction } from '../services/peerService';

interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

export const GameContext = createContext<GameContextProps>({
  state: initialState,
  dispatch: () => null,
});

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const wrappedDispatch = useCallback((action: Action) => {
    dispatch(action);

    if (state.gameType === 'online' && activeRoomId && !isIncomingAction) {
      const isLocalAction = ![
        'SET_ONLINE_GAME',
        'SET_FULL_STATE',
        'SET_GAME_MODE',
        'SET_CARD_INFO_MODAL'
      ].includes(action.type);

      if (isLocalAction) {
        console.log('[Socket Outgoing Action] Forwarding action:', action);
        sendGameAction(action);
      }
    }
  }, [state.gameType]);

  return (
    <GameContext.Provider value={{ state, dispatch: wrappedDispatch }}>
      {children}
    </GameContext.Provider>
  );
};
