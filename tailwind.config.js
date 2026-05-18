/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00f5ff',
        'neon-green': '#00ff88',
        'neon-red': '#ff0044',
        'neon-yellow': '#ffee00',
        'dark-bg': '#0a0a1a',
        'dark-panel': '#111128',
      },
      fontFamily: {
        game: ['Orbitron', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 0.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 10px #00f5ff, 0 0 20px #00f5ff' },
          '50%': { textShadow: '0 0 20px #00f5ff, 0 0 40px #00f5ff, 0 0 60px #00f5ff' },
        },
      },
    },
  },
  plugins: [],
}
