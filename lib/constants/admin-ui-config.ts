

// Layout Constants
export const LAYOUT = {
  SIDEBAR_WIDTH: 256, // w-64 in Tailwind
  HEADER_HEIGHT: 64,  // h-16 in Tailwind
  CONTENT_MAX_WIDTH: 1280, // max-w-7xl
  MOBILE_BREAKPOINT: 768, // md breakpoint
  CARD_PADDING: 24, // p-6
  SECTION_SPACING: 32, // space-y-8
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  MODAL_TRANSITION: 200,
  TOAST_DURATION: 5000,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 10,
  STICKY: 20,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  TOAST: 60,
  TOOLTIP: 70,
} as const;

// Grid and List Configurations
export const GRID_CONFIG = {
  COLUMNS_DESKTOP: 3,
  COLUMNS_TABLET: 2,
  COLUMNS_MOBILE: 1,
  GAP: 24, // gap-6
  MIN_CARD_WIDTH: 300,
} as const;

// Form Configurations
export const FORM_CONFIG = {
  MAX_TITLE_LENGTH: 100,
  MAX_SUMMARY_LENGTH: 200,
  MAX_CONTENT_LENGTH: 5000,
  MIN_PASSWORD_LENGTH: 6,
  DEBOUNCE_DELAY: 500,
} as const;

// Table Configurations
export const TABLE_CONFIG = {
  ROWS_PER_PAGE: 10,
  ROWS_PER_PAGE_OPTIONS: [5, 10, 20, 50],
  COLUMN_MIN_WIDTH: 100,
} as const;

// Modal Sizes
export const MODAL_SIZES = {
  SM: 'max-w-md',
  MD: 'max-w-lg',
  LG: 'max-w-2xl',
  XL: 'max-w-4xl',
  FULL: 'max-w-full',
} as const;

// Button Variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'bg-primary-600 hover:bg-primary-700 text-white',
  SECONDARY: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  DANGER: 'bg-red-600 hover:bg-red-700 text-white',
  SUCCESS: 'bg-green-600 hover:bg-green-700 text-white',
  GHOST: 'hover:bg-gray-100 text-gray-700',
} as const;

// Status Colors
export const STATUS_COLORS = {
  PUBLISHED: 'text-green-600 bg-green-100',
  DRAFT: 'text-gray-600 bg-gray-100',
  FEATURED: 'text-yellow-600 bg-yellow-100',
  ERROR: 'text-red-600 bg-red-100',
  WARNING: 'text-orange-600 bg-orange-100',
  INFO: 'text-blue-600 bg-blue-100',
} as const;

// Icon Sizes
export const ICON_SIZES = {
  XS: 'w-3 h-3',
  SM: 'w-4 h-4',
  MD: 'w-5 h-5',
  LG: 'w-6 h-6',
  XL: 'w-8 h-8',
} as const;

// Loading States
export const LOADING_CONFIG = {
  SKELETON_ANIMATION: 'animate-pulse',
  SPINNER_SIZE: 'w-8 h-8',
  OVERLAY_OPACITY: 'bg-black/50',
  MIN_LOADING_TIME: 300, // Prevent flashing for quick operations
} as const;