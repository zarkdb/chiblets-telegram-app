import { useEffect, useState } from 'react';
import type { TelegramWebApp } from '@/types/telegram';

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        setWebApp(window.Telegram.WebApp);
        setIsLoading(false);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkTelegram()) {
      return;
    }

    // If not available, check periodically
    const interval = setInterval(() => {
      if (checkTelegram()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsLoading(false);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return {
    webApp,
    isLoading,
    isInTelegram: webApp !== null,
    user: webApp?.initDataUnsafe?.user || null,
    initData: webApp?.initData || '',
  };
}
