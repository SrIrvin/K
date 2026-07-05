import { GameState, Player, CardColor, Rank, Suit, Unit } from '@/types';
import { BOARD_ROWS, BOARD_COLS, INITIAL_ACTIONS, INITIAL_DRAW } from '@/utils/constants';
import { getUnitSpeed } from '@/utils/gameUtils';
import { createDeck } from '../gameService';
import * as mutators from '../stateMutators';

export const startGame = (initialState: GameState, payload: { gameType: 'ai' | 'p2'; playerName?: string; aiDifficulty?: 'easy' | 'hard' }): GameState => {
  const { gameType, aiDifficulty } = payload;
  const blackDeck = createDeck(CardColor.Black);
  const redDeck = createDeck(CardColor.Red);

  const player1: Player = { 
    id: 0, 
    name: payload.playerName || 'Player 1 (Black)', 
    color: CardColor.Black, 
    damage: 0, 
    deck: blackDeck, 
    hand: [], 
    discard: [], 
    scored: [] 
  };
  
  const player2: Player = { 
    id: 1, 
    name: gameType === 'ai' 
      ? (aiDifficulty === 'hard' ? 'IA Táctica (Red)' : 'IA Aprendiz (Red)') 
      : 'Player 2 (Red)', 
    color: CardColor.Red, 
    damage: 0, 
    deck: redDeck, 
    hand: [], 
    discard: [], 
    scored: [] 
  };

  // Draw initial cards
  for (let i = 0; i < INITIAL_DRAW; i++) {
    if (player1.deck.length > 0) player1.hand.push(player1.deck.pop()!);
    if (player2.deck.length > 0) player2.hand.push(player2.deck.pop()!);
  }

  return {
    ...initialState,
    board: Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null)),
    players: [player1, player2],
    currentPlayerId: 0,
    actionsRemaining: INITIAL_ACTIONS,
    log: [`¡Partida iniciada! Te enfrentas a ${player2.name}.`],
    gameMode: 'playing',
    gameType,
    aiDifficulty: aiDifficulty || 'easy',
  };
};

export const beginNewTurn = (state: GameState): GameState => {
  const nextPlayerId = 1 - state.currentPlayerId;
  const nextPlayer = state.players[nextPlayerId];
  if (!nextPlayer) return state;

  const newBoard = state.board.map(row => row.map(unit => {
    if (!unit) return null;
    // Reset hasMoved for the new current player's units
    if (unit.color === nextPlayer.color) {
      return { ...unit, hasMoved: false };
    }
    return unit;
  }));

  const intermediateState: GameState = {
    ...state,
    gameMode: 'playing',
    board: newBoard,
    currentPlayerId: nextPlayerId,
    actionsRemaining: INITIAL_ACTIONS,
    selectedCardIdInHand: null,
    selectedUnitIdOnBoard: null,
    isTargeting: null,
  };
  
  return mutators.addLog(intermediateState, `Turn Start.`);
};

export const endTurn = (state: GameState): GameState => {
  if (state.kingMoveState?.isMoving) return state; // Can't end turn during King move
  if (state.gameType === 'p2') {
    return mutators.setGameMode(state, 'switch_turn');
  }
  return beginNewTurn(state);
};

