'use client';

// Collection Grid Component
// Grid responsivo para exibição de múltiplas coleções

import CollectionCard from './Collection.Card';
import CollectionEmptyState from './Collection.EmptyState';
import CollectionLoading from './Collection.Loading';
import { CollectionGridProps } from './Collection.types';
import { cn } from '@/lib/utils/cn';
import { CSS_CLASSES } from '@/lib/constants/collections';

const CollectionGrid: React.FC<CollectionGridProps> = ({
  collections,
  loading = false,
  onCollectionClick,
  onCollectionEdit,
  onCollectionDelete,
  showActions = false,
  className,
}) => {
  // Loading state - use centralized loading component
  if (loading) {
    return <CollectionLoading.GridSkeleton className={className} />;
  }

  // Empty state
  if (!collections || collections.length === 0) {
    return (
      <CollectionEmptyState
        type="no_collections"
        className={className}
      />
    );
  }

  return (
    <div className={cn(CSS_CLASSES.GRID_RESPONSIVE, className)}>
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          showStats={true}
          showActions={showActions}
          onClick={onCollectionClick}
          onEdit={onCollectionEdit}
          onDelete={onCollectionDelete}
          className="h-full"
        />
      ))}
    </div>
  );
};

export default CollectionGrid;