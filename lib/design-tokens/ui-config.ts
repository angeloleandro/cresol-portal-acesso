/**
 * CRESOL PORTAL - CONFIGURAÇÕES DE COMPONENTES UI
 * 
 * Configurações específicas de componentes baseadas no sistema de design tokens
 * Elimina magic numbers e padroniza comportamentos de UI
 * Baseado na análise de componentes padronizados existentes
 */

import { CRESOL_COLORS } from './design-tokens';

// === DESIGN TOKENS CSS VARIABLES ===
// Converte design tokens para CSS variables para uso consistente
const CSS_VARS = {
  primary: CRESOL_COLORS.primary.DEFAULT,
  primaryHover: CRESOL_COLORS.primary.dark,
  secondary: CRESOL_COLORS.secondary.DEFAULT,
  secondaryHover: CRESOL_COLORS.secondary.dark,
  white: CRESOL_COLORS.neutral.white,
  black: CRESOL_COLORS.neutral.black,
  grayDefault: CRESOL_COLORS.gray.DEFAULT,
  grayLight: CRESOL_COLORS.gray[100],
  grayMedium: CRESOL_COLORS.gray[300],
  grayDark: CRESOL_COLORS.gray[700],
  success: CRESOL_COLORS.success.DEFAULT,
  successHover: CRESOL_COLORS.success[600],
  warning: CRESOL_COLORS.warning.DEFAULT,
  warningHover: CRESOL_COLORS.warning[600],
  error: CRESOL_COLORS.error.DEFAULT,
  errorHover: CRESOL_COLORS.error[600],
} as const;

