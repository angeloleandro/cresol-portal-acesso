"use client";

import Link from 'next/link';
import { useMemo, memo } from 'react';

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { CRESOL_COLORS } from '@/lib/design-tokens';
import { Collection } from '@/lib/types/collections';
import { useCollections } from '@/app/contexts/CollectionsContext';

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
      <div className="mb-8">
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
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Icon name="folder" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma coleção disponível
          </h3>
          <p className="text-gray-600">
            Ainda não há coleções organizadas para esta seção.
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
    <div className="mb-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">
          Explore nossas coleções organizadas de conteúdo
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <Link
            key={collection.id}
            href={getCollectionLink(collection)}
            className="group"
          >
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 h-full">
              {/* Cover Image or Placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
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
                      className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: collection.color_theme || CRESOL_COLORS.primary.DEFAULT,
                        opacity: 0.1
                      }}
                    >
                      <Icon 
                        name={getCollectionIcon(collection.type)} 
                        className="h-12 w-12"
                        style={{ color: collection.color_theme || CRESOL_COLORS.primary.DEFAULT }}
                      />
                    </div>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white rounded-full p-3">
                    <Icon name="arrow-right" className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                    <Icon 
                      name={getCollectionIcon(collection.type)} 
                      className="h-3 w-3 mr-1"
                    />
                    {collection.type === 'images' && 'Imagens'}
                    {collection.type === 'videos' && 'Vídeos'}
                    {collection.type === 'mixed' && 'Misto'}
                  </span>
                </div>
              </div>

              {/* Collection Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {collection.description}
                  </p>
                )}
                
                {/* Item Count */}
                <div className="flex items-center text-sm text-gray-500">
                  <Icon name="folder" className="h-4 w-4 mr-1" />
                  <span>
                    {collection.item_count} {collection.item_count === 1 ? 'item' : 'itens'}
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