import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GameContext } from '../../context/GameContext';
import { Player } from '@/types';

interface GameOverModalProps {
    winner: Player;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner }) => {
    const { state, dispatch } = useContext(GameContext);
    const { t } = useTranslation();

    // Resolve which player is "local" (the human user on this screen)
    const localPlayerIdResolved = useMemo(() => {
        if (state.gameType === 'online') {
            return state.localPlayerId ?? 0;
        }
        if (state.gameType === 'ai' || state.gameType === 'adventure') {
            return 0; // Human is always Player 0
        }
        // In local P2, active player changes dynamically with turn
        return state.currentPlayerId;
    }, [state.gameType, state.localPlayerId, state.currentPlayerId]);

    const isHumanWinner = winner.id === localPlayerIdResolved;

    return (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
            <div className={`stone-modal p-8 text-center border-4 ${isHumanWinner ? 'border-[#8A6938]' : 'border-red-900'} max-w-md w-full shadow-[0_0_50px_rgba(216,196,154,0.4)] relative`}>
                {/* Glowing golden light animation effect */}
                <div className={`absolute inset-0 bg-gradient-to-t from-transparent ${isHumanWinner ? 'via-[#8A6938]/10' : 'via-red-950/20'} to-transparent animate-pulse pointer-events-none rounded-lg`} />
                
                <h2 className={`text-3xl md:text-5xl font-ancient-header ${isHumanWinner ? 'text-[#D8C49A]' : 'text-red-500'} mb-4 tracking-widest animate-bounce`}>
                    {isHumanWinner ? t('game_ui.victory') : t('game_ui.defeat')}
                </h2>
                <div className={`h-1 w-24 bg-gradient-to-r from-transparent ${isHumanWinner ? 'via-[#8A6938]' : 'via-red-800'} to-transparent mx-auto mb-6`} />
                
                <p className="text-lg text-[#9A8B72] tracking-wider mb-2">
                    {isHumanWinner ? t('game_ui.victory_sub') : t('game_ui.defeat_sub')}
                </p>
                <p className="text-xl font-bold font-ancient-header text-[#D8C49A] mb-8 drop-shadow-md">
                    {winner.name}
                </p>
                
                <button 
                    onClick={() => dispatch({type: 'RESET_TO_MENU'})} 
                    className="stone-button text-base py-3 px-8 shadow-2xl bg-gradient-to-r from-[#D8C49A] to-[#a49479] text-[#1e1a14] font-bold"
                >
                    {state.gameType === 'adventure' ? t('game_ui.back_to_map') : t('game_ui.back_to_menu')}
                </button>
            </div>
        </div>
    );
};