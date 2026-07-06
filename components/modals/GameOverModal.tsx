import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GameContext } from '../../context/GameContext';
import { Player } from '@/types';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 1500 }) => {
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const startValue = 0;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + easeProgress * (value - startValue));
            setCurrentValue(current);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCurrentValue(value);
            }
        };

        const animationFrameId = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [value, duration]);

    return <span>{currentValue}</span>;
};

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

    const winnerName = state.winner?.name || winner.name;
    const loser = state.players.find(p => p.id !== state.winner?.id);
    const loserName = loser?.name || 'Oponente';

    const winnerGold = state.winnerGold ?? 0;
    const loserGold = state.loserGold ?? 0;

    const winnerConserved = state.winnerGoldDetails?.conserved ?? 0;
    const winnerEffects = state.winnerGoldDetails?.effects ?? 0;
    const winnerJokers = state.winnerGoldDetails?.jokers ?? 0;
    const winnerKings = state.winnerGoldDetails?.kings ?? 0;
    const winnerBonus = state.winnerGoldDetails?.bonus ?? 0;

    const loserConserved = state.loserGoldDetails?.conserved ?? 0;
    const loserEffects = state.loserGoldDetails?.effects ?? 0;
    const loserJokers = state.loserGoldDetails?.jokers ?? 0;
    const loserKings = state.loserGoldDetails?.kings ?? 0;
    const loserBonus = state.loserGoldDetails?.bonus ?? 0;

    return (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className={`stone-modal p-6 text-center border-4 ${isHumanWinner ? 'border-[#8A6938]' : 'border-red-900'} max-w-md w-full shadow-[0_0_50px_rgba(216,196,154,0.4)] relative`}>
                {/* Glowing golden light animation effect */}
                <div className={`absolute inset-0 bg-gradient-to-t from-transparent ${isHumanWinner ? 'via-[#8A6938]/10' : 'via-red-950/20'} to-transparent animate-pulse pointer-events-none rounded-lg`} />
                
                <h2 className={`text-3xl md:text-5xl font-ancient-header ${isHumanWinner ? 'text-[#D8C49A]' : 'text-red-500'} mb-2 tracking-widest animate-bounce`}>
                    {isHumanWinner ? t('game_ui.victory') : t('game_ui.defeat')}
                </h2>
                <div className={`h-1 w-24 bg-gradient-to-r from-transparent ${isHumanWinner ? 'via-[#8A6938]' : 'via-red-800'} to-transparent mx-auto mb-4`} />
                
                <p className="text-sm text-[#9A8B72] tracking-wider mb-1">
                    {isHumanWinner ? t('game_ui.victory_sub') : t('game_ui.defeat_sub')}
                </p>
                <p className="text-xl font-bold font-ancient-header text-[#D8C49A] mb-4 drop-shadow-md">
                    {winnerName}
                </p>

                {/* GOLD REWARDS SUMMARY PANEL */}
                <div className="bg-[#120f0b]/90 border border-[#574d3c] rounded p-4 mb-6 text-left font-mono text-xs max-h-[350px] overflow-y-auto">
                    <h3 className="text-[#D8C49A] font-bold text-center border-b border-[#574d3c] pb-2 mb-3 tracking-widest uppercase flex items-center justify-center gap-1.5">
                        {t('game_ui.gold_booty')}
                    </h3>
                    
                    {/* Winner Gold */}
                    <div className="mb-3.5 pb-3 border-b border-[#574d3c]/35">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-green-500">🏆 {winnerName} {t('game_ui.winner_suffix')}:</span>
                            <span className="text-yellow-500 font-extrabold text-sm"><AnimatedCounter value={winnerGold} /> {t('game_ui.gold_suffix')}</span>
                        </div>
                        <div className="text-[#9A8B72]/80 text-[11px] pl-4 flex flex-col gap-0.5">
                            <div>• {t('game_ui.conserved_units_label')}: <AnimatedCounter value={winnerConserved} /> × 3 = <AnimatedCounter value={winnerConserved * 3} /> {t('game_ui.gold_suffix')}</div>
                            <div>• {t('game_ui.special_effects_label')}: <AnimatedCounter value={winnerEffects} /> × 7 = <AnimatedCounter value={winnerEffects * 7} /> {t('game_ui.gold_suffix')}</div>
                            {winnerJokers > 0 && <div>• {t('game_ui.jokers_label')}: <AnimatedCounter value={winnerJokers} /> × 13 = <AnimatedCounter value={winnerJokers * 13} /> {t('game_ui.gold_suffix')}</div>}
                            {winnerKings > 0 && <div>• {t('game_ui.kings_label')}: <AnimatedCounter value={winnerKings} /> × 21 = <AnimatedCounter value={winnerKings * 21} /> {t('game_ui.gold_suffix')}</div>}
                            {winnerBonus > 0 && <div className="text-green-400 font-semibold">• {t('game_ui.victory_bonus_label')}: +<AnimatedCounter value={winnerBonus} /> {t('game_ui.gold_suffix')}</div>}
                        </div>
                    </div>

                    {/* Loser Gold */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-red-400">💀 {loserName}:</span>
                            <span className="text-yellow-600 font-bold text-xs"><AnimatedCounter value={loserGold} /> {t('game_ui.gold_suffix')}</span>
                        </div>
                        <div className="text-[#9A8B72]/70 text-[10px] pl-4 flex flex-col gap-0.5">
                            <div>• {t('game_ui.conserved_units_label')}: <AnimatedCounter value={loserConserved} /> × 3 = <AnimatedCounter value={loserConserved * 3} /> {t('game_ui.gold_suffix')}</div>
                            <div>• {t('game_ui.special_effects_label')}: <AnimatedCounter value={loserEffects} /> × 7 = <AnimatedCounter value={loserEffects * 7} /> {t('game_ui.gold_suffix')}</div>
                            {loserJokers > 0 && <div>• {t('game_ui.jokers_label')}: <AnimatedCounter value={loserJokers} /> × 13 = <AnimatedCounter value={loserJokers * 13} /> {t('game_ui.gold_suffix')}</div>}
                            {loserKings > 0 && <div>• {t('game_ui.kings_label')}: <AnimatedCounter value={loserKings} /> × 21 = <AnimatedCounter value={loserKings * 21} /> {t('game_ui.gold_suffix')}</div>}
                            {loserBonus !== 0 && (
                                <div className={`${loserBonus < 0 ? 'text-red-400' : 'text-green-400'} font-semibold`}>
                                    • {loserBonus < 0 ? t('game_ui.bet_loss_label') : t('game_ui.bet_bonus_label')}: <AnimatedCounter value={loserBonus} /> {t('game_ui.gold_suffix')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => dispatch({type: 'RESET_TO_MENU'})} 
                    className="stone-button text-base py-3 px-8 shadow-2xl bg-gradient-to-r from-[#D8C49A] to-[#a49479] text-[#1e1a14] font-bold w-full"
                >
                    {state.gameType === 'adventure' ? t('game_ui.back_to_map') : t('game_ui.back_to_menu')}
                </button>
            </div>
        </div>
    );
};