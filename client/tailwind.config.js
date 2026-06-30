/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        luxury: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // ── Luxury Warm Beige Palette ──────────────────────────────
        lux: {
          bg:        '#F8F4EF', // Main page background
          bg2:       '#FDFBF8', // Alternate section background
          card:      '#FFFFFF', // Card surfaces
          border:    '#ECE3DA', // All dividers & borders
          text:      '#2D241F', // Primary text / headings
          muted:     '#6B625C', // Secondary / body text
          dim:       '#9A8F89', // Placeholder / meta
          accent:    '#C98F7A', // Terracotta accent
          hover:     '#B57A67', // Button hover
          light:     '#F0E6DF', // Soft accent background
          success:   '#5E8B63', // Success states
          danger:    '#C0392B', // Error / danger
          warm:      '#E8DDD5', // Warm grey for skeleton
        },
        // ── Keep legacy tokens for Admin panel backward compat ──────
        surface: {
          950: '#F8F4EF',
          900: '#FDFBF8',
          800: '#FFFFFF',
          700: '#ECE3DA',
          600: '#DDD3C8',
          500: '#C9B8AB',
        },
        accent: {
          DEFAULT: '#C98F7A',
          light:   '#D9A899',
          dark:    '#B57A67',
          glow:    'rgba(201,143,122,0.12)',
        },
        gold: {
          200: '#F0E6DF',
          300: '#E8DDD5',
          400: '#D9A899',
          500: '#C98F7A',
          600: '#B57A67',
        },
        obsidian: {
          950: '#2D241F',
          900: '#3A2E28',
          800: '#4A3D36',
          700: '#5C4E45',
          600: '#6B5E54',
        },
        text: {
          primary:   '#2D241F',
          secondary: '#6B625C',
          muted:     '#9A8F89',
          dim:       '#B8AFA9',
        },
        success: '#5E8B63',
        warning: '#C98F7A',
        danger:  '#C0392B',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease both',
        'slide-up':      'slideUp 0.5s ease both',
        'slide-down':    'slideDown 0.3s ease both',
        'scale-in':      'scaleIn 0.2s ease both',
        'reveal':        'reveal 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':       'shimmer 1.8s ease-in-out infinite',
        'float':         'float 4s ease-in-out infinite',
        'fade-up':       'fadeUp 0.5s ease both',
        'pulse-dot':     'pulseDot 2s ease-in-out infinite',
        'slide-right':   'slideRight 0.35s ease both',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        reveal: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.6', transform: 'scale(1.2)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'warm-sm':  '0 2px 8px rgba(201,143,122,0.10)',
        'warm-md':  '0 4px 20px rgba(201,143,122,0.14)',
        'warm-lg':  '0 8px 40px rgba(201,143,122,0.18)',
        'warm-xl':  '0 16px 60px rgba(201,143,122,0.22)',
        'card':     '0 2px 16px rgba(45,36,31,0.06)',
        'card-hover':'0 8px 32px rgba(45,36,31,0.12)',
        'nav':      '0 4px 24px rgba(45,36,31,0.08)',
      },
    },
  },
  plugins: [],
}