export const startAdventureLevel = (initialState: GameState, payload: { level: number; playerName?: string }): GameState => {
  const { level } = payload;
  const blackDeck = createDeck(CardColor.Black);
  const redDeck = createDeck(CardColor.Red);

  const guardianNames = [
    'PiscinaDeLaMuerte',
    'Solar',
    'IrwingElSabio',
    'Shinigami',
    'Moon',
    'Katty',
    'King21'
  ];
  const guardianName = guardianNames[level - 1] || `General Enemigo (Nivel ${level})`;

  const guardianQuotes = [
    "¿Eso fue un ataque? Pensé que estabas acomodando las cartas.",
    "El sol siempre vuelve a levantarse... ¿podrás hacer lo mismo?",
    "Si llegaste hasta aquí... al menos moriste haciendo ejercicio.",
    "Toda partida termina igual... solo cambia cuánto tardas en aceptarlo.",
    "La sangre de los valientes siempre tiene mejor sabor.",
    "La estrategia puede aprenderse... pero la sabiduría debe ganarse.",
    "Yo inventé las reglas... ahora intenta vencerme con ellas."
  ];
  const guardianQuote = guardianQuotes[level - 1] || "";

  const player1: Player = { 
    id: 0, 
    name: payload.playerName || 'K', 
    color: CardColor.Black, 
    damage: 0, 
    deck: blackDeck, 
    hand: [], 
    discard: [], 
    scored: [] 
  };
  
  const player2: Player = { 
    id: 1, 
    name: guardianName, 
    color: CardColor.Red, 
    damage: 0, 
    deck: redDeck, 
    hand: [], 
    discard: [], 
    scored: [] 
  };

  // Set up board and specific level rules
  const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));

  // Determine win target and AI difficulty
  let winTarget = 21;
  let aiDifficulty: 'easy' | 'hard' = 'easy';

  // Helper to place predefined units for Player 1 (Red, the AI) on the board
  // Red is the AI (Player 1), spawning at row 0 (top row)
  const placeAiUnit = (rank: Rank, suit: Suit, row: number, col: number, speedOverride?: number) => {
    const rankNumber = parseInt(rank, 10);
    const unit: Unit = {
      id: `ai-${rank}-${suit}-${row}-${col}-${Math.random()}`,
      rank,
      suit,
      color: CardColor.Red,
      baseDamage: isNaN(rankNumber) ? 0 : rankNumber,
      currentDamage: isNaN(rankNumber) ? 0 : rankNumber,
      speed: speedOverride !== undefined ? speedOverride : getUnitSpeed(rank),
      position: { row, col },
      hasMoved: false,
      boosterCard: null,
      stackedAttackers: []
    };
    board[row][col] = unit;
  };

  // Draw 3 initial cards for the player
  for (let i = 0; i < INITIAL_DRAW; i++) {
    if (player1.deck.length > 0) player1.hand.push(player1.deck.pop()!);
  }

  // Draw 3 initial cards for the AI
  for (let i = 0; i < INITIAL_DRAW; i++) {
    if (player2.deck.length > 0) player2.hand.push(player2.deck.pop()!);
  }

  // Level-specific configurations:
  if (level === 1) {
    // 2 tanques already on the board. (Let's place two Red heavy units, e.g. Rank '8' and '10' at row 1, cols 1 & 2)
    placeAiUnit('8', Suit.Hearts, 1, 1);
    placeAiUnit('10', Suit.Diamonds, 1, 2);
    aiDifficulty = 'easy';
    winTarget = 3;
  } else if (level === 2) {
    // 3 enemy units on the board (value 7)
    placeAiUnit('7', Suit.Hearts, 1, 0);
    placeAiUnit('7', Suit.Diamonds, 1, 2);
    placeAiUnit('7', Suit.Clubs, 1, 3);
    aiDifficulty = 'easy';
    winTarget = 6;
  } else if (level === 3) {
    // 3 units of value 3
    placeAiUnit('3', Suit.Hearts, 1, 1);
    placeAiUnit('3', Suit.Diamonds, 1, 2);
    placeAiUnit('3', Suit.Clubs, 2, 2);
    aiDifficulty = 'easy';
    winTarget = 9;
  } else if (level === 4) {
    // 4 tanks on the board (value 8, 9, 10)
    placeAiUnit('8', Suit.Hearts, 1, 0);
    placeAiUnit('9', Suit.Diamonds, 1, 1);
    placeAiUnit('10', Suit.Clubs, 1, 2);
    placeAiUnit('8', Suit.Spades, 1, 3);
    aiDifficulty = 'hard';
    winTarget = 12;

    // AI starts with a J in hand.
    const jIndex = player2.deck.findIndex(c => c.rank === 'J');
    if (jIndex !== -1) {
      const jCard = player2.deck.splice(jIndex, 1)[0];
      player2.hand.push(jCard);
    }
  } else if (level === 5) {
    // 4 medium units and 1 tank
    placeAiUnit('5', Suit.Hearts, 1, 0);
    placeAiUnit('6', Suit.Diamonds, 1, 1);
    placeAiUnit('7', Suit.Clubs, 1, 2);
    placeAiUnit('6', Suit.Spades, 1, 3);
    placeAiUnit('9', Suit.Hearts, 2, 1);
    aiDifficulty = 'hard';
    winTarget = 15;

    // AI starts with all its K in hand
    const kCards = player2.deck.filter(c => c.rank === 'K');
    player2.deck = player2.deck.filter(c => c.rank !== 'K');
    player2.hand.push(...kCards);
  } else if (level === 6) {
    // First line (row 1) has 4 rapid units
    placeAiUnit('2', Suit.Hearts, 1, 0);
    placeAiUnit('3', Suit.Diamonds, 1, 1);
    placeAiUnit('4', Suit.Clubs, 1, 2);
    placeAiUnit('3', Suit.Spades, 1, 3);
    // Second line (row 0) has medium and heavy units
    placeAiUnit('6', Suit.Hearts, 0, 0);
    placeAiUnit('9', Suit.Diamonds, 0, 1);
    placeAiUnit('10', Suit.Clubs, 0, 2);
    placeAiUnit('7', Suit.Spades, 0, 3);
    aiDifficulty = 'hard';
    winTarget = 18;

    // AI starts with its Queens in hand
    const qCards = player2.deck.filter(c => c.rank === 'Q');
    player2.deck = player2.deck.filter(c => c.rank !== 'Q');
    player2.hand.push(...qCards);
  } else if (level === 7) {
    // First line (row 1) has 4 rapid units
    placeAiUnit('2', Suit.Hearts, 1, 0);
    placeAiUnit('3', Suit.Diamonds, 1, 1);
    placeAiUnit('4', Suit.Clubs, 1, 2);
    placeAiUnit('3', Suit.Spades, 1, 3);
    // Second line (row 0) has 4 heavy units with Speed 2!
    placeAiUnit('8', Suit.Hearts, 0, 0, 2);
    placeAiUnit('9', Suit.Diamonds, 0, 1, 2);
    placeAiUnit('10', Suit.Clubs, 0, 2, 2);
    placeAiUnit('8', Suit.Spades, 0, 3, 2);
    aiDifficulty = 'hard';
    winTarget = 21;

    // AI starts with 1 K, 1 J, 1 Queen, 1 Joker
    const ranksToGet = ['K', 'J', 'Q', 'Joker'];
    for (const rank of ranksToGet) {
      const idx = player2.deck.findIndex(c => c.rank === rank);
      if (idx !== -1) {
        const card = player2.deck.splice(idx, 1)[0];
        player2.hand.push(card);
      }
    }
  }

  return {
    ...initialState,
    board,
    players: [player1, player2],
    currentPlayerId: 1, // AI starts the game!
    actionsRemaining: INITIAL_ACTIONS,
    log: [
      `[${guardianName}] "${guardianQuote}"`,
      `¡Modo Aventura: Nivel ${level} iniciado! Te enfrentas a ${guardianName}.`
    ],
    gameMode: 'playing',
    gameType: 'adventure',
    aiDifficulty,
    storyLevel: level,
    winTarget
  };
};
