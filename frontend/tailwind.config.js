/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MoodTune AI primary brand palette
        brand: {
          50:  '#f0f4ff',
          100: '#e0e8ff',
          200: '#c1d0ff',
          300: '#94adff',
          400: '#6080ff',
          500: '#3d5aff',  // Primary brand blue-violet
          600: '#2a3de8',
          700: '#1f2ecc',
          800: '#1a25a6',
          900: '#181f85',
        },
        accent: {
          purple: '#a855f7',
          pink:   '#ec4899',
          cyan:   '#06b6d4',
          lime:   '#84cc16',
          amber:  '#f59e0b',
        },
        dark: {
          900: '#060608',  // Deepest background
          800: '#0d0d14',  // Main background
          700: '#12121c',  // Card background
          600: '#1a1a2e',  // Sidebar / panel
          500: '#22223a',  // Elevated cards
          400: '#2e2e4a',  // Borders
          300: '#3d3d5c',  // Subtle borders
          200: '#6b6b9a',  // Muted text
          100: '#9999cc',  // Secondary text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3d5aff 0%, #a855f7 100%)',
        'gradient-dark':  'linear-gradient(180deg, #0d0d14 0%, #060608 100%)',
        'gradient-card':  'linear-gradient(135deg, rgba(61,90,255,0.1) 0%, rgba(168,85,247,0.05) 100%)',
        'gradient-glow':  'radial-gradient(ellipse at center, rgba(61,90,255,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'brand':   '0 0 30px rgba(61,90,255,0.3)',
        'purple':  '0 0 30px rgba(168,85,247,0.3)',
        'card':    '0 8px 32px rgba(0,0,0,0.4)',
        'player':  '0 -4px 40px rgba(0,0,0,0.6)',
        'glow-sm': '0 0 15px rgba(61,90,255,0.4)',
        'glow-lg': '0 0 60px rgba(61,90,255,0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':    'spin 8s linear infinite',
        'float':        'float 6s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'slide-up':     'slideUp 0.4s ease-out',
        'fade-in':      'fadeIn 0.3s ease-out',
        'scale-in':     'scaleIn 0.3s ease-out',
        'waveform':     'waveform 1.2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(61,90,255,0.4)' },
          '50%':      { boxShadow: '0 0 50px rgba(61,90,255,0.8)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%':      { transform: 'scaleY(1.5)' },
        },
      },
    },
  },
  plugins: [],
}
