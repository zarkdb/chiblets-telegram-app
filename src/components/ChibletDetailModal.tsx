'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getExpRequiredForLevel, getChibletLevelInfo } from '@/lib/chiblet-utils';

interface ChibletDetailModalProps {
  chiblet: any;
  onClose: () => void;
  onUpdate: (chiblet: any) => void;
}

export default function ChibletDetailModal({ chiblet, onClose, onUpdate }: ChibletDetailModalProps) {
  // Get level information
  const levelInfo = getChibletLevelInfo(chiblet.level, chiblet.experience);
  
  // Calculate stats (simplified - using power for speed/strength/stamina)
  const baseStats = chiblet.power || chiblet.attack || 50;
  const speed = Math.floor(baseStats * 0.8);
  const strength = Math.floor(baseStats * 1.0);
  const stamina = Math.floor(baseStats * 0.9);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-xs w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-500 text-sm">✕</span>
          </button>
        </div>

        {/* Chiblet Image */}
        <div className="p-6 pb-4 flex justify-center">
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={`/images/chiblets/${chiblet.species.rarity}.png`}
              alt={chiblet.species.name}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.classList.remove('hidden');
              }}
            />
            <div className="text-6xl hidden">🐾</div>
          </div>
        </div>

        {/* Chiblet Name */}
        <div className="text-center px-6 pb-4">
          <h3 className="font-bold text-lg text-gray-800">
            {chiblet.name || chiblet.species.name}
          </h3>
          <p className="text-sm text-gray-500 capitalize">{chiblet.species.rarity}</p>
        </div>

        {/* Stats Numbers */}
        <div className="px-6 pb-4 space-y-3">
          {/* Speed */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Speed</span>
            <span className="text-sm font-bold text-gray-800">{speed}</span>
          </div>
          
          {/* Strength */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Strength</span>
            <span className="text-sm font-bold text-gray-800">{strength}</span>
          </div>
          
          {/* Stamina */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Stamina</span>
            <span className="text-sm font-bold text-gray-800">{stamina}</span>
          </div>
        </div>

        {/* Energy */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Energy</span>
            <span className="text-sm text-gray-600">{chiblet.currentEnergy}/{chiblet.maxEnergy} ⚡</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(chiblet.currentEnergy / chiblet.maxEnergy) * 100}%` }}
            />
          </div>
        </div>

        {/* XP */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Level {chiblet.level}{levelInfo.isMaxLevel ? ' (MAX)' : ` / ${levelInfo.maxLevel}`}
            </span>
            <span className="text-sm text-gray-600">
              {levelInfo.isMaxLevel ? 'Max Level!' : `${chiblet.experience}/${levelInfo.expForNext} XP`}
            </span>
          </div>
          {!levelInfo.isMaxLevel && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((chiblet.experience / levelInfo.expForNext) * 100, 100)}%` }}
              />
            </div>
          )}
          {levelInfo.isMaxLevel && (
            <div className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full h-2"></div>
          )}
        </div>

        {/* Battle Info */}
        <div className="p-6 pt-0">
          {levelInfo.canLevelUp ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-green-700 font-medium text-center">
                ✨ Ready to Level Up!
              </p>
              <p className="text-green-600 text-sm text-center mt-1">
                This chiblet will level up after the next battle victory!
              </p>
            </div>
          ) : levelInfo.isMaxLevel ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-700 font-medium text-center">
                🏆 Maximum Level Reached!
              </p>
              <p className="text-yellow-600 text-sm text-center mt-1">
                This chiblet has reached its full potential.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-700 font-medium text-center">
                ⚔️ Win PvP Battles to Gain XP
              </p>
              <p className="text-blue-600 text-sm text-center mt-1">
                Need {levelInfo.expToNext} more XP to reach level {levelInfo.currentLevel + 1}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
