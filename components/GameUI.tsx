import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameContext } from '../context/GameContext';
import { Card, Unit, Player, CardColor, Suit, Rank } from '../types';
import { getValidMoves, getKingValidMoves } from '../services/gameService';
import { getAiBestAction } from '../ai/aiService';
import { GameCard, CardBack } from './GameCard';
import { BOARD_ROWS } from '../constants';
import GameBoard from './GameBoard';
import { audioService } from '../services/audioService';

import { PlayerPillar } from './PlayerPillar';
// #region CARD DESCRIPTIONS
const CARD_DESCRIPTIONS: Record<Rank, string> = {
    '2': "Unidad Ligera. Daño Base: 2. Velocidad: 3. Se invoca en tu fila de inicio.",
    '3': "Unidad Ligera. Daño Base: 3. Velocidad: 3. Se invoca en tu fila de inicio.",
    '4': "Unidad Ligera. Daño Base: 4. Velocidad: 3. Se invoca en tu fila de inicio.",
    '5': "Unidad Media. Daño Base: 5. Velocidad: 2. Se invoca en tu fila de inicio.",
    '6': "Unidad Media. Daño Base: 6. Velocidad: 2. Se invoca en tu fila de inicio.",
    '7': "Unidad Media. Daño Base: 7. Velocidad: 2. Se invoca en tu fila de inicio.",
    '8': "Unidad Pesada. Daño Base: 8. Velocidad: 1. Se invoca en tu fila de inicio.",
    '9': "Unidad Pesada. Daño Base: 9. Velocidad: 1. Se invoca en tu fila de inicio.",
    '10': "Unidad Pesada. Daño Base: 10. Velocidad: 1. Se invoca en tu fila de inicio.",
    'J': "El Turbo. Otorga +1 de velocidad a una unidad para su siguiente movimiento. Se descarta después de usar.",
    'Q': "La Curandera. Restaura los puntos de daño de una unidad a su valor original y elimina las cartas enemigas apiladas encima.",
    'K': "El Dictador Loco. Obliga a avanzar 1 casilla ortogonal a todas tus unidades. Las que omitas serán eliminadas.",
    'A': "El Mísil Kamikaze. Inflige 1 de daño directo al rival y se va a tu pila de anotación.",
    'Joker': "El Sicario de las Sombras. Elimina instantáneamente del tablero a cualquier unidad enemiga seleccionada."
};
// #endregion


import { CardInfoModal } from './modals/CardInfoModal';
import { GameOverModal } from './modals/GameOverModal';
import { SwitchTurnModal } from './modals/SwitchTurnModal';
import { LogChroniclesModal } from './modals/LogChroniclesModal';


