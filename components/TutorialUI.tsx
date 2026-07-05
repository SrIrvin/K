import React, { useState, useMemo } from 'react';
import { Unit, Card, CardColor, Suit } from '../types';
import { GameCard } from './GameCard';
import { GoalZone } from './GoalZone';
import { BOARD_ROWS, BOARD_COLS } from '../utils/constants';
import { audioService } from '../services/audioService';

const OrcIrwinAvatar: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img 
        src="/images/orc_irwin.png" 
        alt="Maestro Irwin" 
        onError={() => setImgError(true)}
        className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-[#76a143] bg-[#12190e] shadow-[0_0_15px_rgba(118,161,67,0.5)] object-cover shrink-0"
      />
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-[#76a143] bg-gradient-to-br from-[#2c3d24] to-[#12190e] shadow-[0_0_15px_rgba(118,161,67,0.4)] animate-pulse shrink-0">
      <defs>
        <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#76a143" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#12190e" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b9643" />
          <stop offset="50%" stopColor="#4f702f" />
          <stop offset="100%" stopColor="#30441d" />
        </linearGradient>
        <linearGradient id="tuskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d5d0be" />
        </linearGradient>
        <linearGradient id="collarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#54301d" />
          <stop offset="100%" stopColor="#301b10" />
        </linearGradient>
      </defs>

      {/* Aura background */}
      <circle cx="50" cy="50" r="50" fill="url(#auraGlow)" />

      {/* Orc green ears (more detailed) */}
      <path d="M 12 43 C 2 33 4 20 20 28 C 15 35 15 40 12 43 Z" fill="#4d6934" stroke="#253518" strokeWidth="1" />
      <path d="M 88 43 C 98 33 96 20 80 28 C 85 35 85 40 88 43 Z" fill="#4d6934" stroke="#253518" strokeWidth="1" />
      <path d="M 15 37 C 8 32 10 24 20 29" stroke="#374e25" strokeWidth="1" fill="none" />
      <path d="M 85 37 C 92 32 90 24 80 29" stroke="#374e25" strokeWidth="1" fill="none" />
      
      {/* Hair (wild black Mohawk or topknot) */}
      <path d="M 33 16 C 45 3 55 3 67 16 C 62 27 38 27 33 16 Z" fill="#111215" />
      <path d="M 40 14 C 47 5 53 5 60 14" stroke="#2a2c35" strokeWidth="1.5" fill="none" />
      
      {/* Head shape */}
      <ellipse cx="50" cy="45" rx="31" ry="26" fill="url(#skinGrad)" stroke="#1d2a13" strokeWidth="2.5" />
      
      {/* Forehead wrinkles */}
      <path d="M 38 30 Q 50 27 62 30" stroke="#202f12" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M 42 26 Q 50 24 58 26" stroke="#202f12" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* Eyebrows */}
      <path d="M 28 35 C 34 30 43 32 46 38" stroke="#111215" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 72 35 C 66 30 57 32 54 38" stroke="#111215" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* Wise Glowing Orange Eyes */}
      <circle cx="37" cy="40" r="4.5" fill="#ff7700" filter="drop-shadow(0 0 2px #ffbb00)" />
      <circle cx="37" cy="40" r="1.5" fill="#fff" />
      <circle cx="63" cy="40" r="4.5" fill="#ff7700" filter="drop-shadow(0 0 2px #ffbb00)" />
      <circle cx="63" cy="40" r="1.5" fill="#fff" />
      
      {/* Nose (broader, styled) */}
      <path d="M 44 49 L 50 43 L 56 49 Z" fill="#2d3f1a" stroke="#1d2a13" strokeWidth="1" />
      <path d="M 46 48 L 50 45 L 54 48" stroke="#3b5220" strokeWidth="1.5" fill="none" />
      
      {/* Mouth and tusks */}
      <path d="M 34 56 Q 50 64 66 56" stroke="#131b0a" strokeWidth="2.5" fill="none" />
      {/* Left tusk */}
      <path d="M 36 57 L 40 47 L 44 56 Z" fill="url(#tuskGrad)" stroke="#131b0a" strokeWidth="1" />
      {/* Right tusk */}
      <path d="M 64 57 L 60 47 L 56 56 Z" fill="url(#tuskGrad)" stroke="#131b0a" strokeWidth="1" />
      
      {/* Cheeks shadow and details */}
      <circle cx="28" cy="48" r="2.5" fill="#243415" opacity="0.4" />
      <circle cx="72" cy="48" r="2.5" fill="#243415" opacity="0.4" />
      
      {/* Leather collar */}
      <path d="M 28 66 L 50 80 L 72 66 L 50 61 Z" fill="url(#collarGrad)" stroke="#1a100a" strokeWidth="1.5" />
      {/* Metallic studs on leather */}
      <circle cx="35" cy="69" r="1.5" fill="#d2d2d2" stroke="#606060" strokeWidth="0.5" />
      <circle cx="65" cy="69" r="1.5" fill="#d2d2d2" stroke="#606060" strokeWidth="0.5" />

      {/* Gold rune medal on collar */}
      <circle cx="50" cy="72" r="5" fill="#d4af37" stroke="#8a6d1c" strokeWidth="1" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.5))" />
      {/* Inner runic design */}
      <path d="M 48 70 L 52 70 M 50 70 L 50 74 M 48 74 L 52 74" stroke="#4a370e" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
};

