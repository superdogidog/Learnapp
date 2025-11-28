/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#ff6b6b',
          coral: '#ff7f50',
          dark: '#e85d5d',
        },
        surface: {
          light: '#ffffff',
          dark: '#111827'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.08)',
        dark: '0 10px 30px rgba(15,23,42,0.4)'
      },
      borderRadius: {
        xl: '1rem',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    },
  },
  plugins: [],
};
