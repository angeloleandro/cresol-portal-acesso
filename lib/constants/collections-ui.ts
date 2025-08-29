// Collection UI Constants - Portal Cresol
// Constantes específicas para interface de usuário das coleções
// Separadas das constantes de negócio para melhor organização

// Classes CSS para Collections
export const COLLECTION_CLASSES = {
  // Grid e Listing
  gridListing: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  gridHome: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  
  // Cards
  card: 'bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 group cursor-pointer',
  cardContent: 'p-4',
  
  // Typography
  title: 'text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors',
  description: 'text-sm text-gray-600 line-clamp-2 mt-2',
  
  // Badges e Status
  badgeType: 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-white/90 text-gray-700 border border-gray-200',
  
  // Empty State
  emptyState: 'flex flex-col items-center justify-center py-12 px-4 text-center',
  
  // Ícones
  iconLarge: 'w-12 h-12 text-gray-400',
  iconMedium: 'w-6 h-6',
  iconSmall: 'w-4 h-4',
  iconXSmall: 'w-3 h-3',
  
  // Estados hover
  cardHover: 'hover:border-primary hover:shadow-lg',
  overlayHover: 'opacity-0 group-hover:opacity-100 transition-opacity',
} as const;

// Estilos para Filtros de Collections
export const COLLECTION_FILTERS = {
  container: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '1.5rem',
    marginBottom: '2rem',
    alignItems: 'end' as const,
  },
  
  fieldContainer: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    minWidth: '200px',
  },
  
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.5rem',
    display: 'block' as const,
  },
  
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    width: '100%',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    outline: 'none',
    
    '&:focus': {
      borderColor: '#F58220',
      boxShadow: '0 0 0 3px rgba(245, 130, 32, 0.1)',
    },
  },
  
  select: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease-in-out',
    outline: 'none',
  },
} as const;

// Configurações específicas para Cards de Collections
export const COLLECTION_CARD = {
  dimensions: {
    coverHeight: '200px',
    coverHeightMobile: '160px',
    iconSize: {
      large: 48,
      medium: 24,
      small: 16,
    },
  },
  
  styles: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
    },
    
    gradient: {
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    },
    
    cover: {
      objectFit: 'cover' as const,
      width: '100%',
      height: '100%',
    },
  },
  
  // Typography específica para cards
  typography: {
    itemCount: {
      fontSize: '0.75rem',
      color: '#6b7280',
    },
  },
  
  badges: {
    position: {
      top: '1rem',
      left: '1rem',
    },
    
    styles: {
      type: 'backdrop-blur-sm bg-white/90 text-gray-700 border border-gray-200',
    },
  },
  
  actions: {
    position: {
      bottom: '1rem',
      right: '1rem',
    },
  },
} as const;

// Mensagens de UI para Collections
export const COLLECTION_UI_MESSAGES = {
  // Estados de carregamento
  loading: 'Carregando coleções...',
  loadingItems: 'Carregando itens da coleção...',
  
  // Estados vazios
  empty: {
    title: 'Nenhuma coleção encontrada',
    description: 'Não há coleções disponíveis no momento',
  },
  emptySearch: 'Nenhuma coleção corresponde aos filtros aplicados',
  emptyItems: 'Esta coleção ainda não possui itens',
  
  // Estados de erro
  error: 'Erro ao carregar coleções',
  errorItems: 'Erro ao carregar itens da coleção',
  errorNetwork: 'Erro de conexão. Verifique sua internet.',
  
  // Filtros
  searchPlaceholder: 'Buscar coleções...',
  filterByType: 'Filtrar por tipo',
  allTypes: 'Todos os tipos',
  
  // Tipos de coleção
  types: {
    all: 'Todas',
    images: 'Imagens',
    videos: 'Vídeos', 
    mixed: 'Misto',
  },
  
  // Ações
  viewCollection: 'Ver coleção',
  viewItems: 'Ver itens',
  
  // Labels e informações
  labels: {
    items: (count: number) => `${count} ${count === 1 ? 'item' : 'itens'}`,
    collections: (count: number) => `${count} ${count === 1 ? 'coleção' : 'coleções'}`,
  },
  
  // Informações (mantido para compatibilidade)
  itemCount: (count: number) => `${count} ${count === 1 ? 'item' : 'itens'}`,
  collectionsFound: (count: number) => `${count} ${count === 1 ? 'coleção encontrada' : 'coleções encontradas'}`,
} as const;

