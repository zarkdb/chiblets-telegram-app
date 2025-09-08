import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BattleChiblet {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  currentEnergy: number;
  species: {
    name: string;
    type: string;
    rarity: string;
  };
}

export interface BattleResult {
  winner: 'player' | 'opponent';
  rounds: BattleRound[];
  expGained: number;
  wchibiGained: number;
  playerChibletAfter: BattleChiblet;
  opponentChibletAfter: BattleChiblet;
}

export interface BattleRound {
  round: number;
  playerAction: BattleAction;
  opponentAction: BattleAction;
  playerDamage: number;
  opponentDamage: number;
  playerHpAfter: number;
  opponentHpAfter: number;
}

export interface BattleAction {
  type: 'attack' | 'defend' | 'special';
  damage: number;
  success: boolean;
}

/**
 * Calculate damage dealt in battle
 */
function calculateDamage(
  attacker: BattleChiblet,
  defender: BattleChiblet,
  actionType: 'attack' | 'defend' | 'special'
): number {
  let baseDamage = attacker.attack;
  let defense = defender.defense;

  // Apply action modifiers
  switch (actionType) {
    case 'attack':
      baseDamage *= 1.0; // Normal attack
      break;
    case 'defend':
      baseDamage *= 0.5; // Weaker attack when defending
      defense *= 2.0; // Double defense
      break;
    case 'special':
      baseDamage *= 1.5; // 50% more damage
      break;
  }

  // Add some randomness (±20%)
  const randomMultiplier = 0.8 + (Math.random() * 0.4);
  baseDamage *= randomMultiplier;

  // Calculate final damage
  const damage = Math.max(1, Math.floor(baseDamage - (defense * 0.5)));
  
  return damage;
}

/**
 * Determine AI action for opponent
 */
function getAIAction(chiblet: BattleChiblet, round: number): 'attack' | 'defend' | 'special' {
  const healthPercentage = chiblet.hp / chiblet.maxHp;
  
  // Defensive strategy when low on health
  if (healthPercentage < 0.3 && Math.random() < 0.4) {
    return 'defend';
  }
  
  // Use special attack occasionally (20% chance)
  if (Math.random() < 0.2) {
    return 'special';
  }
  
  // Default to attack
  return 'attack';
}

/**
 * Simulate a PvP battle between two chiblets
 */
export async function simulateBattle(
  playerChibletId: string,
  opponentChibletId: string
): Promise<BattleResult> {
  // Get both chiblets with their species info
  const playerChiblet = await prisma.userChiblet.findUnique({
    where: { id: playerChibletId },
    include: { species: true }
  });

  const opponentChiblet = await prisma.userChiblet.findUnique({
    where: { id: opponentChibletId },
    include: { species: true }
  });

  if (!playerChiblet || !opponentChiblet) {
    throw new Error('One or both chiblets not found');
  }

  // Create battle copies (don't modify original data during simulation)
  const playerBattle: BattleChiblet = {
    id: playerChiblet.id,
    name: playerChiblet.name || playerChiblet.species.name,
    level: playerChiblet.level,
    hp: playerChiblet.hp,
    maxHp: playerChiblet.maxHp,
    attack: playerChiblet.attack,
    defense: playerChiblet.defense,
    currentEnergy: playerChiblet.currentEnergy || 0,
    species: playerChiblet.species
  };

  const opponentBattle: BattleChiblet = {
    id: opponentChiblet.id,
    name: opponentChiblet.name || opponentChiblet.species.name,
    level: opponentChiblet.level,
    hp: opponentChiblet.hp,
    maxHp: opponentChiblet.maxHp,
    attack: opponentChiblet.attack,
    defense: opponentChiblet.defense,
    currentEnergy: opponentChiblet.currentEnergy || 0,
    species: opponentChiblet.species
  };

  const rounds: BattleRound[] = [];
  let roundNumber = 1;
  const maxRounds = 20; // Prevent infinite battles

  // Battle simulation
  while (playerBattle.hp > 0 && opponentBattle.hp > 0 && roundNumber <= maxRounds) {
    // For now, player always attacks (in real game, this would be player choice)
    const playerAction: 'attack' | 'defend' | 'special' = 'attack';
    const opponentAction = getAIAction(opponentBattle, roundNumber);

    // Calculate damages
    const playerDamage = calculateDamage(playerBattle, opponentBattle, playerAction);
    const opponentDamage = calculateDamage(opponentBattle, playerBattle, opponentAction);

    // Apply damage
    opponentBattle.hp = Math.max(0, opponentBattle.hp - playerDamage);
    playerBattle.hp = Math.max(0, playerBattle.hp - opponentDamage);

    // Record round
    rounds.push({
      round: roundNumber,
      playerAction: {
        type: playerAction,
        damage: playerDamage,
        success: playerDamage > 0
      },
      opponentAction: {
        type: opponentAction,
        damage: opponentDamage,
        success: opponentDamage > 0
      },
      playerDamage,
      opponentDamage,
      playerHpAfter: playerBattle.hp,
      opponentHpAfter: opponentBattle.hp
    });

    roundNumber++;
  }

  // Determine winner
  const winner = playerBattle.hp > 0 ? 'player' : 'opponent';
  
  // Calculate rewards
  let expGained = 0;
  let wchibiGained = 0;

  if (winner === 'player') {
    // Base experience: 10 + (opponent level * 5)
    expGained = 10 + (opponentBattle.level * 5);
    // Base wCHIBI reward: 5 + (opponent level * 2)
    wchibiGained = 5 + (opponentBattle.level * 2);
  }

  return {
    winner,
    rounds,
    expGained,
    wchibiGained,
    playerChibletAfter: playerBattle,
    opponentChibletAfter: opponentBattle
  };
}

