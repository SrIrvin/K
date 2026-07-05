import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { Action, Suit, Card, Unit, CardColor, Rank, GameState } from '../types';

interface LevelData {
  level: number;
  name: string;
  subtitle: string;
  description: string;
  modifiers: string[];
  winTarget: number;
  aiDifficulty: string;
  coords: { x: number; y: number };
}

const levelsData: LevelData[] = [
  {
    level: 1,
    name: 'PiscinaDeLaMuerte',
    subtitle: 'El Mercenario Burlón',
    description: 'Un mercenario impredecible que disfruta humillar a sus rivales antes de derrotarlos. Nunca pierde la oportunidad de lanzar una broma o una provocación en medio del combate.\n\n"¿Eso fue un ataque? Pensé que estabas acomodando las cartas."',
    modifiers: [
      '2 Tanques enemigos en el tablero (fila de la IA)',
      'Dificultad de la IA: Aprendiz (Fácil)',
      'La IA inicia la partida',
      'Gana quien consiga 3 puntos'
    ],
    winTarget: 3,
    aiDifficulty: 'Aprendiz (Fácil)',
    coords: { x: 15, y: 80 }
  },
  {
    level: 2,
    name: 'Solar',
    subtitle: 'El Guardián del Sol',
    description: 'Un viejo guerrero que ha servido durante siglos al Dios de la Luz Solar. Su disciplina es inquebrantable y considera que cada batalla es una prueba del honor de un verdadero comandante.\n\n"El sol siempre vuelve a levantarse... ¿podrás hacer lo mismo?"',
    modifiers: [
      '3 Unidades enemigas de valor 7 en el tablero',
      'Dificultad de la IA: Aprendiz (Fácil)',
      'La IA inicia la partida',
      'Gana quien consiga 6 puntos'
    ],
    winTarget: 6,
    aiDifficulty: 'Aprendiz (Fácil)',
    coords: { x: 42, y: 70 }
  },
  {
    level: 3,
    name: 'IrwingElSabio',
    subtitle: 'El Orco de las Montañas',
    description: 'Un enorme orco conocido por su inteligencia táctica. Vive aislado en las montañas y no siente simpatía por nadie. Habla poco, pero cuando lo hace es letal.\n\n"Si llegaste hasta aquí... al menos moriste haciendo ejercicio."',
    modifiers: [
      '3 Unidades rápidas de valor 3 en el tablero',
      'Dificultad de la IA: Aprendiz (Fácil)',
      'La IA inicia la partida',
      'Gana quien consiga 9 puntos'
    ],
    winTarget: 9,
    aiDifficulty: 'Aprendiz (Fácil)',
    coords: { x: 25, y: 50 }
  },
  {
    level: 4,
    name: 'Shinigami',
    subtitle: 'El Antiguo Dios de la Muerte',
    description: 'Una entidad tan antigua como el tiempo mismo. No pelea por odio ni por gloria; simplemente considera que toda vida termina perteneciendo a su reino.\n\n"Toda partida termina igual... solo cambia cuánto tardas en aceptarlo."',
    modifiers: [
      '4 Tanques blindados enemigos bloqueando la fila 1',
      'La IA inicia con un Jack (J) en su mano',
      'Dificultad de la IA: Táctica (Difícil)',
      'La IA inicia la partida',
      'Gana quien consiga 12 puntos'
    ],
    winTarget: 12,
    aiDifficulty: 'Táctica (Difícil)',
    coords: { x: 55, y: 45 }
  },
  {
    level: 5,
    name: 'Moon',
    subtitle: 'La Princesa Carmesí',
    description: 'Una princesa de apariencia elegante y oscura que obtiene fuerza de la sangre de sus enemigos. Cada victoria alimenta su poder y disfruta ver desesperarse a sus rivales.\n\n"La sangre de los valientes siempre tiene mejor sabor."',
    modifiers: [
      '4 Unidades medias y 1 Tanque enemigo en el tablero',
      'La IA inicia con todos sus Reyes (K) en mano',
      'Dificultad de la IA: Táctica (Difícil)',
      'La IA inicia la partida',
      'Gana quien consiga 15 puntos'
    ],
    winTarget: 15,
    aiDifficulty: 'Táctica (Difícil)',
    coords: { x: 80, y: 55 }
  },
  {
    level: 6,
    name: 'Katty',
    subtitle: 'La Diosa del Conocimiento',
    description: 'Una poderosa diosa de color púrpura. Es la maestra de todos los dioses y guardiana del conocimiento absoluto. Cada estrategia ha sido estudiada por ella miles de veces.\n\n"La estrategia puede aprenderse... pero la sabiduría debe ganarse."',
    modifiers: [
      'Primera línea de 4 unidades rápidas (fila 1)',
      'Segunda línea de 2 unidades medias y 2 tanques (fila 0)',
      'La IA inicia con sus Reinas (Q) en mano',
      'Dificultad de la IA: Táctica (Difícil)',
      'La IA inicia la partida',
      'Gana quien consiga 18 puntos'
    ],
    winTarget: 18,
    aiDifficulty: 'Táctica (Difícil)',
    coords: { x: 70, y: 28 }
  },
  {
    level: 7,
    name: 'King21',
    subtitle: 'El Rey Supremo',
    description: 'El creador del juego. Dios de la Estrategia, el rey absoluto y último rival. No busca demostrar que es poderoso; solo quiere ver si por fin hay alguien capaz de derrotarlo.\n\n"Yo inventé las reglas... ahora intenta vencerme con ellas."',
    modifiers: [
      'Vanguardia enemiga de 4 unidades rápidas (fila 1)',
      'Retaguardia enemiga de 4 tanques con Velocidad 2 (Speed 2!)',
      'La IA inicia con: 1 K, 1 J, 1 Reina y 1 Joker en mano',
      'Dificultad de la IA: Táctica (Difícil)',
      'La IA inicia la partida',
      'Gana quien consiga 21 puntos'
    ],
    winTarget: 21,
    aiDifficulty: 'Táctica (Difícil)',
    coords: { x: 45, y: 15 }
  }
];

