import { NextRequest, NextResponse } from 'next/server';
import { 
  validateTelegramWebAppData, 
  isAuthDataFresh, 
  processUserFromTelegram 
} from '@/lib/telegram-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;

    if (!initData) {
      return NextResponse.json(
        { error: 'Missing initData' },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    // Handle development mode
    if (process.env.NODE_ENV === 'development' && initData.includes('dev123')) {
      const mockUser = {
        id: 123456789, // Make sure this is a number, not string
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
      };
      const user = await processUserFromTelegram(mockUser);
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          telegramId: user.telegramId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.telegramUsername,
          photoUrl: user.photoUrl,
          wchibi: user.wchibi,
          gems: user.gems,
          level: user.level,
          experience: user.experience,
          currentArea: user.currentArea,
          currentStage: user.currentStage,
        }
      });
    }

    // Validate Telegram data for production
    const telegramData = validateTelegramWebAppData(initData, botToken);
    if (!telegramData || !telegramData.user) {
      return NextResponse.json(
        { error: 'Invalid Telegram data' },
        { status: 401 }
      );
    }

    // Check if data is fresh (within 1 hour)
    if (!isAuthDataFresh(telegramData.auth_date)) {
      return NextResponse.json(
        { error: 'Auth data too old' },
        { status: 401 }
      );
    }

    // Create or update user
    const user = await processUserFromTelegram(telegramData.user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.telegramUsername,
        photoUrl: user.photoUrl,
        wchibi: user.wchibi,
        gems: user.gems,
        level: user.level,
        experience: user.experience,
        currentArea: user.currentArea,
        currentStage: user.currentStage,
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
