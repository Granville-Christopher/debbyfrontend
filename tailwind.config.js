/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'logo': ['Orbitron', 'sans-serif'],
        'tech': ['Rajdhani', 'sans-serif'],
        'display': ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#f0f8ff',
          dark: '#e6f3ff',
          light: '#ffffff',
        },
        aliceblue: '#f0f8ff',
        secondary: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
