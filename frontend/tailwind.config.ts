import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Indigo Night brand palette
        brand: {
          DEFAULT: '#4F46E5',
          light: '#818CF8',
          lighter: '#A5B4FC',
          dark: '#3730A3',
        },
        // Legacy primary alias (keep for backwards compat)
        primary: {
          DEFAULT: '#4F46E5',
          light: '#818CF8',
          dark: '#3730A3',
        },
        accent: '#F59E0B',
        // Light mode surfaces
        surface: '#F8FAFC',
        'surface-2': '#FFFFFF',
        border: '#E2E8F0',
        'primary-dark': '#0F172A',
        // Semantic colors
        income: '#10B981',
        expense: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        heading: ['"Fira Code"', 'monospace'],
        body: ['Inter', '"Fira Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'count-up': 'count-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
