import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Forest Green brand palette
        brand: {
          DEFAULT: '#16a34a',
          light: '#22c55e',
          lighter: '#4ade80',
          dark: '#15803d',
        },
        // Legacy primary alias
        primary: {
          DEFAULT: '#16a34a',
          light: '#22c55e',
          dark: '#15803d',
        },
        accent: '#f59e0b',
        // Surfaces
        surface: '#f8fafc',
        'surface-2': '#ffffff',
        border: '#e2e8f0',
        'primary-dark': '#0f172a',
        // Semantic colors
        income: '#16a34a',
        expense: '#ef4444',
        warning: '#f59e0b',
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
