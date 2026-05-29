import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        george: {
          yellow: '#FFD600',
          amber: '#FFB300',
          brown: '#8B5E3C',
          light: '#FFF8E1',
          orange: '#FF8F00',
          banana: '#FFE57F',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out both',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'float': 'float 3.5s ease-in-out infinite',
        'float-delayed': 'float 3.5s ease-in-out 1.75s infinite',
        'float-slow': 'float 5s ease-in-out 0.8s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pop': 'pop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'hat-sway': 'hatSway 4s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.5s ease-out infinite',
        'george-bounce': 'georgeBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'pop-up': 'popUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(4deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-8deg)' },
          '50%': { transform: 'rotate(8deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.75)', opacity: '0' },
          '80%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        hatSway: {
          '0%, 100%': { transform: 'rotate(-7deg) translateY(0px)' },
          '50%': { transform: 'rotate(7deg) translateY(-8px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        georgeBounce: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(0.85) rotate(-6deg)' },
          '60%': { transform: 'scale(1.15) rotate(4deg)' },
          '80%': { transform: 'scale(0.97) rotate(-2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        popUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '60%': { opacity: '1', transform: 'translateY(-20px) scale(1.2)' },
          '100%': { opacity: '0', transform: 'translateY(-36px) scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
