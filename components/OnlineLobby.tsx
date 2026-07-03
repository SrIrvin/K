import React, { useState, useEffect, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { 
  initializeHostPeer, 
  initializeGuestPeer, 
  cleanupPeer, 
  sendSyncState,
  addPeerListener,
  removePeerListener,
  localPlayerId,
  connection
} from '../services/peerService';
import { startGame } from '../services/actions/gameSetup';
import { GameState } from '../types';

interface OnlineLobbyProps {
  onBack: () => void;
  onGameJoined: (roomId: string, localPlayerId: number) => void;
}

const OnlineLobby: React.FC<OnlineLobbyProps> = ({ onBack, onGameJoined }) => {
  const { state, dispatch } = useContext(GameContext);
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('k_player_name') || `Héroe_${Math.floor(1000 + Math.random() * 9000)}`;
  });
  
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  
  const [statusText, setStatusText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    localStorage.setItem('k_player_name', playerName);
  }, [playerName]);

  // Handle incoming Peer handshakes
  useEffect(() => {
    const handlePeerMessage = (data: any) => {
      switch (data.type) {
        case 'handshake': {
          const guestName = data.payload.name;
          setOpponentName(guestName);
          console.log('Opponent name received:', guestName);
          
          if (localPlayerId === 0) {
            // We are the Host. Respond with our name.
            const ws = requirePeerConnection();
            ws.send({ type: 'handshake_response', payload: { name: playerName } });

            // Initialize the game state and send it to the guest
            setTimeout(() => {
              const freshState = startGame(state, { gameType: 'p2' });
              const onlineState: GameState = {
                ...freshState,
                gameType: 'online',
                localPlayerId: 0,
                log: [`¡Partida iniciada! Te enfrentas a ${guestName}.`],
              };
              dispatch({ type: 'SET_ONLINE_GAME', payload: { localPlayerId: 0 } });
              dispatch({ type: 'SET_FULL_STATE', payload: onlineState });
              sendSyncState(onlineState);
            }, 600);
          }
          break;
        }

        case 'handshake_response': {
          const hostName = data.payload.name;
          setOpponentName(hostName);
          console.log('Host name received:', hostName);
          
          dispatch({ type: 'SET_ONLINE_GAME', payload: { localPlayerId: 1 } });
          break;
        }

        case 'opponent_left':
          setErrorMsg('El oponente se ha desconectado de la partida.');
          setActiveRoomId(null);
          setOpponentName(null);
          dispatch({ type: 'RESET_TO_MENU' });
          dispatch({ type: 'SET_GAME_MODE', payload: 'online_lobby' });
          break;

        default:
          break;
      }
    };

    addPeerListener(handlePeerMessage);
    return () => {
      removePeerListener(handlePeerMessage);
    };
  }, [playerName, state, dispatch]);

  const requirePeerConnection = () => {
    if (!connection) throw new Error('Peer connection not established');
    return connection;
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setErrorMsg('Debes ingresar tu nombre de héroe.');
      return;
    }
    
    setConnecting(true);
    setErrorMsg(null);
    setIsHost(true);
    setOpponentName(null);

    // Generate a human-readable 5-character code
    const code = 'K-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    setActiveRoomId(code);
    setStatusText('Creando portal sagrado...');

    initializeHostPeer(
      code,
      // Opponent joined
      (conn) => {
        setStatusText('¡Guerrero detectado! Conectando mentes...');
        setConnecting(false);
        onGameJoined(code, 0);
        
        // Send our name to the guest
        setTimeout(() => {
          conn.send({ type: 'handshake', payload: { name: playerName } });
        }, 300);
      },
      // Closed
      () => {
        setConnecting(false);
        setActiveRoomId(null);
      },
      // Error
      (err) => {
        setConnecting(false);
        setActiveRoomId(null);
        setErrorMsg('Error al crear la sala. Prueba de nuevo o revisa tu conexión.');
      }
    );
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('Debes ingresar tu nombre de héroe.');
      return;
    }
    if (!roomCodeInput.trim()) {
      setErrorMsg('Debes ingresar el código de la sala.');
      return;
    }

    const code = roomCodeInput.trim().toUpperCase();
    setConnecting(true);
    setErrorMsg(null);
    setIsHost(false);
    setOpponentName(null);
    setStatusText(`Buscando el portal ${code}...`);

    initializeGuestPeer(
      code,
      // Connected
      (conn) => {
        setStatusText('¡Portal cruzado! Sincronizando con el anfitrión...');
        setConnecting(false);
        onGameJoined(code, 1);
        
        // Send our name to the host
        conn.send({ type: 'handshake', payload: { name: playerName } });
      },
      // Closed
      () => {
        setConnecting(false);
        setActiveRoomId(null);
      },
      // Error
      (err) => {
        setConnecting(false);
        setErrorMsg('No se pudo encontrar la sala. Verifica que el código sea correcto.');
      }
    );
  };

  const handleLeaveRoom = () => {
    cleanupPeer();
    setActiveRoomId(null);
    setOpponentName(null);
    setConnecting(false);
  };

  const copyRoomCode = () => {
    if (activeRoomId) {
      navigator.clipboard.writeText(activeRoomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

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
    <div className="ancient-bg flex flex-col items-center justify-center min-h-screen text-white p-4 relative overflow-y-auto">
      <div className="archaeological-vignette" />
      <div className="rune-overlay" />
      <div className="dust-container">{dustParticles}</div>

      <div className="relative z-20 flex flex-col items-center p-6 md:p-8 stone-modal max-w-lg w-full text-center my-4">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-4xl md:text-5xl font-ancient-header tracking-wider text-[#D8C49A]">
            PORTAL DE PIEDRA
          </h1>
          <div className="h-0.5 w-24 mx-auto my-2 bg-gradient-to-r from-transparent via-[#8A6938] to-transparent" />
          <h2 className="text-xs font-orbitron tracking-widest text-[#9A8B72] mt-1">
            DUELO EN LÍNEA DE NAVEGADOR A NAVEGADOR
          </h2>
        </div>

        {errorMsg && (
          <div className="w-full bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-lg p-2.5 mb-4 font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        {connecting ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-10 h-10 border-4 border-[#8A6938] border-t-[#D8C49A] rounded-full animate-spin" />
            <p className="text-sm font-runic-text text-[#9A8B72] animate-pulse">
              {statusText}
            </p>
            {activeRoomId && isHost && (
              <p className="text-xs text-[#9A8B72] font-mono mt-1">
                Comparte el código: <span className="text-[#D8C49A] font-bold">{activeRoomId}</span>
              </p>
            )}
            <button
              onClick={handleLeaveRoom}
              className="stone-button stone-button-red text-xs py-1.5 px-4 mt-2"
            >
              Cancelar
            </button>
          </div>
        ) : !activeRoomId ? (
          /* LOBBY VIEW */
          <div className="w-full flex flex-col gap-6 text-left">
            {/* Player Profile */}
            <div className="bg-[#120f0b]/75 border border-[#574d3c] p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-center justify-between">
              <label className="text-xs font-orbitron font-bold text-[#D8C49A] uppercase tracking-wider">
                Tu Nombre de Héroe:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={18}
                className="bg-[#2c241b] border border-[#8A6938] text-[#D8C49A] font-bold text-sm px-3 py-1.5 rounded w-full sm:w-60 focus:outline-none focus:ring-1 focus:ring-[#D8C49A]"
              />
            </div>

            <div className="flex flex-col gap-6">
              {/* Option 1: Create Room */}
              <div className="bg-[#1e1a14]/90 border-2 border-[#574d3c] p-4 rounded-lg flex flex-col gap-3">
                <h3 className="text-sm font-orbitron font-bold text-[#D8C49A] uppercase tracking-wider border-b border-[#574d3c] pb-1.5">
                  1. Crear un Portal (Ser Host)
                </h3>
                <p className="text-[11px] text-[#9A8B72] font-runic-text italic leading-relaxed">
                  Crearás una sala y obtendrás un código sagrado de 5 letras. Pásale este código a tu amigo para que se conecte directamente a tu pantalla.
                </p>
                <button 
                  onClick={handleCreateRoom}
                  className="stone-button text-xs py-2 w-full mt-1"
                >
                  Abrir Portal
                </button>
              </div>

              {/* Option 2: Join Room */}
              <form onSubmit={handleJoinRoom} className="bg-[#1e1a14]/90 border-2 border-[#574d3c] p-4 rounded-lg flex flex-col gap-3">
                <h3 className="text-sm font-orbitron font-bold text-[#D8C49A] uppercase tracking-wider border-b border-[#574d3c] pb-1.5">
                  2. Entrar a un Portal (Ser Invitado)
                </h3>
                <p className="text-[11px] text-[#9A8B72] font-runic-text italic leading-relaxed">
                  ¿Tu amigo ya abrió un portal? Pídele el código, ingrésalo aquí abajo y cruza el portal para batirte en duelo.
                </p>
                
                <div className="flex flex-col gap-1 mt-1">
                  <label className="text-[10px] text-[#9A8B72] uppercase font-bold">Código del Portal:</label>
                  <input
                    type="text"
                    placeholder="Ej: K-HF4B2"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    className="bg-[#120f0b] border border-[#574d3c] text-[#D8C49A] text-xs px-2.5 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#8A6938] font-mono tracking-widest font-bold text-center"
                  />
                </div>

                <button type="submit" className="stone-button stone-button-blue text-xs py-2 w-full mt-1">
                  Cruzar Portal
                </button>
              </form>
            </div>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="stone-button stone-button-red text-xs py-2 w-32 self-center mt-2"
            >
              Volver al Menú
            </button>
          </div>
        ) : (
          /* ROOM WAITING LOBBY */
          <div className="w-full flex flex-col gap-6 text-left">
            <div className="bg-[#1e1a14]/90 border-2 border-[#574d3c] p-5 rounded-lg flex flex-col gap-4 text-center">
              <h2 className="text-lg font-orbitron font-bold text-[#D8C49A] uppercase tracking-wider">
                PORTAL ABIERTO
              </h2>
              
              <div className="flex justify-center items-center gap-2">
                <span className="bg-[#120f0b] border border-[#8A6938] text-[#D8C49A] text-base font-mono px-4 py-2 rounded font-bold tracking-wider shadow-inner">
                  {activeRoomId}
                </span>
                <button
                  onClick={copyRoomCode}
                  className="bg-[#8A6938] text-white hover:bg-[#D8C49A] hover:text-[#2A2A2A] text-xs font-bold px-3 py-2 rounded transition-all shadow border border-[#D8C49A]/30"
                >
                  {copiedCode ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>

              <div className="h-0.5 bg-[#574d3c]/40 w-full my-2" />

              <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full text-left">
                <h4 className="text-xs font-orbitron font-bold text-[#9A8B72] uppercase tracking-widest text-center mb-1">
                  Guerreros en el Portal:
                </h4>
                
                {/* Creator (You if host, or Opponent if guest) */}
                <div className="bg-[#120f0b]/90 border border-[#574d3c]/60 px-4 py-2.5 rounded flex items-center justify-between">
                  <span className="text-sm font-bold text-[#D8C49A]">
                    {isHost ? playerName : (opponentName || 'Conectando...')}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold font-mono border text-[#4facfe] border-[#4facfe]/45 bg-[#4facfe]/10">
                    Host (Mazo Negro)
                  </span>
                </div>

                {/* Guest (Opponent if host, or You if guest) */}
                <div className="bg-[#120f0b]/90 border border-[#574d3c]/60 px-4 py-2.5 rounded flex items-center justify-between">
                  <span className="text-sm font-bold text-[#D8C49A]">
                    {!isHost ? playerName : (opponentName || 'Esperando...')}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold font-mono border text-[#e07567] border-[#e07567]/45 bg-[#e07567]/10">
                    Invitado (Mazo Rojo)
                  </span>
                </div>
                
                {!opponentName && (
                  <div className="bg-[#120f0b]/40 border border-dashed border-[#574d3c]/40 px-4 py-3 rounded text-center text-xs text-[#9A8B72] italic animate-pulse mt-1">
                    Esperando a que tu rival ingrese el código del portal...
                  </div>
                )}
              </div>

              {opponentName && (
                <div className="flex flex-col items-center justify-center py-2 gap-2 mt-2">
                  <div className="w-6 h-6 border-2 border-[#8A6938] border-t-[#D8C49A] rounded-full animate-spin" />
                  <p className="text-xs font-mono text-[#D8C49A] animate-pulse">
                    ¡Ambos guerreros en sintonía! Sincronizando runas de batalla...
                  </p>
                </div>
              )}
            </div>

            {/* Leave Room Button */}
            <button
              onClick={handleLeaveRoom}
              className="stone-button stone-button-red text-xs py-2 w-44 self-center mt-2"
            >
              Cerrar Portal
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 z-20 text-[10px] tracking-widest text-[#9A8B72] font-ancient-header opacity-50 select-none">
        𐎠 𐎢 𐎤 𐎧
      </div>
    </div>
  );
};

export default OnlineLobby;
