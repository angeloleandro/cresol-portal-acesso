'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { CRESOL_COLORS } from '@/lib/design-tokens';
import { useCollections } from '@/app/contexts/CollectionsContext';
import { Collection } from '@/lib/types/collections';
import { 
  COLLECTION_CLASSES,
  COLLECTION_FILTERS,
  COLLECTION_CARD,
  COLLECTION_UI_MESSAGES,
  COLLECTIONS_LAYOUT 
} from '@/lib/constants/collections-ui';

import ChakraNavbar from '../components/ChakraNavbar';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';
import Icon from '../components/icons/Icon';
import OptimizedImage from '../components/OptimizedImage';

export default function ColecoesPage() {
  const router = useRouter();
  const { collections, loading, actions } = useCollections();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'images' | 'videos' | 'mixed'>('all');
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);

  // Filtrar coleções baseado em busca e tipo
  useEffect(() => {
    let filtered = collections.filter(c => c.is_active);

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(c => c.type === selectedType);
    }

    // Filtrar por busca
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) ||
        (c.description && c.description.toLowerCase().includes(search))
      );
    }

    // Ordenar por order_index
    filtered.sort((a, b) => a.order_index - b.order_index);

    setFilteredCollections(filtered);
  }, [collections, searchTerm, selectedType]);

  // Buscar coleções ao montar o componente
  useEffect(() => {
    actions.fetchCollections();
  }, [actions]);

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
    return `/colecoes/${collection.id}`;
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/home' },
    { label: 'Coleções', href: '/colecoes' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ChakraNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.collections} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChakraNavbar />
      
      <main className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coleções</h1>
          <p className="text-gray-600">
            Explore nossas coleções organizadas de conteúdo
          </p>
        </div>

        {/* Filters */}
        <div style={COLLECTION_FILTERS.container}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" style={COLLECTION_FILTERS.label}>
                Buscar coleções
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para buscar..."
                  className="w-full pl-10 pr-4"
                  style={{
                    ...COLLECTION_FILTERS.input,
                    paddingLeft: '2.5rem',
                    paddingRight: '1rem'
                  }}
                />
                <Icon name="search" className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="type" style={COLLECTION_FILTERS.label}>
                Tipo de coleção
              </label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full"
                style={COLLECTION_FILTERS.input}
              >
                <option value="all">Todas as coleções</option>
                <option value="images">Apenas imagens</option>
                <option value="videos">Apenas vídeos</option>
                <option value="mixed">Conteúdo misto</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredCollections.length === 0 ? (
              'Nenhuma coleção encontrada'
            ) : filteredCollections.length === 1 ? (
              '1 coleção encontrada'
            ) : (
              `${filteredCollections.length} coleções encontradas`
            )}
          </div>
        </div>

        {/* Collections Grid */}
        {filteredCollections.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Icon name="folder" className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma coleção encontrada
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || selectedType !== 'all' 
                ? 'Tente ajustar os filtros para encontrar coleções.'
                : 'Ainda não há coleções disponíveis no momento.'}
            </p>
          </div>
        ) : (
          <div className={COLLECTION_CLASSES.gridListing}>
            {filteredCollections.map((collection) => (
              <Link
                key={collection.id}
                href={getCollectionLink(collection)}
                className="group"
              >
                <div className={`${COLLECTION_CLASSES.card} hover:border-primary hover:shadow-lg`}>
                  {/* Cover Image or Placeholder */}
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: COLLECTION_CARD.dimensions.coverHeight }}>
                    {collection.cover_image_url ? (
                      <OptimizedImage
                        src={collection.cover_image_url}
                        alt={collection.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
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
                      <span className={`${COLLECTION_CLASSES.badgeType} backdrop-blur-sm`}>
                        <Icon 
                          name={getCollectionIcon(collection.type)} 
                          className={`${COLLECTION_CLASSES.iconXSmall} mr-1`}
                        />
                        {collection.type === 'images' && 'Imagens'}
                        {collection.type === 'videos' && 'Vídeos'}
                        {collection.type === 'mixed' && 'Misto'}
                      </span>
                    </div>

                    {/* Item Count Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                        {collection.item_count || 0} {collection.item_count === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                  </div>

                  {/* Collection Info */}
                  <div className={COLLECTION_CLASSES.cardContent}>
                    <h3 className={`${COLLECTION_CLASSES.title} line-clamp-1`}>
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className={COLLECTION_CLASSES.description}>
                        {collection.description}
                      </p>
                    )}
                    
                    {/* Footer with metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Icon name="calendar" className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(collection.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Icon name="eye" className="h-3 w-3 mr-1" />
                        <span>
                          {String(collection.view_count || 0)} visualizações
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}