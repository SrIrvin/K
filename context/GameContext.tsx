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
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const wrappedDispatch = useCallback((action: Action) => {
    const currentState = stateRef.current;
    // 1. Calculate next state to determine triggers
    const nextState = gameReducer(currentState, action);

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
            const targetUnit = currentState.board[to.row]?.[to.col];
            const activeUnitId = action.type === 'MOVE_UNIT' 
              ? currentState.selectedUnitIdOnBoard 
              : currentState.kingMoveState?.selectedUnitId;
            
            const attacker = currentState.board.flat().find(u => u?.id === activeUnitId);

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
          if (currentState.isTargeting === 'queen') audioService.playSFX('heal');
          else if (currentState.isTargeting === 'jack') audioService.playSFX('turbo');
          else if (currentState.isTargeting === 'joker') audioService.playSFX('joker');
          break;

        case 'START_GAME':
        case 'RESET_TO_MENU':
          audioService.playSFX('click');
          break;

        default:
          break;
      }

      // Check for victory or defeat
      if (!currentState.winner && nextState.winner) {
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
              gameType: nextState.gameType || 'local',
              winnerGold: nextState.winnerGold || 0,
              loserGold: nextState.loserGold || 0
            });

            // Handle adventure level progression and story completion
            let isWinnerStoryCompleted = localStorage.getItem('k_story_completed') === 'true';
            if (nextState.gameType === 'adventure' && nextState.winner.id === 0) {
              const currentLevel = nextState.storyLevel || 1;
              const nextLevel = currentLevel + 1;
              const savedUnlocked = parseInt(localStorage.getItem('k_unlocked_story_level') || '1', 10);
              if (nextLevel > savedUnlocked) {
                localStorage.setItem('k_unlocked_story_level', String(nextLevel));
                console.log(`[Adventure] Unlocked level ${nextLevel}`);
              }
              if (currentLevel === 7) {
                localStorage.setItem('k_story_completed', 'true');
                isWinnerStoryCompleted = true;
                console.log('[Adventure] Story completed!');
              }
            }

            const winnerTutorialCompleted = localStorage.getItem('k_tutorial_completed') === 'true';
            const isWinnerOnline = nextState.gameType === 'online';

            // Update stats for global ranking for all nicknames
            updatePlayerStats(
              winnerPlayer.name, 
              true, 
              nextState.winnerGold || 0, 
              isWinnerOnline, 
              winnerTutorialCompleted, 
              isWinnerStoryCompleted
            );
            
            updatePlayerStats(
              loserPlayer.name, 
              false, 
              nextState.loserGold || 0, 
              false, 
              localStorage.getItem('k_tutorial_completed') === 'true', 
              localStorage.getItem('k_story_completed') === 'true'
            );
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
      if (currentState.gameMode !== nextState.gameMode) {
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
    if (currentState.gameType === 'online' && activeRoomId && !isIncomingAction) {
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
  }, [dispatch]);

  return (
    <GameContext.Provider value={{ state, dispatch: wrappedDispatch }}>
      {children}
    </GameContext.Provider>
  );
};

