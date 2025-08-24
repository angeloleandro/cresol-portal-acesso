

// === CORES CRESOL ===
// Consolidação das cores da marca baseada em tailwind.config.js
export const CRESOL_COLORS = {
  // Cores principais da marca
  primary: {
    DEFAULT: '#F58220',  // Laranja Cresol - cor principal
    50: '#FFF7F0',
    100: '#FFEDD5', 
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F58220',      // Base
    600: '#EA580C',
    700: '#C2410C', 
    800: '#9A3412',
    900: '#7C2D12',
    dark: '#E06D10',     // Hover/Active states
    light: '#FF9A4D',    // Light variant
  },
  
  secondary: {
    DEFAULT: '#005C46',  // Verde Cresol - uso controlado
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#005C46',      // Base
    600: '#004935',
    700: '#003D2C',
    800: '#003124',
    900: '#00281D',
    dark: '#004935',
    light: '#007A5E',
  },
  
  // Sistema de cinzas Cresol (consolidado)
  gray: {
    DEFAULT: '#727176',   // Cinza médio padrão
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
    light: '#D0D0CE',    // Cinza claro
    dark: '#4A4A4A',     // Cinza escuro
  },
  
  // Cores semânticas
  success: {
    DEFAULT: '#22C55E',
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  
  warning: {
    DEFAULT: '#F59E0B',
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  
  error: {
    DEFAULT: '#EF4444',
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  
  info: {
    DEFAULT: '#3B82F6',
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  
  // Cores neutras
  neutral: {
    DEFAULT: '#FFFFFF',
    black: '#000000',
    white: '#FFFFFF',
  },
} as const;

// === ESPAÇAMENTO ===
// Sistema 4px baseado na análise de hardcoded encontrados
export const CRESOL_SPACING = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px  - xs
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px  - sm
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px - md
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px - lg
  5: '1.25rem',     // 20px - xl
  6: '1.5rem',      // 24px - 2xl
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px - 3xl
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px - 4xl
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px - 5xl
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px - 6xl
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// === TAMANHOS PADRONIZADOS ===
// Baseado na análise de w-*, h-* hardcoded
export const CRESOL_SIZES = {
  // Tamanhos de ícones (mais usados identificados)
  icon: {
    xs: 'w-3 h-3',     // 12px - muito pequeno
    sm: 'w-4 h-4',     // 16px - pequeno padrão
    md: 'w-5 h-5',     // 20px - médio padrão  
    lg: 'w-6 h-6',     // 24px - grande
    xl: 'w-8 h-8',     // 32px - extra grande
    '2xl': 'w-10 h-10', // 40px - muito grande
    '3xl': 'w-12 h-12', // 48px - enorme
  },
  
  // Tamanhos de botões (consolidando magic numbers encontrados)
  button: {
    xs: 'px-2 py-1 text-xs',      // Extra pequeno
    sm: 'px-3 py-1.5 text-sm',    // Pequeno
    md: 'px-4 py-2 text-sm',      // Médio padrão
    lg: 'px-6 py-3 text-base',    // Grande
    xl: 'px-8 py-4 text-lg',      // Extra grande
  },
  
  // Tamanhos de spinner (baseado em StandardizedButton)
  spinner: {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  },
  
  // Dimensões comuns
  container: {
    sm: 'max-w-sm',    // 384px
    md: 'max-w-md',    // 448px
    lg: 'max-w-lg',    // 512px
    xl: 'max-w-xl',    // 576px
    '2xl': 'max-w-2xl', // 672px
    '3xl': 'max-w-3xl', // 768px
    '4xl': 'max-w-4xl', // 896px
    '5xl': 'max-w-5xl', // 1024px
    '6xl': 'max-w-6xl', // 1152px
    '7xl': 'max-w-7xl', // 1280px
    full: 'max-w-full',
  },
} as const;

// === BORDAS E RAIOS ===
// Padronização baseada em tailwind.config.js e inconsistências encontradas
export const CRESOL_RADIUS = {
  none: '0',
  xs: '2px',           // Para elementos muito pequenos
  sm: '4px',           // Para badges, tags pequenas
  DEFAULT: '6px',      // PADRÃO DO SISTEMA - usar como padrão
  md: '6px',           // Mesmo que default para consistência
  lg: '8px',           // Para containers maiores
  xl: '12px',          // Para modais, cards grandes
  '2xl': '16px',       // Para elementos de destaque
  full: '9999px',      // Para pills, avatares circulares
} as const;

// === TIPOGRAFIA ===
// Sistema consolidado baseado na análise
export const CRESOL_TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px - padrão
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',      // Padrão
    medium: '500',      // Usado em botões
    semibold: '600',    // Headings
    bold: '700',        // Destaque
    extrabold: '800',
    black: '900',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',      // Padrão
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// === SOMBRAS ===
// Sistema baseado nos tokens existentes de notificações
export const CRESOL_SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// === ANIMAÇÕES ===
// Consolidação baseada em tailwind.config.js
export const CRESOL_ANIMATIONS = {
  duration: {
    0: '0ms',
    75: '75ms',
    100: '100ms',
    150: '150ms',     // Fast - padrão para interactions
    200: '200ms',     // Normal - padrão geral
    300: '300ms',     // Slow
    500: '500ms',     // Slower
    700: '700ms',
    1000: '1000ms',   // 1s
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',  // Do tailwind.config
    snappy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Do tailwind.config
  },
  
  // Classes de transição mais usadas (eliminando hardcode)
  transition: {
    none: 'transition-none',
    all: 'transition-all',
    fast: 'transition-all duration-150 ease-out',    // Mais usado
    normal: 'transition-all duration-200 ease-out',  // Padrão
    slow: 'transition-all duration-300 ease-out',
    colors: 'transition-colors duration-200 ease-out',
    opacity: 'transition-opacity duration-200 ease-out',
    transform: 'transition-transform duration-200 ease-out',
  },
  
  // Animações customizadas do Cresol (do tailwind.config.js)
  keyframes: {
    shimmer: 'animate-shimmer',
    'pulse-slow': 'animate-pulse-slow',
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'scale-in': 'animate-scale-in',
    spin: 'animate-spin',
    pulse: 'animate-pulse',
  },
} as const;

// === Z-INDEX SYSTEM ===
// Sistema de camadas para modais, overlays, etc.
export const CRESOL_Z_INDEX = {
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
} as const;

// === BREAKPOINTS ===
// Sistema responsivo consolidado
export const CRESOL_BREAKPOINTS = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops/desktops)
  xl: '1280px',  // Extra large devices
  '2xl': '1536px', // 2X Extra large devices
} as const;

// === CLASSES UTILITÁRIAS CONSOLIDADAS ===
// Eliminação de hardcode encontrado na auditoria
export const CRESOL_UTILITIES = {
  // Layout
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
    row: 'flex flex-row',
    wrap: 'flex flex-wrap',
  },
  
  // Grid (mais usados)
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-2', 
    cols3: 'grid grid-cols-3',
    cols4: 'grid grid-cols-4',
    responsive2: 'grid grid-cols-1 sm:grid-cols-2',
    responsive3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    responsive4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },
  
  // Espaçamento gap (muito usado, estava hardcoded)
  gap: {
    1: 'gap-1',     // 4px
    2: 'gap-2',     // 8px - comum
    3: 'gap-3',     // 12px - muito comum
    4: 'gap-4',     // 16px - padrão
    6: 'gap-6',     // 24px - comum
    8: 'gap-8',     // 32px - seções
  },
  
  // Classes de espaçamento space-* (encontradas hardcoded)
  space: {
    1: 'space-y-1',
    2: 'space-y-2', 
    3: 'space-y-3',
    4: 'space-y-4',  // Muito comum
    6: 'space-y-6',
    8: 'space-y-8',
  },
} as const;

