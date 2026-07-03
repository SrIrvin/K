import React, { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';

interface MainMenuProps {
  onOnlineMode: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onOnlineMode }) => {
  const { dispatch } = useContext(GameContext);
  
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('k_player_name') || `Héroe_${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const handleNameChange = (name: string) => {
    setPlayerName(name);
    localStorage.setItem('k_player_name', name);
  };

  const startGame = (gameType: 'ai' | 'p2') => {
    const finalName = playerName.trim() || `Héroe_${Math.floor(1000 + Math.random() * 9000)}`;
    handleNameChange(finalName);
    dispatch({ type: 'START_GAME', payload: { gameType, playerName: finalName } });
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

        <p className="text-sm md:text-base text-[#D8C49A]/80 font-runic-text mb-6 max-w-xs leading-relaxed italic">
          "Las runas del pasado despiertan en el tablero. Solo uno de los guerreros sobrevivirá al juicio de piedra."
        </p>

        {/* Hero Name / Nickname Input */}
        <div className="w-full max-w-xs mb-8 bg-[#120f0b]/75 border border-[#574d3c]/70 p-3.5 rounded-lg flex flex-col gap-2 text-center shadow-inner relative z-30">
          <label className="text-[10px] font-orbitron font-bold text-[#D8C49A] uppercase tracking-widest">
            Tu Nombre de Héroe (Nickname)
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={18}
            className="bg-[#2c241b] border border-[#8A6938] text-[#D8C49A] font-bold text-sm px-3 py-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-[#D8C49A] text-center tracking-wider"
            placeholder="Escribe tu apodo..."
          />
        </div>

        {/* Buttons carved in stone */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => startGame('p2')} 
            className="stone-button w-full py-3 text-sm"
          >
            Duelo Local (Cara a Cara)
          </button>

          <button 
            onClick={onOnlineMode} 
            className="stone-button stone-button-blue w-full py-3 text-sm"
          >
            Duelo en Línea (Salas)
          </button>
          
          <button 
            onClick={() => startGame('ai')} 
            className="stone-button w-full py-3 text-sm"
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
