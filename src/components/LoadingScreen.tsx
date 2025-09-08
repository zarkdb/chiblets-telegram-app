'use client';

import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="game-container flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="text-center">
        {/* Cute loading animation */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-game-primary rounded-full animate-bounce mx-auto"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-game-secondary rounded-full animate-ping opacity-75"></div>
          </div>
        </div>
        
        {/* Loading text */}
        <h1 className="text-3xl font-bold text-game-primary mb-4 font-game">
          ChibletsLite
        </h1>
        
        <div className="text-gray-600 mb-6">
          <div className="animate-pulse">Loading your chiblets...</div>
        </div>
        
        {/* Loading spinner */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-game-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-game-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-game-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Fun loading tips */}
        <div className="mt-8 text-sm text-gray-500 max-w-xs mx-auto">
          <div className="animate-pulse">
            💡 Tip: Your chiblets continue fighting even when you're away!
          </div>
        </div>
      </div>
    </div>
  );
}
