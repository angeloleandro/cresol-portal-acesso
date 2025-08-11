// Collection Manager Types
// Types específicos para componentes administrativos

import { 
  Collection, 
  CollectionItem, 
  CollectionFormData,
  BulkOperation 
} from '@/lib/types/collections';

// Props do Manager Principal
export interface CollectionManagerProps {
  className?: string;
}

// Props do Formulário
export interface CollectionFormProps {
  collection?: Collection;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CollectionFormData) => Promise<void>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

// Props do Item Manager
export interface CollectionItemManagerProps {
  collectionId: string;
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  onItemsUpdated?: () => void;
  className?: string;
}

// Props das Ações em Lote
export interface BulkActionsProps {
  selectedCollections: string[];
  onBulkAction: (operation: BulkOperation) => Promise<void>;
  onSelectionClear: () => void;
  isLoading?: boolean;
  className?: string;
}

// Estados dos Componentes Manager
export interface CollectionManagerState {
  selectedCollections: string[];
  isFormOpen: boolean;
  isItemManagerOpen: boolean;
  editingCollection: Collection | null;
  deletingCollection: Collection | null;
  bulkOperation: BulkOperation | null;
}

export interface CollectionFormState {
  formData: CollectionFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  uploadProgress: number;
  coverImagePreview: string | null;
}

export interface ItemManagerState {
  availableImages: any[];
  availableVideos: any[];
  selectedItems: string[];
  searchQuery: string;
  activeTab: 'images' | 'videos' | 'current';
  isLoading: boolean;
  isDragMode: boolean;
}