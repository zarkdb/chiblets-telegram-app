'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GameProgressBarProps {
  value: number;
  maxValue: number;
  type?: 'health' | 'energy' | 'xp' | 'mana';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const barTypes = {
  health: {
    bg: 'bg-red-500',
    bgEmpty: 'bg-red-900/50',
    border: 'border-red-400',
    glow: 'shadow-red-500/50',
    text: 'HP',
  },
  energy: {
    bg: 'bg-blue-500',
    bgEmpty: 'bg-blue-900/50',
    border: 'border-blue-400',
    glow: 'shadow-blue-500/50',
    text: 'EN',
  },
  xp: {
    bg: 'bg-green-500',
    bgEmpty: 'bg-green-900/50',
    border: 'border-green-400',
    glow: 'shadow-green-500/50',
    text: 'XP',
  },
  mana: {
    bg: 'bg-purple-500',
    bgEmpty: 'bg-purple-900/50',
    border: 'border-purple-400',
    glow: 'shadow-purple-500/50',
    text: 'MP',
  },
};

const sizes = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export default function GameProgressBar({
  value,
  maxValue,
  type = 'health',
  size = 'md',
  showText = true,
  animated = true,
  className = '',
}: GameProgressBarProps) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const barStyle = barTypes[type];
  const sizeStyle = sizes[size];

  return (
    <div className={`relative ${className}`}>
      {/* Text Display */}
      {showText && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-gray-700">{barStyle.text}</span>
          <span className="text-xs font-mono text-gray-600">
            {Math.round(value)}/{Math.round(maxValue)}
          </span>
        </div>
      )}
      
      {/* Progress Bar Container */}
      <div className={`
        relative w-full ${sizeStyle} 
        ${barStyle.bgEmpty} ${barStyle.border}
        border rounded-full overflow-hidden
        shadow-inner
      `}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        
        {/* Progress Fill */}
        <motion.div
          className={`
            absolute left-0 top-0 bottom-0 
            ${barStyle.bg}
            rounded-full
            shadow-sm
          `}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
        >
          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'linear',
              repeatDelay: 1,
            }}
          />
          
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 rounded-full" />
        </motion.div>
        
        {/* Critical Health Warning */}
        {type === 'health' && percentage <= 25 && (
          <motion.div
            className="absolute inset-0 bg-red-500/30 rounded-full"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
        
        {/* Outer Glow for Full Bars */}
        {percentage >= 100 && (
          <motion.div
            className={`absolute inset-0 ${barStyle.glow} shadow-md rounded-full`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
        
        {/* Tick Marks */}
        <div className="absolute inset-0 flex items-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-px h-full bg-black/20"
              style={{ marginLeft: `${(i + 1) * 20}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
