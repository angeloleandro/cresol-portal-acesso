"use client";

import Link from 'next/link';
import { useMemo, memo } from 'react';

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { CRESOL_COLORS } from '@/lib/design-tokens';
import { Collection } from '@/lib/types/collections';
import { useCollections } from '@/app/contexts/CollectionsContext';
import { 
  COLLECTION_CLASSES,
  COLLECTION_EMPTY_STATE,
  COLLECTION_CARD,
  COLLECTION_UI_MESSAGES,
  COLLECTIONS_LAYOUT 
} from '@/lib/constants/collections-ui';

import Icon from '../icons/Icon';
import OptimizedImage from '../OptimizedImage';


interface CollectionSectionProps {
  type?: 'images' | 'videos' | 'mixed' | 'all';
  title?: string;
  showEmptyState?: boolean;
}

/**
 * CollectionSection - Otimizada com contexto centralizado
 * Componente responsável por exibir coleções filtradas por tipo
 */
export const CollectionSection = memo<CollectionSectionProps>(({ 
  type = 'all', 
  title = 'Coleções',
  showEmptyState = true 
}) => {
  // Usar contexto centralizado ao invés de queries diretas
  const { collections: allCollections, loading } = useCollections();

  // Filtrar coleções baseado no tipo - memoizado para performance
  const filteredCollections = useMemo(() => {
    return allCollections.filter(collection => {
      // Mostrar apenas coleções ativas
      if (!collection.is_active) return false;
      
      // Se type é 'all', mostrar todas
      if (type === 'all') return true;
      
      // Se type é específico, incluir esse tipo e 'mixed'
      return collection.type === type || collection.type === 'mixed';
    });
  }, [allCollections, type]);

  if (loading) {
    return (
      <div style={{ marginBottom: COLLECTIONS_LAYOUT.sections.marginBottom }}>
        <div className="flex items-center justify-center py-8">
          <UnifiedLoadingSpinner size="default" message={LOADING_MESSAGES.default} />
        </div>
      </div>
    );
  }

  if (filteredCollections.length === 0 && !showEmptyState) {
    return null;
  }

  if (filteredCollections.length === 0 && showEmptyState) {
    return (
      <div style={{ marginBottom: COLLECTIONS_LAYOUT.sections.marginBottom }}>
        <div className={COLLECTION_CLASSES.emptyState}>
          <Icon name="folder" className={`mx-auto ${COLLECTION_CLASSES.iconLarge} text-gray-400 mb-4`} />
          <h3 className={COLLECTION_EMPTY_STATE.title}>
            {COLLECTION_UI_MESSAGES.empty.title}
          </h3>
          <p className={COLLECTION_EMPTY_STATE.description}>
            {COLLECTION_UI_MESSAGES.empty.description}
          </p>
        </div>
      </div>
    );
  }

  // Get collection icon based on type
  const getCollectionIcon = (collectionType: string) => {
    switch (collectionType) {
      case 'images':
        return 'image';
      case 'videos':
        return 'video';
      case 'mixed':
        return 'folder';
      default:
        return 'folder';
    }
  };

  // Get collection link based on type
  const getCollectionLink = (collection: Collection) => {
    if (collection.type === 'images') {
      return `/galeria?collection=${collection.id}`;
    } else if (collection.type === 'videos') {
      return `/videos?collection=${collection.id}`;
    } else {
      return `/collections/${collection.id}`;
    }
  };

  return (
    <div style={{ marginBottom: COLLECTIONS_LAYOUT.sections.marginBottom }}>
      {/* Section Header */}
      <div style={{ marginBottom: COLLECTIONS_LAYOUT.sections.headerMarginBottom }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">
          Explore nossas coleções organizadas de conteúdo
        </p>
      </div>

      {/* Collections Grid */}
      <div className={COLLECTION_CLASSES.gridHome}>
        {filteredCollections.map((collection) => (
          <Link
            key={collection.id}
            href={getCollectionLink(collection)}
            className="group"
          >
            <div className={COLLECTION_CLASSES.card}>
              {/* Cover Image or Placeholder */}
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: COLLECTION_CARD.dimensions.coverHeight }}>
                {collection.cover_image_url ? (
                  <OptimizedImage
                    src={collection.cover_image_url}
                    alt={collection.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: COLLECTION_CARD.dimensions.iconSize.large,
                        height: COLLECTION_CARD.dimensions.iconSize.large,
                        backgroundColor: collection.color_theme || CRESOL_COLORS.primary.DEFAULT,
                        opacity: 0.1
                      }}
                    >
                      <Icon 
                        name={getCollectionIcon(collection.type)} 
                        className={COLLECTION_CLASSES.iconLarge}
                        style={{ color: collection.color_theme || CRESOL_COLORS.primary.DEFAULT }}
                      />
                    </div>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: COLLECTION_CARD.styles.overlay.background }}>
                  <div className="bg-white rounded-full p-3">
                    <Icon name="arrow-right" className={`${COLLECTION_CLASSES.iconMedium} text-primary`} />
                  </div>
                </div>

                {/* Type Badge */}
                <div className="absolute" style={{ top: COLLECTION_CARD.badges.position.top, left: COLLECTION_CARD.badges.position.left }}>
                  <span className={COLLECTION_CLASSES.badgeType}>
                    <Icon 
                      name={getCollectionIcon(collection.type)} 
                      className={`${COLLECTION_CLASSES.iconXSmall} mr-1`}
                    />
                    {collection.type === 'images' && 'Imagens'}
                    {collection.type === 'videos' && 'Vídeos'}
                    {collection.type === 'mixed' && 'Misto'}
                  </span>
                </div>
              </div>

              {/* Collection Info */}
              <div className={COLLECTION_CLASSES.cardContent}>
                <h3 className={COLLECTION_CLASSES.title}>
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className={COLLECTION_CLASSES.description}>
                    {collection.description}
                  </p>
                )}
                
                {/* Item Count */}
                <div className="flex items-center" style={{ fontSize: COLLECTION_CARD.typography.itemCount.fontSize, color: COLLECTION_CARD.typography.itemCount.color }}>
                  <Icon name="folder" className={`${COLLECTION_CLASSES.iconSmall} mr-1`} />
                  <span>
                    {COLLECTION_UI_MESSAGES.labels.items(collection.item_count || 0)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
});

CollectionSection.displayName = 'CollectionSection';

export default CollectionSection;
