import { GameState, Action, Player, Card, CardColor, Unit, Rank } from '@/models/types';
import * as logic from '../services/logicService';

export const initialState: GameState = {
  board: [],
  players: [],
  currentPlayerId: 0,
  actionsRemaining: 0,
  log: [],
  selectedCardIdInHand: null,
  selectedUnitIdOnBoard: null,
  isTargeting: null,
  winner: null,
  gameMode: 'menu',
  gameType: null,
  kingMoveState: null,
  cardInfoModal: null,
};

export const gameReducer = (state: GameState, action: Action): GameState => {
  // Prevent actions while AI is "thinking" or during certain game modes
  if ((state.gameType === 'ai' && state.currentPlayerId === 1 && state.gameMode === 'playing') && action.type !== 'BEGIN_NEW_TURN' && action.type !== 'END_TURN') {
    if(!['START_GAME', 'RESET_TO_MENU'].includes(action.type)) return state;
  }
  if(state.gameMode === 'game_over' && action.type !== 'RESET_TO_MENU') return state;


  switch (action.type) {
    case 'START_GAME':
      return logic.startGame(initialState, action.payload);

    case 'BEGIN_NEW_TURN':
      return logic.beginNewTurn(state);

    case 'END_TURN':
      return logic.endTurn(state);

    case 'SELECT_CARD_IN_HAND':
      return logic.selectCardInHand(state, action.payload);

    case 'SELECT_UNIT_ON_BOARD':
      return logic.selectUnitOnBoard(state, action.payload);
      
    case 'PLACE_UNIT':
      return logic.placeUnit(state, action.payload);

    case 'MOVE_UNIT':
      return logic.moveUnit(state, action.payload);

    case 'PLAY_SPECIAL_CARD':
      return logic.playSpecialCard(state, action.payload);
      
    case 'USE_ABILITY_ON_TARGET':
      return logic.useAbilityOnTarget(state, action.payload);

    case 'SCORE_UNIT':
      return logic.scoreUnit(state);

    case 'DRAW_CARD':
      return logic.drawCard(state);
    
    case 'RESET_TO_MENU': {
      return initialState;
    }
    
    case 'SET_CARD_INFO_MODAL': {
      return { ...state, cardInfoModal: action.payload.card };
    }
    
    case 'MOVE_UNIT_DURING_KING_EFFECT': {
      return logic.moveUnitDuringKingEffect(state, action.payload);
    }
    
    case 'FINISH_KING_MOVE': {
      return logic.finishKingMove(state);
    }

    default:
      return state;
  }
};