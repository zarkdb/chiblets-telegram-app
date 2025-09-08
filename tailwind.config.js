/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          blue: '#0088cc',
          dark: '#1d1d1d',
          light: '#ffffff',
          gray: '#f4f4f4',
          accent: '#3390ec',
        },
        game: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
        },
        chiblet: {
          fire: '#ef4444',
          water: '#3b82f6',
          earth: '#84cc16',
          air: '#06b6d4',
          light: '#fbbf24',
          dark: '#6b7280',
        },
        rarity: {
          common: '#9ca3af',
          rare: '#3b82f6',
          epic: '#8b5cf6',
          legendary: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        game: ['Comic Neue', 'Comic Sans MS', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
