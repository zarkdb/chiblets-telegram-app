'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  useEffect(() => {
    // Ensure Telegram WebApp is expanded and ready
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set viewport to prevent scrolling during loading (optional API, not in typings)
      (tg as any).disableVerticalSwipes?.();
      
      // Optional: Set header color to match loading screen (optional API, not in typings)
      (tg as any).setHeaderColor?.('#87CEEB');
      
      // Optional: Set background color (optional API, not in typings)
      (tg as any).setBackgroundColor?.('#87CEEB');
    }
    
    // Prevent viewport issues on mobile
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Telegram Mini App optimized loading screen */}
      <div className="relative w-full h-full">
        <Image
          src="/images/loading.png"
          alt="Chiblets Loading Screen"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={100}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLli7kuK4SZSG5A+Hbz2AehNnRsyAQMZdh"
        />
      </div>
    </div>
  );
}
