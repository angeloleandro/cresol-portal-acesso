

// === QUICK ACCESS COLORS ===
// Cores mais usadas - definidas primeiro para evitar conflitos
// REMOVIDO: Conflito com CRESOL_COLORS export abaixo
// Use CRESOL_COLORS importado de design-tokens em vez disso

// === DESIGN TOKENS ===
// Re-exportação específica para evitar conflitos
export { 
  CRESOL_COLORS,
  CRESOL_SPACING,
  CRESOL_SIZES,
  CRESOL_RADIUS,
  CRESOL_TYPOGRAPHY,
  CRESOL_SHADOWS,
  CRESOL_ANIMATIONS,
  CRESOL_Z_INDEX,
  CRESOL_BREAKPOINTS,
  CRESOL_UTILITIES,
  CRESOL_DESIGN_TOKENS,
  ERROR_MESSAGES as DESIGN_ERROR_MESSAGES
} from '../design-tokens';

// === TIMING CONSTANTS ===
export * from './timing';
export {
  ALERT_TIMING,
  REQUEST_TIMING,
  ANIMATION_TIMING,
  DEBOUNCE_TIMING,
  LOADING_TIMING,
  RETRY_TIMING,
  PERIODIC_TIMING,
  MODAL_TIMING,
  PAGE_TIMING,
  TIMING_CONSTANTS,
  TIMING_HELPERS,
  TIMINGS
} from './timing';

// === EXPLICIT RE-EXPORTS FOR COMPATIBILITY ===
export { CRESOL_COLORS as COLORS } from '../design-tokens';

// === DIMENSIONS ===
export * from './dimensions';
export {
  MODAL_DIMENSIONS,
  MIN_HEIGHTS,
  DROPDOWN_DIMENSIONS,
  FILE_LIMITS,
  MEDIA_DIMENSIONS,
  CHART_DIMENSIONS,
  ALERT_DIMENSIONS,
  INPUT_DIMENSIONS,
  BREAKPOINT_VALUES,
  DIMENSION_CONSTANTS,
  DIMENSION_HELPERS
} from './dimensions';

// === VALIDATION ===
export * from './validation';
export {
  TEXT_LIMITS,
  NUMERIC_LIMITS,
  PAGINATION_LIMITS,
  FILE_VALIDATION,
  VALIDATION_PATTERNS,
  VALIDATION_ERROR_MESSAGES as VALIDATION_MESSAGES,
  INPUT_CONSTRAINTS,
  VALIDATION_CONSTANTS,
  VALIDATION_HELPERS
} from './validation';

// === MESSAGES ===
// Remover export * para evitar conflito ERROR_MESSAGES com collections.ts
export {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES as MESSAGE_ERROR_MESSAGES,
  WARNING_MESSAGES,
  INFO_MESSAGES,
  CONFIRMATION_MESSAGES,
  MESSAGE_CONSTANTS,
  MESSAGE_HELPERS
} from './messages';

// === API CONFIG ===
export * from './api-config';
export {
  HTTP_STATUS,
  API_ENDPOINTS,
  REQUEST_CONFIG,
  RESPONSE_FORMATS,
  CONTENT_TYPES,
  API_ERROR_MESSAGES,
  API_SUCCESS_MESSAGES,
  API_VALIDATION,
  RATE_LIMITS,
  CACHE_CONFIG,
  PAGINATION_CONFIG,
  SORT_CONFIG,
  FILTER_CONFIG,
  LOG_CONFIG,
  API_HELPERS
} from './api-config';

// === EXISTING CONSTANTS (já existentes no projeto) ===
export * from './collections';
export * from './subsector-config';
export * from './video-ui';

// === CONSOLIDATED CONSTANTS OBJECT ===
export const CRESOL_CONSTANTS = {
  // Design System
  design: {
    colors: 'CRESOL_COLORS',
    spacing: 'CRESOL_SPACING',
    sizes: 'CRESOL_SIZES',
    radius: 'CRESOL_RADIUS',
    typography: 'CRESOL_TYPOGRAPHY',
    shadows: 'CRESOL_SHADOWS',
    animations: 'CRESOL_ANIMATIONS',
    zIndex: 'CRESOL_Z_INDEX',
    breakpoints: 'CRESOL_BREAKPOINTS',
    utilities: 'CRESOL_UTILITIES'
  },
  
  // Timing & Performance (usando constantes existentes)
  timing: {
    alerts: 3000,
    requests: 30000,
    animations: 200,
    debounce: 300,
    loading: 1000,
    retry: 1000,
    periodic: 60000,
    modal: 200,
    page: 300
  },
  
  // Layout & Dimensions (usando constantes existentes)
  dimensions: {
    modals: 600,
    minHeights: 400,
    dropdowns: 300,
    fileLimits: 10485760,
    media: 800,
    charts: 400,
    alerts: 60,
    inputs: 40
  },
  
  // Validation & Forms (usando constantes existentes)
  validation: {
    text: 255,
    numeric: 999999,
    pagination: 10,
    files: 10485760,
    patterns: /^[a-zA-Z0-9\s\-_.]+$/,
    messages: 'Validation messages',
    inputs: 'Input constraints'
  },
  
  // User Messages (usando constantes existentes)
  messages: {
    success: 'Operation completed successfully',
    error: 'An error occurred',
    warning: 'Warning message',
    info: 'Information message',
    confirmation: 'Please confirm this action'
  },
  
  // Navigation & URLs (usando constantes existentes)
  routes: {
    api: '/api',
    pages: '/',
    storage: '/storage',
    external: 'https://external.com',
    redirect: '/redirect',
    navigation: '/nav'
  }
} as const;

// === QUICK ACCESS IMPORTS ===
// Para facilitar o uso das constantes mais comuns

// TIMINGS removido - agora importado de timing.ts

// Dimensões mais usadas
export const DIMENSIONS = {
  modalMedium: 600,        // 600px
  modalLarge: 800,         // 800px
  minHeightMedium: 400,    // 400px
  fileMaxSize: 10485760,   // 10MB
  dropdownMaxHeight: 300   // 300px
} as const;

// Limites mais usados
export const LIMITS = {
  titleMax: 255,           // Títulos
  descriptionMax: 500,     // Descrições curtas
  contentMax: 10000,       // Conteúdo longo
  paginationDefault: 10,   // Items per page
  nameMax: 100             // Nomes
} as const;

// === MIGRATION GUIDE ===

export default CRESOL_CONSTANTS;