interface AdventureMapProps {
  onBack: () => void;
  dispatch: React.Dispatch<Action>;
  state: GameState;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({ onBack, dispatch, state }) => {
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);

  useEffect(() => {
    // Load progress from localStorage
    const savedLevel = localStorage.getItem('k_unlocked_story_level');
    const levelNum = savedLevel ? parseInt(savedLevel, 10) : 1;
    setUnlockedLevel(levelNum);
    
    // Auto-select the current active level
    const currentActiveLevel = levelsData.find(lvl => lvl.level === levelNum);
    if (currentActiveLevel) {
      setSelectedLevel(currentActiveLevel);
    }
  }, []);

  const handleLevelClick = (lvl: LevelData) => {
    if (lvl.level <= unlockedLevel) {
      audioService.playSFX('click');
      setSelectedLevel(lvl);
    }
  };

  const handleStartBattle = () => {
    if (!selectedLevel) return;
    audioService.playSFX('king');
    const playerName = localStorage.getItem('k_player_name') || 'K';
    dispatch({
      type: 'START_ADVENTURE_LEVEL',
      payload: {
        level: selectedLevel.level,
        playerName: playerName
      }
    });
  };

  const handleResetProgress = () => {
    if (window.confirm('¿Seguro que deseas reiniciar tu aventura? Perderás todo tu progreso actual.')) {
      audioService.playSFX('click');
      localStorage.setItem('k_unlocked_story_level', '1');
      setUnlockedLevel(1);
      setSelectedLevel(levelsData[0]);
    }
  };

