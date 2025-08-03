import React, { createContext, useReducer, ReactNode } from 'react';
import { GameState, Action } from '../types';
import { gameReducer, initialState } from '../reducers/gameReducer';

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

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
