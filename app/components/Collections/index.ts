// Collections System - Portal Cresol
// Export principal dos componentes de coleções

// Componentes Base
export { default as CollectionCard } from './Collection.Card';
export { default as CollectionGrid } from './Collection.Grid';
export { default as CollectionList } from './Collection.List';
export { default as CollectionDetail } from './Collection.Detail';
export { default as CollectionEmptyState } from './Collection.EmptyState';

// Loading component
export { default as CollectionLoading } from './Collection.Loading';

// Hooks - useCollections movido para @/app/contexts/CollectionsContext
export { useCollectionItems } from './Collection.hooks';
export { useCollections, useCollectionsStats } from '@/app/contexts/CollectionsContext';

// Types from domain and component types
export type {
  Collection,
  CollectionItem,
  CollectionWithItems,
  CollectionFormData,
  CollectionFilters,
  CollectionStats,
  CollectionsResponse,
  CollectionItemsResponse,
  CollectionFormProps,
} from '@/lib/types/collections';

export type {
  CollectionListProps,
  CollectionCardProps,
  CollectionDetailProps,
} from './Collection.types';