'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GameButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'legendary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variants = {
  primary: {
    bg: 'bg-gradient-to-b from-blue-400 to-blue-600',
    border: 'border-blue-300',
    shadow: 'shadow-blue-500/50',
    text: 'text-white',
    glow: 'shadow-lg shadow-blue-400/50',
  },
  secondary: {
    bg: 'bg-gradient-to-b from-gray-400 to-gray-600',
    border: 'border-gray-300',
    shadow: 'shadow-gray-500/50',
    text: 'text-white',
    glow: 'shadow-lg shadow-gray-400/50',
  },
  danger: {
    bg: 'bg-gradient-to-b from-red-400 to-red-600',
    border: 'border-red-300',
    shadow: 'shadow-red-500/50',
    text: 'text-white',
    glow: 'shadow-lg shadow-red-400/50',
  },
  success: {
    bg: 'bg-gradient-to-b from-green-400 to-green-600',
    border: 'border-green-300',
    shadow: 'shadow-green-500/50',
    text: 'text-white',
    glow: 'shadow-lg shadow-green-400/50',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-yellow-300 via-orange-400 to-purple-500',
    border: 'border-yellow-300',
    shadow: 'shadow-yellow-500/50',
    text: 'text-white',
    glow: 'shadow-xl shadow-yellow-400/60',
  },
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export default function GameButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}: GameButtonProps) {
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantStyles.bg} ${variantStyles.border} ${variantStyles.text}
        ${sizeStyles}
        relative overflow-hidden
        border-2 rounded-xl font-bold
        transform transition-all duration-200
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={
        !disabled && !loading
          ? {
              scale: 1.05,
              boxShadow: variantStyles.glow,
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={
        !disabled && !loading
          ? { scale: 0.95, transition: { duration: 0.1 } }
          : {}
      }
    >
      {/* Shimmer Effect for Legendary */}
      {variant === 'legendary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
            repeatDelay: 3,
          }}
        />
      )}
      
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Button Content */}
      <span className={`relative z-10 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      
      {/* Bottom Border Highlight */}
      <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-white/30 rounded-full" />
      
      {/* Top Border Highlight */}
      <div className="absolute top-0.5 left-2 right-2 h-0.5 bg-white/20 rounded-full" />
    </motion.button>
  );
}
