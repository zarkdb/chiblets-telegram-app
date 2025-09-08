'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GameCardProps {
  children: React.ReactNode;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
  onClick?: () => void;
  className?: string;
}

const rarities = {
  common: {
    bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
    border: 'border-gray-300',
    glow: 'shadow-gray-400/30',
    shine: 'from-transparent via-white/20 to-transparent',
  },
  uncommon: {
    bg: 'bg-gradient-to-br from-green-100 to-green-200',
    border: 'border-green-400',
    glow: 'shadow-green-400/50',
    shine: 'from-transparent via-green-200/30 to-transparent',
  },
  rare: {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
    border: 'border-blue-400',
    glow: 'shadow-blue-400/50',
    shine: 'from-transparent via-blue-200/30 to-transparent',
  },
  epic: {
    bg: 'bg-gradient-to-br from-purple-100 to-purple-200',
    border: 'border-purple-400',
    glow: 'shadow-purple-400/50',
    shine: 'from-transparent via-purple-200/30 to-transparent',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-400/60',
    shine: 'from-transparent via-yellow-200/40 to-transparent',
  },
};

const sizes = {
  sm: 'p-3 rounded-lg',
  md: 'p-4 rounded-xl',
  lg: 'p-6 rounded-2xl',
};

export default function GameCard({
  children,
  rarity = 'common',
  size = 'md',
  glowing = false,
  onClick,
  className = '',
}: GameCardProps) {
  const rarityStyles = rarities[rarity];
  const sizeStyles = sizes[size];
  const isInteractive = !!onClick;

  return (
    <motion.div
      onClick={onClick}
      className={`
        relative overflow-hidden
        ${rarityStyles.bg} ${rarityStyles.border}
        border-2 ${sizeStyles}
        ${isInteractive ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={
        isInteractive
          ? {
              scale: 1.03,
              boxShadow: `0 8px 32px ${rarityStyles.glow}`,
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={isInteractive ? { scale: 0.98 } : {}}
      animate={
        glowing
          ? {
              boxShadow: [
                `0 4px 16px ${rarityStyles.glow}`,
                `0 8px 32px ${rarityStyles.glow}`,
                `0 4px 16px ${rarityStyles.glow}`,
              ],
            }
          : {}
      }
      transition={
        glowing
          ? {
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
            }
          : {}
      }
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-black/10 via-transparent to-black/10" />
        {/* Dot pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        />
      </div>

      {/* Rarity Indicator */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${rarityStyles.border} border`}>
        <div className={`w-full h-full rounded-full ${rarityStyles.bg}`} />
      </div>

      {/* Legendary Shimmer Effect */}
      {rarity === 'legendary' && (
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${rarityStyles.shine} -skew-x-12`}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
            repeatDelay: 2,
          }}
        />
      )}

      {/* Hover Shine Effect */}
      {isInteractive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0"
          whileHover={{ opacity: 1, x: '200%' }}
          initial={{ x: '-100%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      {/* Corner Decorations for High Rarity */}
      {(rarity === 'epic' || rarity === 'legendary') && (
        <>
          <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-white/40 rounded-tl" />
          <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-white/40 rounded-tr" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-white/40 rounded-bl" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-white/40 rounded-br" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom Highlight */}
      <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-white/30 rounded-full" />
    </motion.div>
  );
}
