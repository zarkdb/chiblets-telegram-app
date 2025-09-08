'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GameProgressBar } from '@/components/game-ui';

interface UserHeaderProps {
  user: any;
}

export default function UserHeader({ user }: UserHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-100 safe-area">
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-game-primary to-game-secondary rounded-full flex items-center justify-center flex-shrink-0">
              {user.photoUrl ? (
                <Image 
                  src={user.photoUrl} 
                  alt="Profile" 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {user.firstName?.[0] || user.username?.[0] || '👤'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-800 text-sm truncate">
                {user.firstName || user.username || 'Player'}
              </h1>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-600">Lv.{user.level}</span>
                <span className="text-game-primary font-medium">
                  Stage {user.currentStage || 1}
                </span>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Coins */}
            <motion.div 
              className="flex items-center space-x-1 bg-gradient-to-r from-yellow-100 to-yellow-200 px-3 py-1.5 rounded-xl border border-yellow-300 shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-yellow-500 text-sm">🪙</span>
              <span className="font-bold text-yellow-800 text-sm">
                {user.coins > 999 ? `${Math.floor(user.coins / 1000)}k` : user.coins || '0'}
              </span>
            </motion.div>

            {/* Gems */}
            <motion.div 
              className="flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-1.5 rounded-xl border border-purple-300 shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-purple-500 text-sm">💎</span>
              <span className="font-bold text-purple-800 text-sm">
                {user.gems || '0'}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Experience Bar */}
        <div className="mt-2">
          <GameProgressBar
            value={(user.experience || 0) % 1000}
            maxValue={1000}
            type="xp"
            size="sm"
            showText={true}
            animated={true}
          />
        </div>
      </div>
    </div>
  );
}
