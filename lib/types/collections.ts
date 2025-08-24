// Collection Types - Sistema de Coleções Portal Cresol
// Baseado na arquitetura VideoGallery e gallery_images

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  color_theme: string | null;
  is_active: boolean;
  order_index: number;
  type: 'mixed' | 'images' | 'videos';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Campos calculados/opcionais
  item_count?: number;
  items?: CollectionItem[];
  preview_items?: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_id: string;
  item_type: 'image' | 'video';
  order_index: number;
  added_at: string;
  added_by: string | null;
  
  // Dados do item associado (populated via join)
  item_data?: GalleryImage | DashboardVideo;
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}

// Formulário de Coleção
export interface CollectionFormData {
  id?: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  color_theme?: string;
  is_active: boolean;
  order_index: number;
  type: 'mixed' | 'images' | 'videos';
}

// Filtros e Search
export interface CollectionFilters {
  search: string;
  type: 'all' | 'mixed' | 'images' | 'videos';
  status: 'all' | 'active' | 'inactive';
  sort_by: 'name' | 'created_at' | 'updated_at' | 'order_index';
  sort_order: 'asc' | 'desc';
  page: number;
  limit: number;
}

// Estatísticas das Coleções
export interface CollectionStats {
  total: number;
  active: number;
  inactive: number;
  by_type: {
    mixed: number;
    images: number;
    videos: number;
  };
  total_items: number;
  recent_activity: number;
}

// Response da API
export interface CollectionsResponse {
  collections: Collection[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface CollectionItemsResponse {
  items: CollectionItem[];
  total: number;
  collection: Collection;
}

// Tipos para operações de drag-and-drop
export interface DragDropItem {
  id: string;
  type: 'collection' | 'item';
  data: Collection | CollectionItem;
}

// Tipos para bulk operations
export interface BulkOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'reorder';
  items: string[];
  metadata?: Record<string, any>;
}

// Form Props (específico para formulários)
export interface CollectionFormProps {
  collection?: Collection | null;
  mode?: 'create' | 'edit';
  onSubmit: (data: CollectionFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  errors?: Record<string, string>;
  className?: string;
  cancelButtonText?: string;
  submitButtonText?: string;
}

// Estados dos Hooks
export interface UseCollectionsState {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  filters: CollectionFilters;
  stats: CollectionStats | null;
  hasMore: boolean;
}

export interface UseCollectionItemsState {
  items: CollectionItem[];
  loading: boolean;
  error: string | null;
  collection: Collection | null;
  hasMore: boolean;
}

// Tipos de erro específicos
export interface CollectionError {
  code: string;
  message: string;
  field?: string;
}

// Tipos para file upload
export interface CollectionUpload {
  collection_id: string;
  files: File[];
  progress?: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Tipos para integração com sistemas existentes
export interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface DashboardVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number;
  upload_type: 'youtube' | 'direct';
  created_at: string;
}