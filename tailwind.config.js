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
          DEFAULT: '#F58220', // Laranja Cresol
          dark: '#E06D10', 
          light: '#FF9A4D',
        },
        secondary: {
          DEFAULT: '#005C46', // Verde Cresol - uso limitado conforme solicitado
          dark: '#004935',
          light: '#007A5E',
        },
        cresol: {
          orange: '#F58220',     // Laranja Cresol
          green: '#005C46',      // Verde Cresol
          gray: {
            DEFAULT: '#727176',  // Cinza médio
            light: '#D0D0CE',    // Cinza claro
          },
          black: '#000000',      // Preto
          white: '#FFFFFF',      // Branco
        },
      },
    },
  },
  plugins: [],
}