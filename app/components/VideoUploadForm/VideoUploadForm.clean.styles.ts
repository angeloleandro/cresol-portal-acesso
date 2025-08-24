

export const cleanVideoStyles = {
  // Core neutral color palette
  colors: {
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5', 
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    semantic: {
      error: '#dc2626',
      success: '#16a34a',
    }
  },

  // Typography scale
  typography: {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px  
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
  },

  // Spacing scale
  spacing: {
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
  },

  // Component patterns
  components: {
    // Modal container
    modal: 'bg-white rounded-lg border border-neutral-200 max-w-3xl mx-auto shadow-lg overflow-hidden max-h-[85vh] flex flex-col',
    
    // Header
    header: 'px-6 py-4 border-b border-neutral-200 bg-white flex-shrink-0',
    
    // Form body
    body: 'flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0',
    
    // Footer actions
    footer: 'flex gap-3 justify-end px-6 py-4 border-t border-neutral-200 bg-neutral-50/50 flex-shrink-0',
    
    // Form field
    field: 'space-y-4',
    
    // Label
    label: 'block text-sm font-medium text-neutral-700',
    
    // Required indicator
    required: 'text-red-500 ml-1',
    
    // Input base
    input: `
      w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm 
      placeholder-neutral-400 bg-white focus:outline-none focus:ring-2 
      focus:ring-neutral-500/20 focus:border-neutral-500 hover:border-neutral-400 
      transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed 
      disabled:bg-neutral-50
    `,
    
    // Input error state
    inputError: 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
    
    // Help text
    help: 'text-xs text-neutral-500 mt-1',
    
    // Error message
    error: 'p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800',
    
    // Button primary
    buttonPrimary: `
      px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium
      hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500/20
      disabled:opacity-60 disabled:cursor-not-allowed
      transition-all duration-200 flex items-center gap-2
    `,
    
    // Button secondary
    buttonSecondary: `
      px-4 py-2 border border-neutral-300 bg-white text-neutral-700 rounded-lg
      text-sm font-medium hover:bg-neutral-50 hover:border-neutral-400
      focus:outline-none focus:ring-2 focus:ring-neutral-500/20
      disabled:opacity-60 disabled:cursor-not-allowed
      transition-all duration-200
    `,
    
    // Radio option
    radioOption: `
      flex items-center gap-2 p-3 border rounded-lg cursor-pointer text-sm font-medium
      transition-all duration-200 hover:border-neutral-400
    `,
    
    // Radio selected
    radioSelected: 'border-neutral-500 bg-neutral-50',
    
    // Radio input
    radioInput: 'w-4 h-4 text-neutral-600 border-neutral-300 focus:ring-2 focus:ring-neutral-500/20',
    
    // Checkbox
    checkbox: `
      w-4 h-4 text-neutral-600 border-neutral-300 rounded 
      focus:ring-2 focus:ring-neutral-500/20
      disabled:opacity-60 disabled:cursor-not-allowed
    `,
    
    // Status indicator
    statusBadge: 'text-xs text-neutral-500 px-2 py-1 bg-neutral-50 rounded',
    
    // Loading spinner
    spinner: 'w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin',
    
    // Thumbnail preview
    thumbnail: 'relative w-full aspect-video bg-neutral-100 rounded-lg overflow-hidden',
    
    // Success indicator
    successDot: 'w-2 h-2 rounded-full bg-green-500',
  }
} as const

export type CleanVideoStyles = typeof cleanVideoStyles