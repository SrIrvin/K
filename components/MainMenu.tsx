import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';

const MainMenu: React.FC = () => {
  const { dispatch } = useContext(GameContext);

  const startGame = (gameType: 'ai' | 'p2') => {
    dispatch({ type: 'START_GAME', payload: { gameType } });
  };

  // Generate 15 dust particles for ambient animation
  const dustParticles = Array.from({ length: 15 }).map((_, i) => {
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 20;
    const duration = Math.random() * 15 + 15;
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
    <div className="ancient-bg flex flex-col items-center justify-center h-screen text-white p-4 relative overflow-hidden">
      {/* Visual Overlay layers */}
      <div className="archaeological-vignette" />
      <div className="rune-overlay" />
      <div className="dust-container">{dustParticles}</div>

      {/* Main Content Card Container (Carved Stone Slab) */}
      <div className="relative z-20 flex flex-col items-center p-8 md:p-12 stone-modal max-w-lg w-full text-center">
        {/* Title Symbol with ancient blue glow */}
        <div className="mb-4">
          <h1 className="text-6xl md:text-8xl font-ancient-header tracking-wider text-[#D8C49A] animate-pulse">
            克
          </h1>
          <div className="h-0.5 w-24 mx-auto my-2 bg-gradient-to-r from-transparent via-[#8A6938] to-transparent" />
          <h2 className="text-xl md:text-2xl font-ancient-header tracking-widest text-[#9A8B72] mt-1">
            DUELO ESTRATÉGICO
          </h2>
        </div>

        <p className="text-sm md:text-base text-[#D8C49A]/80 font-runic-text mb-10 max-w-xs leading-relaxed italic">
          "Las runas del pasado despiertan en el tablero. Solo uno de los guerreros sobrevivirá al juicio de piedra."
        </p>

        {/* Buttons carved in stone */}
        <div className="flex flex-col gap-5 w-full max-w-xs">
          <button 
            onClick={() => startGame('p2')} 
            className="stone-button stone-button-blue w-full py-4 text-base md:text-lg"
          >
            Duelo Cara a Cara
          </button>
          
          <button 
            onClick={() => startGame('ai')} 
            className="stone-button w-full py-4 text-base md:text-lg"
          >
            Desafiar a la IA
          </button>
        </div>
      </div>

      {/* Footer / Copyright in runic style */}
      <div className="absolute bottom-4 z-20 text-[10px] md:text-xs tracking-widest text-[#9A8B72] font-ancient-header opacity-60">
        A.D. MMXXVI • ARTEFACTO SAGRADO
      </div>
    </div>
  );
};

export default MainMenu;
