import { useState, useEffect } from 'react';
import { getTelegramInitData } from '@/lib/telegram';
import axios from 'axios';

interface User {
  id: string;
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  coins: number;
  gems: number;
  level: number;
  experience: number;
  currentArea: number;
  chiblets: any[];
  achievements: any[];
  offlineRewards?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useTelegramAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  const authenticate = async (initData: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await axios.post('/api/auth/telegram', {
        initData,
      }, {
        signal: controller.signal,
        timeout: 10000
      });
      
      clearTimeout(timeoutId);

      const { user, success } = response.data;
      if (!success) {
        throw new Error('Authentication failed');
      }
      const token = 'authenticated'; // Using simple token for now

      // Store token in localStorage
      localStorage.setItem('chiblets_token', token);

      setAuthState({
        user,
        token,
        loading: false,
        error: null,
        isAuthenticated: true,
      });

      return { success: true, user, token };
    } catch (error: any) {
      console.error('🚨 Authentication error:', error);
      const errorMessage = error.code === 'ECONNABORTED' || error.name === 'AbortError' 
        ? 'Connection timeout - check your internet connection' 
        : error.response?.data?.error || 'Authentication failed';
      
      // In development mode, fall back to offline mode on any error
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Development mode: Using offline fallback due to auth error...');
        setAuthState({
          user: {
            id: 'dev_user_fallback',
            telegramId: '123456789',
            firstName: 'Dev',
            lastName: 'User (Offline)',
            username: 'devuser',
            coins: 1000,
            gems: 50,
            level: 1,
            experience: 0,
            currentArea: 1,
            chiblets: [],
            achievements: [],
          },
          token: 'dev_token_fallback',
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        return { success: true };
      }
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('chiblets_token');
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
  };

  // Auto-authenticate on mount
  useEffect(() => {
    const autoAuth = async () => {
      console.log('🚀 Starting authentication...');
      
      // First check if we have a stored token
      const storedToken = localStorage.getItem('chiblets_token');
      if (storedToken) {
        console.log('🔑 Found stored token, will validate...');
        // TODO: Validate stored token with backend
        // For now, we'll try to get fresh data from Telegram
      }

      // Try to get Telegram initData with retry logic
      let initData = getTelegramInitData();
      
      // If no initData found, wait a bit and try again (Telegram might still be loading)
      if (!initData && typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        console.log('⏳ Waiting for Telegram WebApp to fully load...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        initData = getTelegramInitData();
        
        // Try one more time after another second
        if (!initData) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          initData = getTelegramInitData();
        }
      }
      
      if (initData) {
        console.log('✅ Found Telegram initData, authenticating...');
        await authenticate(initData);
      } else if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: using mock authentication');
        // For development, create or get existing dev user from database
        try {
          const mockInitData = 'query_id=dev123&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Dev%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22devuser%22%7D&auth_date=1234567890&hash=dev_hash';
          await authenticate(mockInitData);
        } catch (error) {
          console.error('❌ Mock authentication failed:', error);
          // Fallback to simple mock if API fails
          console.log('🔄 Using offline fallback authentication...');
          setAuthState({
            user: {
              id: 'dev_user',
              telegramId: '123456789',
              firstName: 'Dev',
              lastName: 'User',
              username: 'devuser',
              coins: 1000,
              gems: 50,
              level: 1,
              experience: 0,
              currentArea: 1,
              chiblets: [],
              achievements: [],
            },
            token: 'dev_token',
            loading: false,
            error: null,
            isAuthenticated: true,
          });
        }
      } else {
        console.error('❌ No Telegram data found and not in development mode');
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'No Telegram data found. Please open this app through Telegram.',
        }));
      }
    };

    autoAuth();
  }, []);

  return {
    ...authState,
    authenticate,
    logout,
  };
}

export default useTelegramAuth;
