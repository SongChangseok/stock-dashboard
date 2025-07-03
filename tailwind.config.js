/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          'spotify-green': '#1DB954',
          'spotify-green-hover': '#1ED760',
          'spotify-black': '#000000',
          'spotify-dark-gray': '#121212',
          'spotify-gray': '#1E1E1E',
          'spotify-light-gray': '#B3B3B3',
          'spotify-white': '#FFFFFF'
        },
        fontFamily: {
          'sans': ['Inter', 'system-ui', 'sans-serif'],
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          }
        }
      },
    },
    plugins: [],
  }