import { Peer, DataConnection } from 'peerjs';

export let peer: Peer | null = null;
export let connection: DataConnection | null = null;
export let isIncomingAction = false;
export let localPlayerId: number | null = null;
export let activeRoomId: string | null = null;

const listeners = new Set<(data: any) => void>();

export const addPeerListener = (listener: (data: any) => void) => {
  listeners.add(listener);
};

export const removePeerListener = (listener: (data: any) => void) => {
  listeners.delete(listener);
};

export const setIncomingActionFlag = (val: boolean) => {
  isIncomingAction = val;
};

// WebRTC ICE Server Configuration using public Google STUN servers
const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  }
};

export const initializeHostPeer = (
  roomId: string,
  onOpponentJoined: (conn: DataConnection) => void,
  onClose: () => void,
  onError: (err: any) => void,
  onOpen?: () => void
) => {
  cleanupPeer();

  peer = new Peer(roomId, PEER_CONFIG);

  peer.on('open', (id) => {
    console.log('Host Peer opened with ID:', id);
    activeRoomId = id;
    localPlayerId = 0; // Host is Player 0
    if (onOpen) onOpen();
  });

  peer.on('connection', (conn) => {
    console.log('Opponent connected to host');
    connection = conn;
    setupConnection(conn);
    onOpponentJoined(conn);
  });

  peer.on('close', () => {
    console.log('Host Peer closed');
    onClose();
  });

  peer.on('error', (err) => {
    console.error('Host Peer error:', err);
    onError(err);
  });
};

export const initializeGuestPeer = (
  hostRoomId: string,
  onConnected: (conn: DataConnection) => void,
  onClose: () => void,
  onError: (err: any) => void
) => {
  cleanupPeer();

  peer = new Peer(PEER_CONFIG);

  peer.on('open', (id) => {
    console.log('Guest Peer opened with ID:', id);
    
    // Connect to host
    const conn = peer!.connect(hostRoomId);
    connection = conn;
    
    conn.on('open', () => {
      console.log('Connected to host room:', hostRoomId);
      activeRoomId = hostRoomId;
      localPlayerId = 1; // Guest is Player 1
      setupConnection(conn);
      onConnected(conn);
    });

    conn.on('error', (err) => {
      console.error('Connection to host error:', err);
      onError(err);
    });
  });

  peer.on('close', () => {
    console.log('Guest Peer closed');
    onClose();
  });

  peer.on('error', (err) => {
    console.error('Guest Peer error:', err);
    onError(err);
  });
};

const setupConnection = (conn: DataConnection) => {
  conn.on('data', (data: any) => {
    console.log('Received peer data:', data);
    listeners.forEach((l) => l(data));
  });

  conn.on('close', () => {
    console.log('Peer connection closed');
    cleanupPeer();
    listeners.forEach((l) => l({ type: 'opponent_left' }));
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
  });
};

export const sendGameAction = (action: any) => {
  if (connection && connection.open) {
    connection.send({ type: 'game_action', payload: { action } });
  } else {
    console.warn('No active peer connection. Cannot send action:', action);
  }
};

export const sendSyncState = (gameState: any) => {
  if (connection && connection.open) {
    connection.send({ type: 'sync_state', payload: { gameState } });
  } else {
    console.warn('No active peer connection. Cannot send sync state');
  }
};

export const cleanupPeer = () => {
  if (connection) {
    connection.close();
    connection = null;
  }
  if (peer) {
    peer.destroy();
    peer = null;
  }
  activeRoomId = null;
  localPlayerId = null;
};
