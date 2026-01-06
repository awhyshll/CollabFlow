/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
        },
        dark: {
          bg: '#000000',
          card: '#111111',
          border: '#222222',
          text: '#9ca3af',
          'text-secondary': '#6b7280',
        },
        light: {
          bg: '#e5e5e5',
          card: '#d4d4d4',
          border: '#a3a3a3',
          text: '#171717',
          'text-secondary': '#404040',
        }
      }
    },
  },
  plugins: [],
}
