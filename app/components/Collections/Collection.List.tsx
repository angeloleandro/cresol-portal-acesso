'use client';

// Collection List Component - Otimizado
// Componente principal de listagem de coleções com filtros e cache inteligente

import React, { useState, useMemo, useCallback, memo } from 'react';

import { ChakraSelect, ChakraSelectOption } from '@/app/components/forms';
import { 
  COLLECTION_CONFIG, 
  SORT_LABELS, 
  COLLECTION_TYPE_LABELS 
} from '@/lib/constants/collections';
import { cn } from '@/lib/utils/cn';
import { useCollections } from '@/app/contexts/CollectionsContext';

import CollectionEmptyState from './Collection.EmptyState';
import CollectionGrid from './Collection.Grid';
import CollectionLoading from './Collection.Loading';
import { CollectionListProps } from './Collection.types';


const CollectionList: React.FC<CollectionListProps> = memo(({
  limit,
  showHeader = true,
  showFilters = true,
  showCreateButton = false,
  showStats = true,
  className,
  onCollectionClick,
}) => {
  // State management usando contexto otimizado
  const {
    collections,
    loading,
    error,
    filters,
    stats,
    hasMore,
    actions
  } = useCollections({ limit });

  // Local state for UI
  const [isCreating, setIsCreating] = useState(false);

  // Memoized filtered collections (client-side additional filtering if needed)
  const displayCollections = useMemo(() => {
    let result = collections;
    
    // Apply limit if specified
    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }
    
    return result;
  }, [collections, limit]);

  // Opções para o select de tipo (ChakraSelect)
  const typeOptions = useMemo((): ChakraSelectOption[] => [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'mixed', label: COLLECTION_TYPE_LABELS.mixed },
    { value: 'images', label: COLLECTION_TYPE_LABELS.images },
    { value: 'videos', label: COLLECTION_TYPE_LABELS.videos }
  ], []);

  // Opções para o select de status (ChakraSelect)
  const statusOptions = useMemo((): ChakraSelectOption[] => [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' }
  ], []);

  // Opções para o select de ordenação (ChakraSelect)
  const sortOptions = useMemo((): ChakraSelectOption[] => [
    { value: 'order_index-asc', label: SORT_LABELS['order_index-asc'] },
    { value: 'name-asc', label: SORT_LABELS['name-asc'] },
    { value: 'name-desc', label: SORT_LABELS['name-desc'] },
    { value: 'created_at-desc', label: SORT_LABELS['created_at-desc'] },
    { value: 'created_at-asc', label: SORT_LABELS['created_at-asc'] }
  ], []);

  // Memoized handlers para evitar re-renders
  const handleSearchChange = useCallback((search: string) => {
    actions.updateFilters({ search, page: 1 });
  }, [actions]);

  const handleTypeFilter = useCallback((type: string) => {
    actions.updateFilters({ type: type as any, page: 1 });
  }, [actions]);

  const handleStatusFilter = useCallback((status: string) => {
    actions.updateFilters({ status: status as any, page: 1 });
  }, [actions]);

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    actions.updateFilters({ sort_by: sortBy as any, sort_order: sortOrder, page: 1 });
  }, [actions]);

  const handleCreateClick = useCallback(() => {
    setIsCreating(true);
    // This will be handled by parent component or routing
  }, []);

  const handleRefresh = useCallback(() => {
    actions.refresh();
  }, [actions]);

  const handleLoadMore = useCallback(() => {
    if (actions.loadMore) {
      actions.loadMore();
    }
  }, [actions]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Coleções
            </h2>
            {showStats && stats && (
              <p className="text-sm text-gray-600 mt-1">
                {stats.total} coleção{stats.total !== 1 ? 'ões' : ''} • {stats.active} ativa{stats.active !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {showCreateButton && (
              <button
                onClick={handleCreateClick}
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <CollectionLoading.Button />
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nova Coleção
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Nome ou descrição da coleção..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <ChakraSelect
                label="Tipo"
                options={typeOptions}
                value={filters.type}
                onChange={(value) => handleTypeFilter(value as string)}
                placeholder="Todos os tipos"
                size="md"
                variant="outline"
                fullWidth
              />
            </div>

            {/* Status Filter */}
            <div>
              <ChakraSelect
                label="Status"
                options={statusOptions}
                value={filters.status}
                onChange={(value) => handleStatusFilter(value as string)}
                placeholder="Todos"
                size="md"
                variant="outline"
                fullWidth
              />
            </div>
          </div>

          {/* Sort and View Options */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
              <ChakraSelect
                options={sortOptions}
                value={`${filters.sort_by}-${filters.sort_order}`}
                onChange={(value) => {
                  const [sortBy, sortOrder] = (value as string).split('-');
                  handleSortChange(sortBy, sortOrder as 'asc' | 'desc');
                }}
                placeholder="Ordenar por"
                size="sm"
                variant="outline"
                fullWidth={false}
              />
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              {displayCollections.length} de {stats?.total || 0} resultado{(stats?.total || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">Erro ao carregar coleções</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Collections Grid */}
      <div>
        {loading && displayCollections.length === 0 ? (
          <CollectionLoading.GridSkeleton />
        ) : displayCollections.length === 0 ? (
          <CollectionEmptyState
            type={filters.search || filters.type !== 'all' || filters.status !== 'all' ? 'no_results' : 'no_collections'}
            action={showCreateButton ? {
              label: 'Criar primeira coleção',
              onClick: handleCreateClick,
            } : undefined}
          />
        ) : (
          <>
            <CollectionGrid
              collections={displayCollections}
              loading={false}
              onCollectionClick={onCollectionClick}
              showActions={showCreateButton} // Assume admin context if can create
            />

            {/* Load More */}
            {hasMore && !limit && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? (
                    <CollectionLoading.Button />
                  ) : (
                    'Carregar Mais'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* See All Link */}
      {limit && displayCollections.length === limit && (
        <div className="text-center">
          <button
            onClick={() => window.location.href = '/collections'}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Ver todas as coleções →
          </button>
        </div>
      )}
    </div>
  );
});

CollectionList.displayName = 'CollectionList';

export default CollectionList;