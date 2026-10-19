/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bone: {
          DEFAULT: '#e8e0d2',
          dim: '#b9b09c',
          deep: '#7a7365',
        },
        blood: {
          DEFAULT: '#b3403a',
          dim: '#7a2b27',
          deep: '#4a1816',
        },
        fog: '#05060a',
        moon: '#9fb4d6',
        moss: '#5a6f52',
        amber: '#c9a24a',
      },
      fontFamily: {
        display: ['"Cinzel"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 600ms ease-out forwards',
        'fog-drift': 'fogDrift 18s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fogDrift: {
          '0%,100%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(20px) translateY(-10px)' },
        },
        pulseSlow: {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
