'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface GameToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'legendary';
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
}

const types = {
  info: {
    bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    border: 'border-blue-400',
    icon: 'ℹ️',
    textColor: 'text-white',
  },
  success: {
    bg: 'bg-gradient-to-r from-green-500 to-green-600',
    border: 'border-green-400',
    icon: '✅',
    textColor: 'text-white',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    border: 'border-yellow-400',
    icon: '⚠️',
    textColor: 'text-white',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500 to-red-600',
    border: 'border-red-400',
    icon: '❌',
    textColor: 'text-white',
  },
  legendary: {
    bg: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-600',
    border: 'border-yellow-300',
    icon: '⭐',
    textColor: 'text-white',
  },
};

const positions = {
  top: 'top-4',
  bottom: 'bottom-4',
  center: 'top-1/2 -translate-y-1/2',
};

export default function GameToast({
  isOpen,
  onClose,
  message,
  type = 'info',
  duration = 3000,
  position = 'top',
}: GameToastProps) {
  const typeStyles = types[type];
  const positionClass = positions[position];

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (typeof window === 'undefined') return null;

  const toastContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed left-1/2 -translate-x-1/2 ${positionClass} z-50 px-4`}>
          <motion.div
            className={`
              ${typeStyles.bg} ${typeStyles.border} ${typeStyles.textColor}
              border-2 rounded-xl shadow-2xl
              px-6 py-4 max-w-sm
              backdrop-blur-sm
              relative overflow-hidden
            `}
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Legendary Shimmer Effect */}
            {type === 'legendary' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                  repeatDelay: 1,
                }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex items-center space-x-3">
              <div className="text-2xl">{typeStyles.icon}</div>
              <div className="flex-1">
                <p className="font-bold text-sm leading-tight">{message}</p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors ml-2 p-1 hover:bg-white/20 rounded"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Progress Bar for Timed Toasts */}
            {duration > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            )}

            {/* Corner Decorations for Legendary */}
            {type === 'legendary' && (
              <>
                <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-white/40" />
                <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-white/40" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-white/40" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-white/40" />
              </>
            )}

            {/* Top Glow */}
            <div className="absolute top-0 left-2 right-2 h-0.5 bg-white/40 rounded-t-xl" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(toastContent, document.body);
}

// Hook for managing toasts
export function useGameToast() {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'legendary';
    duration?: number;
  }>>([]);

  const showToast = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'legendary' = 'info',
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <GameToast
          key={toast.id}
          isOpen={true}
          onClose={() => closeToast(toast.id)}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
}
