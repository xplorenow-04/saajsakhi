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
          900: '#0a0b0f',
          800: '#0e1018',
          700: '#1a1d28',
          600: '#1e2133',
          500: '#252840',
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
          glow: 'rgba(99,102,241,0.15)',
        },
        violet: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
        },
        text: {
          primary: '#f1f2f7',
          secondary: '#c4c6e7',
          muted: '#6b7280',
          dim: '#4a4e6a',
        },
        success: '#22d3a0',
        warning: '#fbbf24',
        danger: '#f87171',
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