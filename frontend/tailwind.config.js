/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d9fe',
          300: '#a3c0fd',
          400: '#759dfa',
          500: '#4875f5',
          600: '#2c53eb',
          700: '#1d3dd4',
          800: '#1933ac',
          900: '#0f1d5e',
          950: '#091038',
        },
        navy: {
          800: '#0d172e',
          900: '#080e1e',
          950: '#040710',
        }
      }
    },
  },
  plugins: [],
}
