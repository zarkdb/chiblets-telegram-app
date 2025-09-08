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
      const response = await axios.post('/api/auth/telegram', {
        initData,
      });

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
      const errorMessage = error.response?.data?.error || 'Authentication failed';
      
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
      // First check if we have a stored token
      const storedToken = localStorage.getItem('chiblets_token');
      if (storedToken) {
        // TODO: Validate stored token with backend
        // For now, we'll try to get fresh data from Telegram
      }

      // Try to get Telegram initData
      const initData = getTelegramInitData();
      
      if (initData) {
        await authenticate(initData);
      } else if (process.env.NODE_ENV === 'development') {
        // For development, create a mock user
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
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'No Telegram data found',
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