/**
 * Find a suitable PvP opponent
 */
export async function findPvPOpponent(playerUserId: string, playerChibletLevel: number) {
  // Find opponents within ±2 levels
  const minLevel = Math.max(1, playerChibletLevel - 2);
  const maxLevel = Math.min(10, playerChibletLevel + 2);

  const potentialOpponents = await prisma.userChiblet.findMany({
    where: {
      AND: [
        { userId: { not: playerUserId } }, // Not the same user
        { level: { gte: minLevel, lte: maxLevel } }, // Within level range
        { currentEnergy: { gt: 0 } }, // Has energy to battle
        { hp: { gt: 0 } }, // Not fainted
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          telegramUsername: true,
          photoUrl: true,
          level: true
        }
      },
      species: true
    },
    take: 10 // Get up to 10 potential opponents
  });

  if (potentialOpponents.length === 0) {
    return null;
  }

  // Return a random opponent
  const randomIndex = Math.floor(Math.random() * potentialOpponents.length);
  return potentialOpponents[randomIndex];
}

/**
 * Process battle results and update database
 */
export async function processBattleResults(
  playerUserId: string,
  playerChibletId: string,
  opponentChibletId: string,
  battleResult: BattleResult
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update player chiblet
      const updatedPlayerChiblet = await tx.userChiblet.update({
        where: { id: playerChibletId },
        data: {
          experience: { increment: battleResult.expGained },
          hp: battleResult.playerChibletAfter.hp,
          currentEnergy: { decrement: 1 }, // Use 1 energy per battle
        },
        include: { species: true }
      });

      // Update opponent chiblet
      await tx.userChiblet.update({
        where: { id: opponentChibletId },
        data: {
          hp: battleResult.opponentChibletAfter.hp,
        }
      });

      // Update user stats if player won
      if (battleResult.winner === 'player') {
        await tx.user.update({
          where: { id: playerUserId },
          data: {
            wchibi: { increment: battleResult.wchibiGained },
            totalWins: { increment: 1 },
          }
        });
      }

      // Create battle record
      const battleRecord = await tx.battle.create({
        data: {
          userId: playerUserId,
          chibletId: playerChibletId,
          monsterId: 'pvp_battle', // Use placeholder for PvP battles
          status: battleResult.winner === 'player' ? 'WON' : 'LOST',
          rounds: battleResult.rounds as any,
          expGained: battleResult.expGained,
          coinsGained: battleResult.wchibiGained,
          completedAt: new Date()
        }
      });

      return {
        battleRecord,
        updatedPlayerChiblet,
        battleResult
      };
    });

    return result;
  } finally {
    // Don't disconnect here as it might be called from an API route
  }
}