// === EXPORT PRINCIPAL ===
export const CRESOL_DESIGN_TOKENS = {
  colors: CRESOL_COLORS,
  spacing: CRESOL_SPACING,
  sizes: CRESOL_SIZES,
  radius: CRESOL_RADIUS,
  typography: CRESOL_TYPOGRAPHY,
  shadows: CRESOL_SHADOWS,
  animations: CRESOL_ANIMATIONS,
  zIndex: CRESOL_Z_INDEX,
  breakpoints: CRESOL_BREAKPOINTS,
  utilities: CRESOL_UTILITIES,
} as const;

// === FUNÇÕES UTILITÁRIAS ===
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value = CRESOL_COLORS as any;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getSpacing = (key: keyof typeof CRESOL_SPACING) => {
  return CRESOL_SPACING[key];
};

export const getRadius = (key: keyof typeof CRESOL_RADIUS) => {
  return CRESOL_RADIUS[key];
};

// === TIPOS TYPESCRIPT ===
export type CresolColors = typeof CRESOL_COLORS;
export type CresolSpacing = typeof CRESOL_SPACING;
export type CresolSizes = typeof CRESOL_SIZES;
export type CresolRadius = typeof CRESOL_RADIUS;
export type CresolTypography = typeof CRESOL_TYPOGRAPHY;
export type CresolShadows = typeof CRESOL_SHADOWS;
export type CresolAnimations = typeof CRESOL_ANIMATIONS;
export type CresolZIndex = typeof CRESOL_Z_INDEX;
export type CresolBreakpoints = typeof CRESOL_BREAKPOINTS;
export type CresolUtilities = typeof CRESOL_UTILITIES;
export type CresolDesignTokens = typeof CRESOL_DESIGN_TOKENS;