/**
 * Design Tokens - Sistema de Notificações
 * Baseado na identidade visual Cresol com padrões enterprise
 */

export const designTokens = {
  // === COLORS ===
  colors: {
    // Brand Colors (Cresol)
    primary: {
      50: '#FFF7F0',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F58220', // Main brand orange
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    secondary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#005C46', // Main brand green
      600: '#004935',
      700: '#003D2C',
      800: '#003124',
      900: '#00281D',
    },
    
    // Semantic Colors
    success: {
      50: '#F0FDF4',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
    },
    warning: {
      50: '#FFFBEB',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    error: {
      50: '#FEF2F2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
    info: {
      50: '#EFF6FF',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
    },
    
    // Neutral Colors
    gray: {
      50: '#FAFAF9',
      100: '#F5F5F4',
      200: '#E7E5E4',
      300: '#D6D3D1',
      400: '#A8A29E',
      500: '#78716C',
      600: '#57534E',
      700: '#44403C',
      800: '#292524',
      900: '#1C1917',
    },
  },

  // === SPACING ===
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    '4xl': '3rem',   // 48px
    '5xl': '4rem',   // 64px
  },

  // === TYPOGRAPHY ===
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // === BORDERS ===
  borders: {
    radius: {
      sm: '0.25rem',  // 4px
      md: '0.375rem', // 6px
      lg: '0.5rem',   // 8px
      xl: '0.75rem',  // 12px
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '3px',
    },
  },

  // === SHADOWS ===
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // === COMPONENT TOKENS ===
  components: {
    card: {
      background: '#FFFFFF',
      border: '#E7E5E4',
      borderRadius: '0.5rem',
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    
    input: {
      background: '#FFFFFF',
      border: '#D6D3D1',
      borderFocus: '#F58220',
      borderRadius: '0.375rem',
      padding: {
        x: '0.75rem',
        y: '0.5rem',
      },
      fontSize: '0.875rem',
      shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      shadowFocus: '0 0 0 3px rgb(245 130 32 / 0.1)',
    },
    
    button: {
      borderRadius: '0.375rem',
      fontWeight: '500',
      fontSize: '0.875rem',
      padding: {
        sm: { x: '0.75rem', y: '0.375rem' },
        md: { x: '1rem', y: '0.5rem' },
        lg: { x: '1.25rem', y: '0.625rem' },
      },
      shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    
    notification: {
      priority: {
        low: {
          background: '#F0FDF4',
          border: '#BBF7D0',
          text: '#15803D',
          icon: '●',
        },
        normal: {
          background: '#EFF6FF',
          border: '#DBEAFE',
          text: '#1D4ED8',
          icon: '●',
        },
        high: {
          background: '#FFFBEB',
          border: '#FED7AA',
          text: '#B45309',
          icon: '●',
        },
        urgent: {
          background: '#FEF2F2',
          border: '#FECACA',
          text: '#B91C1C',
          icon: '●',
        },
      },
    },
  },

  // === ANIMATION ===
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

// === UTILITY FUNCTIONS ===
export const getColorValue = (path: string) => {
  const keys = path.split('.');
  let value = designTokens.colors as any;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getSpacingValue = (key: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[key];
};