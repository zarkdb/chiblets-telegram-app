// Game balance configuration
export const GAME_CONFIG = {
  // Chiblet base stats by rarity
  CHIBLET_BASE_STATS: {
    common: {
      basePower: 10,
      energyCapacity: 3, // 3 energy = 2 hours of fighting
      energyRegenTime: 2, // 2 hours to fully regenerate
      baseIncomePerHour: 1,
    },
    rare: {
      basePower: 25,
      energyCapacity: 4, // 4 energy
      energyRegenTime: 3, // 3 hours to fully regenerate
      baseIncomePerHour: 3,
    },
    epic: {
      basePower: 60,
      energyCapacity: 6, // 6 energy
      energyRegenTime: 4, // 4 hours to fully regenerate
      baseIncomePerHour: 8,
    },
    legendary: {
      basePower: 150,
      energyCapacity: 8, // 8 energy
      energyRegenTime: 6, // 6 hours to fully regenerate
      baseIncomePerHour: 20,
    },
  },

  // Power scaling per level
  POWER_SCALING: {
    common: 1.15, // 15% increase per level
    rare: 1.18, // 18% increase per level
    epic: 1.22, // 22% increase per level
    legendary: 1.25, // 25% increase per level
  },

  // Income scaling per level
  INCOME_SCALING: {
    common: 1.1, // 10% increase per level
    rare: 1.12, // 12% increase per level
    epic: 1.15, // 15% increase per level
    legendary: 1.18, // 18% increase per level
  },

  // Stage configuration
  STAGE_CONFIG: {
    baseMonsterPower: 1000, // Stage 1 monster power
    powerScaling: 1.5, // 50% increase per stage
    baseCoinReward: 50, // Base coins for defeating stage 1
    rewardScaling: 1.3, // 30% increase in rewards per stage
  },

  // Fusion system
  FUSION_RULES: {
    common: { count: 2, result: 'rare', cost: 100 },
    rare: { count: 2, result: 'epic', cost: 500 },
    epic: { count: 2, result: 'legendary', cost: 2000 },
  },

  // Energy system
  ENERGY_CONFIG: {
    damagePerEnergy: 1, // 1 energy = 1 attack = damage equal to chiblet power
    hoursPerEnergy: {
      common: 2 / 3, // 3 energy lasts 2 hours = 0.67 hours per energy
      rare: 3 / 4, // 4 energy lasts 3 hours = 0.75 hours per energy
      epic: 4 / 6, // 6 energy lasts 4 hours = 0.67 hours per energy
      legendary: 6 / 8, // 8 energy lasts 6 hours = 0.75 hours per energy
    },
  },

  // Game limits
  LIMITS: {
    maxActiveTeamSize: 5,
    maxChiblets: 50,
    maxStage: 1000,
  },
} as const;

// Helper functions for game calculations
export class GameCalculations {
  /**
   * Calculate chiblet power at a given level
   */
  static calculateChibletPower(rarity: string, level: number): number {
    const baseStats = GAME_CONFIG.CHIBLET_BASE_STATS[rarity as keyof typeof GAME_CONFIG.CHIBLET_BASE_STATS];
    const scaling = GAME_CONFIG.POWER_SCALING[rarity as keyof typeof GAME_CONFIG.POWER_SCALING];
    
    if (!baseStats || !scaling) return 0;
    
    return Math.floor(baseStats.basePower * Math.pow(scaling, level - 1));
  }

  /**
   * Calculate chiblet income per hour at a given level
   */
  static calculateChibletIncome(rarity: string, level: number): number {
    const baseStats = GAME_CONFIG.CHIBLET_BASE_STATS[rarity as keyof typeof GAME_CONFIG.CHIBLET_BASE_STATS];
    const scaling = GAME_CONFIG.INCOME_SCALING[rarity as keyof typeof GAME_CONFIG.INCOME_SCALING];
    
    if (!baseStats || !scaling) return 0;
    
    return Math.floor(baseStats.baseIncomePerHour * Math.pow(scaling, level - 1));
  }

  /**
   * Calculate monster power for a given stage
   */
  static calculateMonsterPower(stage: number): number {
    const { baseMonsterPower, powerScaling } = GAME_CONFIG.STAGE_CONFIG;
    return Math.floor(baseMonsterPower * Math.pow(powerScaling, stage - 1));
  }

  /**
   * Calculate coin reward for defeating a stage
   */
  static calculateStageReward(stage: number): number {
    const { baseCoinReward, rewardScaling } = GAME_CONFIG.STAGE_CONFIG;
    return Math.floor(baseCoinReward * Math.pow(rewardScaling, stage - 1));
  }

  /**
   * Calculate team total power
   */
  static calculateTeamPower(chiblets: Array<{ rarity: string; level: number }>): number {
    return chiblets.reduce((total, chiblet) => {
      return total + this.calculateChibletPower(chiblet.rarity, chiblet.level);
    }, 0);
  }

  /**
   * Calculate time to defeat monster with given team power
   */
  static calculateBattleTime(teamPower: number, monsterPower: number): number {
    if (teamPower <= 0) return Infinity;
    const attacksNeeded = Math.ceil(monsterPower / teamPower);
    return attacksNeeded; // Each attack takes 1 energy unit
  }

  /**
   * Calculate energy regeneration
   */
  static calculateEnergyRegen(rarity: string, hoursOffline: number): number {
    const config = GAME_CONFIG.CHIBLET_BASE_STATS[rarity as keyof typeof GAME_CONFIG.CHIBLET_BASE_STATS];
    if (!config) return 0;
    
    const energyPerHour = config.energyCapacity / config.energyRegenTime;
    const regenEnergy = Math.floor(hoursOffline * energyPerHour);
    
    return Math.min(regenEnergy, config.energyCapacity);
  }

  /**
   * Calculate fusion cost
   */
  static getFusionCost(rarity: string): number {
    const fusionRule = GAME_CONFIG.FUSION_RULES[rarity as keyof typeof GAME_CONFIG.FUSION_RULES];
    return fusionRule?.cost || 0;
  }

  /**
   * Get fusion result rarity
   */
  static getFusionResult(rarity: string): string | null {
    const fusionRule = GAME_CONFIG.FUSION_RULES[rarity as keyof typeof GAME_CONFIG.FUSION_RULES];
    return fusionRule?.result || null;
  }

  /**
   * Calculate experience needed for next level
   */
  static getExpForLevel(level: number): number {
    // Exponential growth: level^2 * 100
    return level * level * 100;
  }

  /**
   * Calculate total experience needed to reach a level
   */
  static getTotalExpForLevel(level: number): number {
    let totalExp = 0;
    for (let i = 1; i < level; i++) {
      totalExp += this.getExpForLevel(i);
    }
    return totalExp;
  }

  /**
   * Calculate passive income for a team over time
   */
  static calculatePassiveIncome(
    chiblets: Array<{ rarity: string; level: number }>, 
    hours: number
  ): number {
    return chiblets.reduce((total, chiblet) => {
      const incomePerHour = this.calculateChibletIncome(chiblet.rarity, chiblet.level);
      return total + (incomePerHour * hours);
    }, 0);
  }
}

// Rarity order for upgrades and display
export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'] as const;
export type ChibletRarity = typeof RARITY_ORDER[number];

// Rarity colors for UI
export const RARITY_COLORS = {
  common: '#9ca3af', // gray
  rare: '#3b82f6', // blue  
  epic: '#8b5cf6', // purple
  legendary: '#f59e0b', // amber
} as const;
