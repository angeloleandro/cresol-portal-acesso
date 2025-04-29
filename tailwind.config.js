/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006938', // Verde Cresol
          dark: '#005529',
          light: '#4C8C73',
        },
        secondary: {
          DEFAULT: '#F18700', // Laranja Cresol
          dark: '#D67700',
          light: '#FFA940',
        },
      },
    },
  },
  plugins: [],
}