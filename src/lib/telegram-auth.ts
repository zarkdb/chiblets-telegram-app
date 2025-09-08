import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramWebAppInitData {
  user?: TelegramUser;
  chat_instance?: string;
  chat_type?: string;
  auth_date: number;
  hash: string;
  [key: string]: any;
}

/**
 * Validates Telegram Mini App init data
 */
export function validateTelegramWebAppData(
  initData: string,
  botToken: string
): TelegramWebAppInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    
    urlParams.forEach((value, key) => {
      data[key] = value;
    });

    const { hash, ...dataToCheck } = data;

    if (!hash) {
      return null;
    }

    // Create data string for verification
    const dataCheckString = Object.keys(dataToCheck)
      .sort()
      .map(key => `${key}=${dataToCheck[key]}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate expected hash
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hash !== expectedHash) {
      return null;
    }

    // Parse user data if exists
    let user: TelegramUser | undefined;
    if (data.user) {
      try {
        user = JSON.parse(data.user);
      } catch {
        return null;
      }
    }

    return {
      user,
      chat_instance: data.chat_instance,
      chat_type: data.chat_type,
      auth_date: parseInt(data.auth_date || '0'),
      hash,
    };
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return null;
  }
}

/**
 * Checks if the auth data is not too old (within 1 hour)
 */
export function isAuthDataFresh(authDate: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = 3600; // 1 hour
  return now - authDate <= maxAge;
}

/**
 * Creates or updates user from Telegram data
 */
export async function processUserFromTelegram(telegramUser: TelegramUser) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // First, check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        telegramId: telegramUser.id.toString(),
      },
    });

    if (existingUser) {
      // Update existing user
      const user = await prisma.user.update({
        where: {
          telegramId: telegramUser.id.toString(),
        },
        data: {
          telegramUsername: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          photoUrl: telegramUser.photo_url,
          lastOnline: new Date(),
        },
      });
      return user;
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        telegramId: telegramUser.id.toString(),
        telegramUsername: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
        wchibi: 1000, // Starting wCHIBI
        gems: 50,    // Starting gems
        level: 1,
        experience: 0,
        currentArea: 1,
        currentStage: 1,
        totalChiblets: 1, // Will have 1 starter chiblet
        lastOnline: new Date(),
      },
    });

    // Give the new user a random common chiblet as starter
    const commonChiblets = await prisma.chibletSpecies.findMany({
      where: {
        rarity: 'common'
      }
    });

    if (commonChiblets.length > 0) {
      const randomCommon = commonChiblets[Math.floor(Math.random() * commonChiblets.length)];
      
      await prisma.userChiblet.create({
        data: {
          userId: newUser.id,
          speciesId: randomCommon.id,
          level: 1,
          experience: 0,
          hp: randomCommon.baseHp,
          maxHp: randomCommon.baseHp,
          attack: randomCommon.baseAttack,
          defense: randomCommon.baseDefense,
          currentEnergy: 3, // Common chiblets start with 3 energy
          isActive: true, // Set as active starter chiblet
          name: `My ${randomCommon.name}`, // Give it a special starter name
        }
      });
    }

    return newUser;
  } finally {
    await prisma.$disconnect();
  }
}
