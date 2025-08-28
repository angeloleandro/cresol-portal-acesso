/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
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
            dark: '#4A4A4A',     // Cinza escuro
          },
          black: '#000000',      // Preto
          white: '#FFFFFF',      // Branco
        },
        // Sistema unificado de hover para cards
        'card-hover': '#A3A3A3', // Cinza ainda mais claro para melhor visibilidade
        // Cores alias para compatibilidade
        'cresol-gray': '#727176',
        'cresol-gray-light': '#D0D0CE',
        'cresol-gray-dark': '#4A4A4A',
        'primary-dark': '#E06D10',
        'secondary-dark': '#004935',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.9)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1)' 
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'snappy': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      // Design System - Border Radius Standardization
      // Baseado na análise da imagem de referência
      borderRadius: {
        'none': '0px',
        'xs': '2px',     // Para elementos muito pequenos
        'sm': '4px',     // Para badges, tags
        'DEFAULT': '6px', // Padrão para botões, cards, inputs
        'md': '6px',     // Padrão principal do design system
        'lg': '8px',     // Para containers maiores
        'xl': '12px',    // Para modais, grandes containers
        '2xl': '16px',   // Para elementos de destaque
        'full': '9999px' // Para pills, avatares
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        
        /* Enhanced Cresol Scrollbar Utilities - THICK SCROLLBARS */
        '.scrollbar-thin': {
          'scrollbar-width': 'auto',  /* Changed from thin to auto for thickness */
          'scrollbar-color': 'var(--scrollbar-bg-thumb) transparent',
        },
        
        /* Force thick scrollbars globally */
        '.scrollbar-default': {
          'scrollbar-width': 'auto !important',
          'scrollbar-color': 'var(--scrollbar-bg-thumb) transparent',
        },
        
        '.scrollbar-branded': {
          'scrollbar-width': 'auto',  /* Changed from thin to auto for thickness */
          'scrollbar-color': 'var(--scrollbar-brand-thumb) var(--scrollbar-brand-track)',
        },
        
        '.scrollbar-modal': {
          'scrollbar-width': 'auto',  /* Changed from thin to auto for thickness */
          'scrollbar-color': 'var(--scrollbar-bg-thumb) transparent',
        },
        
        '.scrollbar-accent': {
          'scrollbar-width': 'auto',  /* Changed from thin to auto for thickness */
          'scrollbar-color': 'var(--scrollbar-accent-thumb) transparent',
        },
        
        '.scrollbar-thick': {
          'scrollbar-width': 'auto',
          'scrollbar-color': 'var(--scrollbar-bg-thumb) transparent',
        },
        
        '.scrollbar-auto-hide': {
          'scrollbar-width': 'auto',  /* Changed from thin to auto for consistency */
          'scrollbar-color': 'transparent transparent',
        }
      })
    }
  ],
}