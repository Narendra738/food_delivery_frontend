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
        primary: '#E23744',
        backgroundLight: '#FFFFFF',
        backgroundDark: '#121212',
        cardLight: '#FFFFFF',
        cardDark: '#1E1E1E',
        textPrimary: '#1C1C1C',
        textSecondary: '#6B6B6B',
      },
    },
  },
  plugins: [],
}
