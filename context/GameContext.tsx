import React, { createContext, useReducer, ReactNode, useCallback } from 'react';
import { GameState, Action } from '../types';
import { gameReducer, initialState } from '../reducers/gameReducer';
import { sendGameAction, activeRoomId, isIncomingAction } from '../services/peerService';
import { audioService } from '../services/audioService';
import { saveGameRecord, updatePlayerStats } from '../services/firebaseService';

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
    // 1. Calculate next state to determine triggers
    const nextState = gameReducer(state, action);

    // 2. Play sound effects based on actions
    try {
      switch (action.type) {
        case 'SELECT_CARD_IN_HAND':
          if (action.payload.cardId !== null) {
            audioService.playSFX('click');
          }
          break;

        case 'SELECT_UNIT_ON_BOARD':
          if (action.payload.unitId !== null) {
            audioService.playSFX('click');
          }
          break;

        case 'PLACE_UNIT':
          audioService.playSFX('play');
          break;

        case 'MOVE_UNIT':
        case 'MOVE_UNIT_DURING_KING_EFFECT': {
          const { to } = action.payload;
          if (to.row === -1 && to.col === -1) {
            audioService.playSFX('win'); // Touchdown
          } else {
            // Check if there was an enemy unit at the target position (combat)
            const targetUnit = state.board[to.row]?.[to.col];
            const activeUnitId = action.type === 'MOVE_UNIT' 
              ? state.selectedUnitIdOnBoard 
              : state.kingMoveState?.selectedUnitId;
            
            const attacker = state.board.flat().find(u => u?.id === activeUnitId);

            if (targetUnit && attacker && targetUnit.color !== attacker.color) {
              audioService.playSFX('combat');
            } else {
              audioService.playSFX('move');
            }
          }
          break;
        }

        case 'SCORE_UNIT':
          audioService.playSFX('win'); // Touchdown
          break;

        case 'DRAW_CARD':
          audioService.playSFX('draw');
          break;

        case 'PLAY_SPECIAL_CARD': {
          const card = action.payload.card;
          if (card.rank === 'J') audioService.playSFX('turbo');
          else if (card.rank === 'Q') audioService.playSFX('heal');
          else if (card.rank === 'K') audioService.playSFX('king');
          else if (card.rank === 'A') audioService.playSFX('missile');
          else if (card.rank === 'Joker') audioService.playSFX('joker');
          break;
        }

        case 'RESURRECT_UNIT_TO_HAND':
          audioService.playSFX('heal');
          break;

        case 'USE_ABILITY_ON_TARGET':
          if (state.isTargeting === 'queen') audioService.playSFX('heal');
          else if (state.isTargeting === 'jack') audioService.playSFX('turbo');
          else if (state.isTargeting === 'joker') audioService.playSFX('joker');
          break;

        case 'START_GAME':
        case 'RESET_TO_MENU':
          audioService.playSFX('click');
          break;

        default:
          break;
      }

      // Check for victory or defeat
      if (!state.winner && nextState.winner) {
        const localId = nextState.localPlayerId ?? 0;
        if (nextState.winner.id === localId) {
          audioService.playSFX('win');
        } else {
          audioService.playSFX('lose');
        }

        // Save record and update statistics in Firebase Firestore
        try {
          const winnerPlayer = nextState.winner;
          const loserPlayer = nextState.players.find(p => p.id !== winnerPlayer.id);
          if (winnerPlayer && loserPlayer) {
            // Save game record
            saveGameRecord({
              winnerName: winnerPlayer.name,
              winnerDamage: winnerPlayer.damage,
              loserName: loserPlayer.name,
              loserDamage: loserPlayer.damage,
              gameType: nextState.gameType || 'local'
            });

            // Update stats for global ranking (ignore standard Hero default names to keep ranking clean)
            if (!winnerPlayer.name.startsWith('Héroe_')) {
              updatePlayerStats(winnerPlayer.name, true);
            }
            if (!loserPlayer.name.startsWith('Héroe_')) {
              updatePlayerStats(loserPlayer.name, false);
            }
          }
        } catch (err) {
          console.warn('[Firebase] Failed to save game record or stats:', err);
        }
      }
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }

    // 3. Handle BGM music transitions
    try {
      if (state.gameMode !== nextState.gameMode) {
        if (nextState.gameMode === 'playing' || nextState.gameMode === 'switch_turn') {
          audioService.startBGM();
        } else if (nextState.gameMode === 'menu' || nextState.gameMode === 'game_over') {
          audioService.stopBGM();
        }
      }
    } catch (e) {
      console.warn('BGM music transition failed:', e);
    }

    // Dispatch action to reducer
    dispatch(action);

    // Sync online action if multiplayer
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
  }, [state, dispatch]);

  return (
    <GameContext.Provider value={{ state, dispatch: wrappedDispatch }}>
      {children}
    </GameContext.Provider>
  );
};

