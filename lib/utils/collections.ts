// Collection Utils - Portal Cresol
// Funções utilitárias para o sistema de coleções

import { 
  COLLECTION_CONFIG, 
  ERROR_MESSAGES, 
  THEME_COLORS 
} from '@/lib/constants/collections';
import { 
  Collection, 
  CollectionItem, 
  CollectionFilters, 
  GalleryImage, 
  DashboardVideo 
} from '@/lib/types/collections';
import { cn } from '@/lib/utils/cn';

// Re-export centralized utils for compatibility
export { cn };

// Validações
export const validateCollection = {
  name: (name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return ERROR_MESSAGES.NAME_REQUIRED;
    }
    if (name.length > COLLECTION_CONFIG.MAX_NAME_LENGTH) {
      return ERROR_MESSAGES.NAME_TOO_LONG;
    }
    return null;
  },

  description: (description: string): string | null => {
    if (description && description.length > COLLECTION_CONFIG.MAX_DESCRIPTION_LENGTH) {
      return ERROR_MESSAGES.DESCRIPTION_TOO_LONG;
    }
    return null;
  },

  colorTheme: (color: string): string | null => {
    if (!color) return null;
    
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(color)) {
      return ERROR_MESSAGES.INVALID_COLOR;
    }
    return null;
  },

  file: (file: File, allowedTypes: readonly string[]): string | null => {
    if (file.size > COLLECTION_CONFIG.MAX_FILE_SIZE) {
      return ERROR_MESSAGES.FILE_TOO_LARGE;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return ERROR_MESSAGES.INVALID_FILE_TYPE;
    }
    
    return null;
  },
};

