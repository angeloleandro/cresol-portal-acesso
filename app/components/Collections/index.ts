// Collections System - Portal Cresol
// Export principal dos componentes de coleções

// Componentes Base
export { default as CollectionCard } from './Collection.Card';
export { default as CollectionGrid } from './Collection.Grid';
export { default as CollectionList } from './Collection.List';
export { default as CollectionDetail } from './Collection.Detail';
export { default as CollectionEmptyState } from './Collection.EmptyState';

// Componentes Admin (types only - componentes não implementados ainda)
export type {
  CollectionManagerProps,
  CollectionItemManagerProps,
  BulkActionsProps,
} from './CollectionManager';

// Hooks
export { useCollections } from './Collection.hooks';
export { useCollectionItems } from './Collection.hooks';

// Types (re-export para conveniência)
export type {
  Collection,
  CollectionItem,
  CollectionWithItems,
  CollectionFormData,
  CollectionFilters,
  CollectionStats,
  CollectionsResponse,
  CollectionItemsResponse,
  CollectionListProps,
  CollectionCardProps,
  CollectionDetailProps,
  CollectionFormProps,
} from '@/lib/types/collections';