import { GameState, Unit } from '@/types';
import * as mutators from './stateMutators';

export const handleCombat = (state: GameState, attacker: Unit, defender: Unit): GameState => {
    const attackerOwner = state.players.find(p => p.color === attacker.color);
    const defenderOwner = state.players.find(p => p.color === defender.color);
    if (!attackerOwner || !defenderOwner) return state; // Guard

    let updatedState = state;
    let attackerDiscard = [...attackerOwner.discard];
    let defenderDiscard = [...defenderOwner.discard];
    let logMsg = `ATTACK! ${attacker.rank} (${attacker.currentDamage} dmg) vs ${defender.rank} (${defender.currentDamage} dmg).`;

    // Case A: Attacker's CURRENT damage is greater than Defender's CURRENT damage.
    if (attacker.currentDamage > defender.currentDamage) {
        logMsg += ` Attacker is stronger. Both units destroyed!`;
        attackerDiscard.push(mutators.unitToCard(attacker));
        attackerDiscard.push(...defender.stackedAttackers);
        defenderDiscard.push(mutators.unitToCard(defender));
        
        // Remove defender from board
        updatedState = mutators.placeUnitOnBoard(updatedState, defender.position.row, defender.position.col, null);
    } 
    // Case B: Attacker's CURRENT damage is less than or equal to Defender's CURRENT damage.
    else {
        const damageToDeal = attacker.currentDamage;
        const newDefender = {
          ...defender,
          currentDamage: defender.currentDamage - damageToDeal,
          stackedAttackers: [...defender.stackedAttackers, mutators.unitToCard(attacker)],
        };
        logMsg += ` ${defender.rank} takes ${damageToDeal} damage.`;

        if (newDefender.currentDamage <= 0) {
            logMsg += ` Defender destroyed!`;
            defenderDiscard.push(mutators.unitToCard(newDefender));
            attackerDiscard.push(...newDefender.stackedAttackers);
            updatedState = mutators.placeUnitOnBoard(updatedState, defender.position.row, defender.position.col, null);
        } else {
            updatedState = mutators.placeUnitOnBoard(updatedState, defender.position.row, defender.position.col, newDefender);
        }
    }
    
    updatedState = mutators.updatePlayer(updatedState, attackerOwner.id, { discard: attackerDiscard });
    updatedState = mutators.updatePlayer(updatedState, defenderOwner.id, { discard: defenderDiscard });

    return mutators.addLog(updatedState, logMsg);
};