  // Generate background dust particles
  const dustParticles = Array.from({ length: 12 }).map((_, i) => {
    const size = Math.random() * 3 + 1.5;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 12 + 10;
    return (
      <div
        key={i}
        className="dust-particle"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });

  return (
    <div className="ancient-bg flex flex-col items-center justify-between h-screen text-white p-4 relative overflow-y-auto md:overflow-hidden">
      {/* Visual Overlay layers */}
      <div className="archaeological-vignette" />
      <div className="rune-overlay" />
      <div className="dust-container">{dustParticles}</div>

      {/* Header */}
      <div className="relative z-20 w-full max-w-5xl flex items-center justify-between border-b border-[#574d3c]/60 pb-3 mt-2">
        <button
          onClick={() => {
            audioService.playSFX('click');
            onBack();
          }}
          className="stone-button py-1.5 px-4 text-xs font-bold text-[#D8C49A] hover:text-white"
        >
          Menú Principal
        </button>
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-ancient-header tracking-wider text-[#D8C49A] mb-0.5">
            MODO AVENTURA
          </h1>
          <p className="text-[10px] md:text-xs font-orbitron uppercase text-[#9A8B72] tracking-widest">
            El camino del comandante K
          </p>
        </div>
        <button
          onClick={handleResetProgress}
          className="bg-red-950/20 hover:bg-red-950/70 border border-red-900/50 text-red-300 text-[9px] font-orbitron uppercase py-1.5 px-3 rounded transition-all"
        >
          ⚙️ Reiniciar
        </button>
      </div>

      {/* Main Map & Detail Panel Layout */}
      <div className="relative z-20 w-full max-w-5xl flex-none md:flex-1 flex flex-col md:flex-row gap-6 my-4 overflow-visible md:overflow-hidden min-h-0">
        
        {/* The ancient scroll map */}
        <div className="flex-1 bg-[#181410]/95 border border-[#574d3c]/70 rounded-xl relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.5)] p-4 flex items-center justify-center min-h-[350px] md:min-h-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-950/10 opacity-60 pointer-events-none" />
          
          {/* Map Grid / Canvas Container */}
          <div className="relative w-full h-full max-w-[500px] max-h-[500px] aspect-square">
            
            {/* SVG Path linking the portals */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path 
                d="M 15 80 L 42 70 L 25 50 L 55 45 L 80 55 L 70 28 L 45 15" 
                fill="none" 
                stroke="#8a6938" 
                strokeWidth="0.8" 
                strokeDasharray="2 1.5"
                className="opacity-70"
              />
            </svg>

            {/* Portals mapping */}
            {levelsData.map((lvl) => {
              const isUnlocked = lvl.level <= unlockedLevel;
              const isCompleted = lvl.level < unlockedLevel;
              const isActive = lvl.level === unlockedLevel;
              const isSelected = selectedLevel?.level === lvl.level;

              return (
                <div
                  key={lvl.level}
                  onClick={() => handleLevelClick(lvl)}
                  style={{
                    left: `${lvl.coords.x}%`,
                    top: `${lvl.coords.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-10 flex flex-col items-center group ${
                    isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  {/* Portal Visual Ring */}
                  <div
                    className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 border ${
                      isSelected
                        ? 'border-[#D8C49A] scale-110 ring-4 ring-[#D8C49A]/30'
                        : isCompleted
                        ? 'border-amber-600 bg-amber-950/40'
                        : isActive
                        ? 'border-cyan-500 bg-cyan-950/40 ring-2 ring-cyan-500/20'
                        : 'border-stone-700 bg-stone-900/60'
                    }`}
                  >
                    {/* Glowing Aura inside portal */}
                    {isUnlocked && (
                      <div
                        className={`absolute inset-0.5 rounded-full opacity-60 ${
                          isCompleted
                            ? 'bg-[radial-gradient(circle,_#8A6938_0%,_transparent_70%)]'
                            : 'bg-[radial-gradient(circle,_#385B74_0%,_transparent_70%)]'
                        }`}
                      />
                    )}

                    {/* Portal core icon/number */}
                    <div className="z-10 font-ancient text-sm md:text-base font-bold">
                      {isCompleted ? (
                        <span className="text-amber-400">🏆</span>
                      ) : !isUnlocked ? (
                        <span className="text-stone-500 text-xs">🔒</span>
                      ) : (
                        <span className={isActive ? 'text-cyan-300 animate-pulse' : 'text-[#D8C49A]'}>
                          {lvl.level}
                        </span>
                      )}
                    </div>

                    {/* Pulsing ring indicator for the current next portal */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-60 pointer-events-none" />
                    )}

                  </div>

                  {/* Level Tooltip label */}
                  <div className="mt-1 px-1.5 py-0.5 rounded bg-black/80 border border-[#574d3c]/40 text-[8px] md:text-[9px] text-[#D8C49A] tracking-wider text-center max-w-[85px] pointer-events-none shadow-md whitespace-nowrap">
                    P{lvl.level}: {lvl.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Portal Detail panel */}
        <div className="w-full md:w-80 bg-[#120f0b]/90 border border-[#574d3c]/80 rounded-xl p-5 md:p-6 flex flex-col justify-between shadow-[0_10px_25px_rgba(0,0,0,0.6)] relative overflow-hidden">
          
          {selectedLevel ? (
            <div className="flex flex-col h-full justify-between">
              
              {/* Level summary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-orbitron font-bold text-cyan-400 tracking-widest uppercase">
                    Portal de Batalla {selectedLevel.level}
                  </span>
                  <span className="text-[9px] font-mono text-[#9A8B72]">
                    Meta: {selectedLevel.winTarget} pts
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-ancient-header text-[#D8C49A] leading-tight">
                  {selectedLevel.name}
                </h2>
                <p className="text-[11px] text-[#9A8B72] italic font-runic-text mb-2 text-center">
                  "{selectedLevel.subtitle}"
                </p>
                
                {/* Guardian Portrait */}
                <div className="w-full flex justify-center mb-3">
                  <img 
                    src={`/images/history/${selectedLevel.name}.png`} 
                    alt={selectedLevel.subtitle} 
                    className="w-24 h-24 rounded-lg border-2 border-[#8A6938] object-cover shadow-[0_4px_10px_rgba(0,0,0,0.5)] bg-[#120f0b] animate-fade-in"
                  />
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#8A6938]/60 to-transparent my-2" />
                
                <p className="text-xs text-[#D8C49A]/80 leading-relaxed mb-4">
                  {selectedLevel.description}
                </p>

                {/* Modifiers List */}
                <div className="bg-[#1c1712]/90 border border-[#8A6938]/30 rounded-lg p-3 shadow-inner">
                  <h3 className="text-[9px] font-orbitron font-bold text-[#E6C687] uppercase tracking-widest mb-1.5">
                    Modificadores del Portal
                  </h3>
                  <ul className="flex flex-col gap-1 text-[10px] text-[#D8C49A]/95 list-none pl-0">
                    {selectedLevel.modifiers.map((mod, index) => (
                      <li key={index} className="flex gap-1.5 items-start">
                        <span className="text-amber-500/80 shrink-0">✦</span>
                        <span>{mod}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex flex-col gap-2.5">
                <div className="flex justify-between text-[10px] font-orbitron text-[#9A8B72] px-1 uppercase tracking-wider">
                  <span>IA: {selectedLevel.aiDifficulty}</span>
                  <span>Turno: IA inicia</span>
                </div>
                
                <button
                  onClick={handleStartBattle}
                  className="stone-button w-full py-3 text-sm text-[#1e1a14] font-bold bg-gradient-to-r from-[#D8C49A] to-[#a49479] hover:from-white hover:to-[#D8C49A] shadow-[0_4px_12px_rgba(216,196,154,0.25)] flex items-center justify-center gap-2"
                >
                  ⚔️ INICIAR DESAFÍO
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <span className="text-3xl mb-3 text-[#9A8B72]/40">🌀</span>
              <p className="text-xs text-[#9A8B72]">
                Selecciona un portal de batalla en el mapa para revelar sus secretos.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Footer Info */}
      <div className="relative z-20 text-[9px] md:text-xs text-[#9A8B72] font-ancient-header tracking-widest text-center opacity-65 mb-1">
        🔥 COMANDANTE K: DEBES COMPLETAR LOS 7 NIVELES PARA DERROTAR A LOS ANTIGUOS DIOSES 🔥
      </div>
    </div>
  );
};
