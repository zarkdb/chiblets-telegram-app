'use client';

import Script from 'next/script';

export default function TelegramScript() {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('Telegram WebApp script loaded');
          
          // Initialize Telegram WebApp
          if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();

            // Set theme properties
            if (tg.themeParams) {
              document.documentElement.style.setProperty(
                '--tg-theme-bg-color',
                tg.themeParams.bg_color || '#ffffff'
              );
              document.documentElement.style.setProperty(
                '--tg-theme-text-color',
                tg.themeParams.text_color || '#000000'
              );
              document.documentElement.style.setProperty(
                '--tg-theme-hint-color',
                tg.themeParams.hint_color || '#999999'
              );
              document.documentElement.style.setProperty(
                '--tg-theme-link-color',
                tg.themeParams.link_color || '#2481cc'
              );
              document.documentElement.style.setProperty(
                '--tg-theme-button-color',
                tg.themeParams.button_color || '#2481cc'
              );
              document.documentElement.style.setProperty(
                '--tg-theme-button-text-color',
                tg.themeParams.button_text_color || '#ffffff'
              );
            }

            // Disable closing confirmation
            tg.isClosingConfirmationEnabled = false;

            console.log('Telegram WebApp initialized:', {
              version: tg.version,
              platform: tg.platform,
              colorScheme: tg.colorScheme,
              initDataLength: tg.initData?.length || 0
            });
          }
        }}
      />
    </>
  );
}
