'use client';

// Admin Collection Detail Component
// Versão administrativa do visualizador de coleções com funcionalidades avançadas

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { CollectionDetailProps } from '@/app/components/Collections/Collection.types';
import { Collection, CollectionWithItems, CollectionItem } from '@/lib/types/collections';
import { useCollectionItems } from '@/app/components/Collections/Collection.hooks';
import CollectionLoading from '@/app/components/Collections/Collection.Loading';
import CollectionEmptyState from '@/app/components/Collections/Collection.EmptyState';
import DraggableItemList from './DraggableItemList';
import { formatCollection, cn } from '@/lib/utils/collections';

interface AdminCollectionDetailProps extends Omit<CollectionDetailProps, 'onItemRemove'> {
  showBulkUploadButton?: boolean;
  onItemRemove?: (item: CollectionItem) => Promise<void>;
  onItemsReorder?: (collectionId: string, items: CollectionItem[]) => Promise<void>;
  onBulkUpload?: (collection: Collection) => void;
}

const AdminCollectionDetail: React.FC<AdminCollectionDetailProps> = ({
  collection: initialCollection,
  showEditButton = false,
  showAddItemButton = false,
  showBulkUploadButton = false,
  showItemActions = false,
  className,
  onEdit,
  onItemAdd,
  onBulkUpload,
  onItemRemove,
  onItemsReorder,
}) => {
  // Determine if we need to fetch items
  const needsFetchItems = !('items' in initialCollection);
  const collectionId = needsFetchItems ? initialCollection.id : null;

  // Fetch items if needed
  const {
    items: fetchedItems,
    loading: itemsLoading,
    error: itemsError,
    collection: fetchedCollection,
  } = useCollectionItems(collectionId);

  // Merge collection data
  const collection: CollectionWithItems = useMemo(() => {
    if ('items' in initialCollection && initialCollection.items) {
      return initialCollection as CollectionWithItems;
    }
    
    return {
      ...initialCollection,
      ...fetchedCollection,
      items: fetchedItems || [],
    };
  }, [initialCollection, fetchedCollection, fetchedItems]);

  // Local state
  const [activeTab, setActiveTab] = useState<'items' | 'info'>('items');
  const [viewMode, setViewMode] = useState<'list' | 'reorder'>('list');

  // Sorted items by order_index
  const sortedItems = useMemo(() => {
    const items = collection.items || [];
    return [...items].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }, [collection.items]);

  // Memoized filtered items
  const { images, videos } = useMemo(() => {
    return {
      images: sortedItems.filter(item => item.item_type === 'image'),
      videos: sortedItems.filter(item => item.item_type === 'video'),
    };
  }, [sortedItems]);

  // Handle item reordering
  const handleReorder = async (reorderedItems: CollectionItem[]) => {
    if (!onItemsReorder) {
      throw new Error('Reordering not implemented');
    }
    
    await onItemsReorder(collection.id, reorderedItems);
  };

  // Handle item removal with confirmation
  const handleItemRemove = async (item: CollectionItem) => {
    if (!onItemRemove) return;
    
    const confirmed = window.confirm(
      'Tem certeza que deseja remover este item da coleção?'
    );
    
    if (confirmed) {
      await onItemRemove(item);
    }
  };

  return (
    <div className={cn("bg-white", className)}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cover Image */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
              {collection.cover_image_url ? (
                <Image
                  src={collection.cover_image_url}
                  alt={collection.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 320px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">
                      {collection.type === 'images' && '🖼️'}
                      {collection.type === 'videos' && '🎥'}
                      {collection.type === 'mixed' && '📁'}
                    </div>
                    <span className="text-lg font-medium">
                      {formatCollection.typeLabelPortuguese(collection.type)}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {!collection.is_active && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inativo
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {collection.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {formatCollection.typeLabelPortuguese(collection.type)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {formatCollection.itemCount(collection.items?.length || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatCollection.dateRelative(collection.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {showAddItemButton && (
                  <button
                    onClick={() => onItemAdd?.(collection)}
                    className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Item
                  </button>
                )}

                {showBulkUploadButton && (
                  <button
                    onClick={() => onBulkUpload?.(collection)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Múltiplo
                  </button>
                )}
                
                {showEditButton && (
                  <button
                    onClick={() => onEdit?.(collection)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            {collection.description && (
              <p className="text-gray-600 leading-relaxed mb-4">
                {collection.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">
                  {collection.items?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total de itens</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">
                  {images.length}
                </div>
                <div className="text-sm text-gray-600">Imagens</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">
                  {videos.length}
                </div>
                <div className="text-sm text-gray-600">Vídeos</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">
                  {collection.is_active ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">
                  {collection.is_active ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('items')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'items'
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Itens ({collection.items?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'info'
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Informações
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'items' && (
        <div>
          {itemsLoading && !collection.items?.length ? (
            <CollectionLoading.GridSkeleton count={6} />
          ) : itemsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Erro ao carregar itens: {itemsError}</p>
            </div>
          ) : !collection.items?.length ? (
            <CollectionEmptyState
              type="no_items"
              action={showAddItemButton ? {
                label: 'Adicionar primeiro item',
                onClick: () => onItemAdd?.(collection),
              } : undefined}
            />
          ) : (
            <>
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Modo de visualização:</span>
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "px-3 py-1 text-sm font-medium rounded transition-colors",
                        viewMode === 'list'
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Lista
                    </button>
                    <button
                      onClick={() => setViewMode('reorder')}
                      className={cn(
                        "px-3 py-1 text-sm font-medium rounded transition-colors",
                        viewMode === 'reorder'
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      Reordenar
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {sortedItems.length} ite{sortedItems.length !== 1 ? 'ns' : 'm'} • Ordenado{sortedItems.length !== 1 ? 's' : ''} por posição
                </div>
              </div>

              {/* Content based on view mode */}
              {viewMode === 'reorder' ? (
                <DraggableItemList
                  items={sortedItems}
                  onReorder={handleReorder}
                  onRemove={showItemActions ? handleItemRemove : undefined}
                />
              ) : (
                /* Traditional Grid/List View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video relative bg-gray-100">
                        {item.item_type === 'image' && item.item_data && 'image_url' in item.item_data && item.item_data.image_url && (
                          <Image
                            src={item.item_data.image_url}
                            alt={'title' in item.item_data ? item.item_data.title || 'Imagem' : 'Imagem'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        )}
                        {item.item_type === 'video' && (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            {item.item_data && 'thumbnail_url' in item.item_data && item.item_data.thumbnail_url ? (
                              <Image
                                src={item.item_data.thumbnail_url}
                                alt={'title' in item.item_data ? item.item_data.title || 'Vídeo' : 'Vídeo'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="text-white text-4xl">🎥</div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/60 rounded-full p-3">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Position indicator */}
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-black/60 text-white">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                          {(item.item_data && 'title' in item.item_data ? item.item_data.title : null) || `${item.item_type === 'image' ? 'Imagem' : 'Vídeo'} sem título`}
                        </h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.item_type === 'image' ? 'Imagem' : 'Vídeo'} • Posição {item.order_index + 1}
                        </p>

                        {/* Quick Actions */}
                        {showItemActions && (
                          <div className="flex items-center justify-end mt-2 gap-1">
                            <button
                              onClick={() => handleItemRemove(item)}
                              className="p-1 text-red-400 hover:text-red-600 rounded"
                              title="Remover item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-600">Nome</dt>
                <dd className="text-sm text-gray-900">{collection.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Descrição</dt>
                <dd className="text-sm text-gray-900">
                  {collection.description || 'Sem descrição'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Tipo</dt>
                <dd className="text-sm text-gray-900">
                  {formatCollection.typeLabelPortuguese(collection.type)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Status</dt>
                <dd className="text-sm text-gray-900">
                  {collection.is_active ? 'Ativo' : 'Inativo'}
                </dd>
              </div>
              {collection.color_theme && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Cor tema</dt>
                  <dd className="text-sm text-gray-900 flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: collection.color_theme }}
                    />
                    {collection.color_theme}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadados</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-600">Criado em</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(collection.created_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Atualizado em</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(collection.updated_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">ID</dt>
                <dd className="text-sm text-gray-900 font-mono">
                  {collection.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollectionDetail;