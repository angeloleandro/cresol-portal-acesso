'use client';

// Collection Grid Component
// Grid responsivo para exibição de múltiplas coleções

import React from 'react';
import CollectionCard from './Collection.Card';
import CollectionEmptyState from './Collection.EmptyState';
import { CollectionGridProps } from './Collection.types';
import { cn } from '@/lib/utils/collections';
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
  // Loading skeleton
  if (loading) {
    return (
      <div className={cn(CSS_CLASSES.GRID_RESPONSIVE, className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={CSS_CLASSES.CARD_BASE}>
            {/* Cover skeleton */}
            <div className="aspect-video bg-gray-200 animate-pulse" />
            
            {/* Content skeleton */}
            <div className={CSS_CLASSES.CARD_CONTENT}>
              <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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