// Layout e estrutura das páginas de Collections
export const COLLECTIONS_LAYOUT = {
  container: 'min-h-screen bg-gray-50',
  main: 'container mx-auto px-4 py-8',
  
  header: {
    container: 'mb-8',
    title: 'text-3xl font-bold text-gray-900 mb-2',
    subtitle: 'text-gray-600 text-lg',
  },
  
  content: {
    container: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
    section: 'space-y-6',
  },
  
  footer: {
    container: 'mt-12 pt-8 border-t border-gray-200',
    content: 'text-center text-gray-500 text-sm',
  },
  
  // Seções
  sections: {
    marginBottom: '2rem',
    headerMarginBottom: '1.5rem',
  },
  
  // Responsividade
  responsive: {
    mobile: 'block sm:hidden',
    tablet: 'hidden sm:block lg:hidden', 
    desktop: 'hidden lg:block',
  },
} as const;

// Estados de interação para Collections
export const COLLECTION_STATES = {
  loading: {
    card: 'animate-pulse',
    skeleton: 'bg-gray-200 rounded',
    spinner: 'animate-spin h-6 w-6 text-primary',
  },
  
  hover: {
    card: 'hover:border-primary hover:shadow-lg transform hover:-translate-y-1',
    overlay: 'opacity-0 group-hover:opacity-100 transition-all duration-300',
    button: 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200',
  },
  
  active: {
    filter: 'bg-primary text-white border-primary',
    tab: 'border-primary text-primary',
  },
  
  disabled: {
    card: 'opacity-50 cursor-not-allowed',
    button: 'opacity-50 cursor-not-allowed pointer-events-none',
  },
} as const;

// Estado vazio específico para Collections (alias para compatibilidade)
export const COLLECTION_EMPTY_STATE = {
  container: 'flex flex-col items-center justify-center py-12 px-4 text-center',
  icon: 'w-16 h-16 text-gray-300 mb-4',
  title: 'text-lg font-semibold text-gray-500 mb-2',
  description: 'text-gray-400 mb-6',
  button: 'bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 rounded-lg transition-colors',
  
  // Mensagens específicas
  messages: {
    noCollections: 'Nenhuma coleção encontrada',
    noItems: 'Esta coleção ainda não possui itens',
    noResults: 'Nenhum resultado encontrado para sua busca',
    createFirst: 'Crie sua primeira coleção',
  },
} as const;

// Animações específicas para Collections
export const COLLECTION_ANIMATIONS = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  
  // Durações
  durations: {
    fast: 'duration-150',
    normal: 'duration-200', 
    slow: 'duration-300',
  },
  
  // Delays para animações em cascata
  delays: {
    none: 'delay-0',
    short: 'delay-75',
    medium: 'delay-150',
    long: 'delay-300',
  },
} as const;

// Configurações de performance para UI
export const COLLECTION_PERFORMANCE = {
  // Virtual scrolling
  virtualThreshold: 50,
  itemHeight: 280, // Altura estimada de cada card
  
  // Lazy loading
  lazyLoadOffset: '200px',
  
  // Debounce para busca
  searchDebounce: 300,
  
  // Cache de imagens
  imageCacheDuration: 24 * 60 * 60 * 1000, // 24 horas
} as const;

// Export default com todas as constantes para importação simplificada
export default {
  COLLECTION_CLASSES,
  COLLECTION_FILTERS, 
  COLLECTION_CARD,
  COLLECTION_UI_MESSAGES,
  COLLECTIONS_LAYOUT,
  COLLECTION_STATES,
  COLLECTION_ANIMATIONS,
  COLLECTION_PERFORMANCE,
} as const;