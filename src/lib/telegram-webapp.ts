// Telegram WebApp types - using global types from /types/telegram.d.ts

class TelegramWebApp {
  private static instance: TelegramWebApp;
  private webApp: any = null;
  private isReady = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.webApp = window.Telegram?.WebApp;
      this.initialize();
    }
  }

  public static getInstance(): TelegramWebApp {
    if (!TelegramWebApp.instance) {
      TelegramWebApp.instance = new TelegramWebApp();
    }
    return TelegramWebApp.instance;
  }

  private initialize() {
    if (!this.webApp) {
      console.warn('Telegram WebApp not available');
      return;
    }

    try {
      // Configure WebApp
      this.webApp.ready();
      this.webApp.expand();
      
      // Enable closing confirmation
      this.webApp.enableClosingConfirmation();

      // Set theme
      this.setTheme();

      this.isReady = true;
      console.log('Telegram WebApp initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
    }
  }

  private setTheme() {
    if (!this.webApp) return;

    // Apply Telegram theme to the app
    const themeParams = this.webApp.themeParams;
    const root = document.documentElement;

    if (themeParams) {
      // Set CSS custom properties based on Telegram theme
      root.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#ffffff');
      root.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#000000');
      root.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#999999');
      root.style.setProperty('--tg-theme-link-color', themeParams.link_color || '#0088cc');
      root.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#0088cc');
      root.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff');
    }

    // Add theme class to body
    document.body.classList.add(`tg-theme-${this.webApp.colorScheme}`);
  }

  // Public methods for game interactions
  public showMainButton(text: string, callback: () => void) {
    if (!this.webApp?.MainButton) return;

    this.webApp.MainButton.setText(text);
    this.webApp.MainButton.show();
    this.webApp.MainButton.onClick(callback);
  }

  public hideMainButton() {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.hide();
  }

  public showBackButton(callback: () => void) {
    if (!this.webApp?.BackButton) return;

    this.webApp.BackButton.show();
    this.webApp.BackButton.onClick(callback);
  }

  public hideBackButton() {
    if (!this.webApp?.BackButton) return;
    this.webApp.BackButton.hide();
  }

  // Haptic feedback for game actions
  public hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection') {
    if (!this.webApp?.HapticFeedback) return;

    try {
      switch (type) {
        case 'light':
        case 'medium':
        case 'heavy':
          this.webApp.HapticFeedback.impactOccurred(type);
          break;
        case 'success':
        case 'error':
        case 'warning':
          this.webApp.HapticFeedback.notificationOccurred(type);
          break;
        case 'selection':
          this.webApp.HapticFeedback.selectionChanged();
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  // Get user data
  public getInitData() {
    return this.webApp?.initData || null;
  }

  public getUser() {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  public getColorScheme() {
    return this.webApp?.colorScheme || 'light';
  }

  public getPlatform() {
    return this.webApp?.platform || 'unknown';
  }

  // Close the app
  public close() {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  // Send data back to bot
  public sendData(data: any) {
    if (this.webApp) {
      this.webApp.sendData(JSON.stringify(data));
    }
  }

  public isWebAppReady() {
    return this.isReady && !!this.webApp;
  }
}

// Export singleton instance
export const telegramWebApp = TelegramWebApp.getInstance();

// Hook for React components
export function useTelegramWebApp() {
  return telegramWebApp;
}

export default telegramWebApp;
