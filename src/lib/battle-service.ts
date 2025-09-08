import { prisma } from './prisma';
import { GameCalculations, GAME_CONFIG } from './game-config';
import { getUserActiveTeam, updateChibletEnergy } from './chiblet-service';

export interface StageInfo {
  stage: number;
  monsterPower: number;
  coinReward: number;
  isUnlocked: boolean;
  currentMonster?: {
    name: string;
    type: string;
    hp: number;
    attack: number;
    spriteUrl?: string;
  };
}

export interface BattleResult {
  success: boolean;
  victory: boolean;
  energyUsed: number;
  coinsEarned: number;
  expEarned: number;
  timeToComplete: number;
  newStage?: number;
  error?: string;
}

/**
 * Get current stage information for user
 */
export async function getCurrentStage(userId: string): Promise<StageInfo | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStage: true },
    });

    if (!user) return null;

    const stage = user.currentStage;
    const monsterPower = GameCalculations.calculateMonsterPower(stage);
    const coinReward = GameCalculations.calculateStageReward(stage);

    // Get a monster from the database for this stage (if available)
    const monster = await prisma.monster.findFirst({
      where: {
        area: Math.ceil(stage / 10), // Every 10 stages = new area
        level: { lte: stage },
      },
      orderBy: { level: 'desc' },
    });

    return {
      stage,
      monsterPower,
      coinReward,
      isUnlocked: true,
      currentMonster: monster ? {
        name: monster.name,
        type: monster.type,
        hp: monsterPower, // Use calculated power instead of DB power
        attack: Math.floor(monsterPower * 0.8),
        spriteUrl: monster.spriteUrl || undefined,
      } : {
        name: `Stage ${stage} Boss`,
        type: 'unknown',
        hp: monsterPower,
        attack: Math.floor(monsterPower * 0.8),
      },
    };
  } catch (error) {
    console.error('Error getting current stage:', error);
    return null;
  }
}

/**
 * Get available stages for user (current + preview of next few)
 */
export async function getAvailableStages(userId: string, count: number = 5): Promise<StageInfo[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStage: true },
    });

    if (!user) return [];

    const stages: StageInfo[] = [];
    const currentStage = user.currentStage;

    for (let i = 0; i < count; i++) {
      const stage = currentStage + i;
      const monsterPower = GameCalculations.calculateMonsterPower(stage);
      const coinReward = GameCalculations.calculateStageReward(stage);
      
      // Get monster data
      const monster = await prisma.monster.findFirst({
        where: {
          area: Math.ceil(stage / 10),
          level: { lte: stage },
        },
        orderBy: { level: 'desc' },
      });

      stages.push({
        stage,
        monsterPower,
        coinReward,
        isUnlocked: i === 0, // Only current stage is unlocked
        currentMonster: monster ? {
          name: monster.name,
          type: monster.type,
          hp: monsterPower,
          attack: Math.floor(monsterPower * 0.8),
          spriteUrl: monster.spriteUrl || undefined,
        } : {
          name: `Stage ${stage} Boss`,
          type: 'unknown',
          hp: monsterPower,
          attack: Math.floor(monsterPower * 0.8),
        },
      });
    }

    return stages;
  } catch (error) {
    console.error('Error getting available stages:', error);
    return [];
  }
}

/**
 * Start battle with current stage
 */
