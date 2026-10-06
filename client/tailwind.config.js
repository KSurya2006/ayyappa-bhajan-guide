/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ayyappa: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        devotional: {
          marigold: '#F59E0B',
          saffron: '#D97706',
          deepOchre: '#9A3412',
          sandalwood: '#FEF9C3',
          sacredBlack: '#1C1917',
          templeRed: '#991B1B',
        }
      },
      fontFamily: {
        telugu: ['"Gautami"', '"Nirmala UI"', '"Tiro Telugu"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
