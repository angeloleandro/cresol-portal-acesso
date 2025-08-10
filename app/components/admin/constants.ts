// Constantes de design system para páginas administrativas

export const DESIGN_TOKENS = {
  // Cores Cresol
  colors: {
    primary: '#F58220', // Laranja Cresol
    primaryDark: '#E6761D',
    secondary: '#005C46', // Verde Cresol
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
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
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
    fast: '150ms',
    normal: '200ms',
    slow: '300ms'
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};

// Ícones padrão para diferentes contextos
export const DEFAULT_ICONS = {
  users: 'user-group',
  sectors: 'building-1',
  subsectors: 'folder',
  notifications: 'mail',
  settings: 'cog',
  analytics: 'chart-bar',
  search: 'magnifying-glass',
  add: 'plus',
  edit: 'pencil',
  delete: 'trash',
  view: 'eye',
  save: 'check',
  cancel: 'x-mark',
  loading: 'arrow-path'
};

// Mensagens padrão
export const DEFAULT_MESSAGES = {
  loading: 'Carregando...',
  error: 'Ocorreu um erro. Tente novamente.',
  success: 'Operação realizada com sucesso!',
  noData: 'Nenhum item encontrado.',
  confirmDelete: 'Tem certeza que deseja excluir este item?',
  unsavedChanges: 'Você tem alterações não salvas. Deseja continuar?'
};