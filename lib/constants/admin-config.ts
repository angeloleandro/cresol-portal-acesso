

// ===== LAYOUT & STYLING =====
export const ADMIN_LAYOUT = {
  header: {
    height: 'h-10', // Header height class
    logoWidth: 'w-24', // Logo width class
    logoHeight: 'h-10', // Logo height class
    margin: 'mr-4', // Logo margin
    padding: {
      container: 'px-4 sm:px-6 lg:px-8 py-4',
      content: 'px-4 sm:px-6 lg:px-8 py-8',
      card: 'p-6',
      form: 'p-4',
      modal: 'p-6'
    }
  },
  container: {
    maxWidth: 'max-w-7xl',
    margin: 'mx-auto',
    fullHeight: 'min-h-screen'
  },
  grid: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    iconGrid: 'grid grid-cols-6 gap-2'
  },
  spacing: {
    section: 'mb-8',
    subsection: 'mb-6',
    item: 'mb-4',
    small: 'mb-2',
    formGroup: 'space-y-4'
  }
} as const;

// ===== TYPOGRAPHY =====
export const ADMIN_TYPOGRAPHY = {
  headings: {
    page: 'text-2xl font-bold text-primary',
    section: 'text-xl font-semibold text-gray-800',
    subsection: 'text-lg font-semibold text-gray-800',
    card: 'text-lg font-medium',
    modal: 'text-lg font-semibold'
  },
  text: {
    body: 'text-cresol-gray',
    subtitle: 'text-cresol-gray mt-1',
    description: 'text-gray-600',
    label: 'text-sm font-medium text-gray-700',
    help: 'text-sm text-gray-600',
    error: 'text-red-600',
    success: 'text-green-600'
  },
  sizes: {
    small: 'text-sm',
    base: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  }
} as const;

// ===== COLORS & THEMING =====
export const ADMIN_COLORS = {
  primary: {
    main: 'text-primary',
    hover: 'hover:text-primary-dark',
    bg: 'bg-primary',
    bgHover: 'hover:bg-primary-dark'
  },
  secondary: {
    main: 'text-cresol-gray',
    hover: 'hover:text-primary'
  },
  status: {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800'
  },
  backgrounds: {
    page: 'bg-gray-50',
    card: 'bg-white',
    modal: 'bg-white',
    overlay: 'bg-black bg-opacity-50'
  },
  borders: {
    light: 'border-gray-200',
    default: 'border border-gray-200',
    focused: 'border-primary',
    error: 'border-red-300'
  }
} as const;

// ===== BUTTONS =====
export const ADMIN_BUTTONS = {
  primary: 'bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors',
  secondary: 'bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors',
  danger: 'bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors',
  outline: 'text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors',
  link: 'text-primary hover:text-primary-dark transition-colors',
  small: {
    primary: 'bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm',
    secondary: 'bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 text-sm',
    danger: 'bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm'
  },
  icon: {
    edit: 'text-primary hover:text-primary-dark',
    delete: 'text-red-500 hover:text-red-700',
    view: 'text-blue-500 hover:text-blue-700'
  },
  toggle: {
    show: 'flex items-center space-x-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
    hide: 'flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm transition-colors'
  }
} as const;

// ===== FORMS =====
export const ADMIN_FORMS = {
  input: {
    base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary',
    error: 'w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500',
    textarea: {
      small: 'w-full px-3 py-2 border border-gray-300 rounded-md h-20',
      medium: 'w-full px-3 py-2 border border-gray-300 rounded-md h-32',
      large: 'w-full px-3 py-2 border border-gray-300 rounded-md h-40'
    }
  },
  checkbox: 'h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded',
  label: {
    base: 'block text-sm font-medium text-gray-700 mb-1',
    required: 'block text-sm font-medium text-gray-700 mb-1 after:content-["*"] after:text-red-500 after:ml-1'
  },
  fieldset: 'space-y-4',
  group: 'mb-4'
} as const;

// ===== MODALS =====
export const ADMIN_MODALS = {
  overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
  container: 'bg-white rounded-lg w-full max-w-md',
  content: 'p-6',
  header: 'text-lg font-semibold mb-4',
  footer: 'flex space-x-3 pt-4',
  closeButton: 'absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
} as const;

// ===== CARDS =====
export const ADMIN_CARDS = {
  base: 'bg-white rounded-lg border border-gray-200',
  hover: 'bg-white rounded-lg border border-gray-200 hover:border-primary/30 transition-colors',
  content: 'p-6',
  stats: 'text-center',
  actions: 'flex space-x-2'
} as const;

// ===== NAVIGATION =====
export const ADMIN_NAVIGATION = {
  breadcrumb: {
    container: 'bg-white border-b',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4',
    link: 'inline-flex items-center text-sm text-cresol-gray hover:text-primary'
  },
  tabs: {
    container: 'mb-6 border-b border-gray-200',
    list: 'flex space-x-4',
    item: {
      active: 'py-2 px-4 border-b-2 border-primary text-primary font-medium text-sm',
      inactive: 'py-2 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm'
    }
  },
  links: {
    header: 'text-sm text-gray-600 mr-4 hover:text-primary',
    back: 'inline-flex items-center text-sm text-cresol-gray hover:text-primary mb-4'
  }
} as const;

// ===== IMAGES & MEDIA =====
export const ADMIN_MEDIA = {
  logo: {
    src: '/logo-horizontal-laranja.svg',
    alt: 'Logo Cresol HUB 2.0',
    sizes: '(max-width: 768px) 100vw, 96px'
  },
  images: {
    preview: {
      container: 'relative h-32 w-full max-w-sm mx-auto border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50',
      sizes: '(max-width: 384px) 100vw, 384px'
    },
    thumbnail: {
      small: 'h-12 w-12 rounded-lg',
      medium: 'relative h-40 w-full',
      large: 'relative h-full w-full'
    }
  },
  upload: {
    area: 'flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors',
    icon: 'w-8 h-8 mb-4 text-gray-500',
    input: 'hidden'
  }
} as const;

