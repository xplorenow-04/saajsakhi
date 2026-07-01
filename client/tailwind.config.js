/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          950: '#050505',
          900: '#050505', // bg-obsidian-950
          800: '#0D0D0D', // bg-obsidian-900
          700: '#141414', // bg-obsidian-800
          600: '#1F1F1F', // border-obsidian-700
          500: '#2A2A2A',
        },
        accent: {
          DEFAULT: '#D4AF37', // text-gold-500
          light: '#DFB86C',   // text-gold-400
          dark: '#AA8826',
          glow: 'rgba(212,175,55,0.12)',
        },
        obsidian: {
          950: '#050505',
          900: '#0D0D0D',
          800: '#141414',
          700: '#1F1F1F',
          600: '#2A2A2A',
        },
        gold: {
          200: '#F3E7C4',
          300: '#EAD2AC',
          400: '#DFB86C',
          500: '#D4AF37',
          600: '#AA8826',
        },
        violet: {
          DEFAULT: '#AA8826',
          light: '#DFB86C',
        },
        text: {
          primary: '#FFFDF0',
          secondary: '#EAD2AC',
          muted: '#8A8A8A',
          dim: '#5A5A5A',
        },
        success: '#D4AF37', // Aligning success with gold as well or keeping green for success
        warning: '#DFB86C',
        danger: '#e05353',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease both',
        'slide-up': 'slideUp 0.3s ease both',
        'slide-down': 'slideDown 0.3s ease both',
        'scale-in': 'scaleIn 0.15s ease both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'typing-blink': 'typingBlink 1.2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'msg-in': 'msgIn 0.2s ease both',
        'ctx-in': 'ctxIn 0.15s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.93) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.15)' },
        },
        typingBlink: {
          '0%, 80%, 100%': { opacity: '0.2' },
          '40%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        msgIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ctxIn: {
          '0%': { opacity: '0', transform: 'scale(0.93) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}