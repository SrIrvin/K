import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GameContext } from '../../context/GameContext';
import { Player } from '@/types';
import { formatGold } from '@/utils/gameUtils';
import { audioService } from '@/services/audioService';
import { storyTranslations } from '@/services/storyTranslations';
import { SHINIGAMI_QUOTES } from '../../services/shinigamiQuotes';

const playCoinTickSound = () => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        // Fun casino chime pitch
        osc.frequency.setValueAtTime(900 + Math.random() * 300, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
};

const playFireworkExplosionSound = () => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        // Bass boom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + Math.random() * 40, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        
        // Metallic sparkle crackle
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const sparkOsc = ctx.createOscillator();
                    const sparkGain = ctx.createGain();
                    sparkOsc.type = 'sine';
                    sparkOsc.frequency.setValueAtTime(1800 + Math.random() * 1200, ctx.currentTime);
                    sparkGain.gain.setValueAtTime(0.03, ctx.currentTime);
                    sparkGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
                    sparkOsc.connect(sparkGain);
                    sparkGain.connect(ctx.destination);
                    sparkOsc.start();
                    sparkOsc.stop(ctx.currentTime + 0.04);
                }, i * 40);
            }
        }, 120);
    } catch (e) {}
};

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    formatter?: (val: number) => string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 1500, formatter }) => {
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        let lastValue = 0;
        let startTimestamp: number | null = null;
        const startValue = 0;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + easeProgress * (value - startValue));
            
            if (current !== lastValue) {
                lastValue = current;
                playCoinTickSound();
            }
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

    return <span>{formatter ? formatter(currentValue) : currentValue}</span>;
};

