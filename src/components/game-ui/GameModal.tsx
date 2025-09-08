'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'legendary' | 'error' | 'success';
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const variants = {
  default: {
    bg: 'bg-gradient-to-br from-slate-100 via-white to-slate-200',
    border: 'border-slate-300',
    titleBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    titleText: 'text-white',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-yellow-100 via-orange-50 to-purple-100',
    border: 'border-yellow-400',
    titleBg: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-600',
    titleText: 'text-white',
  },
  error: {
    bg: 'bg-gradient-to-br from-red-100 via-white to-red-200',
    border: 'border-red-400',
    titleBg: 'bg-gradient-to-r from-red-500 to-red-600',
    titleText: 'text-white',
  },
  success: {
    bg: 'bg-gradient-to-br from-green-100 via-white to-green-200',
    border: 'border-green-400',
    titleBg: 'bg-gradient-to-r from-green-500 to-green-600',
    titleText: 'text-white',
  },
};

export default function GameModal({
  isOpen,
  onClose,
  title,
  size = 'md',
  variant = 'default',
  children,
  closeOnBackdrop = true,
}: GameModalProps) {
  const sizeClass = sizes[size];
  const variantStyles = variants[variant];

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (typeof window === 'undefined') return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          >
            {/* Modal Container */}
            <motion.div
              className={`
                relative w-full ${sizeClass} 
                ${variantStyles.bg} ${variantStyles.border}
                border-2 rounded-2xl shadow-2xl
                max-h-[90vh] overflow-hidden
                backdrop-blur-sm
              `}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Legendary Shimmer Effect */}
              {variant === 'legendary' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent -skew-x-12"
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

              {/* Header */}
              {title && (
                <div className={`
                  ${variantStyles.titleBg} ${variantStyles.titleText}
                  px-6 py-4 relative overflow-hidden
                  border-b-2 ${variantStyles.border}
                `}>
                  <div className="relative z-10 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{title}</h2>
                    
                    {/* Close Button */}
                    <button
                      onClick={onClose}
                      className="
                        text-white/80 hover:text-white
                        transition-colors duration-200
                        p-1 rounded-lg hover:bg-white/20
                      "
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Header Glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30" />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 max-h-[calc(90vh-100px)] overflow-y-auto">
                {children}
              </div>

              {/* Corner Decorations */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/30 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/30 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/30 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/30 rounded-br-lg" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
