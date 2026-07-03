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
import { 
  loginAsGuest, 
  createLobbyRoom, 
  joinLobbyRoom, 
  deleteLobbyRoom, 
  subscribeToLobbyRooms, 
  getLeaderboard,
  LobbyRoom, 
  GameRecord 
} from '../services/firebaseService';

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
  
  // Firebase specific states
  const [availableRooms, setAvailableRooms] = useState<LobbyRoom[]>([]);
  const [leaderboard, setLeaderboard] = useState<GameRecord[]>([]);

  useEffect(() => {
    localStorage.setItem('k_player_name', playerName);
  }, [playerName]);

  // Authenticate with Firebase on mount / name change
  useEffect(() => {
    if (!playerName.trim()) return;
    
    const initAuth = async () => {
      try {
        await loginAsGuest(playerName);
        console.log('[Firebase] Authenticated anonymously');
      } catch (err) {
        console.warn('[Firebase] Auth failed, continuing in offline mode:', err);
      }
    };
    initAuth();
  }, [playerName]);

  // Subscribe to RTDB active rooms and load leaderboard
  useEffect(() => {
    if (activeRoomId || connecting) return;

    // 1. Subscribe to active rooms
    let unsubscribeRooms = () => {};
    try {
      unsubscribeRooms = subscribeToLobbyRooms((rooms) => {
        // Only show rooms in 'waiting' status
        const waitingRooms = rooms.filter(r => r.status === 'waiting');
        setAvailableRooms(waitingRooms);
      });
    } catch (e) {
      console.warn('[Firebase] Failed to load lobby rooms:', e);
    }

    // 2. Fetch Leaderboard
    getLeaderboard(5).then(records => {
      setLeaderboard(records);
    }).catch(err => console.error('[Firebase] Leaderboard fetch error:', err));

    return () => {
      unsubscribeRooms();
    };
  }, [activeRoomId, connecting]);

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
        
        // Remove room from Firebase RTDB lobby once connected
        deleteLobbyRoom(code).catch(err => console.error('[Firebase] Clean room error:', err));
        
        onGameJoined(code, 0);
        
        // Send our name to the guest
        setTimeout(() => {
          conn.send({ type: 'handshake', payload: { name: playerName } });
        }, 300);
      },
      // Closed
      () => {
        deleteLobbyRoom(code).catch(err => console.error('[Firebase] Clean room error:', err));
        setConnecting(false);
        setActiveRoomId(null);
      },
      // Error
      (err) => {
        deleteLobbyRoom(code).catch(err => console.error('[Firebase] Clean room error:', err));
        setConnecting(false);
        setActiveRoomId(null);
        setErrorMsg('Error al crear la sala. Prueba de nuevo o revisa tu conexión.');
      }
    );

    // Register room in Firebase RTDB
    createLobbyRoom(code, `${playerName}'s Portal`, code).catch(err => {
      console.error('[Firebase] Failed to register lobby room:', err);
    });
  };

  const handleJoinRoomByCode = (code: string) => {
    if (!playerName.trim()) {
      setErrorMsg('Debes ingresar tu nombre de héroe.');
      return;
    }

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
        
        // Register join in Firebase RTDB
        joinLobbyRoom(code, playerName, conn.peer).catch(err => console.error('[Firebase] Join room error:', err));
        
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
        setErrorMsg('No se pudo encontrar la sala. Verifica que el código sea correcto o que no esté llena.');
      }
    );
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) {
      setErrorMsg('Debes ingresar el código de la sala.');
      return;
    }
    handleJoinRoomByCode(roomCodeInput.trim().toUpperCase());
  };

  const handleLeaveRoom = () => {
    if (activeRoomId) {
      deleteLobbyRoom(activeRoomId).catch(err => console.error('[Firebase] Clean room error:', err));
    }
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
            DUELO EN LÍNEA POR PORTAL SAGRADO
          </h2>
        </div>

        {errorMsg && (
          <div className="w-full bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-lg p-2.5 mb-4 font-mono text-left">
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
          <div className="w-full flex flex-col gap-5 text-left">
            {/* Player Profile */}
            <div className="bg-[#120f0b]/75 border border-[#574d3c] p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-center justify-between shadow-inner">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Create Room */}
              <div className="bg-[#1e1a14]/90 border-2 border-[#574d3c] p-4 rounded-lg flex flex-col justify-between gap-3 shadow-md">
                <div>
                  <h3 className="text-xs font-orbitron font-bold text-[#D8C49A] uppercase tracking-wider border-b border-[#574d3c] pb-1.5">
                    1. Crear Portal (Host)
                  </h3>
                  <p className="text-[10px] text-[#9A8B72] font-runic-text italic leading-relaxed mt-2">
                    Abrirás un nuevo portal y esperarás a que un oponente ingrese tu código o se una desde la lista.
                  </p>
                </div>
                <button 
                  onClick={handleCreateRoom}
                  className="stone-button text-xs py-2 w-full mt-2"
                >
                  Abrir Portal
                </button>
              </div>

              {/* Option 2: Join Room */}
              <form onSubmit={handleJoinRoom} className="bg-[#1e1a14]/90 border-2 border-[#574d3c] p-4 rounded-lg flex flex-col justify-between gap-3 shadow-md">
                <div>
                  <h3 className="text-xs font-orbitron font-bold text-[#D8C49A] uppercase tracking-wider border-b border-[#574d3c] pb-1.5">
                    2. Unirse por Código
                  </h3>
                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[9px] text-[#9A8B72] uppercase font-bold">Código del Portal:</label>
                    <input
                      type="text"
                      placeholder="Ej: K-HF4B2"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                      className="bg-[#120f0b] border border-[#574d3c] text-[#D8C49A] text-xs px-2.5 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-[#8A6938] font-mono tracking-widest font-bold text-center"
                    />
                  </div>
                </div>
                <button type="submit" className="stone-button stone-button-blue text-xs py-2 w-full mt-2">
                  Cruzar Portal
                </button>
              </form>
            </div>

            {/* Option 3: Realtime Database Room List */}
            <div className="bg-[#1e1a14]/90 border-2 border-[#574d3c] p-4 rounded-lg flex flex-col gap-3 shadow-md">
              <h3 className="text-xs font-orbitron font-bold text-[#D8C49A] uppercase tracking-wider border-b border-[#574d3c] pb-1.5 flex items-center justify-between">
                <span>3. Portales Activos en el Templo</span>
                <span className="text-[8px] bg-green-950/70 border border-green-600/40 text-green-400 px-1.5 py-0.5 rounded font-mono animate-pulse">EN VIVO</span>
              </h3>
              
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                {availableRooms.length === 0 ? (
                  <div className="text-center text-[10px] text-[#9A8B72]/50 py-4 italic">
                    No hay portales abiertos en este momento. ¡Abre uno!
                  </div>
                ) : (
                  availableRooms.map((room) => (
                    <div 
                      key={room.id}
                      className="bg-[#120f0b]/90 border border-[#574d3c]/60 p-2 rounded flex items-center justify-between hover:border-[#8A6938] transition-colors"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-bold text-[#D8C49A]">
                          {room.name}
                        </span>
                        <span className="text-[9px] text-[#9A8B72] font-mono">
                          Creador: {room.host.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleJoinRoomByCode(room.id)}
                        className="stone-button stone-button-blue text-[9px] py-1 px-3"
                      >
                        UNIRSE
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Option 4: Leaderboard */}
            <div className="bg-[#1e1a14]/90 border-2 border-[#574d3c] p-4 rounded-lg flex flex-col gap-3 shadow-md">
              <h3 className="text-xs font-orbitron font-bold text-[#D8C49A] uppercase tracking-wider border-b border-[#574d3c] pb-1.5">
                🏆 CRÓNICAS DE HONOR (RÉCORDS)
              </h3>
              
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                {leaderboard.length === 0 ? (
                  <div className="text-center text-[10px] text-[#9A8B72]/50 py-4 italic">
                    Aún no hay registros de batalla.
                  </div>
                ) : (
                  leaderboard.map((record, index) => (
                    <div 
                      key={index}
                      className="bg-[#120f0b]/90 border border-[#574d3c]/50 p-2 rounded flex justify-between items-center text-left text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-[#D8C49A]">{record.winnerName}</span> 
                        <span className="text-[#9A8B72]/65"> derrotó a </span>
                        <span className="font-bold text-[#D8C49A]">{record.loserName}</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#8A6938] font-bold">
                        {record.winnerDamage} - {record.loserDamage}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="stone-button stone-button-red text-xs py-2 w-32 self-center mt-2 shadow"
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
              className="stone-button stone-button-red text-xs py-2 w-44 self-center mt-2 shadow"
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
