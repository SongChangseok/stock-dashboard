/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          // Modern gradient-based color system
          'primary': {
            50: '#eef2ff',
            100: '#e0e7ff',
            500: '#6366f1',
            600: '#5b21b6',
            700: '#4c1d95',
            900: '#312e81',
          },
          'secondary': {
            50: '#f0fdfa',
            100: '#ccfbf1',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            900: '#064e3b',
          },
          'accent': {
            50: '#fef3c7',
            100: '#fed7aa',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            900: '#92400e',
          },
          'glass': {
            50: 'rgba(255, 255, 255, 0.1)',
            100: 'rgba(255, 255, 255, 0.05)',
            200: 'rgba(255, 255, 255, 0.02)',
            dark: 'rgba(15, 23, 42, 0.8)',
            'dark-light': 'rgba(30, 41, 59, 0.6)',
          },
          // Legacy Spotify colors (for backward compatibility)
          'spotify-green': '#1DB954',
          'spotify-green-hover': '#1ED760',
          'spotify-black': '#000000',
          'spotify-dark-gray': '#121212',
          'spotify-gray': '#1E1E1E',
          'spotify-light-gray': '#B3B3B3',
          'spotify-white': '#FFFFFF'
        },
        backgroundImage: {
          'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          'gradient-secondary': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          'gradient-accent': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        },
        fontFamily: {
          'sans': ['Inter', 'system-ui', 'sans-serif'],
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'float': 'float 6s ease-in-out infinite',
          'glow': 'glow 2s ease-in-out infinite alternate',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          glow: {
            '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' },
            '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)' },
          }
        },
        backdropBlur: {
          xs: '2px',
          sm: '4px',
          md: '8px',
          lg: '16px',
          xl: '24px',
        },
        boxShadow: {
          'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          'glow-primary': '0 0 20px rgba(99, 102, 241, 0.5)',
          'glow-secondary': '0 0 20px rgba(16, 185, 129, 0.5)',
        }
      },
    },
    plugins: [],
  }