// === CONFIGURAÇÕES DE BOTÃO ===
// Baseado no StandardizedButton.tsx existente (excelente implementação)
export const BUTTON_CONFIG = {
  // Classes base para todos os botões (eliminando hardcode de StandardizedButton)
  base: `font-medium transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md`,
  
  // Tamanhos (consolidando magic numbers identificados)
  sizes: {
    xs: {
      classes: 'px-2 py-1 text-xs',
      iconSize: 'w-3 h-3',
      spinnerSize: 'w-3 h-3',
    },
    sm: {
      classes: 'px-3 py-1.5 text-sm',
      iconSize: 'w-4 h-4',
      spinnerSize: 'w-4 h-4',
    },
    md: {
      classes: 'px-4 py-2 text-sm',
      iconSize: 'w-5 h-5',
      spinnerSize: 'w-4 h-4',
    },
    lg: {
      classes: 'px-6 py-3 text-base',
      iconSize: 'w-6 h-6',
      spinnerSize: 'w-5 h-5',
    },
    xl: {
      classes: 'px-8 py-4 text-lg',
      iconSize: 'w-8 h-8',
      spinnerSize: 'w-6 h-6',
    },
  },
  
  // Variantes (baseado na implementação existente - 9 variantes)
  variants: {
    primary: {
      classes: `bg-primary text-white hover:bg-primary-dark focus:ring-primary/20 rounded-md`,
      colors: {
        background: CSS_VARS.primary,
        backgroundHover: CSS_VARS.primaryHover,
        text: CSS_VARS.white,
        focus: `${CSS_VARS.primary}33`, // 20% opacity
      },
    },
    secondary: {
      classes: `bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary/20 rounded-md`,
      colors: {
        background: CSS_VARS.white,
        backgroundHover: CSS_VARS.grayLight,
        text: CSS_VARS.grayDark,
        border: CSS_VARS.grayMedium,
        focus: `${CSS_VARS.primary}33`,
      },
    },
    danger: {
      classes: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20 rounded-md`,
      colors: {
        background: CSS_VARS.error,
        backgroundHover: CSS_VARS.errorHover,
        text: CSS_VARS.white,
        focus: `${CSS_VARS.error}33`,
      },
    },
    outline: {
      classes: `bg-transparent text-primary border border-primary hover:bg-primary hover:text-white focus:ring-primary/20 rounded-md`,
      colors: {
        background: 'transparent',
        backgroundHover: CSS_VARS.primary,
        text: CSS_VARS.primary,
        textHover: CSS_VARS.white,
        border: CSS_VARS.primary,
        focus: `${CSS_VARS.primary}33`,
      },
    },
    ghost: {
      classes: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500/20 rounded-md',
      colors: {
        background: 'transparent',
        backgroundHover: CSS_VARS.grayLight,
        text: CSS_VARS.grayDefault,
        focus: `${CSS_VARS.grayDefault}33`,
      },
    },
    link: {
      classes: 'bg-transparent text-primary underline-offset-4 hover:underline focus:ring-primary/20 rounded-md',
      colors: {
        background: 'transparent',
        text: CSS_VARS.primary,
        focus: `${CSS_VARS.primary}33`,
      },
    },
    success: {
      classes: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/20 rounded-md',
      colors: {
        background: CSS_VARS.success,
        backgroundHover: CSS_VARS.successHover,
        text: CSS_VARS.white,
        focus: `${CSS_VARS.success}33`,
      },
    },
    warning: {
      classes: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500/20 rounded-md',
      colors: {
        background: CSS_VARS.warning,
        backgroundHover: CSS_VARS.warningHover,
        text: CSS_VARS.white,
        focus: `${CSS_VARS.warning}33`,
      },
    },
    info: {
      classes: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/20 rounded-md',
      colors: {
        background: CRESOL_COLORS.info.DEFAULT,
        backgroundHover: CRESOL_COLORS.info[600],
        text: CSS_VARS.white,
        focus: `${CRESOL_COLORS.info.DEFAULT}33`,
      },
    },
  },
  
  // Configurações de estado
  states: {
    loading: {
      cursor: 'cursor-not-allowed',
      opacity: 'opacity-75',
      disabled: true,
    },
    disabled: {
      cursor: 'cursor-not-allowed',
      opacity: 'opacity-50',
    },
  },
} as const;

// === CONFIGURAÇÕES DE CARD ===
// Baseado no StandardizedCard.tsx existente
export const CARD_CONFIG = {
  // Classes base (eliminando hardcode de bg-white border border-gray-200 rounded-lg)
  base: 'bg-white border border-gray-200 rounded-lg shadow-sm',
  
  // Tamanhos de padding (consolidando p-4, p-6, p-12 encontrados)
  padding: {
    none: '',
    sm: 'p-4',    // 16px
    md: 'p-6',    // 24px - padrão
    lg: 'p-8',    // 32px
    xl: 'p-12',   // 48px
  },
  
  // Variantes de hover
  variants: {
    default: '',
    hover: 'hover:shadow-md transition-shadow duration-200',
    clickable: 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
  },
  
  // Configurações de layout interno
  layout: {
    header: 'flex items-center justify-between mb-4',
    body: 'flex-1',
    footer: 'mt-6 pt-4 border-t border-gray-100',
    divider: 'border-t border-gray-100 my-4',
  },
} as const;

// === CONFIGURAÇÕES DE INPUT (CHAKRA UI V3) ===
// Padrão baseado no Chakra UI v3 para eliminação de inputs inconsistentes
export const INPUT_CONFIG = {
  // Classes base (consolidando "w-full border rounded-md px-3 py-2")
  base: 'w-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
  
  // Variantes Chakra UI v3
  variants: {
    outline: {
      classes: 'border rounded-md bg-transparent',
      states: {
        default: 'border-gray-300 focus:border-primary focus:ring-primary/20',
        error: 'border-red-300 focus:border-red-500 focus:ring-red-100',
        success: 'border-green-300 focus:border-green-500 focus:ring-green-100',
        disabled: 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed',
      },
    },
    filled: {
      classes: 'border-0 rounded-md bg-gray-100',
      states: {
        default: 'focus:bg-gray-50 focus:ring-primary/20',
        error: 'bg-red-50 focus:bg-red-50 focus:ring-red-100',
        success: 'bg-green-50 focus:bg-green-50 focus:ring-green-100',
        disabled: 'bg-gray-100 text-gray-500 cursor-not-allowed',
      },
    },
    flushed: {
      classes: 'border-0 border-b-2 rounded-none bg-transparent px-0',
      states: {
        default: 'border-b-gray-300 focus:border-b-primary focus:ring-0',
        error: 'border-b-red-300 focus:border-b-red-500 focus:ring-0',
        success: 'border-b-green-300 focus:border-b-green-500 focus:ring-0',
        disabled: 'border-b-gray-200 text-gray-500 cursor-not-allowed',
      },
    },
    unstyled: {
      classes: 'border-0 rounded-none bg-transparent px-0 focus:ring-0',
      states: {
        default: '',
        error: '',
        success: '',
        disabled: 'text-gray-500 cursor-not-allowed',
      },
    },
  },
  
  // Tamanhos Chakra UI v3
  sizes: {
    xs: {
      classes: 'px-2 py-1 text-xs h-6',
      iconSize: 'w-3 h-3',
    },
    sm: {
      classes: 'px-3 py-1.5 text-sm h-8',
      iconSize: 'w-4 h-4',
    },
    md: {
      classes: 'px-3 py-2 text-sm h-10',    // Padrão
      iconSize: 'w-5 h-5',
    },
    lg: {
      classes: 'px-4 py-3 text-base h-12',
      iconSize: 'w-6 h-6',
    },
  },
  
  // InputGroup configuration
  group: {
    base: 'relative flex items-stretch',
    addon: {
      base: 'inline-flex items-center px-3 border border-gray-300 bg-gray-50 text-gray-500 text-sm',
      left: 'rounded-l-md border-r-0',
      right: 'rounded-r-md border-l-0',
    },
    element: {
      base: 'absolute flex items-center justify-center pointer-events-none',
      left: 'left-0 pl-3',
      right: 'right-0 pr-3',
      interactive: 'pointer-events-auto cursor-pointer',
    },
  },
  
  // Tipos especiais
  types: {
    search: {
      paddingLeft: 'pl-10',
      iconPosition: 'left',
    },
    password: {
      paddingRight: 'pr-10',
      iconPosition: 'right',
    },
  },
  
  // Labels (eliminando hardcode de "text-sm font-medium text-neutral-700")
  label: {
    default: 'block text-sm font-medium text-gray-700 mb-1',
    required: 'block text-sm font-medium text-gray-700 mb-1 after:content-["*"] after:ml-0.5 after:text-red-500',
    optional: 'block text-sm font-medium text-gray-500 mb-1',
  },
  
  // Help text e erros
  help: {
    default: 'mt-1 text-xs text-gray-500',
    error: 'mt-1 text-xs text-red-600',
    success: 'mt-1 text-xs text-green-600',
  },
  
  // Field wrapper (Chakra UI v3 Field component)
  field: {
    base: 'space-y-1',
    label: 'block text-sm font-medium text-gray-700',
    helpText: 'text-xs text-gray-500',
    errorText: 'text-xs text-red-600',
    requiredIndicator: 'text-red-500 ml-1',
  },
} as const;

// === CONFIGURAÇÕES DE MODAL ===
// Criando padrão unificado para modais (gap identificado)
export const MODAL_CONFIG = {
  // Overlay
  overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
  
  // Container do modal
  container: {
    base: 'bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transition-all duration-200',
    sizes: {
      sm: 'max-w-sm',
      md: 'max-w-md',   // Padrão
      lg: 'max-w-lg', 
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      full: 'max-w-full h-full',
    },
  },
  
  // Layout interno
  layout: {
    header: 'px-6 py-4 border-b border-gray-200',
    body: 'px-6 py-4',
    footer: 'px-6 py-4 border-t border-gray-200 flex justify-end space-x-2',
  },
  
  // Título
  title: {
    default: 'text-lg font-semibold text-gray-900',
    center: 'text-lg font-semibold text-gray-900 text-center',
  },
  
  // Animações
  animations: {
    enter: 'animate-scale-in',
    exit: 'animate-fade-out',
  },
} as const;

// === CONFIGURAÇÕES DE SPINNER ===
// Baseado no StandardizedSpinner.tsx (eliminando cores hardcoded)
export const SPINNER_CONFIG = {
  // Tamanhos (consolidando w-4 h-4, w-5 h-5, etc.)
  sizes: {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-6 h-6',   // Padrão
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  },
  
  // Configurações de cor por contexto (eliminando hardcode do StandardizedSpinner)
  contexts: {
    home: {
      color: CSS_VARS.primary,
      trackColor: `${CSS_VARS.primary}33`, // 20% opacity
    },
    admin: {
      color: CSS_VARS.grayDefault,
      trackColor: `${CSS_VARS.grayDefault}33`, // 20% opacity
    },
    light: {
      color: CSS_VARS.white,
      trackColor: `${CSS_VARS.white}33`,
    },
    dark: {
      color: CRESOL_COLORS.gray[800],
      trackColor: `${CRESOL_COLORS.gray[800]}33`,
    },
  },
  
  // Classes base
  base: 'animate-spin',
  
  // Posicionamento para botões
  position: {
    left: 'mr-2',
    right: 'ml-2',
    center: 'mx-auto',
  },
  
  // Overlay para fullscreen spinner
  overlay: {
    background: `${CSS_VARS.grayDefault}4D`, // 30% opacity
  },
  
  // Classes para spinner inline (eliminando hardcode)
  inline: {
    classes: 'border-2 border-current border-t-transparent rounded-full animate-spin',
  },
} as const;

// === CONFIGURAÇÕES DE BADGE/TAG ===
// Padrão para status indicators (gap identificado)
export const BADGE_CONFIG = {
  // Classes base
  base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  
  // Tamanhos
  sizes: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',  // Padrão
    lg: 'px-3 py-1 text-sm',
  },
  
  // Variantes por status
  variants: {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  },
  
  // Com ponto de status
  dot: {
    base: 'flex items-center',
    dot: 'w-1.5 h-1.5 rounded-full mr-1.5',
    colors: {
      primary: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500', 
      error: 'bg-red-500',
      info: 'bg-blue-500',
    },
  },
} as const;

// === CONFIGURAÇÕES DE TABELA ===
// Padrão para tabelas (gap identificado)
export const TABLE_CONFIG = {
  // Container
  container: 'overflow-x-auto',
  wrapper: 'min-w-full',
  
  // Tabela principal
  table: 'min-w-full divide-y divide-gray-200',
  
  // Header
  header: {
    row: 'bg-gray-50',
    cell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  },
  
  // Body
  body: {
    base: 'bg-white divide-y divide-gray-200',
    row: 'hover:bg-gray-50 transition-colors duration-150',
    cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  },
  
  // Estados
  states: {
    selected: 'bg-primary/5',
    disabled: 'opacity-50 cursor-not-allowed',
  },
} as const;

// === CONFIGURAÇÕES DE FORMULÁRIO ===
// Layout padronizado para formulários
export const FORM_CONFIG = {
  // Container do formulário
  container: 'space-y-6',
  
  // Grupos de campos (eliminando hardcode de "space-y-4")
  fieldGroup: 'space-y-4',
  
  // Grid de campos (eliminando grid hardcoded)
  grid: {
    single: 'grid-cols-1',
    double: 'grid-cols-1 md:grid-cols-2',
    triple: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    gap: 'gap-4',
  },
  
  // Ações do formulário
  actions: {
    container: 'flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6',
    left: 'flex justify-start space-x-3 pt-6 border-t border-gray-200 mt-6',
    center: 'flex justify-center space-x-3 pt-6 border-t border-gray-200 mt-6',
    between: 'flex justify-between pt-6 border-t border-gray-200 mt-6',
  },
} as const;

// === EXPORT PRINCIPAL ===
export const CRESOL_UI_CONFIG = {
  button: BUTTON_CONFIG,
  card: CARD_CONFIG,
  input: INPUT_CONFIG,
  modal: MODAL_CONFIG,
  spinner: SPINNER_CONFIG,
  badge: BADGE_CONFIG,
  table: TABLE_CONFIG,
  form: FORM_CONFIG,
} as const;

// === TIPOS TYPESCRIPT ===
export type ButtonConfig = typeof BUTTON_CONFIG;
export type CardConfig = typeof CARD_CONFIG;
export type InputConfig = typeof INPUT_CONFIG;
export type ModalConfig = typeof MODAL_CONFIG;
export type SpinnerConfig = typeof SPINNER_CONFIG;
export type BadgeConfig = typeof BADGE_CONFIG;
export type TableConfig = typeof TABLE_CONFIG;
export type FormConfig = typeof FORM_CONFIG;
export type CresolUIConfig = typeof CRESOL_UI_CONFIG;