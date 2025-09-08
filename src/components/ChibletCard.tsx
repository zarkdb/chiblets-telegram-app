'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { RARITY_COLORS } from '@/lib/game-config';

interface ChibletCardProps {
  chiblet: any;
  onClick: () => void;
}

const typeEmojis = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '💨',
  light: '✨',
  dark: '🌙',
  unknown: '❓',
};

const rarityGradients = {
  common: 'from-gray-100 to-gray-200 border-gray-300',
  rare: 'from-blue-100 to-blue-200 border-blue-400',
  epic: 'from-purple-100 to-purple-200 border-purple-400',
  legendary: 'from-yellow-100 to-yellow-200 border-yellow-400',
};

const rarityImages = {
  common: '/images/chiblets/common.png',
  rare: '/images/chiblets/rare.png',
  epic: '/images/chiblets/epic.png',
  legendary: '/images/chiblets/legendary.png',
};

export default function ChibletCard({ chiblet, onClick }: ChibletCardProps) {
  const rarity = chiblet.species.rarity as keyof typeof rarityGradients;
  const type = chiblet.species.type as keyof typeof typeEmojis;
  
  // Define max energy based on rarity
  const maxEnergyByRarity = {
    common: 3,
    rare: 6,
    epic: 8,
    legendary: 12
  };
  
  const maxEnergy = maxEnergyByRarity[rarity] || 3;

  return (
    <motion.div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >

      {/* Chiblet Image */}
      <div className="text-center mb-4">
        <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
          <Image
            src={rarityImages[rarity] || rarityImages.common}
            alt={chiblet.species.name}
            width={160}
            height={160}
            className="rounded-2xl object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="text-4xl hidden">{typeEmojis[type] || typeEmojis.unknown}</div>
        </div>
      </div>

      {/* Name & Rarity */}
      <div className="text-center mb-3">
        <h3 className="font-semibold text-gray-800 text-base mb-1">
          {chiblet.name || chiblet.species.name}
        </h3>
        <p className="text-sm text-gray-500 capitalize">{chiblet.species.rarity}</p>
      </div>

      {/* Level & Energy */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Lv. {chiblet.level}</span>
        <span className="font-medium text-blue-600">
          {chiblet.currentEnergy}/{maxEnergy} ⚡
        </span>
      </div>
    </motion.div>
  );
}
