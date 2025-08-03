
import { GameState, Action, Player, Unit, CardColor, Rank } from '../types';
import { getValidMoves } from '../services/gameService';
import { BOARD_ROWS } from '../constants';

type AiScoredAction = Action & {
    score: number;
    log: string;
}

export const getAiBestAction = (state: GameState): Action | null => {
    const aiPlayer = state.players[1];
    if (!aiPlayer || state.actionsRemaining <= 0) return null;

    const possibleActions: AiScoredAction[] = [];

    const aiUnits = state.board.flat().filter((u): u is Unit => u?.color === aiPlayer.color);

    // 1. Scoring Action
    const scoringUnit = aiUnits.find(u => u.position.row === BOARD_ROWS - 1 && !u.hasMoved);
    if (scoringUnit) {
        possibleActions.push({
            type: 'SCORE_UNIT',
            score: 1000 + scoringUnit.currentDamage, // Highest priority
            log: `AI will score with ${scoringUnit.rank}`
        });
    }
    
    // 2. Attack Actions (now generating MOVE_UNIT actions)
    for (const unit of aiUnits) {
        if (unit.hasMoved) continue;
        const validMoves = getValidMoves(unit, state.board, 1);
        for (const move of validMoves) {
            const target = state.board[move.row][move.col];
            if (target && target.color !== aiPlayer.color) {
                let score = 50; // Base score for an attack
                if (unit.baseDamage > target.baseDamage) {
                    score += 100 + target.baseDamage; // Prioritize destroying units
                } else {
                    score += unit.baseDamage; // Damage is good
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
    
    // 3. Move Actions
     for (const unit of aiUnits) {
        if (unit.hasMoved) continue;
        const validMoves = getValidMoves(unit, state.board, 1);
        const forwardMoves = validMoves.filter(m => !state.board[m.row][m.col]).sort((a,b) => b.row - a.row);
        if(forwardMoves.length > 0) {
            const bestMove = forwardMoves[0];
            possibleActions.push({
                type: 'MOVE_UNIT',
                payload: { to: bestMove },
                score: 10 + bestMove.row, // Prioritize moving forward
                log: `AI will move ${unit.rank} forward`
            });
        }
    }

    // 4. Place Unit Action
    const unitCardsInHand = aiPlayer.hand.filter(c => !(['J','Q','K','A','Joker'] as Rank[]).includes(c.rank));
    const placeableSpots = state.board[0].map((cell, i) => !cell ? i : -1).filter(i => i !== -1);
    if(unitCardsInHand.length > 0 && placeableSpots.length > 0){
        const cardToPlay = [...unitCardsInHand].sort((a,b) => parseInt(b.rank) - parseInt(a.rank))[0]; // play strongest card
        const spot = placeableSpots[Math.floor(placeableSpots.length / 2)]; // Prefer center
        possibleActions.push({
            type: 'PLACE_UNIT',
            payload: { row: 0, col: spot },
            score: 20,
            log: `AI will place ${cardToPlay.rank}`
        });
    }

    // 5. Draw Card Action
    if (aiPlayer.deck.length > 0) {
        possibleActions.push({ type: 'DRAW_CARD', score: 5, log: 'AI will draw a card' });
    }

    // Choose the best action
    if (possibleActions.length === 0) {
        return { type: 'END_TURN' };
    }

    possibleActions.sort((a, b) => b.score - a.score);
    const bestAction = possibleActions[0];
    console.log("AI Preparing:", bestAction.log, "Score:", bestAction.score);

    // This is a multi-step process. First, select the unit/card. Then, perform the action.
    switch(bestAction.type) {
        case 'SCORE_UNIT': {
            const unitToScore = aiUnits.find(u => u.position.row === BOARD_ROWS - 1 && !u.hasMoved);
            if (unitToScore && state.selectedUnitIdOnBoard !== unitToScore.id) {
                return { type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: unitToScore.id } };
            }
            break;
        }
        case 'MOVE_UNIT': {
            const unitForAction = aiUnits.find(u => {
                 if(u.hasMoved) return false;
                 const moves = getValidMoves(u, state.board, 1);
                 return moves.some(m => m.row === bestAction.payload.to.row && m.col === bestAction.payload.to.col);
            });
            if (unitForAction && state.selectedUnitIdOnBoard !== unitForAction.id) {
                 return { type: 'SELECT_UNIT_ON_BOARD', payload: { unitId: unitForAction.id }};
            }
            break;
        }
        case 'PLACE_UNIT': {
             const cardToPlay = [...unitCardsInHand].sort((a,b) => parseInt(b.rank) - parseInt(a.rank))[0];
             if (cardToPlay && state.selectedCardIdInHand !== cardToPlay.id) {
                return { type: 'SELECT_CARD_IN_HAND', payload: { cardId: cardToPlay.id } };
             }
             break;
        }
    }

    // If the correct card/unit is already selected from a previous AI step, dispatch the action.
    if (state.selectedUnitIdOnBoard && (bestAction.type === 'MOVE_UNIT' || bestAction.type === 'SCORE_UNIT')) {
        return bestAction;
    }
    if (state.selectedCardIdInHand && bestAction.type === 'PLACE_UNIT') {
        return bestAction;
    }

    // If the action doesn't require selection, dispatch it directly.
    if (bestAction.type === 'DRAW_CARD' || bestAction.type === 'END_TURN') {
        return bestAction;
    }

    // Fallback: if we are here, it means a selection is needed but wasn't dispatched.
    // This can happen if the AI recalculates and changes its mind.
    // The safest action is to end the turn to avoid an infinite loop.
    console.warn("AI logic reached an unexpected state. Ending turn to be safe.", bestAction);
    return { type: 'END_TURN' };
};