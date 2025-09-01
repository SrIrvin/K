import { GameState, Unit, Player } from '@/models/types';
import { addLog, updatePlayer, unitToCard } from './coreLogic';

export const handleCombat = (state: GameState, attacker: Unit, defender: Unit): GameState => {
    const newBoard = state.board.map(r => r.map(c => c));
    let players = [...state.players];
    
    const attackerOwner = players.find(p => p.color === attacker.color);
    const defenderOwner = players.find(p => p.color === defender.color);
    if (!attackerOwner || !defenderOwner) return state; // Guard

    let attackerDiscard = [...attackerOwner.discard];
    let defenderDiscard = [...defenderOwner.discard];
    let logMsg = `ATTACK! ${attacker.rank} (${attacker.currentDamage} dmg) vs ${defender.rank} (${defender.currentDamage} dmg).`;

    // Case A: Attacker's CURRENT damage is greater than Defender's CURRENT damage.
    if (attacker.currentDamage > defender.currentDamage) {
        logMsg += ` Attacker is stronger. Both units destroyed!`;
        attackerDiscard.push(unitToCard(attacker));
        defenderDiscard.push(unitToCard(defender));
        defenderDiscard.push(...defender.stackedAttackers);
        newBoard[defender.position.row][defender.position.col] = null;
    } 
    // Case B: Attacker's CURRENT damage is less than or equal to Defender's CURRENT damage.
    else {
        const damageToDeal = attacker.currentDamage;
        const newDefender = {
          ...defender,
          currentDamage: defender.currentDamage - damageToDeal,
          stackedAttackers: [...defender.stackedAttackers, unitToCard(attacker)],
        };
        logMsg += ` ${defender.rank} takes ${damageToDeal} damage.`;

        if (newDefender.currentDamage <= 0) {
            logMsg += ` Defender destroyed!`;
            defenderDiscard.push(unitToCard(newDefender));
            defenderDiscard.push(...newDefender.stackedAttackers);
            newBoard[defender.position.row][defender.position.col] = null;
        } else {
            newBoard[defender.position.row][defender.position.col] = newDefender;
        }
    }
    
    players = updatePlayer(players, attackerOwner.id, { discard: attackerDiscard });
    players = updatePlayer(players, defenderOwner.id, { discard: defenderDiscard });

    return addLog({ ...state, board: newBoard, players: players }, logMsg);
};