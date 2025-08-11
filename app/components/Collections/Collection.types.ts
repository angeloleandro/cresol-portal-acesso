// Collection Component Props - CONSOLIDATED
// Única fonte para props de componentes de coleção

import { 
  Collection, 
  CollectionItem, 
  CollectionWithItems,
  CollectionFilters,
  CollectionStats 
} from '@/lib/types/collections';

// ========================
// CORE COMPONENT PROPS
// ========================

export interface CollectionCardProps {
  collection: Collection;
  showStats?: boolean;
  showActions?: boolean;
  onClick?: (collection: Collection) => void;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
  onToggleStatus?: (collection: Collection) => void;
  className?: string;
}

export interface CollectionGridProps {
  collections: Collection[];
  loading?: boolean;
  onCollectionClick?: (collection: Collection) => void;
  onCollectionEdit?: (collection: Collection) => void;
  onCollectionDelete?: (collection: Collection) => void;
  showActions?: boolean;
  className?: string;
}

export interface CollectionListProps {
  limit?: number;
  showHeader?: boolean;
  showFilters?: boolean;
  showCreateButton?: boolean;
  showStats?: boolean;
  className?: string;
  onCollectionClick?: (collection: Collection) => void;
}

export interface CollectionDetailProps {
  collection: Collection | CollectionWithItems;
  showEditButton?: boolean;
  showAddItemButton?: boolean;
  showItemActions?: boolean;
  // Admin-specific props
  isAdminView?: boolean;
  enableReordering?: boolean;
  showAnalytics?: boolean;
  showBulkUploadButton?: boolean;
  className?: string;
  onEdit?: (collection: Collection) => void;
  onItemAdd?: (collection: Collection) => void;
  onItemRemove?: (item: CollectionItem) => void;
  onItemReorder?: (items: CollectionItem[]) => void;
  onBulkUpload?: (collection: Collection) => void;
}

export interface CollectionEmptyStateProps {
  type: 'no_collections' | 'no_items' | 'no_results';
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// Props dos Filtros e Header
export interface CollectionHeaderProps {
  stats?: CollectionStats;
  showCreateButton?: boolean;
  showFilters?: boolean;
  onCreateClick?: () => void;
  onFiltersChange?: (filters: Partial<CollectionFilters>) => void;
  className?: string;
}

export interface CollectionFiltersProps {
  filters: CollectionFilters;
  onFiltersChange: (filters: Partial<CollectionFilters>) => void;
  stats?: CollectionStats;
  className?: string;
}

// Props dos Modais
export interface CollectionModalProps {
  collection: Collection | CollectionWithItems;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (collection: Collection) => void;
  onItemClick?: (item: CollectionItem) => void;
}

// Props de Drag & Drop
export interface DragDropContextProps {
  children: React.ReactNode;
  onDragEnd: (result: any) => void;
  className?: string;
}

export interface DraggableCollectionCardProps extends CollectionCardProps {
  index: number;
  isDragDisabled?: boolean;
}

// ========================
// COMPONENT STATES
// ========================

export interface CollectionGridState {
  selectedCollections: string[];
  draggedItem: string | null;
  contextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    collection: Collection | null;
  };
}

export interface CollectionDetailState {
  activeTab: 'items' | 'settings' | 'analytics';
  selectedItems: string[];
  isReordering: boolean;
  viewMode: 'grid' | 'list';
}