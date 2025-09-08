import { PrismaClient } from '@prisma/client';

const MAX_CHIBLET_LEVEL = 10;

export interface ChibletStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  power: number;
}

/**
 * Calculate experience required for a specific level
 */
export function getExpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_CHIBLET_LEVEL) return Infinity;
  
  // Exponential growth: 100 * (level^2)
  return 100 * Math.pow(level, 2);
}

/**
 * Calculate total experience needed from level 1 to target level
 */
export function getTotalExpForLevel(level: number): number {
  if (level <= 1) return 0;
  
  let total = 0;
  for (let i = 2; i <= Math.min(level, MAX_CHIBLET_LEVEL); i++) {
    total += getExpRequiredForLevel(i);
  }
  return total;
}

/**
 * Calculate chiblet stats based on base stats and level
 */
export function calculateChibletStats(
  baseHp: number,
  baseAttack: number,
  baseDefense: number,
  level: number
): ChibletStats {
  const levelMultiplier = 1 + (level - 1) * 0.2; // 20% increase per level
  
  const hp = Math.floor(baseHp * levelMultiplier);
  const attack = Math.floor(baseAttack * levelMultiplier);
  const defense = Math.floor(baseDefense * levelMultiplier);
  const power = Math.floor((hp + attack + defense) / 3);

  return {
    hp,
    maxHp: hp,
    attack,
    defense,
    power,
  };
}

/**
 * Check if chiblet can level up and return level info
 */
export function getChibletLevelInfo(currentLevel: number, experience: number) {
  const isMaxLevel = currentLevel >= MAX_CHIBLET_LEVEL;
  
  if (isMaxLevel) {
    return {
      canLevelUp: false,
      currentLevel,
      maxLevel: MAX_CHIBLET_LEVEL,
      expToNext: 0,
      expForNext: 0,
      isMaxLevel: true,
    };
  }

  const expForNext = getExpRequiredForLevel(currentLevel + 1);
  const expToNext = Math.max(0, expForNext - experience);
  const canLevelUp = experience >= expForNext;

  return {
    canLevelUp,
    currentLevel,
    maxLevel: MAX_CHIBLET_LEVEL,
    expToNext,
    expForNext,
    isMaxLevel: false,
  };
}

/**
 * Level up a chiblet (database operation)
 */
export async function levelUpChiblet(chibletId: string) {
  const prisma = new PrismaClient();
  
  try {
    const chiblet = await prisma.userChiblet.findUnique({
      where: { id: chibletId },
      include: { species: true }
    });

    if (!chiblet) {
      throw new Error('Chiblet not found');
    }

    const levelInfo = getChibletLevelInfo(chiblet.level, chiblet.experience);
    
    if (!levelInfo.canLevelUp) {
      throw new Error(levelInfo.isMaxLevel ? 'Chiblet is already at max level' : 'Not enough experience');
    }

    const newLevel = chiblet.level + 1;
    const newStats = calculateChibletStats(
      chiblet.species.baseHp,
      chiblet.species.baseAttack,
      chiblet.species.baseDefense,
      newLevel
    );

    // Update chiblet with new level and stats
    const updatedChiblet = await prisma.userChiblet.update({
      where: { id: chibletId },
      data: {
        level: newLevel,
        experience: chiblet.experience - levelInfo.expForNext, // Subtract used experience
        hp: newStats.hp,
        maxHp: newStats.maxHp,
        attack: newStats.attack,
        defense: newStats.defense,
      },
      include: { species: true }
    });

    return {
      success: true,
      chiblet: updatedChiblet,
      newLevel,
      statsGained: {
        hp: newStats.hp - chiblet.hp,
        attack: newStats.attack - chiblet.attack,
        defense: newStats.defense - chiblet.defense,
      }
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get energy info based on chiblet rarity
 */
export function getEnergyInfo(rarity: string) {
  const energyLimits = {
    common: 3,
    rare: 6,
    epic: 8,
    legendary: 12,
  };

  return {
    maxEnergy: energyLimits[rarity as keyof typeof energyLimits] || 3,
    regenMinutes: 20, // 20 minutes per energy point
  };
}
