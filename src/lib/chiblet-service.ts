import { prisma } from './prisma';
import { GameCalculations, GAME_CONFIG, ChibletRarity } from './game-config';

export interface ChibletWithStats {
  id: string;
  speciesId: string;
  name?: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  currentEnergy: number;
  maxEnergy: number;
  lastEnergyUpdate: Date;
  isActive: boolean;
  species: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    spriteUrl?: string;
    description?: string;
  };
  // Calculated stats
  power: number;
  incomePerHour: number;
}

/**
 * Get user's chiblets with calculated stats
 */
export async function getUserChiblets(userId: string): Promise<ChibletWithStats[]> {
  try {
    const userChiblets = await prisma.userChiblet.findMany({
      where: { userId },
      include: {
        species: true,
      },
      orderBy: [
        { isActive: 'desc' },
        { level: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return userChiblets.map(chiblet => {
      const currentEnergy = calculateCurrentEnergy(
        chiblet.species.rarity,
        chiblet.currentEnergy || chiblet.species.baseHp,
        chiblet.lastEnergyUpdate || chiblet.updatedAt
      );

      return {
        ...chiblet,
        currentEnergy,
        maxEnergy: GAME_CONFIG.CHIBLET_BASE_STATS[chiblet.species.rarity as ChibletRarity].energyCapacity,
        power: GameCalculations.calculateChibletPower(chiblet.species.rarity, chiblet.level),
        incomePerHour: GameCalculations.calculateChibletIncome(chiblet.species.rarity, chiblet.level),
      } as ChibletWithStats;
    });
  } catch (error) {
    console.error('Error fetching user chiblets:', error);
    return [];
  }
}

/**
 * Get user's active team (up to 5 chiblets)
 */
export async function getUserActiveTeam(userId: string): Promise<ChibletWithStats[]> {
  try {
    const activeChiblets = await prisma.userChiblet.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        species: true,
      },
      take: GAME_CONFIG.LIMITS.maxActiveTeamSize,
      orderBy: [
        { level: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return activeChiblets.map(chiblet => {
      const currentEnergy = calculateCurrentEnergy(
        chiblet.species.rarity,
        chiblet.currentEnergy || GAME_CONFIG.CHIBLET_BASE_STATS[chiblet.species.rarity as ChibletRarity].energyCapacity,
        chiblet.lastEnergyUpdate || chiblet.updatedAt
      );

      return {
        ...chiblet,
        currentEnergy,
        maxEnergy: GAME_CONFIG.CHIBLET_BASE_STATS[chiblet.species.rarity as ChibletRarity].energyCapacity,
        power: GameCalculations.calculateChibletPower(chiblet.species.rarity, chiblet.level),
        incomePerHour: GameCalculations.calculateChibletIncome(chiblet.species.rarity, chiblet.level),
      } as ChibletWithStats;
    });
  } catch (error) {
    console.error('Error fetching active team:', error);
    return [];
  }
}

/**
 * Calculate current energy based on regeneration
 */
function calculateCurrentEnergy(rarity: string, lastEnergy: number, lastUpdate: Date): number {
  const config = GAME_CONFIG.CHIBLET_BASE_STATS[rarity as ChibletRarity];
  if (!config) return 0;

  const now = new Date();
  const hoursOffline = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  const regenEnergy = GameCalculations.calculateEnergyRegen(rarity, hoursOffline);
  return Math.min(lastEnergy + regenEnergy, config.energyCapacity);
}

/**
 * Set chiblet as active/inactive in team
 */
export async function setChibletActive(chibletId: string, userId: string, isActive: boolean): Promise<boolean> {
  try {
    // Check if user is trying to add to team
    if (isActive) {
      // Count current active chiblets
      const activeCount = await prisma.userChiblet.count({
        where: {
          userId,
          isActive: true,
        },
      });

      // Check team size limit
      if (activeCount >= GAME_CONFIG.LIMITS.maxActiveTeamSize) {
        throw new Error(`Team is full! Maximum ${GAME_CONFIG.LIMITS.maxActiveTeamSize} chiblets allowed.`);
      }
    }

    await prisma.userChiblet.update({
      where: {
        id: chibletId,
        userId, // Ensure user owns this chiblet
      },
      data: {
        isActive,
        updatedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Error setting chiblet active status:', error);
    return false;
  }
}

/**
 * Level up a chiblet using experience
 */
export async function levelUpChiblet(chibletId: string, userId: string): Promise<{ success: boolean; newLevel?: number; error?: string }> {
  try {
    const chiblet = await prisma.userChiblet.findFirst({
      where: {
        id: chibletId,
        userId,
      },
      include: {
        species: true,
      },
    });

    if (!chiblet) {
      return { success: false, error: 'Chiblet not found' };
    }

    const expNeeded = GameCalculations.getExpForLevel(chiblet.level + 1);
    
    if (chiblet.experience < expNeeded) {
      return { success: false, error: 'Not enough experience' };
    }

    const newLevel = chiblet.level + 1;
    const newPower = GameCalculations.calculateChibletPower(chiblet.species.rarity, newLevel);
    
    // Calculate new HP (scales with power)
    const hpMultiplier = newPower / GameCalculations.calculateChibletPower(chiblet.species.rarity, chiblet.level);
    const newMaxHp = Math.floor(chiblet.maxHp * hpMultiplier);

    await prisma.userChiblet.update({
      where: { id: chibletId },
      data: {
        level: newLevel,
        experience: chiblet.experience - expNeeded,
        attack: newPower,
        maxHp: newMaxHp,
        hp: newMaxHp, // Full heal on level up
        updatedAt: new Date(),
      },
    });

    return { success: true, newLevel };
  } catch (error) {
    console.error('Error leveling up chiblet:', error);
    return { success: false, error: 'Failed to level up chiblet' };
  }
}

/**
 * Fuse two chiblets of the same rarity
 */
export async function fuseChiblets(
  chibletId1: string, 
  chibletId2: string, 
  userId: string
): Promise<{ success: boolean; newChiblet?: any; error?: string }> {
  try {
    // Get both chiblets
    const chiblets = await prisma.userChiblet.findMany({
      where: {
        id: { in: [chibletId1, chibletId2] },
        userId,
      },
      include: {
        species: true,
      },
    });

    if (chiblets.length !== 2) {
      return { success: false, error: 'Invalid chiblets for fusion' };
    }

    const [chiblet1, chiblet2] = chiblets;

    // Check same rarity
    if (chiblet1.species.rarity !== chiblet2.species.rarity) {
      return { success: false, error: 'Chiblets must be the same rarity' };
    }

    // Check if fusion is possible
    const fusionResult = GameCalculations.getFusionResult(chiblet1.species.rarity);
    if (!fusionResult) {
      return { success: false, error: 'Cannot fuse legendary chiblets' };
    }

    const fusionCost = GameCalculations.getFusionCost(chiblet1.species.rarity);

    // Check if user has enough coins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wchibi: true },
    });

    if (!user || user.wchibi < fusionCost) {
      return { success: false, error: 'Not enough coins for fusion' };
    }

    // Get random species of target rarity
    const targetSpecies = await prisma.chibletSpecies.findMany({
      where: { rarity: fusionResult },
    });

    if (targetSpecies.length === 0) {
      return { success: false, error: 'No species found for fusion result' };
    }

    const randomSpecies = targetSpecies[Math.floor(Math.random() * targetSpecies.length)];

    // Calculate new chiblet stats
    const newLevel = Math.max(chiblet1.level, chiblet2.level);
    const newPower = GameCalculations.calculateChibletPower(fusionResult, newLevel);

    // Perform fusion in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete the two chiblets
      await tx.userChiblet.deleteMany({
        where: {
          id: { in: [chibletId1, chibletId2] },
        },
      });

      // Deduct coins
      await tx.user.update({
        where: { id: userId },
        data: {
          wchibi: { decrement: fusionCost },
        },
      });

      // Create new chiblet
      const newChiblet = await tx.userChiblet.create({
        data: {
          userId,
          speciesId: randomSpecies.id,
          level: newLevel,
          experience: 0,
          hp: newPower,
          maxHp: newPower,
          attack: newPower,
          defense: Math.floor(newPower * 0.8),
          isActive: false,
        },
        include: {
          species: true,
        },
      });

      return newChiblet;
    });

    return { success: true, newChiblet: result };
  } catch (error) {
    console.error('Error fusing chiblets:', error);
    return { success: false, error: 'Fusion failed' };
  }
}

/**
 * Update chiblet energy after battle or time passage
 */
export async function updateChibletEnergy(chibletId: string, energyUsed: number): Promise<boolean> {
  try {
    const chiblet = await prisma.userChiblet.findUnique({
      where: { id: chibletId },
      include: { species: true },
    });

    if (!chiblet) return false;

    const currentEnergy = calculateCurrentEnergy(
      chiblet.species.rarity,
      chiblet.currentEnergy || GAME_CONFIG.CHIBLET_BASE_STATS[chiblet.species.rarity as ChibletRarity].energyCapacity,
      chiblet.lastEnergyUpdate || chiblet.updatedAt
    );

    const newEnergy = Math.max(0, currentEnergy - energyUsed);

    await prisma.userChiblet.update({
      where: { id: chibletId },
      data: {
        currentEnergy: newEnergy,
        lastEnergyUpdate: new Date(),
        updatedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating chiblet energy:', error);
    return false;
  }
}

/**
 * Get available species for summoning/rewards
 */
export async function getAvailableSpecies(rarity?: ChibletRarity) {
  try {
    return await prisma.chibletSpecies.findMany({
      where: rarity ? { rarity } : {},
      orderBy: [
        { rarity: 'asc' },
        { name: 'asc' },
      ],
    });
  } catch (error) {
    console.error('Error fetching species:', error);
    return [];
  }
}

/**
 * Create a new chiblet for user (for rewards, purchases, etc.)
 */
export async function createChibletForUser(
  userId: string, 
  speciesId: string, 
  level: number = 1
): Promise<ChibletWithStats | null> {
  try {
    const species = await prisma.chibletSpecies.findUnique({
      where: { id: speciesId },
    });

    if (!species) return null;

    const power = GameCalculations.calculateChibletPower(species.rarity, level);
    
    const chiblet = await prisma.userChiblet.create({
      data: {
        userId,
        speciesId,
        level,
        experience: 0,
        hp: power,
        maxHp: power,
        attack: power,
        defense: Math.floor(power * 0.8),
        isActive: false,
      },
      include: {
        species: true,
      },
    });

    const maxEnergy = GAME_CONFIG.CHIBLET_BASE_STATS[species.rarity as ChibletRarity].energyCapacity;

    return {
      ...chiblet,
      currentEnergy: maxEnergy,
      maxEnergy,
      power,
      incomePerHour: GameCalculations.calculateChibletIncome(species.rarity, level),
    } as ChibletWithStats;
  } catch (error) {
    console.error('Error creating chiblet for user:', error);
    return null;
  }
}
