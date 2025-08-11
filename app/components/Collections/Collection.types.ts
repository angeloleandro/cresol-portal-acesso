// Collection Component Types
// Types específicos para componentes de coleção

import { 
  Collection, 
  CollectionItem, 
  CollectionWithItems,
  CollectionFilters,
  CollectionStats 
} from '@/lib/types/collections';

// Props dos Componentes Base
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
  className?: string;
  onEdit?: (collection: Collection) => void;
  onItemAdd?: (collection: Collection) => void;
  onItemRemove?: (item: CollectionItem) => void;
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

// Estados dos Componentes
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
}