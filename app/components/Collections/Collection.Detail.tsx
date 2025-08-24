'use client';

// Collection Detail Component
// Visualização detalhada de coleção com itens - Portal Cresol

import Image from 'next/image';
import React, { useMemo, useState } from 'react';


import Icon from '@/app/components/icons/Icon';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { CollectionWithItems } from '@/lib/types/collections';
import { cn } from '@/lib/utils/cn';
import { formatCollection } from '@/lib/utils/collections';

import CollectionEmptyState from './Collection.EmptyState';
import { useCollectionItems } from './Collection.hooks';
import CollectionLoading from './Collection.Loading';
import { CollectionDetailProps } from './Collection.types';

// Conditional import for admin functionality
let DraggableItemList: React.ComponentType<any> | null = null;
try {
  DraggableItemList = require('../../admin/collections/components/DraggableItemList').default;
} catch {
  // DraggableItemList not available in non-admin contexts
}

const CollectionDetail: React.FC<CollectionDetailProps> = ({
  collection: initialCollection,
  showEditButton = false,
  showAddItemButton = false,
  showItemActions = false,
  isAdminView = false,
  enableReordering = false,
  showAnalytics = false,
  showBulkUploadButton = false,
  className,
  onEdit,
  onItemAdd,
  onItemRemove,
  onItemReorder,
  onBulkUpload,
  onVideoUpload,
}) => {
  const deleteModal = useDeleteModal('item');
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

  // Local state - conditional based on admin view
  const [activeTab, setActiveTab] = useState<'items' | 'info'>('items');
  const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'reorder'>(isAdminView ? 'list' : 'grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Memoized filtered items
  const { images, videos } = useMemo(() => {
    const items = collection.items || [];
    return {
      images: items.filter(item => item.item_type === 'image'),
      videos: items.filter(item => item.item_type === 'video'),
    };
  }, [collection.items]);

  // Handle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle item removal with optional confirmation (admin view)
  const handleRemoveItem = async (item: any) => {
    if (!item || !onItemRemove) return;
    await onItemRemove(item);
  };

  const handleRemoveClick = (itemId: string) => {
    const items = collection.items || [];
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    if (isAdminView) {
      const itemName = item.item_data?.title || 'Item';
      deleteModal.openDeleteModal(item, itemName);
    } else {
      handleRemoveItem(item);
    }
  };
  
  // Handle item reordering (admin view)
  const handleReorder = async (reorderedItems: any[]) => {
    if (!onItemReorder || !isAdminView) {
      throw new Error('Reordering not available in this view');
    }
    
    await onItemReorder(reorderedItems);
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
                    <div className="mb-2 text-gray-400">
                      {collection.type === 'images' && <Icon name="image" className="w-16 h-16" />}
                      {collection.type === 'videos' && <Icon name="video" className="w-16 h-16" />}
                      {collection.type === 'mixed' && <Icon name="folder" className="w-16 h-16" />}
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {collection.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    {formatCollection.typeLabelPortuguese(collection.type)}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>
                    {formatCollection.itemCount(collection.items?.length || 0)}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>
                    {formatCollection.dateRelative(collection.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {showAddItemButton && (
                  <button
                    onClick={() => onItemAdd?.(collection)}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Adicionar Item
                  </button>
                )}
                {showBulkUploadButton && (
                  <button
                    onClick={() => onBulkUpload?.(collection)}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Upload em Lote
                  </button>
                )}
                {onVideoUpload && (collection.type === 'videos' || collection.type === 'mixed') && (
                  <button
                    onClick={() => onVideoUpload(collection)}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Upload YouTube
                  </button>
                )}
                
                {showEditButton && (
                  <button
                    onClick={() => onEdit?.(collection)}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                  >
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

            {/* Compact Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-gray-900">{collection.items?.length || 0}</span>
                <span className="text-sm text-gray-500">Total de itens</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-gray-900">{images.length}</span>
                <span className="text-sm text-gray-500">Imagens</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-gray-900">{videos.length}</span>
                <span className="text-sm text-gray-500">Vídeos</span>
              </div>
              
              <div className="flex items-center gap-2">
                {collection.is_active ? (
                  <Icon name="check-circle" className="w-5 h-5 text-green-600" />
                ) : (
                  <Icon name="x" className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-500">
                  {collection.is_active ? 'Ativo' : 'Inativo'}
                </span>
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
              {/* View Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Visualização:</span>
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setSelectedView('grid')}
                      className={cn(
                        "px-3 py-1 text-sm font-medium rounded transition-colors",
                        selectedView === 'grid'
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      Grade
                    </button>
                    <button
                      onClick={() => setSelectedView('list')}
                      className={cn(
                        "px-3 py-1 text-sm font-medium rounded transition-colors",
                        selectedView === 'list'
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      Lista
                    </button>
                    {isAdminView && enableReordering && (
                      <button
                        onClick={() => setSelectedView('reorder')}
                        className={cn(
                          "px-3 py-1 text-sm font-medium rounded transition-colors",
                          selectedView === 'reorder'
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        Reordenar
                      </button>
                    )}
                  </div>
                </div>

                {showItemActions && selectedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} selecionado{selectedItems.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => selectedItems.forEach(id => handleRemoveClick(id))}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>

              {/* Items Grid/List/Reorder */}
              {selectedView === 'reorder' && isAdminView && DraggableItemList ? (
                <DraggableItemList
                  items={collection.items || []}
                  onReorder={handleReorder}
                  onItemRemove={handleRemoveClick}
                />
              ) : (
                <div className={cn(
                  selectedView === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-4"
                )}>
                {collection.items?.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow",
                      selectedView === 'list' && "flex items-center p-4",
                      showItemActions && "cursor-pointer",
                      selectedItems.includes(item.id) && "ring-2 ring-primary"
                    )}
                    onClick={() => showItemActions && toggleItemSelection(item.id)}
                  >
                    {selectedView === 'grid' ? (
                      // Grid View
                      <>
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
                                <div className="text-white">
                                  <Icon name="video" className="w-12 h-12" />
                                </div>
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
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                            {(item.item_data && 'title' in item.item_data ? item.item_data.title : null) || `${item.item_type === 'image' ? 'Imagem' : 'Vídeo'} sem título`}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">
                            {item.item_type === 'image' ? 'Imagem' : 'Vídeo'}
                          </p>
                        </div>
                      </>
                    ) : (
                      // List View
                      <>
                        <div className="w-16 h-16 relative bg-gray-100 rounded flex-shrink-0 mr-4">
                          {item.item_type === 'image' && item.item_data && 'image_url' in item.item_data && item.item_data.image_url && (
                            <Image
                              src={item.item_data.image_url}
                              alt={'title' in item.item_data ? item.item_data.title || 'Imagem' : 'Imagem'}
                              fill
                              className="object-cover rounded"
                              sizes="64px"
                            />
                          )}
                          {item.item_type === 'video' && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {(item.item_data && 'title' in item.item_data ? item.item_data.title : null) || `${item.item_type === 'image' ? 'Imagem' : 'Vídeo'} sem título`}
                          </h4>
                          <p className="text-sm text-gray-500 capitalize">
                            {item.item_type === 'image' ? 'Imagem' : 'Vídeo'}
                          </p>
                        </div>
                        {showItemActions && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveClick(item.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
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

      {/* Modal de exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleRemoveItem)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default CollectionDetail;