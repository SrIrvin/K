import React, { useContext, useState, useEffect } from 'react';
import { GameContext } from '../context/GameContext';
import { 
  loginWithGoogle, 
  logoutUser, 
  subscribeToAuthChanges 
} from '../services/firebaseService';

interface MainMenuProps {
  onOnlineMode: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onOnlineMode }) => {
  const { dispatch } = useContext(GameContext);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('k_player_name') || `Héroe_${Math.floor(1000 + Math.random() * 9000)}`;
  });

  // Listen to Authentication changes to update Google Profile
  useEffect(() => {
    try {
      const unsubscribe = subscribeToAuthChanges((user) => {
        setCurrentUser(user);
        if (user && user.displayName && !user.isAnonymous) {
          handleNameChange(user.displayName);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('[Firebase] Auth listener failed:', e);
    }
  }, []);

  const handleNameChange = (name: string) => {
    setPlayerName(name);
    localStorage.setItem('k_player_name', name);
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      if (user.displayName) {
        handleNameChange(user.displayName);
      }
    } catch (err) {
      console.error('[Firebase] Google Sign-In failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      const defaultName = `Héroe_${Math.floor(1000 + Math.random() * 9000)}`;
      handleNameChange(defaultName);
    } catch (err) {
      console.error('[Firebase] Logout failed:', err);
    }
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

        {/* Hero Name / Nickname Input & Google Sign-in */}
        <div className="w-full max-w-xs mb-8 bg-[#120f0b]/75 border border-[#574d3c]/70 p-3.5 rounded-lg flex flex-col gap-2.5 text-center shadow-inner relative z-30">
          <label className="text-[10px] font-orbitron font-bold text-[#D8C49A] uppercase tracking-widest">
            Tu Nombre de Héroe (Nickname)
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={18}
            disabled={currentUser && !currentUser.isAnonymous}
            className="bg-[#2c241b] border border-[#8A6938] text-[#D8C49A] font-bold text-xs px-3 py-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-[#D8C49A] text-center tracking-wider disabled:opacity-75 disabled:cursor-not-allowed"
            placeholder="Escribe tu apodo..."
          />
          
          <div className="h-px bg-[#574d3c]/40 my-1 w-full" />
          
          {currentUser && !currentUser.isAnonymous ? (
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-left min-w-0">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Perfil" 
                    className="w-5 h-5 rounded-full border border-[#8A6938] shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-[#D8C49A] shrink-0">👤</span>
                )}
                <span className="text-[#9A8B72] text-[9px] font-mono truncate max-w-[120px]">
                  Google: {currentUser.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-[#8A6938]/30 hover:bg-red-950/80 border border-[#8A6938]/50 hover:border-red-700 text-[#D8C49A] hover:text-red-200 text-[8px] font-bold py-1 px-2.5 rounded transition-all shrink-0"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="bg-[#1a1712] hover:bg-[#2A241B] border border-[#8A6938] hover:border-[#D8C49A] text-[#D8C49A] text-[9px] font-bold py-1.5 px-3 rounded transition-all flex items-center justify-center gap-1.5 w-full font-orbitron"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Conectar con Google
            </button>
          )}
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