export async function startBattle(userId: string): Promise<BattleResult> {
  try {
    // Get user's current stage and active team
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, currentStage: true },
    });

    if (!user) {
      return { success: false, victory: false, energyUsed: 0, coinsEarned: 0, expEarned: 0, timeToComplete: 0, error: 'User not found' };
    }

    const activeTeam = await getUserActiveTeam(userId);
    
    if (activeTeam.length === 0) {
      return { success: false, victory: false, energyUsed: 0, coinsEarned: 0, expEarned: 0, timeToComplete: 0, error: 'No active chiblets in team' };
    }

    // Calculate team stats
    const teamPower = activeTeam.reduce((total, chiblet) => total + chiblet.power, 0);
    const totalEnergy = activeTeam.reduce((total, chiblet) => total + chiblet.currentEnergy, 0);

    if (totalEnergy <= 0) {
      return { success: false, victory: false, energyUsed: 0, coinsEarned: 0, expEarned: 0, timeToComplete: 0, error: 'Team has no energy left' };
    }

    // Get monster stats
    const monsterPower = GameCalculations.calculateMonsterPower(user.currentStage);
    const attacksNeeded = Math.ceil(monsterPower / teamPower);
    const energyNeeded = Math.min(attacksNeeded, totalEnergy);

    // Check if team can defeat monster
    const canWin = teamPower > 0 && energyNeeded <= totalEnergy;

    if (!canWin) {
      return { success: false, victory: false, energyUsed: 0, coinsEarned: 0, expEarned: 0, timeToComplete: 0, error: 'Team too weak or not enough energy' };
    }

    // Calculate rewards
    const coinsEarned = GameCalculations.calculateStageReward(user.currentStage);
    const expEarned = Math.floor(coinsEarned * 0.5); // 50% of coins as exp

    // Distribute energy usage among chiblets proportionally
    const energyPerChiblet = Math.floor(energyNeeded / activeTeam.length);
    const remainingEnergy = energyNeeded % activeTeam.length;

    // Update chiblet energy
    for (let i = 0; i < activeTeam.length; i++) {
      const chiblet = activeTeam[i];
      const energyUsed = energyPerChiblet + (i < remainingEnergy ? 1 : 0);
      await updateChibletEnergy(chiblet.id, energyUsed);
    }

    // Update user progress and rewards
    const newStage = user.currentStage + 1;
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStage: newStage,
        wchibi: { increment: coinsEarned },
        experience: { increment: expEarned },
        lastOnline: new Date(),
      },
    });

    // Add experience to active chiblets
    const expPerChiblet = Math.floor(expEarned / activeTeam.length);
    for (const chiblet of activeTeam) {
      await prisma.userChiblet.update({
        where: { id: chiblet.id },
        data: {
          experience: { increment: expPerChiblet },
        },
      });
    }

    // Create battle record
    await prisma.battle.create({
      data: {
        userId: userId,
        chibletId: activeTeam[0].id, // Primary chiblet
        monsterId: await getOrCreateStageMonster(user.currentStage),
        status: 'WON',
        rounds: {
          teamPower,
          monsterPower,
          attacksUsed: attacksNeeded,
          energyUsed: energyNeeded,
        },
        expGained: expEarned,
        coinsGained: coinsEarned,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      victory: true,
      energyUsed: energyNeeded,
      coinsEarned,
      expEarned,
      timeToComplete: attacksNeeded, // In game terms, 1 attack = 1 time unit
      newStage,
    };
  } catch (error) {
    console.error('Error starting battle:', error);
    return { success: false, victory: false, energyUsed: 0, coinsEarned: 0, expEarned: 0, timeToComplete: 0, error: 'Battle failed' };
  }
}

/**
 * Get or create a monster for a stage
 */
async function getOrCreateStageMonster(stage: number): Promise<string> {
  try {
    // Try to find existing monster
    let monster = await prisma.monster.findFirst({
      where: {
        area: Math.ceil(stage / 10),
        level: { lte: stage },
      },
      orderBy: { level: 'desc' },
    });

    // Create a generic monster if none found
    if (!monster) {
      const monsterPower = GameCalculations.calculateMonsterPower(stage);
      
      monster = await prisma.monster.create({
        data: {
          name: `Stage ${stage} Boss`,
          type: 'unknown',
          area: Math.ceil(stage / 10),
          level: stage,
          hp: monsterPower,
          attack: Math.floor(monsterPower * 0.8),
          defense: Math.floor(monsterPower * 0.2),
          expReward: Math.floor(GameCalculations.calculateStageReward(stage) * 0.5),
          coinReward: GameCalculations.calculateStageReward(stage),
          description: `A powerful boss guarding stage ${stage}`,
        },
      });
    }

    return monster.id;
  } catch (error) {
    console.error('Error getting/creating stage monster:', error);
    throw error;
  }
}

