import { GameState, Action, Player, Unit, Card, CardColor, Rank } from '../types';
import { getValidMoves, getKingValidMoves } from '../services/gameService';
import { BOARD_ROWS } from '../constants';

type AiScoredAction = Action & {
    score: number;
    log: string;
}

export const getAiBestAction = (state: GameState): Action | null => {
    const aiPlayer = state.players[1];
    if (!aiPlayer) return null;
    if (state.actionsRemaining <= 0 && !state.kingMoveState?.isMoving) return null;

    const opponentPlayer = state.players[0];
    const aiUnits = state.board.flat().filter((u): u is Unit => u?.color === aiPlayer.color);
    const enemyUnits = state.board.flat().filter((u): u is Unit => u?.color === opponentPlayer.color);

    // ==========================================
    // PHASE A: RESOLVE FORCED TARGETING STATE
    // ==========================================
    if (state.isTargeting) {
        const targetingCard = aiPlayer.hand.find(c => c.id === state.selectedCardIdInHand);
        
        if (state.isTargeting === 'joker') {
            if (enemyUnits.length > 0) {
                // Target the enemy unit with the highest damage value (strongest threat)
                const target = [...enemyUnits].sort((a, b) => b.baseDamage - a.baseDamage)[0];
                return { type: 'USE_ABILITY_ON_TARGET', payload: { unitId: target.id } };
            }
        } 
        else if (state.isTargeting === 'jack') {
            if (aiUnits.length > 0) {
                // Target the friendly unit closest to the enemy goal line (row 4)
                const target = [...aiUnits].sort((a, b) => b.position.row - a.position.row)[0];
                return { type: 'USE_ABILITY_ON_TARGET', payload: { unitId: target.id } };
            }
        } 
        else if (state.isTargeting === 'queen') {
            if (aiUnits.length > 0) {
                // Prioritize healing a damaged friendly unit
                const damagedUnits = aiUnits.filter(u => u.currentDamage < u.baseDamage);
                if (damagedUnits.length > 0) {
                    const target = [...damagedUnits].sort((a, b) => (b.baseDamage - b.currentDamage) - (a.baseDamage - a.currentDamage))[0];
                    return { type: 'USE_ABILITY_ON_TARGET', payload: { unitId: target.id } };
                } else {
                    // Otherwise, buff the strongest friendly unit (+1 attack)
                    const target = [...aiUnits].sort((a, b) => b.baseDamage - a.baseDamage)[0];
                    return { type: 'USE_ABILITY_ON_TARGET', payload: { unitId: target.id } };
                }
            }
        }
        
        // Fallback: If no target exists, cancel targeting
        return { type: 'SELECT_CARD_IN_HAND', payload: { cardId: null } };
    }

    // ==========================================
    // PHASE B: RESOLVE FORCED KING COMMAND STATE
    // ==========================================
    if (state.kingMoveState?.isMoving) {
        const { unitsToMove, selectedUnitId } = state.kingMoveState;
        console.log("[AI King Move] unitsToMove:", unitsToMove, "selectedUnitId:", selectedUnitId, "selectedUnitIdOnBoard:", state.selectedUnitIdOnBoard);
        
        if (unitsToMove.length === 0) {
            console.log("[AI King Move] No units remaining to move. Dispatching FINISH_KING_MOVE.");
            return { type: 'FINISH_KING_MOVE' };
        }

        // If no unit is currently selected, find the first unit in queue that has valid moves
        if (!selectedUnitId || !state.selectedUnitIdOnBoard) {
            for (const unitId of unitsToMove) {
                const unit = aiUnits.find(u => u.id === unitId);
                if (unit) {
                    const moves = getKingValidMoves(unit, state.board);
                    console.log(`[AI King Move] Checked unit ${unit.rank} (${unitId}). Moves available:`, moves.length);
                    if (moves.length > 0) {
                        console.log(`[AI King Move] Selecting unit ${unit.rank} (${unitId}) to move.`);
                        return { type: 'SELECT_UNIT_ON_BOARD', payload: { unitId } };
                    }
                } else {
                    console.log(`[AI King Move] Unit ${unitId} is in unitsToMove queue but not found on board.`);
                }
            }
            // If none of the remaining units have valid moves, finish the command
            console.log("[AI King Move] None of the remaining units have valid moves. Dispatching FINISH_KING_MOVE.");
            return { type: 'FINISH_KING_MOVE' };
        }

        const activeUnit = aiUnits.find(u => u.id === selectedUnitId);
        if (activeUnit) {
            const moves = getKingValidMoves(activeUnit, state.board);
            console.log(`[AI King Move] Active unit ${activeUnit.rank} (${selectedUnitId}) moves:`, moves);
            if (moves.length > 0) {
                // Move DOWN (towards row 4). Sort moves by row index descending
                const sortedMoves = [...moves].sort((a, b) => b.row - a.row);
                console.log(`[AI King Move] Moving active unit ${activeUnit.rank} to:`, sortedMoves[0]);
                return { type: 'MOVE_UNIT_DURING_KING_EFFECT', payload: { to: sortedMoves[0] } };
            }
        }

        // If the selected unit cannot move, select another one or finish
        console.log(`[AI King Move] Selected unit ${selectedUnitId} has no moves. Deselecting.`);
        return { type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: null } };
    }

    // ==========================================
    // PHASE C: NORMAL ACTION SCORE EVALUATION
    // ==========================================
    const possibleActions: AiScoredAction[] = [];

    // 1. Scoring Action (Touchdown)
    // AI moves units from row 0 to row 4, so touchdown row is BOARD_ROWS - 1
    const scoringUnit = aiUnits.find(u => u.position.row === BOARD_ROWS - 1 && !u.hasMoved);
    if (scoringUnit) {
        possibleActions.push({
            type: 'SCORE_UNIT',
            score: 1000 + scoringUnit.currentDamage,
            log: `AI will score touchdown with ${scoringUnit.rank} (${scoringUnit.currentDamage} pts)`
        });
    }

    // 2. Play Special Cards from hand
    const aceCard = aiPlayer.hand.find(c => c.rank === 'A');
    if (aceCard) {
        possibleActions.push({
            type: 'PLAY_SPECIAL_CARD',
            payload: { card: aceCard },
            score: 250,
            log: 'AI will play ACE for 1 direct damage point'
        });
    }

    const jokerCard = aiPlayer.hand.find(c => c.rank === 'Joker');
    if (jokerCard && enemyUnits.length > 0) {
        const strongestEnemy = [...enemyUnits].sort((a, b) => b.baseDamage - a.baseDamage)[0];
        possibleActions.push({
            type: 'PLAY_SPECIAL_CARD',
            payload: { card: jokerCard },
            score: 300 + strongestEnemy.baseDamage,
            log: `AI will play JOKER to assassinate ${strongestEnemy.rank}`
        });
    }

    const queenCard = aiPlayer.hand.find(c => c.rank === 'Q');
    if (queenCard) {
        // Option A: Heal/Buff (targets a friendly unit on board)
        if (aiUnits.length > 0) {
            const damagedUnits = aiUnits.filter(u => u.currentDamage < u.baseDamage);
            const score = damagedUnits.length > 0 ? 180 : 80;
            possibleActions.push({
                type: 'PLAY_SPECIAL_CARD',
                payload: { card: queenCard },
                score,
                log: 'AI will play QUEEN to heal or buff'
            });
        }

        // Option B: Resurrect unit from discard to hand
        const aiDiscardUnits = aiPlayer.discard.filter(card => {
            const val = parseInt(card.rank, 10);
            return !isNaN(val) && val >= 2 && val <= 10;
        });
        if (aiDiscardUnits.length > 0) {
            const lastUnit = aiDiscardUnits[aiDiscardUnits.length - 1];
            possibleActions.push({
                type: 'RESURRECT_UNIT_TO_HAND',
                payload: { queenCardId: queenCard.id, targetCardId: lastUnit.id },
                score: 155, // Higher than buffing, lower than healing a heavily damaged unit
                log: `AI will play QUEEN to resurrect ${lastUnit.rank} of ${lastUnit.suit} to hand`
            });
        }
    }

    const jackCard = aiPlayer.hand.find(c => c.rank === 'J');
    if (jackCard && aiUnits.length > 0) {
        possibleActions.push({
            type: 'PLAY_SPECIAL_CARD',
            payload: { card: jackCard },
            score: 90,
            log: 'AI will play JACK for speed boost'
        });
    }

    const kingCard = aiPlayer.hand.find(c => c.rank === 'K');
    if (kingCard && aiUnits.length >= 2) {
        possibleActions.push({
            type: 'PLAY_SPECIAL_CARD',
            payload: { card: kingCard },
            score: 75,
            log: "AI will play KING's command to advance all units"
        });
    }

    // 3. Attack Actions (MOVE_UNIT on enemy)
    for (const unit of aiUnits) {
        if (unit.hasMoved) continue;
        const validMoves = getValidMoves(unit, state.board, 1);
        for (const move of validMoves) {
            if (move.row === -1) continue; // Skip scoring move for attack evaluation
            const target = state.board[move.row][move.col];
            if (target && target.color !== aiPlayer.color) {
                let score = 50;
                if (unit.currentDamage > target.currentDamage) {
                    score += 150 + target.baseDamage; // Very high priority if we destroy them entirely
                } else {
                    score += 40 + unit.currentDamage; // Deal partial stacking damage
                }
                
                possibleActions.push({
                    type: 'MOVE_UNIT',
                    payload: { to: move },
                    score,
                    log: `AI will attack ${target.rank} with ${unit.rank}`
                });
            }
        }
    }
    
    // 4. Move Actions (MOVE_UNIT forward)
    for (const unit of aiUnits) {
        if (unit.hasMoved) continue;
        const validMoves = getValidMoves(unit, state.board, 1);
        // AI starts at row 0, goal is row 4, so sorting descending by row index is moving forward
        // Filter out touchdown move coordinates (-1, -1) to prevent out of bounds crashes
        const forwardMoves = validMoves.filter(m => m.row !== -1 && !state.board[m.row][m.col]).sort((a, b) => b.row - a.row);
        if (forwardMoves.length > 0) {
            const bestMove = forwardMoves[0];
            possibleActions.push({
                type: 'MOVE_UNIT',
                payload: { to: bestMove },
                score: 15 + bestMove.row * 8, // Higher row = closer to goal = higher score
                log: `AI will move ${unit.rank} forward to row ${bestMove.row}`
            });
        }
    }

    // 5. Place Unit Actions
    const unitCardsInHand = aiPlayer.hand.filter(c => !(['J','Q','K','A','Joker'] as Rank[]).includes(c.rank));
    const placeableSpots = state.board[0].map((cell, i) => !cell ? i : -1).filter(i => i !== -1);
    if (unitCardsInHand.length > 0 && placeableSpots.length > 0) {
        const cardToPlay = [...unitCardsInHand].sort((a, b) => parseInt(b.rank) - parseInt(a.rank))[0]; // Strongest unit first
        // Prefer center columns (1 or 2) over edges (0 or 3)
        const sortedSpots = [...placeableSpots].sort((a, b) => Math.abs(a - 1.5) - Math.abs(b - 1.5));
        const spot = sortedSpots[0];
        
        possibleActions.push({
            type: 'PLACE_UNIT',
            payload: { row: 0, col: spot },
            score: 30 + parseInt(cardToPlay.rank),
            log: `AI will place ${cardToPlay.rank} in column ${spot}`
        });
    }

    // 6. Draw Card Action (Lowest default option)
    if (aiPlayer.deck.length > 0) {
        possibleActions.push({ 
            type: 'DRAW_CARD', 
            score: aiPlayer.hand.length < 3 ? 25 : 5, // Draw card has higher priority if hand is low
            log: 'AI will draw a card' 
        });
    }

    // ==========================================
    // PHASE D: CHOOSE BEST ACTION & DISPATCH STEPS
    // ==========================================
    if (possibleActions.length === 0) {
        return { type: 'END_TURN' };
    }

    possibleActions.sort((a, b) => b.score - a.score);
    const bestAction = possibleActions[0];
    console.log("AI Decision:", bestAction.log, "Score:", bestAction.score);

    // Translate scored actions into two-step operations where required
    switch (bestAction.type) {
        case 'SCORE_UNIT': {
            const unitToScore = aiUnits.find(u => u.position.row === BOARD_ROWS - 1 && !u.hasMoved);
            if (unitToScore && state.selectedUnitIdOnBoard !== unitToScore.id) {
                return { type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: unitToScore.id } };
            }
            break;
        }
        case 'MOVE_UNIT': {
            // Find which of the AI units is the one that can reach the target move position
            const unitForAction = aiUnits.find(u => {
                 if (u.hasMoved) return false;
                 const moves = getValidMoves(u, state.board, 1);
                 return moves.some(m => m.row === bestAction.payload.to.row && m.col === bestAction.payload.to.col);
            });
            if (unitForAction && state.selectedUnitIdOnBoard !== unitForAction.id) {
                 return { type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: unitForAction.id } };
            }
            break;
        }
        case 'PLACE_UNIT': {
             // Find matching card in hand to select first
             const cardToPlay = unitCardsInHand.find(c => {
                 // Match rank and suit to play the correct card
                 const matchingInPayload = parseInt(c.rank);
                 return matchingInPayload > 0; // Simple fallback
             });
             // Select strongest card
             const strongestCard = [...unitCardsInHand].sort((a, b) => parseInt(b.rank) - parseInt(a.rank))[0];
             if (strongestCard && state.selectedCardIdInHand !== strongestCard.id) {
                return { type: 'SELECT_CARD_IN_HAND', payload: { cardId: strongestCard.id } };
             }
             break;
        }
    }

    // Selection matches? Dispatch action.
    if (state.selectedUnitIdOnBoard && (bestAction.type === 'MOVE_UNIT' || bestAction.type === 'SCORE_UNIT')) {
        return bestAction;
    }
    if (state.selectedCardIdInHand && bestAction.type === 'PLACE_UNIT') {
        return bestAction;
    }

    // Direct action dispatches
    if (bestAction.type === 'PLAY_SPECIAL_CARD' || bestAction.type === 'DRAW_CARD' || bestAction.type === 'END_TURN' || bestAction.type === 'RESURRECT_UNIT_TO_HAND') {
        return bestAction;
    }

    // Fallback ending turn
    console.warn("AI logic reached unexpected state. Ending turn safely.", bestAction);
    return { type: 'END_TURN' };
};