// ===== STATES & STATUS =====
export const ADMIN_STATES = {
  loading: {
    container: 'flex min-h-screen items-center justify-center',
    content: 'text-center'
  },
  empty: {
    container: 'bg-white rounded-lg border border-gray-200 p-8 text-center',
    icon: 'text-6xl text-gray-300 mb-4',
    message: 'text-gray-500'
  },
  error: {
    container: 'flex min-h-screen items-center justify-center',
    content: 'text-center',
    message: 'text-red-600'
  }
} as const;

// ===== DIMENSIONS & SIZING =====
export const ADMIN_DIMENSIONS = {
  image: {
    minWidth: 300,
    minHeight: 200,
    maxSize: 2 * 1024 * 1024, // 2MB
    quality: 85
  },
  icon: {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
    xlarge: 'w-12 h-12'
  },
  viewport: {
    mobile: 'sm:',
    tablet: 'md:',
    desktop: 'lg:'
  }
} as const;

// ===== FILE CONFIGURATION =====
export const ADMIN_FILE_CONFIG = {
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSize: 2 * 1024 * 1024, // 2MB
  supportedFormats: ['PNG', 'JPG', 'WebP'],
  storage: {
    bucket: 'images',
    folders: {
      sectorNews: 'sector-news',
      subsectorNews: 'subsector-news',
      avatars: 'avatars',
      banners: 'banners'
    }
  }
} as const;

// ===== ICONS =====
export const ADMIN_ICONS = {
  system: {
    default: '/icons/default-app.svg',
    available: [
      '/icons/default-app.svg',
      '/icons/app-1.svg',
      '/icons/app-2.svg',
      '/icons/app-3.svg',
      '/icons/app-4.svg',
      '/icons/app-5.svg'
    ]
  },
  svg: {
    edit: {
      viewBox: '0 0 24 24',
      path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    },
    delete: {
      viewBox: '0 0 24 24',
      path: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
    },
    back: {
      viewBox: '0 0 24 24',
      path: 'M10 19l-7-7m0 0l7-7m-7 7h18'
    },
    close: {
      viewBox: '0 0 24 24',
      path: 'M6 18L18 6M6 6l12 12'
    },
    calendar: {
      viewBox: '0 0 24 24',
      path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    location: {
      viewBox: '0 0 24 24',
      path: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
    },
    upload: {
      viewBox: '0 0 20 16',
      path: 'M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
    }
  }
} as const;

// ===== VALIDATION MESSAGES =====
export const ADMIN_VALIDATION = {
  required: {
    title: 'Título é obrigatório',
    summary: 'Resumo é obrigatório',
    content: 'Conteúdo é obrigatório',
    description: 'Descrição é obrigatória',
    startDate: 'Data de início é obrigatória',
    name: 'Nome é obrigatório',
    url: 'URL é obrigatória'
  },
  format: {
    invalidFileType: 'Por favor, selecione apenas arquivos PNG, JPG ou WebP.',
    fileTooLarge: 'A imagem deve ter menos de 2MB.',
    imageTooSmall: 'Para melhor qualidade, recomendamos imagens com pelo menos 300x200 pixels.',
    invalidUrl: 'Por favor, insira uma URL válida.'
  },
  confirm: {
    deleteNews: 'Tem certeza que deseja excluir esta notícia?',
    deleteEvent: 'Tem certeza que deseja excluir este evento?',
    deleteSystem: 'Tem certeza que deseja excluir este sistema?'
  }
} as const;

// ===== PLACEHOLDERS =====
export const ADMIN_PLACEHOLDERS = {
  news: {
    summary: 'Breve resumo da notícia',
    content: 'Conteúdo detalhado da notícia'
  },
  events: {
    description: 'Descrição do evento',
    location: 'Local do evento (opcional)'
  },
  systems: {
    description: 'Descrição do sistema'
  },
  common: {
    search: 'Buscar...',
    select: 'Selecione uma opção'
  }
} as const;

// ===== TIME & DATE FORMATS =====
export const ADMIN_TIME_CONFIG = {
  locale: 'pt-BR',
  formats: {
    date: 'dd/MM/yyyy',
    datetime: 'dd/MM/yyyy HH:mm',
    time: 'HH:mm'
  },
  cache: {
    control: '31536000', // 1 year for images
    shortTerm: '3600' // 1 hour for dynamic content
  }
} as const;

// ===== TYPE EXPORTS =====
export type AdminLayout = typeof ADMIN_LAYOUT;
export type AdminTypography = typeof ADMIN_TYPOGRAPHY;
export type AdminColors = typeof ADMIN_COLORS;
export type AdminButtons = typeof ADMIN_BUTTONS;
export type AdminForms = typeof ADMIN_FORMS;
export type AdminModals = typeof ADMIN_MODALS;
export type AdminCards = typeof ADMIN_CARDS;
export type AdminNavigation = typeof ADMIN_NAVIGATION;
export type AdminMedia = typeof ADMIN_MEDIA;
export type AdminStates = typeof ADMIN_STATES;
export type AdminDimensions = typeof ADMIN_DIMENSIONS;
export type AdminFileConfig = typeof ADMIN_FILE_CONFIG;
export type AdminIcons = typeof ADMIN_ICONS;
export type AdminValidation = typeof ADMIN_VALIDATION;
export type AdminPlaceholders = typeof ADMIN_PLACEHOLDERS;
export type AdminTimeConfig = typeof ADMIN_TIME_CONFIG;