/**
 * Calculate idle battle progress (for offline rewards)
 */
export async function calculateIdleBattleProgress(
  userId: string, 
  hoursOffline: number
): Promise<{ stages: number; coins: number; experience: number; details: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStage: true },
    });

    if (!user) {
      return { stages: 0, coins: 0, experience: 0, details: 'User not found' };
    }

    const activeTeam = await getUserActiveTeam(userId);
    
    if (activeTeam.length === 0) {
      return { stages: 0, coins: 0, experience: 0, details: 'No active team' };
    }

    // Calculate team power and energy capacity
    const teamPower = activeTeam.reduce((total, chiblet) => total + chiblet.power, 0);
    const totalEnergyCapacity = activeTeam.reduce((total, chiblet) => total + chiblet.maxEnergy, 0);

    // Calculate how much energy regenerates over time
    const averageRegenTime = activeTeam.reduce((total, chiblet) => {
      const config = GAME_CONFIG.CHIBLET_BASE_STATS[chiblet.species.rarity as keyof typeof GAME_CONFIG.CHIBLET_BASE_STATS];
      return total + config.energyRegenTime;
    }, 0) / activeTeam.length;

    const energyRegenCycles = Math.floor(hoursOffline / averageRegenTime);
    const totalEnergyAvailable = totalEnergyCapacity * energyRegenCycles;

    if (totalEnergyAvailable <= 0) {
      return { stages: 0, coins: 0, experience: 0, details: 'No energy available' };
    }

    // Simulate battles
    let stagesCleared = 0;
    let totalCoins = 0;
    let totalExp = 0;
    let energyRemaining = totalEnergyAvailable;
    let currentStage = user.currentStage;

    while (energyRemaining > 0 && stagesCleared < 100) { // Max 100 stages per offline session
      const monsterPower = GameCalculations.calculateMonsterPower(currentStage);
      const attacksNeeded = Math.ceil(monsterPower / teamPower);

      if (attacksNeeded > energyRemaining) break; // Not enough energy

      // Battle won
      energyRemaining -= attacksNeeded;
      stagesCleared++;
      
      const stageReward = GameCalculations.calculateStageReward(currentStage);
      totalCoins += stageReward;
      totalExp += Math.floor(stageReward * 0.5);
      
      currentStage++;
    }

    // Apply offline multiplier (battles are less efficient when idle)
    const offlineMultiplier = 0.7; // 70% efficiency when offline
    totalCoins = Math.floor(totalCoins * offlineMultiplier);
    totalExp = Math.floor(totalExp * offlineMultiplier);

    return {
      stages: stagesCleared,
      coins: totalCoins,
      experience: totalExp,
      details: `Cleared ${stagesCleared} stages with ${activeTeam.length} chiblets over ${hoursOffline} hours`,
    };
  } catch (error) {
    console.error('Error calculating idle battle progress:', error);
    return { stages: 0, coins: 0, experience: 0, details: 'Calculation failed' };
  }
}

/**
 * Apply idle battle rewards to user
 */
export async function applyIdleBattleRewards(userId: string, hoursOffline: number): Promise<boolean> {
  try {
    const progress = await calculateIdleBattleProgress(userId, hoursOffline);
    
    if (progress.stages === 0) return false;

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStage: { increment: progress.stages },
        wchibi: { increment: progress.coins },
        experience: { increment: progress.experience },
      },
    });

    // Add experience to active chiblets
    const activeTeam = await getUserActiveTeam(userId);
    const expPerChiblet = Math.floor(progress.experience / activeTeam.length);
    
    for (const chiblet of activeTeam) {
      await prisma.userChiblet.update({
        where: { id: chiblet.id },
        data: {
          experience: { increment: expPerChiblet },
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error applying idle battle rewards:', error);
    return false;
  }
}
