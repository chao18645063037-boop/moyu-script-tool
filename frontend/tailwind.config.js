/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0A1628',
        midnightLight: '#112240',
        amber: '#D4A574',
        amberLight: '#E8C59A',
        purple: '#6B4E71',
        purpleLight: '#8B6B94',
        forest: '#2D5A4E',
        forestLight: '#4A7B6A',
        slate: '#334155',
        textPrimary: '#F1F5F9',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Lora', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'typing': 'typing 0.05s steps(1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 165, 116, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 165, 116, 0.8)' },
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