const GameUI: React.FC = () => {
    const { t } = useTranslation();
    const { state, dispatch } = useContext(GameContext);
    const { players, currentPlayerId, board, selectedUnitIdOnBoard, gameMode, winner, selectedCardIdInHand, kingMoveState, actionsRemaining } = state;
    
    const [showKingInfo, setShowKingInfo] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(true);
    const [isRightCollapsed, setIsRightCollapsed] = useState(true);
    const [hoveredRank, setHoveredRank] = useState<string | null>(null);
    const [isLogExpanded, setIsLogExpanded] = useState(false);

    const [activeEffect, setActiveEffect] = useState<'blood' | 'necrotic' | 'gold' | 'mystic' | 'queen_purify' | 'jack_speed' | 'king_iron' | 'ace_arrow' | null>(null);
    
    useEffect(() => {
        if (state.log.length === 0) return;
        const latest = state.log[0].toUpperCase();
        
        if (latest.includes('QUEEN') || latest.includes('REINA') || latest.includes('HEAL') || latest.includes('CURÓ') || latest.includes('CURACIÓN')) {
            setActiveEffect('queen_purify');
            audioService.playThematicBGM('queen');
        } else if (latest.includes('JACK') || latest.includes('JOTA') || latest.includes('VELOCIDAD') || latest.includes('TURBO') || latest.includes('BOOST')) {
            setActiveEffect('jack_speed');
            audioService.playThematicBGM('jack');
        } else if (latest.includes('KING\'S') || latest.includes('KING') || latest.includes('REY') || latest.includes('COMMAND') || latest.includes('MANDATO') || latest.includes('DICTADOR')) {
            setActiveEffect('king_iron');
            audioService.playThematicBGM('king');
        } else if (latest.includes('ACE PLAYED') || latest.includes('AS JUGADO') || (latest.includes('ACE') && latest.includes('DIRECT'))) {
            setActiveEffect('ace_arrow');
        } else if (latest.includes('TOUCHDOWN')) {
            setActiveEffect('gold');
        } else if (latest.includes('ELIMINATE') || latest.includes('ELIMINÓ') || latest.includes('DAMAGE') || latest.includes('DAÑO') || latest.includes('VS') || latest.includes('ATACANTE') || latest.includes('COMBATE') || latest.includes('ATTACK')) {
            setActiveEffect('blood');
        } else if (latest.includes('JOKER') || latest.includes('SICARIO')) {
            setActiveEffect('necrotic');
            audioService.playThematicBGM('joker');
        } else if (latest.includes('PLACED') || latest.includes('COLOCÓ') || latest.includes('MOVED') || latest.includes('MOVIÓ') || latest.includes('DREW') || latest.includes('ROBÓ')) {
            setActiveEffect('mystic');
        }
    
        const duration = (latest.includes('KING') || latest.includes('REY') || latest.includes('QUEEN') || latest.includes('REINA')) ? 1100 : 750;
 
        const timer = setTimeout(() => {
            setActiveEffect(null);
        }, duration);
    
        return () => clearTimeout(timer);
    }, [state.log]);


    const [cardWidth, setCardWidth] = useState(72);
    const [cardSpacing, setCardSpacing] = useState(75);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 768) {
                setIsLeftCollapsed(false);
                setIsRightCollapsed(false);
            }
            
            const handleResize = () => {
                if (window.innerWidth < 640) {
                    setCardWidth(56);
                    setCardSpacing(58);
                } else if (window.innerWidth < 768) {
                    setCardWidth(64);
                    setCardSpacing(68);
                } else {
                    setCardWidth(72);
                    setCardSpacing(75);
                }
            };
            handleResize();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    // Resolve which player is "local" (the human user on this screen)
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

    const currentPlayer = useMemo(() => players?.[localPlayerIdResolved], [players, localPlayerIdResolved]);
    const opponentPlayer = useMemo(() => players?.[1 - localPlayerIdResolved], [players, localPlayerIdResolved]);

    const storyGuardians = useMemo(() => [
      { name: "Piscina De La Muerte", title: "El Mercenario Burlón", image: "Piscina De La Muerte.png" },
      { name: "Solar", title: "El Guardián del Sol", image: "Solar.png" },
      { name: "IrwingElSabio", title: "Irwing El Sabio", image: "IrwingElSabio.png" },
      { name: "Shinigami", title: "El Antiguo Dios de la Muerte", image: "Shinigami.png" },
      { name: "Moon", title: "La Princesa Carmesí", image: "Moon.png" },
      { name: "Katty", title: "La Diosa del Conocimiento", image: "Katty.png" },
      { name: "King21", title: "El Jerarca Divino", image: "King21.png" },
    ], []);

    const guardianQuotePools = useMemo(() => [
      // Level 1: Piscina De La Muerte
      [
        "¡Oye! ¿Podrías apurarte? Mi chimichanga se está enfriando.",
        "¿Eso fue un ataque? Pensé que estabas acomodando las cartas para la foto.",
        "¡Cuidado con las costuras de mi traje! Me costó una fortuna en la sastrería dimensional.",
        "¿Sabías que somos solo píxeles en la pantalla de alguien? ¡Igual te voy a aplastar!",
        "¡Mira mamá, estoy peleando con cartas de piedra! Espera, ¿dónde está mi espada real?",
        "¡Apuéstame 5 dólares a que mi Reina cura tu depresión antes de destruir tu meta!",
        "¡Toc, toc! ¿Quién es? ¡El tipo que va a reventar tus defensas en tres segundos!",
        "¡Uff, jugar contra ti es más lento que una película de autor francesa!",
        "¡No llores si mi comodín hace desaparecer a tu carta favorita, es solo negocios!",
        "¿Me das tu autógrafo antes de perder? Es para mi colección de 'rivales caídos'."
      ],
      // Level 2: Solar
      [
        "El sol siempre vuelve a levantarse... ¿crees que tú podrás hacer lo mismo?",
        "Mis destellos purificarán tu arrogancia. El fuego solar no conoce piedad.",
        "¿Sientes el calor del tablero? Es tu fin aproximándose grado a grado.",
        "Aquellos que desafían la luz solo encuentran cenizas en su camino.",
        "¡La aurora del mediodía derretirá tus runas! No hay sombra donde esconderse.",
        "El brillo del amanecer corona mi victoria. Ríndete ante el calor celestial.",
        "Cada carta tuya que toco se convierte en humo rúnico.",
        "La luz solar revela todas tus debilidades, no puedes ocultar tu estrategia.",
        "Bajo el sol ardiente, solo los fuertes de espíritu prevalecerán.",
        "¡Siente la gloria del amanecer eterno golpear tu zona de meta!"
      ],
      // Level 3: IrwingElSabio
      [
        "La estrategia puede aprenderse en libros... pero la sabiduría rúnica se gana con sangre.",
        "He calculado todos tus movimientos posibles. Ninguno de ellos te salva de la derrota.",
        "Las runas antiguas susurran tu destino... y no es un final feliz para ti.",
        "Cada carta que juegas es un paso más hacia la trampa que diseñé hace siglos.",
        "El conocimiento es el arma definitiva, y tu mazo carece de profundidad.",
        "Aprende de esta lección, joven discípulo: el tablero es mi mente y tú solo un pensamiento.",
        "Un verdadero sabio no teme al descarte; sabe que todo vuelve en el ciclo rúnico.",
        "Tus impulsos te traicionan, joven estratega. La paciencia es el pilar de la victoria.",
        "Incluso la roca más dura se erosiona ante un río de decisiones inteligentes.",
        "¿Crees en la suerte de las cartas? Yo solo creo en el diseño rúnico de mi mazo."
      ],
      // Level 4: Shinigami
      [
        "Si llegaste hasta aquí... al menos morirás sirviendo de abono para mi jardín de almas.",
        "Tu nombre ya está escrito en mi cuaderno del descarte. Es solo cuestión de tiempo.",
        "¿Escuchas ese frío viento? Es el filo de mi guadaña reclamando tu mazo.",
        "Toda vida es efímera. Tus cartas jugadas pronto me pertenecerán en la pila de descarte.",
        "He cosechado almas más brillantes que la tuya. La tuya será un juego de niños.",
        "La muerte no es injusta... simplemente es puntual. Tu reloj se agota.",
        "El vacío del descarte te llama por tu nombre de pila.",
        "Cada turno que pasa, tu sombra se alarga y tu tiempo en este tablero disminuye.",
        "No llores por tus unidades caídas, todas encontrarán descanso eterno en mi cementerio.",
        "El destino final de todo jugador es rendir sus cartas ante mi presencia."
      ],
      // Level 5: Moon
      [
        "Toda partida termina igual... en la completa y absoluta penumbra de la luna nueva.",
        "La noche es mi aliada y tus secretos son visibles bajo mi luz plateada.",
        "Caminas a ciegas en un laberinto de sombras. Yo soy la dueña del laberinto.",
        "El eclipse total de tu esperanza comenzará en tu próximo movimiento.",
        "La marea de mi mazo sube y bajará para ahogar tus débiles tropas.",
        "La fría gravedad lunar aprisionará tu velocidad de avance.",
        "Incluso las estrellas titilan con miedo cuando despliego mis fases ocultas.",
        "La belleza de la luna carmesí es lo último que verán tus ojos cansados.",
        "Tu luz de esperanza se atenúa... pronto reinará la oscuridad absoluta en tu meta.",
        "Mis cartas danzan al ritmo de la marea lunar, un baile del que no podrás escapar."
      ],
      // Level 6: Katty
      [
        "Oh, qué tierno intento... pero estás cometiendo un error de principiante.",
        "A ver, te lo explicaré despacio para que puedas entenderlo: esa carta no va ahí.",
        "¿De verdad pensaste que eso funcionaría? Qué adorable.",
        "Tranquilo, no llores. De los errores se aprende, pequeño comandante.",
        "Ven, déjame darte una lección de estrategia que jamás olvidarás.",
        "Es lindo ver cómo te esfuerzas, pero estás jugando a nivel de guardería.",
        "¿Quieres que te deje ganar un punto para que no te sientas mal?",
        "La paciencia es una virtud... lástima que aún seas muy inmaduro para entenderla.",
        "Te trato con cariño porque sé que estás dando lo mejor de ti, aunque no sea suficiente.",
        "Pon atención a este movimiento: así es como juega un verdadero maestro."
      ],
      // Level 7: King21
      [
        "Desciendo de los dioses antiguos; mi deber es guiar y proteger a mi pueblo con sabiduría.",
        "La fuerza sin sabiduría solo trae destrucción. Muéstrame tu verdadero propósito.",
        "Como gobernante supremo, cada movimiento en este tablero busca proteger la paz de mi reino.",
        "El respeto se gana en el campo de batalla, con honor y decisiones justas.",
        "No busco tu aniquilación, sino probar si eres digno de liderar el destino de los tuyos.",
        "Las leyes que creé protegen el equilibrio de nuestro mundo. Debes respetarlas.",
        "Un líder sabio protege a cada uno de sus soldados en el tablero.",
        "La autoridad no proviene del miedo, sino de la justicia y la devoción a nuestro pueblo.",
        "Demuestra tu valía como comandante, con nobleza y sin caer en impulsos egoístas.",
        "Que los dioses juzguen nuestro duelo. Que gane quien realmente pueda proteger al reino."
      ]
    ], []);

    const [activeGuardianQuote, setActiveGuardianQuote] = useState<string>('');
    const [showStoryBubble, setShowStoryBubble] = useState<boolean>(false);

    useEffect(() => {
        if (state.gameType !== 'adventure' || !state.storyLevel) return;
        const levelIdx = state.storyLevel - 1;
        const pool = guardianQuotePools[levelIdx];
        if (!pool) return;

        const getRandomQuote = () => pool[Math.floor(Math.random() * pool.length)];
        
        // Show first quote after 3 seconds so the board finishes opening
        const initialTimeout = setTimeout(() => {
            setActiveGuardianQuote(getRandomQuote());
            setShowStoryBubble(true);
        }, 3000);

        const interval = setInterval(() => {
            setActiveGuardianQuote(getRandomQuote());
            setShowStoryBubble(true);
        }, 50000); // 50 seconds

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [state.gameType, state.storyLevel, guardianQuotePools]);


    
    const isPlacingCard = !!selectedCardIdInHand && !kingMoveState?.isMoving;
    const isCurrentPlayerTurn = useMemo(() => currentPlayerId === state.currentPlayerId, [currentPlayerId, state.currentPlayerId]);
    const isLocalTurn = useMemo(() => {
        if (state.gameType === 'online') {
            return state.localPlayerId === state.currentPlayerId;
        }
        if (state.gameType === 'ai' || state.gameType === 'adventure') {
            return state.currentPlayerId === 0;
        }
        return true;
    }, [state.gameType, state.localPlayerId, state.currentPlayerId]);
    const canAct = useMemo(() => actionsRemaining > 0 && !state.isTargeting && !kingMoveState?.isMoving && isCurrentPlayerTurn && isLocalTurn, [actionsRemaining, state.isTargeting, kingMoveState, isCurrentPlayerTurn, isLocalTurn]);

    // 🕯️ Idle timer UX - Highlights options if player is inactive for 20 seconds
    useEffect(() => {
        setShowHints(false);

        // Do not highlight hints if game is over or if it's the AI's turn
        if (gameMode !== 'playing' || ((state.gameType === 'ai' || state.gameType === 'adventure') && currentPlayerId === 1)) {
            return;
        }

        const timer = setTimeout(() => {
            setShowHints(true);
        }, 20000); // 20 seconds

        return () => clearTimeout(timer);
    }, [
        board, 
        currentPlayerId, 
        actionsRemaining, 
        selectedCardIdInHand, 
        selectedUnitIdOnBoard, 
        state.isTargeting, 
        gameMode
    ]);

    // 🕯️ Store state in a ref to avoid stale closures in setTimeout
    const stateRef = React.useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // AI thinking effect trigger
    useEffect(() => {
        // Only run when game is playing, type is AI or adventure, and it is the AI's turn (Player 1)
        if (gameMode !== 'playing' || (state.gameType !== 'ai' && state.gameType !== 'adventure') || currentPlayerId !== 1 || winner) {
            return;
        }

        console.log("[AI Turn Start] Actions remaining:", actionsRemaining);

        const timer = setTimeout(() => {
            try {
                const currentState = stateRef.current;
                
                // If AI has no actions left, force end turn
                if (actionsRemaining <= 0 && !kingMoveState?.isMoving) {
                    console.log("[AI] No actions remaining. Ending turn.");
                    dispatch({ type: 'END_TURN' });
                    return;
                }

                const bestAction = getAiBestAction(currentState);
                console.log("[AI Decision] Selected Action:", bestAction);
                
                if (bestAction) {
                    dispatch(bestAction);
                } else {
                    dispatch({ type: 'END_TURN' });
                }
            } catch (error) {
                console.error("[AI Error] Failed to calculate action, ending turn:", error);
                dispatch({ type: 'END_TURN' }); // Safely pass turn on crash
            }
        }, 1000); // 1 second delay between steps

        return () => clearTimeout(timer);
    }, [
        currentPlayerId, 
        gameMode, 
        winner, 
        actionsRemaining, 
        selectedCardIdInHand, 
        selectedUnitIdOnBoard, 
        state.isTargeting, 
        kingMoveState?.isMoving, 
        dispatch
    ]);

    const selectedUnit = useMemo(() => board.flat().find(u => u?.id === selectedUnitIdOnBoard), [board, selectedUnitIdOnBoard]);
    
    const validMoves = useMemo(() => {
      if (!selectedUnit) return [];
      if (kingMoveState?.isMoving) {
        return getKingValidMoves(selectedUnit, board);
      }
      return getValidMoves(selectedUnit, board, currentPlayerId);
    }, [selectedUnit, board, currentPlayerId, kingMoveState]);

    // Generate 85 dust particles for background animation
    const dustParticles = useMemo(() => {
      return Array.from({ length: 85 }).map((_, i) => {
        const size = Math.random() * 4 + 1.5;
        const left = Math.random() * 100;
        const delay = Math.random() * 25;
        const duration = Math.random() * 10 + 15;
        return (
          <div
            key={i}
            className="dust-particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              backgroundColor: 'var(--particle-color, #706f6c)',
              boxShadow: '0 0 8px var(--particle-color, #706f6c)',
              opacity: Math.random() * 0.35 + 0.15,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      });
    }, []);

    // Split hand cards for better visual spacing safely
    const specialCards = currentPlayer ? currentPlayer.hand.filter(c => ['J', 'Q', 'K', 'A', 'Joker'].includes(c.rank)) : [];
    const unitCards = currentPlayer ? currentPlayer.hand.filter(c => !['J', 'Q', 'K', 'A', 'Joker'].includes(c.rank)).sort((a,b) => parseInt(a.rank) - parseInt(b.rank)) : [];

    const groupedSpecialCards = useMemo(() => {
      const groups: Record<string, Card[]> = {};
      for (const card of specialCards) {
        if (!groups[card.rank]) {
          groups[card.rank] = [];
        }
        groups[card.rank].push(card);
      }
      return groups;
    }, [specialCards]);

    const groupedUnitCards = useMemo(() => {
      const groups: Record<string, Card[]> = {};
      for (const card of unitCards) {
        if (!groups[card.rank]) {
          groups[card.rank] = [];
        }
        groups[card.rank].push(card);
      }
      return groups;
    }, [unitCards]);

    const handleSelectCard = (cardId: string | null) => {
        if (canAct || selectedCardIdInHand === cardId) {
            dispatch({ type: 'SELECT_CARD_IN_HAND', payload: { cardId } });
        }
    };

    const resetIdleTimer = () => {
        if (showHints) {
            setShowHints(false);
        }
    };

    const particleStyles = useMemo(() => {
        if (!players || players.length < 2) return {};
        const p0Damage = players[0]?.damage || 0;
        const p1Damage = players[1]?.damage || 0;
        const totalDamage = p0Damage + p1Damage;
        const winTargetValue = state.winTarget || 20;

        // Progress ratio (0 to 1) based on match progression
        const progress = Math.min(1, totalDamage / (winTargetValue * 1.5));

        // Interpolate color from grey ash (#7a7a7a) to deep red (#ab3e30)
        const r = Math.round(122 + (171 - 122) * progress);
        const g = Math.round(122 + (62 - 122) * progress);
        const b = Math.round(122 + (48 - 122) * progress);
        const particleColor = `rgb(${r}, ${g}, ${b})`;

        // Drift direction: towards the player with less health (higher damage)
        // Player 0 is bottom (105vh to -5vh is UP, so to go towards Player 0, drift down: -5vh to 105vh)
        // Player 1 is top (-5vh to 105vh is DOWN, so to go towards Player 1, drift up: 105vh to -5vh)
        let driftStart = '105vh';
        let driftEnd = '-5vh';
        let driftX = '50px';

        if (p0Damage > p1Damage) {
            // Player 0 has less health (more damage), so particles drift DOWN
            driftStart = '-5vh';
            driftEnd = '105vh';
            driftX = '-50px';
        } else if (p1Damage > p0Damage) {
            // Player 1 has less health (more damage), so particles drift UP
            driftStart = '105vh';
            driftEnd = '-5vh';
            driftX = '50px';
        }

        return {
            '--particle-color': particleColor,
            '--drift-start': driftStart,
            '--drift-end': driftEnd,
            '--drift-x': driftX
        } as React.CSSProperties;
    }, [players, state.winTarget]);

    if (!currentPlayer || !opponentPlayer) {
      return <div className="h-screen w-screen flex items-center justify-center bg-[#2A2A2A] text-[#D8C49A] font-ancient-header text-xl">Invocando el altar...</div>;
    }

    return (
        <div 
          className="ancient-bg flex h-screen w-screen overflow-hidden text-white relative" 
          onClick={resetIdleTimer}
        >
            {/* Visual Overlays */}
            <div className="archaeological-vignette" />
            <div className="rune-overlay" />
            <div className="dust-container" style={particleStyles}>{dustParticles}</div>

            {/* King's Command Phase Atmospheric Overlays */}
            {state.kingMoveState?.isMoving && (
                <>
                    <div className="king-phase-bg-overlay" />
                    <div className="king-watermark">
                        <svg viewBox="0 0 100 100" style={{
                            width: '55vh',
                            height: '55vh',
                            fill: '#ffffff',
                            opacity: 0.14,
                            filter: 'drop-shadow(0 0 45px rgba(255, 255, 255, 0.45)) blur(1px)',
                            animation: 'king-watermark-fade 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                            pointerEvents: 'none',
                            userSelect: 'none'
                        }}>
                          {/* Vertical left wedge (stem of K) */}
                          <path d="M 28 20 L 44 20 L 36 30 Z" />
                          <path d="M 33 28 L 39 28 L 36 80 Z" />
                          
                          {/* Upper diagonal wedge (pointing to center) */}
                          <path d="M 72 25 L 82 37 L 68 34 Z" />
                          <path d="M 73 31 L 77 36 L 36 50 Z" />
                          
                          {/* Lower diagonal wedge (pointing to center) */}
                          <path d="M 72 75 L 68 66 L 82 63 Z" />
                          <path d="M 73 69 L 77 64 L 36 50 Z" />
                        </svg>
                    </div>
                </>
            )}

            {/* 🏛️ Layout: Widescreen Landscape Altar (3 columns: Left Pillar, Center Altar, Right Pillar) */}
            <div className="flex flex-col md:flex-row w-full h-full relative z-20 overflow-hidden">
                
                {/* Mobile Backdrops for collapsible sidebars */}
                {!isLeftCollapsed && (
                  <div 
                    className="md:hidden fixed inset-0 bg-black/70 z-25 transition-opacity"
                    onClick={() => setIsLeftCollapsed(true)}
                  />
                )}
                {!isRightCollapsed && (
                  <div 
                    className="md:hidden fixed inset-0 bg-black/70 z-25 transition-opacity"
                    onClick={() => setIsRightCollapsed(true)}
                  />
                )}

                {/* 1. LEFT SIDEBAR PILLAR: Opponent Stats */}
                <div 
                  className={`fixed md:relative top-0 left-0 h-full z-30 md:z-10 transition-all duration-300 ease-in-out flex flex-col ${
                    isLeftCollapsed 
                      ? 'fixed -translate-x-full md:relative md:w-0 border-r-0 bg-transparent shadow-none' 
                      : 'fixed translate-x-0 w-[260px] md:relative md:w-[18%] lg:md:w-[15%] bg-[#1e1a14]/95 border-r-4 border-[#8A6938] shadow-[10px_0_30px_rgba(0,0,0,0.8)]'
                  }`}
                >
                    <div className={`flex flex-col h-full w-full transition-opacity duration-300 ${isLeftCollapsed ? 'md:hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <PlayerPillar 
                          player={opponentPlayer} 
                          isOpponent={true} 
                          title={(state.gameType === 'ai' || state.gameType === 'adventure') ? "Fuerza AI" : "Rival"} 
                          winTarget={state.winTarget}
                          guardianQuote={activeGuardianQuote || undefined}
                        />
                    </div>

                    {/* Left Sidebar Toggle Tab (Drawer handle) */}
                    <button 
                      onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                      className="absolute top-1/2 -translate-y-1/2 left-full z-40 bg-[#1e1a14] border-y-2 border-r-2 border-[#8A6938] hover:bg-[#2e261f] text-[#D8C49A] p-2 rounded-r-md transition-all duration-300 shadow-md font-extrabold flex items-center justify-center text-xs cursor-pointer"
                      style={{ height: '50px', width: '20px' }}
                    >
                      {isLeftCollapsed ? '▶' : '◀'}
                    </button>
                </div>

                {/* 2. CENTER AREA: The Altar Floor (GameBoard & Active Hand) */}
                <div className="flex-grow flex flex-col h-full min-w-0 p-2 justify-between items-center relative">
                    
                    {/* Tiny header for mobile/portrait backup */}
                    <div className="md:hidden flex justify-between items-center w-full px-3 py-1.5 bg-[#1e1a14]/90 border-b border-[#8A6938] rounded-md text-[#D8C49A] text-xs z-10 gap-2 shadow-lg">
                        <button 
                          onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                          className="px-2 py-1 bg-[#2A2A2A] border border-[#8A6938] rounded font-bold font-runic-text hover:bg-[#8A6938] hover:text-[#1e1a14] transition-all text-[10px]"
                        >
                          𐎠 Rival 📊
                        </button>
                        
                        <div className="flex items-center gap-1.5 font-orbitron text-[10px] sm:text-xs">
                          <span className="font-extrabold">{currentPlayer.name.split(' ')[0]} ({currentPlayer.damage}D)</span>
                          <span className="text-yellow-500 font-bold">Acc: {actionsRemaining}</span>
                          <span className="font-extrabold">vs {opponentPlayer.name.split(' ')[0]} ({opponentPlayer.damage}D)</span>
                        </div>

                        <button 
                          onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                          className="px-2 py-1 bg-[#2A2A2A] border border-[#8A6938] rounded font-bold font-runic-text hover:bg-[#8A6938] hover:text-[#1e1a14] transition-all text-[10px]"
                        >
                          Panel 𐎧
                        </button>
                    </div>

                    {/* Game board takes about 70% of the screen height */}
                    <div className={`flex-grow flex items-center justify-center w-full min-h-0 py-1 md:py-2 ${activeEffect === 'blood' ? 'shake-effect' : ''} relative`}>
                        <GameBoard 
                          board={board}
                          currentPlayer={currentPlayer}
                          opponentPlayer={opponentPlayer}
                          validMoves={validMoves}
                          showHints={showHints}
                        />

                        {/* Story Mode Dialog Bubble Overlay */}
                        {state.gameType === 'adventure' && showStoryBubble && activeGuardianQuote && (
                          <>
                            {/* Fullscreen backdrop to capture screen touches/clicks and dismiss the bubble */}
                            <div 
                              className="fixed inset-0 z-40 bg-black/10 cursor-pointer pointer-events-auto"
                              onClick={() => {
                                audioService.playSFX('click');
                                setShowStoryBubble(false);
                              }}
                            />
                            
                            {/* Comic Speech Bubble */}
                            <div 
                              className="absolute z-50 max-w-[280px] sm:max-w-md bg-[#1d1610]/95 border-2 border-[#D8C49A] p-4 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.95)] flex gap-3.5 items-start cursor-pointer hover:border-white transition-all transform hover:scale-[1.02] pointer-events-auto"
                              onClick={() => {
                                audioService.playSFX('click');
                                setShowStoryBubble(false);
                              }}
                              style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <img 
                                src={`/images/history/${storyGuardians[state.storyLevel - 1]?.image || 'IrwingElSabio.png'}`}
                                alt={storyGuardians[state.storyLevel - 1]?.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-[#8A6938] object-cover shrink-0 shadow-md bg-black"
                              />
                              <div className="flex flex-col">
                                <span className="text-[9px] font-orbitron tracking-widest text-[#D8C49A] uppercase leading-none font-bold">
                                  {storyGuardians[state.storyLevel - 1]?.title || 'Enemigo'}
                                </span>
                                <h4 className="text-xs sm:text-sm font-ancient-header text-white font-extrabold tracking-wide mt-1">
                                  {storyGuardians[state.storyLevel - 1]?.name.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <div className="h-0.5 bg-gradient-to-r from-[#8A6938] to-transparent my-1.5" />
                                <p className="text-xs sm:text-sm text-[#E2C799] italic leading-relaxed font-runic-text">
                                  "{activeGuardianQuote}"
                                </p>
                                <span className="text-[8px] text-[#8A6938] mt-2 self-end animate-pulse uppercase tracking-wider font-extrabold font-orbitron">
                                  ⚡ Toca la pantalla para continuar
                                </span>
                              </div>
                              {/* Speech Bubble Arrow Indicator */}
                              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[#1d1610] border-r-2 border-b-2 border-[#D8C49A] rotate-45" />
                            </div>
                          </>
                        )}
                    </div>

                    {/* Current Player's Active Hand (tactile slots) */}
                    {state.gameMode === 'playing' && (
                        <div className="w-full max-w-2xl bg-[#1e1a14]/60 p-2 rounded-lg border-2 border-[#574d3c] flex flex-col gap-2 relative shadow-inner shadow-black mb-1.5 flex-shrink-0 z-20">
                            {/* Special Ability Targeting Floating HUD - Positioned over/covering the hand */}
                            {state.isTargeting && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 max-w-sm w-[95%] pointer-events-none">
                                <div className="stone-modal p-4 flex flex-col items-center border-2 border-[#8A6938] shadow-2xl pointer-events-auto bg-[#1e1a14]/95 text-center">
                                  <h2 className="text-base font-ancient-header text-[#D8C49A] animate-pulse tracking-widest flex items-center gap-1.5 mb-1">
                                    ✨ HABILIDAD ACTIVA ✨
                                  </h2>
                                  <div className="h-0.5 w-12 bg-[#8A6938] mb-2" />
                                  <p className="text-xs text-[#D8C49A] font-runic-text leading-snug">
                                    {state.isTargeting === 'queen' && "REINA: Haz clic en una unidad aliada en el tablero para curarla/potenciarla."}
                                    {state.isTargeting === 'jack' && "JOTA: Haz clic en una unidad aliada para darle +1 de velocidad en su próximo movimiento."}
                                    {state.isTargeting === 'joker' && "JOKER: Haz clic en una unidad enemiga en el tablero para eliminarla instantáneamente."}
                                  </p>
                                  
                                  <button
                                    onClick={() => dispatch({ type: 'SELECT_CARD_IN_HAND', payload: { cardId: null } })}
                                    className="stone-button stone-button-red text-xs py-1.5 px-6 mt-3 shadow-md"
                                  >
                                    Cancelar Habilidad
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* King Command Floating HUD Alert - Positioned over/covering the hand */}
                            {kingMoveState?.isMoving && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 max-w-sm w-[95%] pointer-events-none">
                                <div className="stone-modal p-4 flex flex-col items-center border-2 border-[#8A6938] shadow-2xl pointer-events-auto bg-[#1e1a14]/95 text-center">
                                  <h2 className="text-base font-ancient-header text-[#D8C49A] animate-pulse tracking-widest flex items-center gap-1.5 mb-1">
                                    👑 MANDO DEL REY 👑
                                  </h2>
                                  <div className="h-0.5 w-12 bg-[#8A6938] mb-2" />
                                  <p className="text-xs text-[#D8C49A] font-runic-text leading-snug">
                                    Avanza tus unidades (ortogonal). Las unidades no movidas serán destruidas al finalizar la orden.
                                  </p>
                                  
                                  <button
                                    onClick={() => dispatch({type: 'FINISH_KING_MOVE'})}
                                    className="stone-button stone-button-red text-xs py-1.5 px-6 mt-3 shadow-md"
                                  >
                                    Terminar Orden ({kingMoveState.unitsToMove.length} pendientes)
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Hand Header */}
                            <div className="flex justify-between items-center px-1 text-[10px] sm:text-xs text-[#9A8B72] font-runic-text">
                              <span className="uppercase tracking-widest font-bold">Tus Unidades (Desplegar)</span>
                              <span className="uppercase tracking-widest font-bold">Habilidades Especiales</span>
                            </div>

                            {/* Hand Cards */}
                            {(() => {
                              const isCardHinted = showHints && actionsRemaining > 0 && !selectedCardIdInHand && !selectedUnitIdOnBoard;
                              const hasQueenInHand = specialCards.some(c => c.rank === 'Q');
                              const lastUnitInDiscard = [...currentPlayer.discard].reverse().find(card => {
                                const val = parseInt(card.rank, 10);
                                return !isNaN(val) && val >= 2 && val <= 10 && card.color === currentPlayer.color;
                              });

                              return (
                                <div className="flex justify-between items-center gap-4 h-[125px] sm:h-[135px] md:h-[160px] w-full">
                                     {/* Unit Cards Area (Left) - 50% width */}
                                     <div className={`${isRightCollapsed ? 'w-[40%] sm:w-[42%] md:w-[42%]' : 'w-1/2'} flex gap-4 overflow-x-auto h-full pr-3 border-r border-[#574d3c]/40 items-start pt-1.5`}>
                                         {unitCards.length === 0 && !lastUnitInDiscard ? (
                                             <div className="flex items-center justify-center w-full h-full text-xs text-[#9A8B72]/40 italic">
                                               Sin cartas de unidad
                                             </div>
                                         ) : (
                                             <>
                                              {Object.entries(groupedUnitCards).map(([rank, cards]) => {
                                                  const isHovered = hoveredRank === rank;
                                                  const stackWidth = isHovered 
                                                      ? `${cardWidth + (cards.length - 1) * cardSpacing}px` 
                                                      : `${cardWidth}px`;
                                                  const topCard = cards[cards.length - 1];
                                                  const isTopCardSelected = selectedCardIdInHand === topCard.id;
                                                  
                                                  return (
                                                      <div 
                                                        key={rank} 
                                                        className="h-full flex flex-col justify-center transition-all duration-300 ease-out relative"
                                                        style={{ 
                                                            width: stackWidth,
                                                        }}
                                                        onMouseEnter={() => setHoveredRank(rank)}
                                                        onMouseLeave={() => setHoveredRank(null)}
                                                      >
                                                          {/* Stack Wrapper */}
                                                          <div className="relative w-full flex-grow flex items-center justify-start">
                                                              {cards.map((card, index) => {
                                                                  const translateX = isHovered ? index * cardSpacing : index * 3;
                                                                  const translateY = isHovered ? 0 : index * -3;
                                                                  const rotate = isHovered ? 0 : (index * 1.5 - (cards.length - 1) * 0.75);
                                                                  const scale = isHovered ? 1.02 : 1;
                                                                  const isSelected = selectedCardIdInHand === card.id;
                                                                  
                                                                  return (
                                                                      <div 
                                                                        key={card.id} 
                                                                        className="absolute left-0 top-0 flex flex-col items-center justify-center transition-all duration-300 ease-out cursor-pointer"
                                                                        style={{ 
                                                                            width: `${cardWidth}px`,
                                                                            height: `${cardWidth * 1.4}px`,
                                                                            transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                                                                            zIndex: isHovered ? index + 10 : index,
                                                                        }}
                                                                        draggable={canAct}
                                                                        onDragStart={(e) => {
                                                                            e.dataTransfer.setData('cardId', card.id);
                                                                            dispatch({ type: 'SELECT_CARD_IN_HAND', payload: { cardId: card.id } });
                                                                        }}
                                                                        onDragEnd={() => {
                                                                            setTimeout(() => {
                                                                                dispatch({ type: 'SELECT_CARD_IN_HAND', payload: { cardId: null } });
                                                                            }, 150);
                                                                        }}
                                                                        onClick={(e) => {
                                                                            if (isHovered || cards.length === 1) {
                                                                                e.stopPropagation();
                                                                                handleSelectCard(isSelected ? null : card.id);
                                                                            }
                                                                        }}
                                                                      >
                                                                          <div className={`w-full h-full ${isSelected ? 'stone-card-selected' : 'stone-card-container'} ${isCardHinted ? 'idle-hint-glow' : ''}`}>
                                                                              <GameCard 
                                                                                  card={card} 
                                                                                  isSelected={isSelected}
                                                                                  onInfoClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card } })} 
                                                                              />
                                                                          </div>
                                                                      </div>
                                                                  );
                                                              })}
                                                          </div>

                                                          {/* Count Badge (only when stacked and > 1) */}
                                                          {!isHovered && cards.length > 1 && (
                                                              <div className="absolute top-1 right-1 z-25 bg-[#8A6938] text-white border border-[#D8C49A] text-[9px] font-orbitron font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-lg pointer-events-none animate-pulse">
                                                                {cards.length}
                                                              </div>
                                                          )}

                                                          {/* Clicking the stacked pile when not hovered selects/deselects the top card */}
                                                          {!isHovered && cards.length > 1 && (
                                                              <div 
                                                                className="absolute inset-0 z-20 cursor-pointer"
                                                                onClick={() => handleSelectCard(isTopCardSelected ? null : topCard.id)}
                                                              />
                                                          )}
                                                      </div>
                                                  );
                                              })}

                                              {/* Ghost Card for Queen's Resurrection ability */}
                                              {hasQueenInHand && lastUnitInDiscard && (
                                                <div 
                                                  className="flex-shrink-0 relative opacity-40 hover:opacity-85 border-2 border-dashed border-yellow-600/70 rounded-lg cursor-pointer transform hover:scale-[1.03] transition-all duration-300 group shadow-lg flex flex-col justify-center"
                                                  style={{ 
                                                      width: `${cardWidth}px`, 
                                                      height: `${cardWidth * 1.4}px` 
                                                  }}
                                                  onClick={() => {
                                                    const queenCard = specialCards.find(c => c.rank === 'Q');
                                                    if (queenCard && canAct) {
                                                      dispatch({ 
                                                        type: 'RESURRECT_UNIT_TO_HAND', 
                                                        payload: { queenCardId: queenCard.id, targetCardId: lastUnitInDiscard.id } 
                                                      });
                                                    }
                                                  }}
                                                  title="Haz clic para resucitar a tu mano usando tu Reina (Q)"
                                                >
                                                    <div className="w-full h-full max-h-[80%] pointer-events-none filter sepia contrast-125 brightness-75 stone-card-container">
                                                        <GameCard 
                                                            card={lastUnitInDiscard}
                                                            isSelected={false}
                                                        />
                                                    </div>
                                                    {/* Golden runic text overlay */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-[#D8C49A] font-bold text-center text-[9px] sm:text-[10px] pointer-events-none p-1 font-orbitron select-none">
                                                      <span>RESUCITAR</span>
                                                      <span className="text-[8px] opacity-75 font-mono">({lastUnitInDiscard.rank} de {lastUnitInDiscard.suit})</span>
                                                      <span className="text-[7px] text-yellow-500 mt-1 px-1 bg-yellow-950/70 border border-yellow-600/40 rounded uppercase tracking-wider">Cuesta Q (1)</span>
                                                    </div>
                                                </div>
                                              )}
                                            </>
                                         )}
                                     </div>
 
                                     {/* Special Cards Area (Right) - 50% width */}
                                     <div className={`${isRightCollapsed ? 'w-[40%] sm:w-[42%] md:w-[42%]' : 'w-1/2'} flex gap-4 overflow-x-auto h-full pl-3 items-start pt-1.5`}>
                                         {specialCards.length === 0 ? (
                                             <div className="flex items-center justify-center w-full h-full text-xs text-[#9A8B72]/40 italic">
                                               Sin habilidades
                                             </div>
                                         ) : (
                                             Object.entries(groupedSpecialCards).map(([rank, cards]) => {
                                                 const isHovered = hoveredRank === rank;
                                                 const stackWidth = isHovered 
                                                     ? `${cardWidth + (cards.length - 1) * cardSpacing}px` 
                                                     : `${cardWidth}px`;
                                                 
                                                 return (
                                                     <div 
                                                       key={rank} 
                                                       className="h-full flex flex-col justify-center transition-all duration-300 ease-out relative"
                                                       style={{ 
                                                           width: stackWidth,
                                                       }}
                                                       onMouseEnter={() => setHoveredRank(rank)}
                                                       onMouseLeave={() => setHoveredRank(null)}
                                                     >
                                                         {/* Stack Wrapper */}
                                                         <div className="relative w-full flex-grow flex items-center justify-start">
                                                             {cards.map((card, index) => {
                                                                 const translateX = isHovered ? index * cardSpacing : index * 3;
                                                                 const translateY = isHovered ? 0 : index * -3;
                                                                 const rotate = isHovered ? 0 : (index * 1.5 - (cards.length - 1) * 0.75);
                                                                 const scale = isHovered ? 1.02 : 1;
                                                                 
                                                                 return (
                                                                     <div 
                                                                       key={card.id} 
                                                                       className="absolute left-0 top-0 flex flex-col items-center justify-start transition-all duration-300 ease-out cursor-pointer"
                                                                       style={{ 
                                                                           width: `${cardWidth}px`,

                                                                           transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                                                                           zIndex: isHovered ? index + 10 : index,
                                                                       }}
                                                                       draggable={canAct}
                                                                       onDragStart={(e) => {
                                                                           e.dataTransfer.setData('cardId', card.id);
                                                                           dispatch({ type: 'SELECT_CARD_IN_HAND', payload: { cardId: card.id } });
                                                                       }}
                                                                       onDragEnd={() => {
                                                                           setTimeout(() => {
                                                                               dispatch({ type: 'SELECT_CARD_IN_HAND', payload: { cardId: null } });
                                                                           }, 150);
                                                                       }}
                                                                         onClick={(e) => {
                                                                             if (isHovered || cards.length === 1) {
                                                                                 e.stopPropagation();
                                                                                 if (canAct) {
                                                                                     dispatch({ type: 'PLAY_SPECIAL_CARD', payload: { card } });
                                                                                 }
                                                                             }
                                                                         }}
                                                                     >
                                                                         <div className={`w-full stone-card-container ${isCardHinted ? 'idle-hint-glow' : ''}`} style={{ height: `${cardWidth * 1.4}px` }}>
                                                                             <GameCard 
                                                                                 card={card} 
                                                                                 onInfoClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card } })} 
                                                                             />
                                                                         </div>
                                                                         
                                                                         {/* Show buttons only when expanded (hovered) or if it's the top card of a stack of 1 */}
                                                                         {(isHovered || cards.length === 1) && (
                                                                             <button 
                                                                               onClick={() => dispatch({ type: 'PLAY_SPECIAL_CARD', payload: { card } })} 
                                                                               disabled={!canAct} 
                                                                               className={`stone-button stone-button-blue text-[7px] sm:text-[8px] py-0.5 px-1 mt-1 w-full ${isCardHinted ? 'idle-hint-glow' : ''} shadow-md`}
                                                                             >
                                                                               Activar (1)
                                                                             </button>
                                                                         )}
                                                                     </div>
                                                                 );
                                                             })}
                                                         </div>

                                                         {/* Count Badge (only when stacked and > 1) */}
                                                         {!isHovered && cards.length > 1 && (
                                                             <div className="absolute top-1 right-1 z-25 bg-[#8A6938] text-white border border-[#D8C49A] text-[9px] font-orbitron font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-lg pointer-events-none animate-pulse">
                                                               {cards.length}
                                                             </div>
                                                         )}

                                                         {/* Single Activar button under the stack when not hovered (only for stack > 1) */}
                                                         {!isHovered && cards.length > 1 && (
                                                             <button 
                                                               onClick={() => dispatch({ type: 'PLAY_SPECIAL_CARD', payload: { card: cards[cards.length - 1] } })} 
                                                               disabled={!canAct} 
                                                               className={`stone-button stone-button-blue text-[8px] sm:text-[9px] py-0.5 px-2 mt-1 w-full ${isCardHinted ? 'idle-hint-glow' : ''}`}
                                                             >
                                                               Activar ({cards.length})
                                                             </button>
                                                         )}
                                                     </div>
                                                 );
                                             })
                                         )}
                                     </div>

                                      {isRightCollapsed && (
                                          <div className="w-[20%] sm:w-[16%] flex flex-col justify-center gap-1.5 h-full pl-2 sm:pl-3 border-l border-[#574d3c]/40 font-orbitron flex-shrink-0">
                                              {isLocalTurn && gameMode === 'playing' ? (
                                                  <>
                                                      <button 
                                                        onClick={() => dispatch({ type: 'DRAW_CARD'})} 
                                                        disabled={!canAct || !currentPlayer || currentPlayer.deck.length === 0} 
                                                        className={`stone-button w-full py-1.5 text-[8px] sm:text-[9px] text-[#1e1a14] ${
                                                          currentPlayer && currentPlayer.deck.length === 0 ? 'bg-red-950/40 text-red-500 border-red-900/80 cursor-not-allowed hover:scale-100 hover:border-red-900/80' : ''
                                                        } ${
                                                          showHints && actionsRemaining > 0 && !selectedCardIdInHand && !selectedUnitIdOnBoard ? 'idle-hint-glow' : ''
                                                        }`}
                                                      >
                                                        {currentPlayer && currentPlayer.deck.length === 0 ? '¡Sin cartas!' : `Robar (${actionsRemaining})`}
                                                      </button>
                                                      <button 
                                                        onClick={() => dispatch({ type: 'END_TURN'})} 
                                                        disabled={kingMoveState?.isMoving} 
                                                        className={`stone-button stone-button-red w-full py-1.5 text-[8px] sm:text-[9px] ${
                                                          showHints && actionsRemaining === 0 ? 'idle-hint-glow' : ''
                                                        }`}
                                                      >
                                                        {t('game_ui.end_turn')}
                                                      </button>
                                                  </>
                                              ) : (
                                                  <div className="w-full text-center py-3 bg-[#2A2A2A]/20 border border-[#574d3c]/20 rounded-md">
                                                      <span className="text-[7px] sm:text-[8px] text-[#9A8B72] uppercase tracking-wider block animate-pulse">Rival</span>
                                                  </div>
                                              )}
                                          </div>
                                      )}

                                </div>
                              );
                            })()}
                        </div>
                    )}
                </div>

                {/* 3. RIGHT SIDEBAR PILLAR: Current Player Details & Action Center */}
                <div 
                  className={`fixed md:relative top-0 right-0 h-full z-30 md:z-10 transition-all duration-300 ease-in-out flex flex-col justify-between ${
                    isRightCollapsed 
                      ? 'fixed translate-x-full md:relative md:w-0 border-l-0 bg-transparent shadow-none' 
                      : 'fixed translate-x-0 right-0 w-[260px] md:relative md:w-[18%] lg:md:w-[15%] bg-[#1e1a14]/95 border-l-4 border-[#8A6938] shadow-[-10px_0_30px_rgba(0,0,0,0.8)]'
                  }`}
                >
                    <div className={`flex flex-col h-full w-full justify-between transition-opacity duration-300 ${isRightCollapsed ? 'md:hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        {/* Current Player Stats */}
                        <div className="flex-shrink-0">
                          <PlayerPillar 
                            player={currentPlayer} 
                            title="Tu Guardián" 
                            winTarget={state.winTarget}
                          />
                        </div>

                        {/* Action Hub / Control Panel */}
                        <div className="flex-grow flex flex-col justify-end p-4 border-t border-[#574d3c]/30">
                            {isLocalTurn && gameMode === 'playing' ? (
                              <div className="flex flex-col gap-3 w-full bg-[#2A2A2A]/50 p-3 rounded-lg border border-[#574d3c] shadow-inner mb-3 text-center">
                                <div className="text-[#D8C49A] font-runic-text font-bold text-xs uppercase tracking-widest">
                                  Acciones Libres
                                </div>
                                <div className="text-4xl font-extrabold font-orbitron text-[#D8C49A] tracking-tighter my-1">
                                  {actionsRemaining}
                                </div>
                                
                                <button 
                                  onClick={() => dispatch({ type: 'DRAW_CARD'})} 
                                  disabled={!canAct || !currentPlayer || currentPlayer.deck.length === 0} 
                                  className={`stone-button w-full py-2.5 text-xs text-[#1e1a14] ${
                                    currentPlayer && currentPlayer.deck.length === 0 ? 'bg-red-950/40 text-red-500 border-red-900/80 cursor-not-allowed hover:scale-100 hover:border-red-900/80' : ''
                                  } ${showHints && actionsRemaining > 0 && !selectedCardIdInHand && !selectedUnitIdOnBoard ? 'idle-hint-glow' : ''}`}
                                >
                                  {currentPlayer && currentPlayer.deck.length === 0 ? '¡No hay más cartas!' : 'Robar (1 Act)'}
                                </button>
                                
                                <button 
                                  onClick={() => dispatch({ type: 'END_TURN'})} 
                                  disabled={kingMoveState?.isMoving} 
                                  className={`stone-button stone-button-red w-full py-2.5 text-xs ${showHints && actionsRemaining === 0 ? 'idle-hint-glow' : ''}`}
                                >
                                  {t('game_ui.finish_turn')}
                                </button>
                              </div>
                            ) : (
                              <div className="w-full bg-[#2A2A2A]/20 p-3 rounded-lg border border-[#574d3c]/40 text-center mb-3">
                                <p className="text-xs text-[#9A8B72] italic uppercase tracking-wider animate-pulse">
                                  {(state.gameType === 'online') ? 'Esperando al rival...' : (state.gameType === 'ai' || state.gameType === 'adventure') ? 'La IA está decidiendo...' : 'Esperando al rival...'}
                                </p>
                              </div>
                            )}

                            {/* Recent History log */}
                            <div className="flex flex-col gap-1.5 mt-2">
                              <div className="flex items-center justify-between text-[10px] text-[#9A8B72] uppercase tracking-wider font-bold">
                                <span>Bitácora de Duelo</span>
                                <button
                                  onClick={() => {
                                    audioService.playSFX('click');
                                    setIsLogExpanded(true);
                                  }}
                                  className="text-[#D8C49A] hover:text-white transition-colors flex items-center gap-1 text-[9px] font-ancient-header border border-[#8A6938]/30 px-1.5 py-0.5 rounded bg-[#1e1a14]/50 shadow-sm"
                                >
                                  <span>VER CRÓNICA</span>
                                </button>
                              </div>
                              <div 
                                onClick={() => {
                                  audioService.playSFX('click');
                                  setIsLogExpanded(true);
                                }}
                                className="h-20 bg-[#120f0b] rounded border border-[#574d3c] p-2 overflow-y-auto text-[9px] sm:text-[10px] text-[#9A8B72] font-mono shadow-inner cursor-pointer hover:border-[#8A6938]/85 transition-colors relative group"
                              >
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-1 rounded text-[8px] text-[#D8C49A] border border-[#574d3c]">
                                  Ampliar 🔍
                                </div>
                                {state.log.length === 0 ? (
                                  <div className="italic text-center text-[#9A8B72]/40 mt-5">Las runas aguardan el primer movimiento...</div>
                                ) : (
                                  state.log.slice(0, 3).map((l, index) => (
                                    <div key={index} className="truncate border-b border-[#574d3c]/10 pb-0.5 mb-0.5">
                                      <span className="text-[#8A6938] font-bold">&gt; </span>
                                      {l}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Exit / Forfeit Button */}
                            <button 
                              onClick={() => {
                                audioService.playSFX('click');
                                if (window.confirm(t('game_ui.confirm_quit', "¿Seguro que deseas retirarte y salir de esta batalla?"))) {
                                  dispatch({ type: 'RESET_TO_MENU' });
                                }
                              }}
                              className="stone-button stone-button-red w-full py-2 mt-4 text-[10px] font-orbitron font-bold tracking-wider hover:bg-red-950/80 border-red-700/60"
                              style={{ borderBottomWidth: '4px' }}
                            >
                              {t('game_ui.surrender_quit')}
                            </button>
                        </div>
                    </div>

                    {/* Right Sidebar Toggle Tab (Drawer handle) */}
                    <button 
                      onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                      className="absolute top-1/2 -translate-y-1/2 right-full z-40 bg-[#1e1a14] border-y-2 border-l-2 border-[#8A6938] hover:bg-[#2e261f] text-[#D8C49A] p-2 rounded-l-md transition-all duration-300 shadow-md font-extrabold flex items-center justify-center text-xs cursor-pointer"
                      style={{ height: '50px', width: '20px' }}
                    >
                      {isRightCollapsed ? '◀' : '▶'}
                    </button>
                </div>
            </div>


            {/* Modals & Overlays */}
            <CardInfoModal />

            {/* Dark Fantasy Full-Screen / Board-Screen Visual Overlays */}
            {activeEffect === 'blood' && <div className="blood-slash-overlay" />}
            {activeEffect === 'necrotic' && <div className="necrotic-overlay" />}
            {activeEffect === 'gold' && <div className="gold-overlay" />}
            {activeEffect === 'mystic' && <div className="mystic-overlay" />}
            {activeEffect === 'queen_purify' && <div className="queen-purify-overlay" />}
            {activeEffect === 'jack_speed' && <div className="jack-silver-overlay" />}
            {activeEffect === 'king_iron' && (
              <div className="king-iron-overlay">
                <svg viewBox="0 0 100 100" className="king-iron-svg">
                  <defs>
                    <linearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d5d8dc" />
                      <stop offset="30%" stopColor="#7f8c8d" />
                      <stop offset="70%" stopColor="#34495e" />
                      <stop offset="100%" stopColor="#1c2833" />
                    </linearGradient>
                    <filter id="ironShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#000000" floodOpacity="0.95" />
                      <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ffffff" floodOpacity="0.4" />
                    </filter>
                  </defs>
                  {/* Vertical left wedge (stem of K) */}
                  <path d="M 28 20 L 44 20 L 36 30 Z" fill="url(#ironGrad)" filter="url(#ironShadow)" />
                  <path d="M 33 28 L 39 28 L 36 80 Z" fill="url(#ironGrad)" filter="url(#ironShadow)" />
                  
                  {/* Upper diagonal wedge (pointing to center) */}
                  <path d="M 72 25 L 82 37 L 68 34 Z" fill="url(#ironGrad)" filter="url(#ironShadow)" />
                  <path d="M 73 31 L 77 36 L 36 50 Z" fill="url(#ironGrad)" filter="url(#ironShadow)" />
                  
                  {/* Lower diagonal wedge (pointing to center) */}
                  <path d="M 72 75 L 68 66 L 82 63 Z" fill="url(#ironGrad)" filter="url(#ironShadow)" />
                  <path d="M 73 69 L 77 64 L 36 50 Z" fill="url(#ironGrad)" filter="url(#ironShadow)" />
                </svg>
              </div>
            )}
            {activeEffect === 'ace_arrow' && <div className="ace-arrow-projectile" />}

            {/* Game Over Modal overlay (Runic celebration) */}
            {gameMode === 'game_over' && winner && <GameOverModal winner={winner} />}

            {/* Switch Turn device passing modal (Local 2 player) */}
            {gameMode === 'switch_turn' && <SwitchTurnModal />}

            {/* Expanded Game Log Modal overlay (Runic parchment / Stone scroll) */}
            <LogChroniclesModal isOpen={isLogExpanded} onClose={() => setIsLogExpanded(false)} log={state.log} />
        </div>
    );
}

export default GameUI;