// Formatação e Display
export const formatCollection = {
  typeLabelPortuguese: (type: Collection['type']): string => {
    const labels = {
      mixed: 'Misto',
      images: 'Imagens',
      videos: 'Vídeos',
    };
    return labels[type] || type;
  },

  statusLabel: (isActive: boolean): string => {
    return isActive ? 'Ativo' : 'Inativo';
  },

  dateRelative: (date: string): string => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - targetDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} meses atrás`;
    return `${Math.ceil(diffDays / 365)} anos atrás`;
  },

  itemCount: (count: number): string => {
    if (count === 0) return 'Nenhum item';
    if (count === 1) return '1 item';
    return `${count} itens`;
  },
};

// Filtros e Busca
export const filterCollections = {
  bySearch: (collections: Collection[], query: string): Collection[] => {
    if (!query.trim()) return collections;
    
    const searchTerm = query.toLowerCase().trim();
    return collections.filter(collection => 
      collection.name.toLowerCase().includes(searchTerm) ||
      (collection.description?.toLowerCase().includes(searchTerm) ?? false)
    );
  },

  byType: (collections: Collection[], type: CollectionFilters['type']): Collection[] => {
    if (type === 'all') return collections;
    return collections.filter(collection => collection.type === type);
  },

  byStatus: (collections: Collection[], status: CollectionFilters['status']): Collection[] => {
    if (status === 'all') return collections;
    const isActive = status === 'active';
    return collections.filter(collection => collection.is_active === isActive);
  },

  applySorting: (collections: Collection[], sortBy: string, sortOrder: 'asc' | 'desc'): Collection[] => {
    return [...collections].sort((a, b) => {
      const aValue: unknown = a[sortBy as keyof Collection];
      const bValue: unknown = b[sortBy as keyof Collection];
      
      // Handle date strings
      if (sortBy.includes('_at')) {
        const aDate = typeof aValue === 'string' || typeof aValue === 'number' || aValue instanceof Date ? new Date(aValue).getTime() : 0;
        const bDate = typeof bValue === 'string' || typeof bValue === 'number' || bValue instanceof Date ? new Date(bValue).getTime() : 0;
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aStr = aValue.toLowerCase();
        const bStr = bValue.toLowerCase();
        if (sortOrder === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle booleans
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        const aNum = aValue ? 1 : 0;
        const bNum = bValue ? 1 : 0;
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Fallback for mixed types - convert to string
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      if (sortOrder === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  },
};

// Operações de Coleção
export const collectionOperations = {
  // Calcular próximo order_index
  getNextOrderIndex: (collections: Collection[]): number => {
    if (collections.length === 0) return COLLECTION_CONFIG.DEFAULT_ORDER_INCREMENT;
    
    const maxOrder = Math.max(...collections.map(c => c.order_index));
    return maxOrder + COLLECTION_CONFIG.DEFAULT_ORDER_INCREMENT;
  },

  // Reordenar lista após drag & drop
  reorderCollections: (collections: Collection[], startIndex: number, endIndex: number): Collection[] => {
    const result = Array.from(collections);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Recalcular order_index
    return result.map((collection, index) => ({
      ...collection,
      order_index: (index + 1) * COLLECTION_CONFIG.DEFAULT_ORDER_INCREMENT,
    }));
  },

  // Reordenar itens de coleção
  reorderItems: (items: CollectionItem[], startIndex: number, endIndex: number): CollectionItem[] => {
    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    return result.map((item, index) => ({
      ...item,
      order_index: (index + 1) * COLLECTION_CONFIG.DEFAULT_ORDER_INCREMENT,
    }));
  },

  // Verificar se item pode ser adicionado à coleção
  canAddItemToCollection: (collection: Collection, itemType: 'image' | 'video'): boolean => {
    if (collection.type === 'mixed') return true;
    if (collection.type === 'images' && itemType === 'image') return true;
    if (collection.type === 'videos' && itemType === 'video') return true;
    return false;
  },
};

// Geração de Dados
export const generateCollection = {
  // Gerar cor tema aleatória
  randomThemeColor: (): string => {
    const randomIndex = Math.floor(Math.random() * THEME_COLORS.length);
    return THEME_COLORS[randomIndex];
  },

  // Gerar nome placeholder para nova coleção
  defaultName: (): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `Nova Coleção - ${day}/${month}/${year}`;
  },

  // Gerar slug para URL amigável
  generateSlug: (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início/fim
  },
};

// Integração com sistema existente
export const integrationHelpers = {
  // Converter GalleryImage para CollectionItem
  galleryImageToCollectionItem: (
    image: GalleryImage, 
    collectionId: string, 
    orderIndex: number
  ): Omit<CollectionItem, 'id' | 'added_at' | 'added_by'> => ({
    collection_id: collectionId,
    item_id: image.id,
    item_type: 'image',
    order_index: orderIndex,
    item_data: image,
  }),

  // Converter DashboardVideo para CollectionItem
  dashboardVideoToCollectionItem: (
    video: DashboardVideo, 
    collectionId: string, 
    orderIndex: number
  ): Omit<CollectionItem, 'id' | 'added_at' | 'added_by'> => ({
    collection_id: collectionId,
    item_id: video.id,
    item_type: 'video',
    order_index: orderIndex,
    item_data: video,
  }),

  // Extrair IDs de itens para busca
  extractItemIds: (items: CollectionItem[], type?: 'image' | 'video'): string[] => {
    return items
      .filter(item => !type || item.item_type === type)
      .map(item => item.item_id);
  },
};

// Performance Helpers
export const performanceHelpers = {
  // Debounce function
  debounce: <T extends (...args: unknown[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  // Throttle function
  throttle: <T extends (...args: unknown[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return ((...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  },

  // Chunkar array para processamento em lotes
  chunkArray: <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },
};

// Error Handling
export const errorHelpers = {
  // Extrair mensagem de erro user-friendly
  getErrorMessage: (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') return error.message;
      if ('error' in error && typeof error.error === 'string') return error.error;
    }
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  },

  // Verificar se é erro de rede
  isNetworkError: (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;
    
    const hasCode = 'code' in error && error.code === 'NETWORK_ERROR';
    const hasMessage = 'message' in error && typeof (error as any).message === 'string';
    const hasFetchError = hasMessage && ((error as any).message.includes('fetch') || (error as any).message.includes('network'));
    
    return hasCode || hasFetchError;
  },

  // Verificar se é erro de permissão
  isPermissionError: (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;
    
    const hasCode = 'code' in error && error.code === 'PERMISSION_DENIED';
    const hasStatus = 'status' in error && error.status === 403;
    const hasMessage = 'message' in error && typeof (error as any).message === 'string';
    const hasPermissionError = hasMessage && (error as any).message.includes('permission');
    
    return hasCode || hasStatus || hasPermissionError;
  },
};