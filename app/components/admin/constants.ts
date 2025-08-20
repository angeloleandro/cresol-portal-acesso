// Constantes de design system para páginas administrativas
import { CRESOL_COLORS } from '@/lib/design-tokens';

export const DESIGN_TOKENS = {
  // Cores Cresol - Usando design tokens centralizados
  colors: {
    gray: CRESOL_COLORS.gray
  },

  // Espaçamentos
  spacing: {
    xs: '0.25rem',    // 1
    sm: '0.5rem',     // 2
    md: '1rem',       // 4
    lg: '1.5rem',     // 6
    xl: '2rem',       // 8
    xxl: '3rem'       // 12
  },

  // Typography
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },

  // Arredondamento
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem'     // 12px
  },

  // Shadows
  boxShadow: {
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }
};

// Configurações padrão
export const DEFAULT_CONFIG = {
  // Layout
  maxWidth: '1280px',      // max-w-7xl
  contentPadding: {
    mobile: '1rem',        // px-4
    tablet: '1.5rem',      // sm:px-6
    desktop: '2rem'        // lg:px-8
  },
  
  // Animações
  transitions: {
    slow: '300ms'
  },

  // Breakpoints
  breakpoints: {
    xl: '1280px'
  }
};

// Ícones padrão para diferentes contextos
export const DEFAULT_ICONS = {
  loading: 'arrow-path'
};

// Mensagens padrão
export const DEFAULT_MESSAGES = {
  unsavedChanges: 'Você tem alterações não salvas. Deseja continuar?'
};