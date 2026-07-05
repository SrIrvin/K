import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GameContext } from '../../context/GameContext';

export const SwitchTurnModal: React.FC = () => {
    const { state, dispatch } = useContext(GameContext);
    const { t } = useTranslation();
    const { players, currentPlayerId } = state;

    const localPlayerIdResolved = useMemo(() => {
        if (state.gameType === 'online') {
            return state.localPlayerId ?? 0;
        }
        if (state.gameType === 'ai' || state.gameType === 'adventure') {
            return 0; // Human is always Player 0
        }
        // In local P2, active player changes dynamically with turn
        return currentPlayerId;
    }, [state.gameType, state.localPlayerId, currentPlayerId]);

    const opponentPlayer = useMemo(() => players?.[1 - localPlayerIdResolved], [players, localPlayerIdResolved]);

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
            <div className="stone-modal p-8 text-center max-w-sm w-full border-4 border-[#8A6938] shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-ancient-header text-[#D8C49A] mb-3 tracking-widest">
                    {t('game_ui.pass_tablet')}
                </h2>
                <div className="h-0.5 w-16 bg-[#8A6938] mx-auto mb-4" />
                
                <p className="text-sm text-[#9A8B72] uppercase tracking-wider mb-2">{t('game_ui.next_turn_of')}</p>
                <p className="text-xl md:text-2xl font-bold font-ancient-header text-[#D8C49A] mb-8">
                    {opponentPlayer?.name}
                </p>
                
                <button 
                    onClick={() => dispatch({type: 'BEGIN_NEW_TURN'})} 
                    className="stone-button stone-button-blue text-sm py-3 px-8 w-full shadow-lg"
                >
                    {t('game_ui.take_tablet')}
                </button>
            </div>
        </div>
    );
};