import { prisma } from './prisma';
import { TelegramUser } from './telegram';

/**
 * Creates or updates a user from Telegram data
 * @param telegramUser - Telegram user data
 * @returns Created or updated user from database
 */
export async function createOrUpdateUser(telegramUser: TelegramUser) {
  const userData = {
    telegramId: telegramUser.id,
    telegramUsername: telegramUser.username || null,
    firstName: telegramUser.first_name || null,
    lastName: telegramUser.last_name || null,
    photoUrl: telegramUser.photo_url || null,
    languageCode: telegramUser.language_code || 'en',
    isPremium: telegramUser.is_premium || false,
    lastOnline: new Date(),
  };

  try {
    // Use upsert to create or update user
    const user = await prisma.user.upsert({
      where: {
        telegramId: telegramUser.id,
      },
      update: {
        ...userData,
        // Calculate offline rewards if user was offline
        offlineRewards: (await calculateOfflineRewards(telegramUser.id)) as any,
      },
      create: {
        ...userData,
        // Give new users a starter chiblet
        chiblets: {
          create: await createStarterChiblet(),
        },
      },
      include: {
        chiblets: {
          include: {
            species: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw new Error('Failed to create or update user');
  }
}

/**
 * Gets user by Telegram ID
 * @param telegramId - Telegram user ID
 * @returns User data with relations or null
 */
export async function getUserByTelegramId(telegramId: string) {
  try {
    return await prisma.user.findUnique({
      where: {
        telegramId,
      },
      include: {
        chiblets: {
          include: {
            species: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
          where: {
            claimed: false,
          },
        },
        battleHistory: {
          orderBy: {
            startedAt: 'desc',
          },
          take: 10, // Last 10 battles
          include: {
            monster: true,
            chiblet: {
              include: {
                species: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Updates user's last online timestamp and calculates offline rewards
 * @param telegramId - Telegram user ID
 * @returns Updated user data
 */
export async function updateUserLastOnline(telegramId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      select: { lastOnline: true, currentArea: true, level: true },
    });

    if (!user) return null;

    const offlineRewards = await calculateOfflineRewards(telegramId);

    return await prisma.user.update({
      where: { telegramId },
      data: {
        lastOnline: new Date(),
        offlineRewards: offlineRewards as any,
      },
    });
  } catch (error) {
    console.error('Error updating user last online:', error);
    return null;
  }
}

/**
 * Calculates offline rewards based on time away
 * @param telegramId - Telegram user ID
 * @returns Offline rewards data
 */
async function calculateOfflineRewards(telegramId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      select: {
        lastOnline: true,
        currentArea: true,
        level: true,
        chiblets: {
          where: { isActive: true },
          include: { species: true },
        },
      },
    });

    if (!user || !user.lastOnline) return null;

    const now = new Date();
    const offlineHours = Math.min(
      (now.getTime() - user.lastOnline.getTime()) / (1000 * 60 * 60),
      24 // Max 24 hours of offline progress
    );

    if (offlineHours < 0.5) return null; // Less than 30 minutes

    // Calculate rewards based on active chiblet and current area
    const activeChiblet = user.chiblets.find(c => c.isActive);
    if (!activeChiblet) return null;

    // Base rewards per hour (modified by area and chiblet level)
    const baseCoinsPerHour = 10 + (user.currentArea * 5);
    const baseExpPerHour = 5 + (user.currentArea * 2);

    // Offline multiplier (50% of normal rate)
    const offlineMultiplier = 0.5;

    const totalCoins = Math.floor(offlineHours * baseCoinsPerHour * offlineMultiplier);
    const totalExp = Math.floor(offlineHours * baseExpPerHour * offlineMultiplier);

    return {
      hours: Math.floor(offlineHours * 10) / 10, // Round to 1 decimal
      coins: totalCoins,
      experience: totalExp,
      calculatedAt: now,
    };
  } catch (error) {
    console.error('Error calculating offline rewards:', error);
    return null;
  }
}

/**
 * Creates a starter chiblet for new users
 * @returns Chiblet creation data
 */
async function createStarterChiblet() {
  try {
    // Get a random common chiblet species
    const commonSpecies = await prisma.chibletSpecies.findMany({
      where: { rarity: 'common' },
    });

    if (commonSpecies.length === 0) {
      throw new Error('No common chiblet species found');
    }

    const randomSpecies = commonSpecies[Math.floor(Math.random() * commonSpecies.length)];

    return {
      speciesId: randomSpecies.id,
      level: 1,
      experience: 0,
      hp: randomSpecies.baseHp,
      maxHp: randomSpecies.baseHp,
      attack: randomSpecies.baseAttack,
      defense: randomSpecies.baseDefense,
      isActive: true, // Set as active chiblet
    };
  } catch (error) {
    console.error('Error creating starter chiblet:', error);
    throw new Error('Failed to create starter chiblet');
  }
}

/**
 * Claims offline rewards for a user
 * @param telegramId - Telegram user ID
 * @returns Updated user data
 */
export async function claimOfflineRewards(telegramId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      select: { offlineRewards: true, wchibi: true, experience: true },
    });

    if (!user || !user.offlineRewards) return null;

    const rewards = user.offlineRewards as any;

    return await prisma.user.update({
      where: { telegramId },
      data: {
        wchibi: user.wchibi + rewards.coins,
        experience: user.experience + rewards.experience,
        offlineRewards: null as any, // Clear claimed rewards
      },
    });
  } catch (error) {
    console.error('Error claiming offline rewards:', error);
    throw new Error('Failed to claim offline rewards');
  }
}
