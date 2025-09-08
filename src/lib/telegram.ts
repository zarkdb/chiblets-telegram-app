import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface TelegramUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  [key: string]: any;
}

/**
 * Validates Telegram Mini App initData
 * @param initData - Raw initData string from Telegram
 * @param botToken - Telegram bot token
 * @returns Parsed and validated initData or null if invalid
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string
): TelegramInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.error('No hash provided in initData');
      return null;
    }

    // Remove hash from params for validation
    urlParams.delete('hash');
    
    // Sort parameters alphabetically
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate expected hash
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');

    if (hash !== expectedHash) {
      console.error('Invalid hash - initData validation failed');
      return null;
    }

    // Parse user data
    const userData = urlParams.get('user');
    let user: TelegramUser | undefined;
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData)) as any;
        // Convert id to string for consistency
        if (parsedUser && typeof parsedUser.id === 'number') {
          parsedUser.id = parsedUser.id.toString();
        }
        user = parsedUser;
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
      }
    }

    const authDate = parseInt(urlParams.get('auth_date') || '0');
    
    // Check if data is not too old (24 hours)
    const maxAge = 24 * 60 * 60; // 24 hours in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (currentTime - authDate > maxAge) {
      console.error('InitData is too old');
      return null;
    }

    return {
      user,
      auth_date: authDate,
      hash,
      ...Object.fromEntries(urlParams.entries())
    };
  } catch (error) {
    console.error('Error validating initData:', error);
    return null;
  }
}

/**
 * Creates a JWT token for authenticated user
 * @param telegramUser - Validated Telegram user data
 * @returns JWT token string
 */
export function createUserToken(telegramUser: TelegramUser): string {
  const payload = {
    userId: telegramUser.id,
    username: telegramUser.username,
    firstName: telegramUser.first_name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  };

  return jwt.sign(payload, process.env.JWT_SECRET!);
}

/**
 * Verifies and decodes a user JWT token
 * @param token - JWT token to verify
 * @returns Decoded token data or null if invalid
 */
export function verifyUserToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extracts initData from Telegram Mini App context
 * @param window - Browser window object
 * @returns InitData string or null
 */
export function getTelegramInitData(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try to get from URL hash first
  const hash = window.location.hash.substring(1);
  if (hash.includes('tgWebAppData=')) {
    const params = new URLSearchParams(hash);
    return decodeURIComponent(params.get('tgWebAppData') || '');
  }

  // Try to get from Telegram WebApp
  if ((window as any).Telegram?.WebApp?.initData) {
    return (window as any).Telegram.WebApp.initData;
  }

  // For development, you can return mock data
  if (process.env.NODE_ENV === 'development') {
    console.warn('No Telegram initData found, using mock data for development');
    return null; // Return null to handle in development mode
  }

  return null;
}
