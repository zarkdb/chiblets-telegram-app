'use client';

import React from 'react';

interface ErrorScreenProps {
  error: string;
}

export default function ErrorScreen({ error }: ErrorScreenProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="game-container flex items-center justify-center bg-gradient-to-b from-red-50 to-pink-50 p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Error icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-4xl">😔</span>
          </div>
        </div>
        
        {/* Error title */}
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Oops! Something went wrong
        </h1>
        
        {/* Error message */}
        <div className="text-gray-700 mb-6 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm">{error}</p>
        </div>
        
        {/* Help text */}
        <div className="text-sm text-gray-600 mb-6 space-y-2">
          <p>This usually happens when:</p>
          <ul className="text-left space-y-1 mt-2">
            <li>• The app isn't opened through Telegram</li>
            <li>• Network connection issues</li>
            <li>• Server is temporarily unavailable</li>
          </ul>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="btn-primary w-full"
          >
            Try Again
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="font-semibold text-yellow-700 mb-1">Development Mode</p>
              <p>The app is running in development mode. Open it through Telegram or the provided development URL.</p>
            </div>
          )}
        </div>
        
        {/* Contact info */}
        <div className="mt-8 text-xs text-gray-500">
          Need help? Contact support through the bot.
        </div>
      </div>
    </div>
  );
}