interface TutorialStep {
  title: string;
  text: string;
  expectedAction: 'click_next' | 'place_card' | 'move_unit' | 'click_score' | 'play_spell' | 'click_finish';
  setupBoard: () => (Unit | null)[][];
  setupHand: () => Card[];
  setupOpponentHand: () => Card[];
  playerDamage: number;
  opponentDamage: number;
  playerScored: Card[];
  opponentScored: Card[];
  highlightedCells?: { row: number; col: number }[];
  highlightedHandCards?: string[];
  actionPrompt: string;
}

interface TutorialUIProps {
  onBack?: () => void;
}

export const TutorialUI: React.FC<TutorialUIProps> = ({ onBack }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [selectedBoardUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [activeTargeting, setActiveTargeting] = useState<'queen' | 'jack' | null>(null);

  // Mocks and initializers for different steps
  const tutorialSteps: TutorialStep[] = useMemo(() => [
    {
      title: "¡Bienvenido a 克 (Duelo de Cartas)!",
      text: "Saludos, estratega. Este es el tablero sagrado de 克 (K), una cuadrícula de 4x5 donde pondrás a prueba tu astucia táctica.\n\nEl objetivo de la batalla es llevar tus cartas desde tu zona de salida hasta la Zona Meta del rival (la fila superior). El primer jugador en infligir 21 puntos de daño acumulado al oponente ganará la partida.",
      expectedAction: 'click_next',
      playerDamage: 0,
      opponentDamage: 0,
      playerScored: [],
      opponentScored: [],
      actionPrompt: "Haz clic en 'Siguiente' para comenzar a aprender las reglas básicas.",
      setupHand: () => [],
      setupOpponentHand: () => [],
      setupBoard: () => Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null)),
    },
    {
      title: "Invocación de Unidades",
      text: "Tus unidades (cartas numéricas del 2 al 10) se juegan desde tu mano en tu 'Zona de Salida' (la fila iluminada en bronce más cercana a ti, fila 5).\n\nPara este paso, tienes un 2 de Tréboles (Unidad Ligera) en tu mano. Haz clic en ella en tu mano, y luego haz clic en cualquiera de las casillas iluminadas de tu fila de salida para invocarla.",
      expectedAction: 'place_card',
      playerDamage: 0,
      opponentDamage: 0,
      playerScored: [],
      opponentScored: [],
      highlightedCells: [
        { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }
      ],
      highlightedHandCards: ['Clubs2'],
      actionPrompt: "Selecciona el 2 de Tréboles de tu mano y colócalo en tu Zona de Salida.",
      setupHand: () => [{ id: 'Clubs2', rank: '2', suit: Suit.Clubs, color: CardColor.Black }],
      setupOpponentHand: () => [],
      setupBoard: () => Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null)),
    },
    {
      title: "Velocidad y Desplazamiento",
      text: "¡Excelente invocación! Cada unidad tiene una Velocidad máxima que determina cuántas casillas puede moverse por acción:\n- Unidades Ligeras (2, 3, 4): Velocidad 3 casillas.\n- Unidades Medias (5, 6, 7): Velocidad 2 casillas.\n- Unidades Pesadas (8, 9, 10): Velocidad 1 casilla.\n\nSelecciona tu 2 de Tréboles en el tablero y muévelo hacia adelante. Al tener velocidad 3, puede avanzar de 1 a 3 celdas ortogonalmente.",
      expectedAction: 'move_unit',
      playerDamage: 0,
      opponentDamage: 0,
      playerScored: [],
      opponentScored: [],
      highlightedCells: [
        { row: 3, col: 1 }, { row: 2, col: 1 }, { row: 1, col: 1 }
      ],
      actionPrompt: "Haz clic en tu 2 de Tréboles y muévelo hacia una de las casillas iluminadas en azul.",
      setupHand: () => [],
      setupOpponentHand: () => [],
      setupBoard: () => {
        const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
        board[4][1] = {
          id: 'Clubs2', rank: '2', suit: Suit.Clubs, color: CardColor.Black,
          baseDamage: 2, currentDamage: 2, speed: 3, position: { row: 4, col: 1 },
          hasMoved: false, boosterCard: null, stackedAttackers: []
        };
        return board;
      }
    },
    {
      title: "Combate: Caso A (Aniquilación)",
      text: "El combate ocurre cuando mueves una unidad a una celda ocupada por un enemigo.\n\nEl Caso A ocurre cuando el Atacante tiene un daño_base mayor al Defensor. La fuerza del choque destruye instantáneamente AMBAS unidades y las manda a la pila de descarte.\n\nTienes un 8 de Espadas (Atacante - Daño 8). El rival tiene un 5 de Corazones (Defensor - Daño 5). Ataca al 5 enemigo con tu 8 para aniquilarlo.",
      expectedAction: 'move_unit',
      playerDamage: 0,
      opponentDamage: 0,
      playerScored: [],
      opponentScored: [],
      highlightedCells: [{ row: 2, col: 2 }],
      actionPrompt: "Selecciona tu 8 de Espadas y muévelo hacia la casilla del 5 enemigo para iniciar combate.",
      setupHand: () => [],
      setupOpponentHand: () => [],
      setupBoard: () => {
        const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
        board[3][2] = {
          id: 'Spades8', rank: '8', suit: Suit.Spades, color: CardColor.Black,
          baseDamage: 8, currentDamage: 8, speed: 1, position: { row: 3, col: 2 },
          hasMoved: false, boosterCard: null, stackedAttackers: []
        };
        board[2][2] = {
          id: 'Hearts5', rank: '5', suit: Suit.Hearts, color: CardColor.Red,
          baseDamage: 5, currentDamage: 5, speed: 2, position: { row: 2, col: 2 },
          hasMoved: false, boosterCard: null, stackedAttackers: []
        };
        return board;
      }
    },
    {
      title: "Combate: Caso B (Daño de Apilamiento)",
      text: "El Caso B ocurre si tu daño_base es MENOR o IGUAL al del defensor. El atacante NO es destruido; en su lugar, se apila físicamente sobre el defensor.\n\nLa unidad defensora sobrevive, pero su daño actual se reduce por el valor de tu atacante. Sin embargo, conserva su velocidad original de su rango.\n\nTienes un 3 de Picas. Ataca al 10 de Diamantes enemigo para reducir su daño de 10 a 7.",
      expectedAction: 'move_unit',
      playerDamage: 0,
      opponentDamage: 0,
      playerScored: [],
      opponentScored: [],
      highlightedCells: [{ row: 1, col: 1 }],
      actionPrompt: "Selecciona tu 3 de Picas y ataca al 10 de Diamantes enemigo.",
      setupHand: () => [],
      setupOpponentHand: () => [],
      setupBoard: () => {
        const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
        board[2][1] = {
          id: 'Spades3', rank: '3', suit: Suit.Spades, color: CardColor.Black,
          baseDamage: 3, currentDamage: 3, speed: 3, position: { row: 2, col: 1 },
          hasMoved: false, boosterCard: null, stackedAttackers: []
        };
        board[1][1] = {
          id: 'Diamonds10', rank: '10', suit: Suit.Diamonds, color: CardColor.Red,
          baseDamage: 10, currentDamage: 10, speed: 1, position: { row: 1, col: 1 },
          hasMoved: false, boosterCard: null, stackedAttackers: []
        };
        return board;
      }
    },
    {
      title: "¡Touchdown! Anotar Puntos",
      text: "Si logras que una unidad propia alcance la fila superior (Zona Meta del rival, más allá de la última fila), podrás registrar un Touchdown. Tu oponente sumará el daño actual de tu unidad como daño directo.\n\nTienes un 9 de Tréboles en el borde superior listo para anotar. Haz clic sobre él para abrir el menú de acción, y luego presiona el gran botón de ANOTAR para infligirle 9 de daño.",
      expectedAction: 'click_score',
      playerDamage: 0,
      opponentDamage: 0,
      playerScored: [],
      opponentScored: [],
      actionPrompt: "Haz clic en el 9 de Tréboles y presiona el botón 'ANOTAR (1)' que aparecerá en medio de la carta.",
      setupHand: () => [],
      setupOpponentHand: () => [],
      setupBoard: () => {
        const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
        board[0][2] = {
          id: 'Clubs9', rank: '9', suit: Suit.Clubs, color: CardColor.Black,
          baseDamage: 9, currentDamage: 9, speed: 1, position: { row: 0, col: 2 },
          hasMoved: false, boosterCard: null, stackedAttackers: []
        };
        return board;
      }
    },
    {
      title: "Habilidades Especiales: Jota (J)",
      text: "Las cartas de figuras son hechizos mágicos. La Jota (J - El Turbo) te permite darle temporalmente +1 de velocidad a cualquier unidad en el tablero.\n\nSelecciona la Jota en tu mano, haz clic en tu 7 de Tréboles para colocar la Jota a su lomo, y luego muévelo a gran distancia.",
      expectedAction: 'play_spell',
      playerDamage: 0,
      opponentDamage: 9,
      playerScored: [{ id: 'Clubs9', rank: '9', suit: Suit.Clubs, color: CardColor.Black }],
      opponentScored: [],
      highlightedHandCards: ['ClubsJ'],
      actionPrompt: "Selecciona la Jota (J) de tu mano y haz clic en tu 7 de Tréboles para potenciarlo.",
      setupHand: () => [{ id: 'ClubsJ', rank: 'J', suit: Suit.Clubs, color: CardColor.Black }],
      setupOpponentHand: () => [],
      setupBoard: () => {
        const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
        board[4][1] = {
          id: 'Clubs7', rank: '7', suit: Suit.Clubs, color: CardColor.Black,
          baseDamage: 7, currentDamage: 7, speed: 2, position: { row: 4, col: 1 },
          hasMoved: false, boosterCard: null, stackedAttackers: []
        };
        return board;
      }
    },
    {
      title: "Habilidades Especiales: Reina (Q)",
      text: "La Reina (Q - La Curandera) purifica tus unidades: restaura la salud actual de una unidad aliada dañada a su daño base máximo y elimina todas las cartas enemigas que lleve apiladas encima mandándolas al descarte.\n\nTienes un 10 de Diamantes en el tablero que fue atacado por un 6, reduciendo su daño actual a 4. Juega la Reina para restaurar su salud a 10.",
      expectedAction: 'play_spell',
      playerDamage: 0,
      opponentDamage: 9,
      playerScored: [],
      opponentScored: [],
      highlightedHandCards: ['HeartsQ'],
      actionPrompt: "Selecciona la Reina (Q) de tu mano y haz clic sobre tu 10 de Diamantes dañado.",
      setupHand: () => [{ id: 'HeartsQ', rank: 'Q', suit: Suit.Hearts, color: CardColor.Black }],
      setupOpponentHand: () => [],
      setupBoard: () => {
        const board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
        board[3][2] = {
          id: 'Diamonds10', rank: '10', suit: Suit.Diamonds, color: CardColor.Black,
          baseDamage: 10, currentDamage: 4, speed: 1, position: { row: 3, col: 2 },
          hasMoved: false, boosterCard: null, stackedAttackers: [{ id: 'Clubs6', rank: '6', suit: Suit.Clubs, color: CardColor.Red }]
        };
        return board;
      }
    },
    {
      title: "¡Felicidades, Maestro de las Runas!",
      text: "¡Increíble trabajo! Has completado el entrenamiento básico. Ya dominas todas las mecánicas fundamentales del juego:\n- Invocación de unidades y velocidades de movimiento.\n- Los dos casos de combate (destrucción mutua y apilamiento).\n- Touchdown en la zona meta para acumular puntos.\n- Uso estratégico de cartas de habilidades como la Jota y la Reina.\n\nAhora estás listo para enfrentarte al destino. ¡Que comience el duelo real!",
      expectedAction: 'click_finish',
      playerDamage: 0,
      opponentDamage: 9,
      playerScored: [],
      opponentScored: [],
      actionPrompt: "Presiona el botón de 'Finalizar Tutorial' para volver al menú principal y jugar tu primera partida.",
      setupHand: () => [],
      setupOpponentHand: () => [],
      setupBoard: () => Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null)),
    }
  ], []);

  const step = tutorialSteps[currentStepIdx];
  const [board, setBoard] = useState<(Unit | null)[][]>(() => step.setupBoard());
  const [hand, setHand] = useState<Card[]>(() => step.setupHand());

  const handleNextStep = () => {
    if (currentStepIdx < tutorialSteps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setSelectedHandCardId(null);
      setSelectedUnitId(null);
      setActiveTargeting(null);
      setBoard(tutorialSteps[nextIdx].setupBoard());
      setHand(tutorialSteps[nextIdx].setupHand());
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      setSelectedHandCardId(null);
      setSelectedUnitId(null);
      setActiveTargeting(null);
      setBoard(tutorialSteps[prevIdx].setupBoard());
      setHand(tutorialSteps[prevIdx].setupHand());
    }
  };

  const handleResetStep = () => {
    setSelectedHandCardId(null);
    setSelectedUnitId(null);
    setActiveTargeting(null);
    setBoard(step.setupBoard());
    setHand(step.setupHand());
  };

  const handleCellInteraction = (row: number, col: number) => {
    const unitInCell = board[row][col];

    // STEP 1: Place unit
    if (step.expectedAction === 'place_card' && selectedHandCardId === 'Clubs2') {
      if (row === 4) { // Valid row 4 for summoning
        const newBoard = board.map((r, rIdx) =>
          r.map((c, cIdx) => (rIdx === row && cIdx === col) ? {
            id: 'Clubs2', rank: '2', suit: Suit.Clubs, color: CardColor.Black,
            baseDamage: 2, currentDamage: 2, speed: 3, position: { row, col },
            hasMoved: false, boosterCard: null, stackedAttackers: []
          } as Unit : c)
        );
        setBoard(newBoard);
        setHand([]);
        setSelectedHandCardId(null);
        setTimeout(() => handleNextStep(), 1500);
      }
      return;
    }

    // STEP 2: Move Unit
    if (step.expectedAction === 'move_unit' && step.title.includes("Velocidad")) {
      if (selectedBoardUnitId && row < 4 && col === 1) {
        const movingUnit = board[4][1];
        if (movingUnit) {
          const newBoard = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
          newBoard[row][col] = { ...movingUnit, position: { row, col } };
          setBoard(newBoard);
          setSelectedUnitId(null);
          setTimeout(() => handleNextStep(), 1500);
        }
      } else if (unitInCell && unitInCell.id === 'Clubs2') {
        setSelectedUnitId(unitInCell.id);
      }
      return;
    }

    // STEP 3: Combat Caso A
    if (step.expectedAction === 'move_unit' && step.title.includes("Caso A")) {
      if (selectedBoardUnitId === 'Spades8' && row === 2 && col === 2) {
        // Combat! Both destroyed
        const newBoard = board.map(r => r.map(c => null));
        setBoard(newBoard);
        setSelectedUnitId(null);
        setTimeout(() => handleNextStep(), 1800);
      } else if (unitInCell && unitInCell.id === 'Spades8') {
        setSelectedUnitId(unitInCell.id);
      }
      return;
    }

    // STEP 4: Combat Caso B
    if (step.expectedAction === 'move_unit' && step.title.includes("Caso B")) {
      if (selectedBoardUnitId === 'Spades3' && row === 1 && col === 1) {
        // Combat! Stacked and damaged
        const targetDefender = board[1][1];
        if (targetDefender) {
          const updatedDefender = {
            ...targetDefender,
            currentDamage: 7,
            stackedAttackers: [{ id: 'Spades3', rank: '3', suit: Suit.Spades, color: CardColor.Black }]
          };
          const newBoard = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
          newBoard[1][1] = updatedDefender;
          setBoard(newBoard);
          setSelectedUnitId(null);
          setTimeout(() => handleNextStep(), 2000);
        }
      } else if (unitInCell && unitInCell.id === 'Spades3') {
        setSelectedUnitId(unitInCell.id);
      }
      return;
    }

    // STEP 5: Score Touchdown
    if (step.expectedAction === 'click_score' && unitInCell && unitInCell.id === 'Clubs9') {
      setSelectedUnitId(unitInCell.id);
      return;
    }

    // STEP 6: Spell Jack
    if (activeTargeting === 'jack' && unitInCell && unitInCell.id === 'Clubs7') {
      const boostedUnit = {
        ...unitInCell,
        boosterCard: { id: 'ClubsJ', rank: 'J' as const, suit: Suit.Clubs, color: CardColor.Black }
      };
      const newBoard = board.map(r => r.map(c => c?.id === 'Clubs7' ? boostedUnit : c));
      setBoard(newBoard);
      setActiveTargeting(null);
      setSelectedHandCardId(null);
      // Automatically move it forward to show boosted range
      setTimeout(() => {
        const finalBoard = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
        finalBoard[1][1] = { ...boostedUnit, position: { row: 1, col: 1 } };
        setBoard(finalBoard);
        setTimeout(() => handleNextStep(), 1500);
      }, 1000);
      return;
    }

    // STEP 7: Spell Queen
    if (activeTargeting === 'queen' && unitInCell && unitInCell.id === 'Diamonds10') {
      const healedUnit = {
        ...unitInCell,
        currentDamage: 10,
        stackedAttackers: []
      };
      const newBoard = board.map(r => r.map(c => c?.id === 'Diamonds10' ? healedUnit : c));
      setBoard(newBoard);
      setActiveTargeting(null);
      setSelectedHandCardId(null);
      setTimeout(() => handleNextStep(), 2000);
      return;
    }

    // Default select unit
    if (unitInCell && unitInCell.color === CardColor.Black) {
      setSelectedUnitId(unitInCell.id);
    } else {
      setSelectedUnitId(null);
    }
  };

  const handleScoreAction = () => {
    if (step.expectedAction === 'click_score' && selectedBoardUnitId === 'Clubs9') {
      const newBoard = board.map(r => r.map(c => null));
      setBoard(newBoard);
      setSelectedUnitId(null);
      setTimeout(() => handleNextStep(), 1500);
    }
  };

  const handleHandCardSelect = (cardId: string) => {
    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    if (step.expectedAction === 'place_card' && card.id === 'Clubs2') {
      setSelectedHandCardId(cardId);
      return;
    }

    if (step.expectedAction === 'play_spell') {
      setSelectedHandCardId(cardId);
      if (card.rank === 'J') {
        setActiveTargeting('jack');
      } else if (card.rank === 'Q') {
        setActiveTargeting('queen');
      }
    }
  };

  return (
    <div className="ancient-bg flex flex-col md:flex-row h-screen text-white overflow-hidden relative font-runic-text select-none">
      <div className="archaeological-vignette" />
      <div className="rune-overlay" />

      {/* 1. TUTORIAL BUBBLE OVERLAY PANEL (LEFT SIDEBAR ON LARGE SCREENS) */}
      <div className="w-full md:w-[380px] bg-[#1a1510]/95 border-b-2 md:border-b-0 md:border-r-2 border-[#8A6938] flex flex-col justify-between p-4 md:p-6 z-30 shadow-2xl shrink-0 max-h-[40vh] md:max-h-screen overflow-y-auto">
        <div>
          {onBack && (
            <button
              onClick={() => {
                audioService.playSFX('click');
                onBack();
              }}
              className="stone-button py-1 px-3 text-[10px] mb-3 text-[#D8C49A] border-[#8A6938]/60 hover:text-white uppercase font-orbitron tracking-wider flex items-center gap-1"
            >
              ⬅ Regresar al Menú
            </button>
          )}
          {/* Irwin Green Orc Header */}
          <div className="flex items-center gap-3 mb-2">
            <OrcIrwinAvatar />
            <div>
              <div className="text-[10px] font-orbitron font-extrabold text-[#76a143] uppercase tracking-widest leading-none flex items-center gap-1.5">
                🟢 ORCO GUÍA <span className="animate-bounce">★</span>
              </div>
              <h1 className="text-sm md:text-base font-ancient-header text-[#E2C799] font-black tracking-wider mt-0.5">IRWIN, EL SABIO</h1>
            </div>
          </div>

          <div className="h-0.5 bg-gradient-to-r from-[#76a143]/60 via-[#8A6938]/40 to-transparent my-2.5" />

          {/* Comic Dialogue Balloon */}
          <div className="relative mt-2 mb-2">
            {/* Balloon arrow pointing up to the avatar (on desktop) */}
            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[#14100d] border-t border-l border-[#8A6938]/80 rotate-45 z-10 hidden md:block" />
            
            <div className="relative z-0 bg-gradient-to-b from-[#14100d] to-[#0a0806] border-2 border-[#8A6938]/80 p-3.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
              <h2 className="text-sm md:text-base font-ancient-header text-[#76a143] mb-2 tracking-wide font-black border-b border-[#574d3c]/40 pb-1 flex items-center gap-1.5">
                💬 {step.title}
              </h2>
              
              <p className="text-xs md:text-sm text-[#D8C49A] leading-relaxed font-runic-text whitespace-pre-line italic">
                "{step.text}"
              </p>
            </div>
          </div>
        </div>

        {/* Instructions, Controls and Back Button */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="text-[11px] md:text-xs font-orbitron font-extrabold text-[#9A8B72] border-l-2 border-red-800 pl-2 py-0.5 animate-pulse bg-red-950/20">
            👉 {step.actionPrompt}
          </div>

          <div className="flex gap-2 w-full mt-1">
            {currentStepIdx > 0 && (
              <button 
                onClick={handlePrevStep}
                className="stone-button py-2 text-xs flex-1"
              >
                ◀ Anterior
              </button>
            )}

            <button
              onClick={handleResetStep}
              className="stone-button py-2 text-xs bg-[#40382d]/30 text-gray-300 hover:text-white"
              title="Reiniciar paso"
            >
              Reiniciar
            </button>

            {step.expectedAction === 'click_next' && (
              <button 
                onClick={handleNextStep}
                className="stone-button py-2 text-xs flex-1 text-[#E2C799] border-[#8A6938] font-bold"
              >
                Siguiente ▶
              </button>
            )}

            {step.expectedAction === 'click_finish' && (
              <button 
                onClick={() => {
                  audioService.playSFX('click');
                  if (onBack) {
                    onBack();
                  } else {
                    window.location.reload();
                  }
                }}
                className="stone-button stone-button-blue py-2 text-xs flex-1 font-bold animate-bounce"
              >
                Finalizar Tutorial 🎉
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. PLAYING BOARD / GRAPHICS AREA (RIGHT SIDEBAR ON LARGE SCREENS) */}
      <div className="flex-grow flex flex-col justify-center items-center p-3 relative h-full min-h-0">
        
        {/* Opponent Zone Header Mock */}
        <div className="w-full max-w-lg flex items-center justify-between px-3 py-1 bg-[#1e1a14]/90 border border-[#8A6938] rounded-md text-xs z-10 shadow-lg text-[#9A8B72] uppercase font-orbitron text-[9px] sm:text-[10px]">
          <span>Rival (Aprendiz IA)</span>
          <span>Daño acumulado: {step.playerDamage} / 21</span>
        </div>

        <GoalZone player={{ id: 1, name: 'AI', color: CardColor.Red, damage: step.playerDamage, hand: [], deck: [], discard: [], scored: step.opponentScored }} isOpponent={true} canScoreDirectly={step.expectedAction === 'click_score' && selectedBoardUnitId === 'Clubs9'} />

        {/* Board grid altar */}
        <div className="w-full max-w-lg flex-grow my-1 p-2 bg-[#40382d]/50 border-4 border-[#8A6938] rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.1)] relative" style={{ aspectRatio: '4 / 5', maxHeight: '42vh' }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_rgba(0,0,0,0.65)_90%)] z-0 pointer-events-none rounded-lg" />
          
          <div className="grid grid-cols-4 grid-rows-5 gap-1.5 sm:gap-2.5 w-full h-full relative z-10">
            {board.map((row, rowIndex) => (
              row.map((unit, colIndex) => {
                const isCellHighlighted = step.highlightedCells?.some(c => c.row === rowIndex && c.col === colIndex);
                const isSelected = selectedBoardUnitId === unit?.id;

                let cellClass = 'stone-cell-cracked';
                if (isCellHighlighted) {
                  cellClass = 'border-[#8A6938] bg-[#D8C49A]/15 cursor-pointer shadow-[0_0_12px_rgba(216,196,154,0.35)] animate-pulse';
                }

                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-full h-full relative stone-cell transition-all duration-300 hover:brightness-110 ${cellClass}`}
                    onClick={() => handleCellInteraction(rowIndex, colIndex)}
                  >
                    {unit && (
                      <div className={`absolute inset-0 flex items-center justify-center p-1 transition-all duration-300 ${isSelected ? 'scale-105' : ''}`}>
                        <div className="w-full h-full stone-piece">
                          <GameCard 
                            unit={unit} 
                            isUnitOnBoard={true} 
                            card={unit} 
                            isSelected={isSelected} 
                            onInfoClick={() => {}}
                          />
                        </div>

                        {isSelected && step.expectedAction === 'click_score' && unit.id === 'Clubs9' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleScoreAction(); }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-4 py-2 text-[10px] sm:text-xs font-ancient-header font-bold text-white bg-[#8A6938]/95 border-2 border-[#D8C49A] rounded-lg shadow-[0_6px_15px_rgba(0,0,0,0.95)] hover:bg-[#a57f49] hover:scale-105 active:scale-95 transition-all">
                            ANOTAR (1)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            ))}
          </div>
        </div>

        {/* GoalZone for Player */}
        <GoalZone player={{ id: 0, name: 'Héroe', color: CardColor.Black, damage: step.opponentDamage, hand: [], deck: [], discard: [], scored: step.playerScored }} />

        {/* Interactive Hand Area */}
        <div className="w-full max-w-lg bg-[#1e1a14]/60 p-2 rounded-lg border-2 border-[#574d3c] flex flex-col gap-2 relative shadow-inner shadow-black shrink-0 mt-1">
          {/* Active Hand text */}
          <div className="flex justify-between items-center px-1 font-orbitron text-[9px] text-[#9A8B72] tracking-wider uppercase font-bold">
            <span>Tu Mano del Destino</span>
            {activeTargeting && (
              <span className="text-yellow-500 animate-pulse font-black">
                🔮 Hechizo activo: Elige objetivo en el tablero
              </span>
            )}
          </div>

          <div className="flex justify-center items-center gap-3 min-h-[90px] h-[100px] overflow-x-auto w-full">
            {hand.length === 0 ? (
              <p className="text-xs text-[#9A8B72]/40 font-bold italic tracking-wide">Mano vacía</p>
            ) : (
              hand.map(card => {
                const isCardHighlighted = step.highlightedHandCards?.includes(card.id);
                const isSelected = selectedHandCardId === card.id;

                return (
                  <div 
                    key={card.id} 
                    onClick={() => handleHandCardSelect(card.id)}
                    className={`h-full cursor-pointer hover:brightness-110 active:scale-95 transition-all relative ${isCardHighlighted ? 'ring-2 ring-yellow-500 shadow-[0_0_12px_rgba(216,196,154,0.6)] animate-pulse' : ''} ${isSelected ? 'scale-105 ring-2 ring-blue-500' : ''}`}
                    style={{ aspectRatio: '5/7' }}
                  >
                    <GameCard card={card} isUnitOnBoard={false} unit={card as Unit} isSelected={isSelected} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
