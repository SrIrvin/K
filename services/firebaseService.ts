import { auth, db, rtdb } from './firebase';
import { 
  signInAnonymously, 
  updateProfile, 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  doc,
  setDoc,
  increment
} from 'firebase/firestore';
import { 
  ref, 
  set, 
  push, 
  onValue, 
  off, 
  remove, 
  update 
} from 'firebase/database';

// --- AUTHENTICATION ---

/**
 * Sign in anonymously (creates a guest user session)
 */
export const loginAsGuest = async (displayName: string): Promise<User> => {
  const userCredential = await signInAnonymously(auth);
  const user = userCredential.user;
  
  // Update the display name in Firebase Auth profile
  await updateProfile(user, { displayName });
  return user;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Sign in using Google Auth Pop-Up
 */
export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
};

/**
 * Log out current user
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Subscribe to auth changes
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- FIRESTORE: RECORDS & LEADERBOARD ---

export interface GameRecord {
  winnerName: string;
  winnerDamage: number;
  loserName: string;
  loserDamage: number;
  gameType: string;
  timestamp?: any;
}

/**
 * Save a game result record to Firestore
 */
export const saveGameRecord = async (record: Omit<GameRecord, 'timestamp'>) => {
  try {
    await addDoc(collection(db, 'records'), {
      ...record,
      timestamp: serverTimestamp()
    });
    console.log('[Firebase] Game record saved successfully');
  } catch (error) {
    console.error('[Firebase] Error saving game record:', error);
  }
};

/**
 * Retrieve the top records (leaderboard)
 */
export const getLeaderboard = async (limitCount = 10): Promise<GameRecord[]> => {
  try {
    const recordsCol = collection(db, 'records');
    const q = query(recordsCol, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        winnerName: data.winnerName,
        winnerDamage: data.winnerDamage,
        loserName: data.loserName,
        loserDamage: data.loserDamage,
        gameType: data.gameType,
        timestamp: data.timestamp
      };
    });
  } catch (error) {
    console.error('[Firebase] Error getting leaderboard:', error);
    return [];
  }
};

export interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  totalGames: number;
}

/**
 * Update player statistics in Firestore (atomic increments)
 */
export const updatePlayerStats = async (playerName: string, isWinner: boolean) => {
  if (!playerName || playerName.trim() === '') return;
  
  try {
    const playerRef = doc(db, 'players_stats', playerName);
    await setDoc(playerRef, {
      name: playerName,
      wins: increment(isWinner ? 1 : 0),
      losses: increment(isWinner ? 0 : 1),
      totalGames: increment(1),
      lastUpdated: serverTimestamp()
    }, { merge: true });
    console.log(`[Firebase] Updated stats for ${playerName}`);
  } catch (error) {
    console.error('[Firebase] Error updating player stats:', error);
  }
};

/**
 * Get top 10 ranked players ordered by wins
 */
export const getTopRankedPlayers = async (limitCount = 10): Promise<PlayerStats[]> => {
  try {
    const statsCol = collection(db, 'players_stats');
    const q = query(statsCol, orderBy('wins', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.name || doc.id,
        wins: data.wins || 0,
        losses: data.losses || 0,
        totalGames: data.totalGames || 0
      };
    });
  } catch (error) {
    console.error('[Firebase] Error getting ranking:', error);
    return [];
  }
};

// --- REALTIME DATABASE: MULTIPLAYER LOBBY ---

export interface LobbyRoom {
  id: string;
  name: string;
  status: 'waiting' | 'playing';
  host: {
    name: string;
    peerId: string;
  };
  guest?: {
    name: string;
    peerId: string;
  };
  createdAt: number;
  isPortal?: boolean;
  level?: number;
}

/**
 * Create a new multiplayer room in the lobby
 */
export const createLobbyRoom = async (
  roomId: string,
  roomName: string, 
  hostName: string, 
  hostPeerId: string,
  isPortal?: boolean,
  level?: number
): Promise<string> => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  
  const roomData: LobbyRoom = {
    id: roomId,
    name: roomName,
    status: 'waiting',
    host: {
      name: hostName,
      peerId: hostPeerId
    },
    createdAt: Date.now(),
    isPortal,
    level
  };
  
  await set(roomRef, roomData);
  return roomId;
};

/**
 * Join an existing lobby room
 */
export const joinLobbyRoom = async (roomId: string, guestName: string, guestPeerId: string): Promise<void> => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  
  await update(roomRef, {
    status: 'playing',
    guest: {
      name: guestName,
      peerId: guestPeerId
    }
  });
};

/**
 * Remove a lobby room (clean up when host leaves or game ends)
 */
export const deleteLobbyRoom = async (roomId: string): Promise<void> => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  await remove(roomRef);
};

/**
 * Listen to all active rooms in the lobby
 */
export const subscribeToLobbyRooms = (callback: (rooms: LobbyRoom[]) => void): (() => void) => {
  const roomsRef = ref(rtdb, 'rooms');
  
  const listener = onValue(roomsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    
    // Map object rooms to array list
    const roomsList = Object.keys(data).map(key => data[key] as LobbyRoom);
    // Filter only waiting rooms or rooms created recently
    callback(roomsList);
  });
  
  // Return unsubscribe function
  return () => {
    off(roomsRef, 'value', listener);
  };
};

/**
 * Listen to a specific room updates (e.g. host listening for guest connection)
 */
export const subscribeToRoomDetail = (roomId: string, callback: (room: LobbyRoom | null) => void): (() => void) => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  
  const listener = onValue(roomRef, (snapshot) => {
    const room = snapshot.val();
    callback(room);
  });
  
  return () => {
    off(roomRef, 'value', listener);
  };
};