interface GameOverModalProps {
    winner: Player;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number;
    life: number;
    decay: number;
    size: number;
    type: 'spark' | 'coin' | 'confetti';
    rotation?: number;
    rotationSpeed?: number;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner }) => {
    const { state, dispatch } = useContext(GameContext);
    const { t, i18n } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Resolve which player is "local" (the human user on this screen)
    const localPlayerIdResolved = useMemo(() => {
        if (state.gameType === 'online') {
            return state.localPlayerId ?? 0;
        }
        if (state.gameType === 'ai' || state.gameType === 'adventure') {
            return 0; // Human is always Player 0
        }
        return state.currentPlayerId;
    }, [state.gameType, state.localPlayerId, state.currentPlayerId]);

    // Resolve Level Boss Quotes
    const storyLevelData = useMemo(() => {
        if (state.gameType !== 'adventure' || !state.storyLevel) return null;
        
        // Load i18n language
        const currentLang = i18n.language || 'es';
        const trans = storyTranslations[currentLang] || storyTranslations['es'];
        
        // Find level entry
        const guardianNames = [
            'Piscina De La Muerte',
            'Solar',
            'IrwingElSabio',
            'Shinigami',
            'Moon',
            'Katty',
            'King21'
        ];
        const key = guardianNames[state.storyLevel - 1];
        if (!key) return null;
        
        return trans.levels[key];
    }, [state.gameType, state.storyLevel, i18n.language]);

    const bossQuote = useMemo(() => {
        if (!storyLevelData) return null;
        if (state.gameType === 'adventure' && state.storyLevel === 4) {
            const currentLang = (i18n.language && i18n.language.startsWith('en')) ? 'en' : 'es';
            const shinigamiList = SHINIGAMI_QUOTES[currentLang] || SHINIGAMI_QUOTES['es'];
            if (winner.id === localPlayerIdResolved) {
                // Human won, Shinigami lost -> "pierde"
                const pool = shinigamiList.pierde;
                return pool[Math.floor(Math.random() * pool.length)];
            } else {
                // Shinigami won -> "gana"
                const pool = shinigamiList.gana;
                return pool[Math.floor(Math.random() * pool.length)];
            }
        }
        return winner.id === localPlayerIdResolved ? storyLevelData.winQuote : storyLevelData.loseQuote;
    }, [storyLevelData, winner.id, localPlayerIdResolved, state.gameType, state.storyLevel, i18n.language]);

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

    // Blinking lights state for Casino frame
    const [bulbCycle, setBulbCycle] = useState(0);
    useEffect(() => {
        if (!isHumanWinner) return;
        const interval = setInterval(() => {
            setBulbCycle(c => (c + 1) % 4);
        }, 150);
        return () => clearInterval(interval);
    }, [isHumanWinner]);

    // Handle Victory/Defeat SFX and Particles
    useEffect(() => {
        if (isHumanWinner) {
            audioService.playSFX('win');
        } else {
            audioService.playSFX('lose');
        }
    }, [isHumanWinner]);

    // Canvas Particle Animation Loop
    useEffect(() => {
        if (!isHumanWinner || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Chinese/Golden Palette
        const colors = [
            '#FF2A2A', // Imperial Chinese Red
            '#FFD700', // Royal Gold
            '#FFA500', // Mandarin Orange
            '#4AF3A1', // Sacred Jade Green
            '#00FFFF', // Dragon Cyan
            '#FF44DD'  // Emperor Violet
        ];

        const spawnFirework = (x?: number, y?: number) => {
            const startX = x ?? (Math.random() * (canvas.width - 200) + 100);
            const startY = y ?? (Math.random() * (canvas.height * 0.4) + canvas.height * 0.15);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            playFireworkExplosionSound();

            // Spawn sparks
            for (let i = 0; i < 70; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 7 + 2;
                particles.push({
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: color,
                    alpha: 1.0,
                    life: 1.0,
                    decay: Math.random() * 0.015 + 0.015,
                    size: Math.random() * 3 + 2,
                    type: 'spark'
                });
            }

            // Spawn occasional falling jackpot coins at firework origin
            for (let i = 0; i < 15; i++) {
                particles.push({
                    x: startX,
                    y: startY,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -Math.random() * 6 - 2,
                    color: '#FFD700',
                    alpha: 1.0,
                    life: 1.0,
                    decay: Math.random() * 0.005 + 0.005,
                    size: Math.random() * 6 + 7,
                    type: 'coin',
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2
                });
            }
        };

        // Continuous coin rain generator from top
        let coinSpawnTimer = 0;
        
        // Auto firework timer
        let fireworkTimer = 0;

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn random fireworks
            fireworkTimer++;
            if (fireworkTimer > 50) {
                spawnFirework();
                fireworkTimer = 0;
            }

            // Spawn rain of coins from top
            coinSpawnTimer++;
            if (coinSpawnTimer > 3) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: -10,
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * 3 + 3,
                    color: '#FFD700',
                    alpha: 1.0,
                    life: 1.0,
                    decay: 0.004,
                    size: Math.random() * 6 + 7,
                    type: 'coin',
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.15
                });
                coinSpawnTimer = 0;
            }

            // Update & Draw Particles
            particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.type === 'spark') {
                    p.vy += 0.08; // Gravity for sparks
                    p.vx *= 0.98; // Friction
                } else if (p.type === 'coin') {
                    p.vy += 0.12; // Gravity for coins
                    if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
                        p.rotation += p.rotationSpeed;
                    }
                }

                p.life -= p.decay;
                p.alpha = Math.max(0, p.life);

                if (p.life <= 0) {
                    particles.splice(idx, 1);
                    return;
                }

                ctx.save();
                ctx.globalAlpha = p.alpha;

                if (p.type === 'coin') {
                    // Draw shiny casino gold coins
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation || 0);
                    
                    // Golden circle border
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = '#FFA500';
                    ctx.fill();
                    
                    // Inner gold circle
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = '#FFD700';
                    ctx.fill();

                    // Inner coin details (square hole or ridge)
                    ctx.fillStyle = '#B25900';
                    ctx.fillRect(-p.size * 0.25, -p.size * 0.25, p.size * 0.5, p.size * 0.5);
                } else {
                    // Glow effect for firework sparks
                    ctx.shadowBlur = p.size * 2;
                    ctx.shadowColor = p.color;
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                }

                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(loop);
        };

        // Initial burst
        setTimeout(() => spawnFirework(canvas.width * 0.3, canvas.height * 0.35), 200);
        setTimeout(() => spawnFirework(canvas.width * 0.7, canvas.height * 0.3), 600);
        setTimeout(() => spawnFirework(canvas.width * 0.5, canvas.height * 0.25), 1000);

        loop();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [isHumanWinner]);

    return (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in overflow-hidden">
            {/* CANVAS FOR CHINESE FIREWORKS AND CASINO COIN RAIN */}
            {isHumanWinner && (
                <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />
            )}

            {/* MAIN VICTORY/DEFEAT CONTAINER CARD */}
            <div className={`stone-modal p-6 text-center border-4 ${
                isHumanWinner 
                    ? 'border-yellow-500 shadow-[0_0_100px_#FFA500] animate-card-glow' 
                    : 'border-red-900 shadow-[0_0_50px_rgba(255,0,0,0.3)]'
            } max-w-md w-full relative z-20 transition-all duration-300`}>
                
                {/* BLINKING NEON CASINO LIGHTS MARQUEE (Only on Winner) */}
                {isHumanWinner && (
                    <div className="absolute -inset-1 border-2 border-yellow-400 rounded pointer-events-none opacity-90">
                        {/* Top Lights */}
                        <div className="absolute -top-1.5 left-4 right-4 flex justify-between px-2">
                            {[...Array(9)].map((_, i) => (
                                <span 
                                    key={i} 
                                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-100 ${
                                        (i + bulbCycle) % 3 === 0 ? 'bg-red-500 shadow-[0_0_8px_#ff0000]' : (i + bulbCycle) % 3 === 1 ? 'bg-yellow-400 shadow-[0_0_8px_#ffd700]' : 'bg-cyan-400 shadow-[0_0_8px_#00ffff]'
                                    }`}
                                />
                            ))}
                        </div>
                        {/* Bottom Lights */}
                        <div className="absolute -bottom-1.5 left-4 right-4 flex justify-between px-2">
                            {[...Array(9)].map((_, i) => (
                                <span 
                                    key={i} 
                                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-100 ${
                                        (i + bulbCycle + 1) % 3 === 0 ? 'bg-yellow-400 shadow-[0_0_8px_#ffd700]' : (i + bulbCycle + 1) % 3 === 1 ? 'bg-cyan-400 shadow-[0_0_8px_#00ffff]' : 'bg-red-500 shadow-[0_0_8px_#ff0000]'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Glowing background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t from-transparent ${
                    isHumanWinner ? 'via-yellow-500/15' : 'via-red-950/20'
                } to-transparent animate-pulse pointer-events-none rounded-lg`} />
                
                {/* JACKPOT BANNER */}
                {isHumanWinner && (
                    <div className="inline-block bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 border border-yellow-300 text-white font-extrabold text-[10px] tracking-[0.2em] uppercase py-0.5 px-3 rounded-full mb-3 shadow-[0_0_15px_#ff0000] animate-pulse">
                        🌟 ¡JACKPOT GRANDIOSO! 🌟
                    </div>
                )}

                <h2 className={`text-4xl md:text-6xl font-ancient-header ${
                    isHumanWinner 
                        ? 'text-yellow-400 text-shadow-[0_0_15px_rgba(255,215,0,0.8)]' 
                        : 'text-red-500'
                } mb-1 tracking-widest animate-bounce`}>
                    {isHumanWinner ? t('game_ui.victory') : t('game_ui.defeat')}
                </h2>
                <div className={`h-1 w-32 bg-gradient-to-r from-transparent ${isHumanWinner ? 'via-yellow-500 shadow-[0_0_8px_#ffd700]' : 'via-red-800'} to-transparent mx-auto mb-4`} />
                
                <p className="text-xs text-[#9A8B72] tracking-wider mb-1 uppercase font-semibold">
                    {isHumanWinner ? t('game_ui.victory_sub') : t('game_ui.defeat_sub')}
                </p>
                <p className={`text-2xl font-bold font-ancient-header ${
                    isHumanWinner ? 'text-yellow-100 drop-shadow-[0_2px_4px_rgba(255,165,0,0.8)]' : 'text-[#D8C49A]'
                } mb-4`}>
                    {winnerName}
                </p>

                {/* STORY BOSS DEFEAT/VICTORY DIALOGUE QUOTE */}
                {bossQuote && (
                    <div className={`mb-5 p-4 rounded-lg bg-[#1C1712] border-2 text-left relative overflow-hidden ${
                        isHumanWinner ? 'border-yellow-600/50 shadow-[0_0_15px_rgba(202,138,4,0.15)]' : 'border-red-900/60 shadow-[0_0_15px_rgba(127,29,29,0.15)]'
                    }`}>
                        {/* Decorative quote mark */}
                        <div className="absolute right-2 bottom-2 text-6xl text-[#ffffff]/3 font-serif pointer-events-none select-none">”</div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isHumanWinner ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#D8C49A]">
                                {storyLevelData?.displayName}
                            </span>
                        </div>
                        <p className="text-xs text-[#E1D4B7] italic leading-relaxed pl-3.5 border-l border-[#D8C49A]/30">
                            "{bossQuote}"
                        </p>
                    </div>
                )}

                {/* GOLD REWARDS SUMMARY PANEL */}
                <div className={`bg-[#120f0b]/95 border ${
                    isHumanWinner ? 'border-yellow-500/60 shadow-[inset_0_0_20px_rgba(255,215,0,0.1)]' : 'border-[#574d3c]'
                } rounded-lg p-4 mb-6 text-left font-mono text-xs max-h-[350px] overflow-y-auto`}>
                    <h3 className={`font-bold text-center border-b pb-2 mb-3 tracking-widest uppercase flex items-center justify-center gap-1.5 ${
                        isHumanWinner ? 'text-yellow-400 border-yellow-500/40' : 'text-[#D8C49A] border-[#574d3c]'
                    }`}>
                        {t('game_ui.gold_booty')}
                    </h3>
                    
                    {/* Winner Gold Section */}
                    <div className={`mb-3.5 pb-3 border-b ${isHumanWinner ? 'border-yellow-500/30' : 'border-[#574d3c]/35'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-green-400 text-xs">🏆 {winnerName} {t('game_ui.winner_suffix')}:</span>
                            <span className="text-yellow-400 font-extrabold text-sm flex items-center gap-1">
                                🪙 <AnimatedCounter value={winnerGold} formatter={formatGold} /> {t('game_ui.gold_suffix')}
                            </span>
                        </div>
                        <div className="text-[#9A8B72]/80 text-[11px] pl-4 flex flex-col gap-1">
                            <div>• {t('game_ui.conserved_units_label')}: <AnimatedCounter value={winnerConserved} /> × 3 = <span className="text-yellow-500 font-bold"><AnimatedCounter value={winnerConserved * 3} formatter={formatGold} /></span> {t('game_ui.gold_suffix')}</div>
                            <div>• {t('game_ui.special_effects_label')}: <AnimatedCounter value={winnerEffects} /> × 7 = <span className="text-yellow-500 font-bold"><AnimatedCounter value={winnerEffects * 7} formatter={formatGold} /></span> {t('game_ui.gold_suffix')}</div>
                            {winnerJokers > 0 && <div>• {t('game_ui.jokers_label')}: <AnimatedCounter value={winnerJokers} /> × 13 = <span className="text-yellow-500 font-bold"><AnimatedCounter value={winnerJokers * 13} formatter={formatGold} /></span> {t('game_ui.gold_suffix')}</div>}
                            {winnerKings > 0 && <div>• {t('game_ui.kings_label')}: <AnimatedCounter value={winnerKings} /> × 21 = <span className="text-yellow-500 font-bold"><AnimatedCounter value={winnerKings * 21} formatter={formatGold} /></span> {t('game_ui.gold_suffix')}</div>}
                            {winnerBonus > 0 && <div className="text-green-400 font-semibold">• {t('game_ui.victory_bonus_label')}: +<AnimatedCounter value={winnerBonus} formatter={formatGold} /> {t('game_ui.gold_suffix')}</div>}
                        </div>
                    </div>

                    {/* Loser Gold Section */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-red-400 text-[11px]">💀 {loserName}:</span>
                            <span className="text-yellow-600 font-bold text-xs"><AnimatedCounter value={loserGold} formatter={formatGold} /> {t('game_ui.gold_suffix')}</span>
                        </div>
                        <div className="text-[#9A8B72]/70 text-[10px] pl-4 flex flex-col gap-0.5">
                            <div>• {t('game_ui.conserved_units_label')}: <AnimatedCounter value={loserConserved} /> × 3 = <AnimatedCounter value={loserConserved * 3} formatter={formatGold} /> {t('game_ui.gold_suffix')}</div>
                            <div>• {t('game_ui.special_effects_label')}: <AnimatedCounter value={loserEffects} /> × 7 = <AnimatedCounter value={loserEffects * 7} formatter={formatGold} /> {t('game_ui.gold_suffix')}</div>
                            {loserJokers > 0 && <div>• {t('game_ui.jokers_label')}: <AnimatedCounter value={loserJokers} /> × 13 = <AnimatedCounter value={loserJokers * 13} formatter={formatGold} /> {t('game_ui.gold_suffix')}</div>}
                            {loserKings > 0 && <div>• {t('game_ui.kings_label')}: <AnimatedCounter value={loserKings} /> × 21 = <AnimatedCounter value={loserKings * 21} formatter={formatGold} /> {t('game_ui.gold_suffix')}</div>}
                            {loserBonus !== 0 && (
                                <div className={`${loserBonus < 0 ? 'text-red-400' : 'text-green-400'} font-semibold`}>
                                    • {loserBonus < 0 ? t('game_ui.bet_loss_label') : t('game_ui.bet_bonus_label')}: <AnimatedCounter value={loserBonus} formatter={formatGold} /> {t('game_ui.gold_suffix')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* CASINO ACTION BUTTON */}
                <button 
                    onClick={() => {
                        audioService.playSFX('click');
                        dispatch({type: 'RESET_TO_MENU'});
                    }} 
                    className={`stone-button text-base py-3 px-8 shadow-2xl ${
                        isHumanWinner 
                            ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:brightness-110 border-2 border-yellow-300 text-[#120f0b] scale-100 hover:scale-105 active:scale-95' 
                            : 'bg-gradient-to-r from-[#D8C49A] to-[#a49479] text-[#1e1a14]'
                    } font-bold w-full transition-all duration-150 uppercase tracking-widest`}
                >
                    {state.gameType === 'adventure' ? t('game_ui.back_to_map') : t('game_ui.back_to_menu')}
                </button>
            </div>
        </div>
    );
};