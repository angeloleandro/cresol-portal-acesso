/**
 * Video System Design Tokens
 * Enterprise-grade design system for video upload components
 * Based on Chakra UI v3 and Ant Design patterns
 */

export const videoSystemTokens = {
  // Colors - Based on existing Cresol brand
  colors: {
    primary: '#F58220',
    primaryHover: '#E6740F',
    primaryActive: '#D96B00',
    
    success: '#10B981',
    successLight: '#D1FAE5',
    successDark: '#047857',
    
    error: '#EF4444',
    errorLight: '#FEE2E2',
    errorDark: '#DC2626',
    
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningDark: '#D97706',
    
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    infoDark: '#1D4ED8',
    
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  
  // Spacing system (8px base)
  spacing: {
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    10: '2.5rem', // 40px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
  },
  
  // Typography scale
  typography: {
    fontSizes: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    },
  },
  
  // Border radius
  radii: {
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    '2xl': '1rem',  // 16px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Animation durations
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Z-index scale
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

// Component-specific tokens
export const videoComponentTokens = {
  uploadArea: {
    height: '12rem', // 192px
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderColor: videoSystemTokens.colors.neutral[300],
    borderColorHover: videoSystemTokens.colors.primary,
    backgroundColor: videoSystemTokens.colors.neutral[50],
    backgroundColorHover: '#FFF7ED', // primary/5
    padding: videoSystemTokens.spacing[8],
  },
  
  thumbnail: {
    aspectRatio: '16 / 9',
    width: '100%',
    height: '8rem', // 128px
    borderRadius: videoSystemTokens.radii.md,
    borderColor: videoSystemTokens.colors.neutral[200],
  },
  
  form: {
    maxWidth: '42rem', // 672px
    padding: videoSystemTokens.spacing[6],
    backgroundColor: 'white',
    borderRadius: videoSystemTokens.radii.lg,
    borderColor: videoSystemTokens.colors.neutral[200],
    shadow: videoSystemTokens.shadows.sm,
  },
  
  button: {
    primary: {
      backgroundColor: videoSystemTokens.colors.primary,
      backgroundColorHover: videoSystemTokens.colors.primaryHover,
      backgroundColorActive: videoSystemTokens.colors.primaryActive,
      color: 'white',
      paddingX: videoSystemTokens.spacing[6],
      paddingY: videoSystemTokens.spacing[3],
      borderRadius: videoSystemTokens.radii.lg,
      fontWeight: videoSystemTokens.typography.fontWeights.medium,
    },
    
    secondary: {
      backgroundColor: 'white',
      backgroundColorHover: videoSystemTokens.colors.neutral[50],
      backgroundColorActive: videoSystemTokens.colors.neutral[100],
      color: videoSystemTokens.colors.neutral[700],
      borderColor: videoSystemTokens.colors.neutral[300],
      paddingX: videoSystemTokens.spacing[6],
      paddingY: videoSystemTokens.spacing[3],
      borderRadius: videoSystemTokens.radii.lg,
      fontWeight: videoSystemTokens.typography.fontWeights.medium,
    },
  },
  
  input: {
    borderColor: videoSystemTokens.colors.neutral[300],
    borderColorFocus: videoSystemTokens.colors.primary,
    borderRadius: videoSystemTokens.radii.md,
    paddingX: videoSystemTokens.spacing[3],
    paddingY: videoSystemTokens.spacing[2],
    fontSize: videoSystemTokens.typography.fontSizes.base,
  },
  
  progressBar: {
    height: '0.5rem', // 8px
    backgroundColor: videoSystemTokens.colors.neutral[200],
    fillColor: videoSystemTokens.colors.primary,
    borderRadius: videoSystemTokens.radii.full,
  },
} as const

// Accessibility compliance utilities
export const a11yTokens = {
  focusRing: {
    outline: 'none',
    ringWidth: '2px',
    ringColor: `${videoSystemTokens.colors.primary}20`, // 20% opacity
    ringOffset: '2px',
  },
  
  ariaLabels: {
    videoUpload: 'Área de upload de vídeo. Clique ou arraste arquivos aqui',
    thumbnailUpload: 'Upload de thumbnail personalizada',
    videoPreview: 'Preview do vídeo selecionado',
    cropperControls: 'Controles de recorte de imagem',
    progressBar: 'Progresso do upload',
    errorMessage: 'Mensagem de erro',
    successMessage: 'Mensagem de sucesso',
  },
  
  screenReader: {
    hide: 'sr-only', // Screen reader only class
    announce: 'aria-live="polite"',
    alert: 'role="alert" aria-live="assertive"',
  },
} as const

export type VideoSystemTokens = typeof videoSystemTokens
export type VideoComponentTokens = typeof videoComponentTokens
export type A11yTokens = typeof a11yTokens