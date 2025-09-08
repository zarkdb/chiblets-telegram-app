'use client';

import React from 'react';
import Image from 'next/image';

interface CurrencyBarProps {
  coins: number;
}

export default function CurrencyBar({ coins }: CurrencyBarProps) {
  const formatCoins = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative flex items-center justify-center">
        {/* Gold Bar Background */}
        <div className="relative">
          <Image
            src="/images/GoldBar.png"
            alt="Gold Bar"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
          {/* Currency Amount Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-amber-900 font-bold text-sm drop-shadow-sm">
              {formatCoins(coins || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
