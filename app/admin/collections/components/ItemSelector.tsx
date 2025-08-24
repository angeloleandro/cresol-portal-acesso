'use client';

// Item Selector Component
// Seletor de itens (imagens/vídeos) para adicionar em coleções - Portal Cresol

import Image from 'next/image';
import { useState, useEffect, useMemo, useCallback } from 'react';

import Icon from '@/app/components/icons/Icon';
import { Collection } from '@/lib/types/collections';

import type React from 'react';

interface GalleryImage {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  created_at: string;
}

interface DashboardVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  upload_type: string;
  created_at: string;
}

interface ItemSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  onItemsSelected: (items: { type: 'image' | 'video'; data: any }[]) => Promise<void>;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  isOpen,
  onClose,
  collection,
  onItemsSelected,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<DashboardVideo[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load gallery images
  const loadImages = useCallback(async () => {
    const response = await fetch('/api/admin/gallery?limit=100');
    if (!response.ok) {
      throw new Error('Erro ao carregar imagens');
    }
    const data = await response.json();
    setImages(data.images || []);
  }, []);

  // Load dashboard videos
  const loadVideos = useCallback(async () => {
    const response = await fetch('/api/admin/videos?limit=100');
    if (!response.ok) {
      throw new Error('Erro ao carregar vídeos');
    }
    const data = await response.json();
    setVideos(data.videos || []);
  }, []);

  // Load gallery items
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (activeTab === 'images') {
        await loadImages();
      } else {
        await loadVideos();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar itens');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, loadImages, loadVideos]);

  // Load items based on active tab
  useEffect(() => {
    if (isOpen) {
      loadItems();
      setSelectedItems(new Set());
      setSearchQuery('');
      setError('');
    }
  }, [isOpen, activeTab, loadItems]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (activeTab === 'images') {
      return images.filter(image => 
        (image.title?.toLowerCase().includes(query)) ||
        (image.description?.toLowerCase().includes(query)) ||
        query === ''
      );
    } else {
      return videos.filter(video =>
        video.title.toLowerCase().includes(query) ||
        query === ''
      );
    }
  }, [activeTab, images, videos, searchQuery]);

  // Handle item selection toggle
  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  // Handle select all toggle
  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item: any) => item.id)));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedItems.size === 0) {
      setError('Selecione pelo menos um item');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare selected items data
      const itemsToAdd = Array.from(selectedItems).map(itemId => {
        if (activeTab === 'images') {
          const image = images.find(img => img.id === itemId);
          return {
            type: 'image' as const,
            data: {
              item_id: image?.id,
              title: image?.title || 'Imagem sem título',
              image_url: image?.image_url,
              description: image?.description,
            }
          };
        } else {
          const video = videos.find(vid => vid.id === itemId);
          return {
            type: 'video' as const,
            data: {
              item_id: video?.id,
              title: video?.title || 'Vídeo sem título',
              video_url: video?.video_url,
              thumbnail_url: video?.thumbnail_url,
              upload_type: video?.upload_type,
            }
          };
        }
      });

      await onItemsSelected(itemsToAdd);
      onClose();

    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar itens');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter by collection type
  const shouldShowTab = (tab: 'images' | 'videos') => {
    return collection.type === 'mixed' || collection.type === tab;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Adicionar Itens à Coleção
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Selecione itens para adicionar à coleção &quot;{collection.name}&quot;
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white px-6 py-3 border-b border-gray-200">
            <div className="flex space-x-8">
              {shouldShowTab('images') && (
                <button
                  onClick={() => setActiveTab('images')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'images'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Imagens da Galeria
                </button>
              )}
              {shouldShowTab('videos') && (
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'videos'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Vídeos do Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={`Buscar ${activeTab === 'images' ? 'imagens' : 'vídeos'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} de {filteredItems.length} selecionado{selectedItems.size !== 1 ? 's' : ''}
                </span>
                {filteredItems.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {selectedItems.size === filteredItems.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4c0-1.313.253-2.566.712-3.714m0 0A10.003 10.003 0 0124 26c4.991 0 9.257 3.656 9.988 8.286" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhum {activeTab === 'images' ? 'imagem' : 'vídeo'} encontrado
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Tente ajustar sua busca' : `Não há ${activeTab === 'images' ? 'imagens' : 'vídeos'} disponíveis`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredItems.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className={`relative aspect-video cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-md ${
                      selectedItems.has(item.id)
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Content */}
                    {activeTab === 'images' ? (
                      <Image
                        src={item.image_url}
                        alt={item.title || 'Imagem'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        {item.thumbnail_url ? (
                          <Image
                            src={item.thumbnail_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="text-white">
                            <Icon name="video" className="w-8 h-8" />
                          </div>
                        )}
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/60 rounded-full p-2">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selection Indicator */}
                    <div className="absolute top-2 right-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedItems.has(item.id)
                          ? 'bg-primary border-primary'
                          : 'bg-white border-gray-300'
                      }`}>
                        {selectedItems.has(item.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                      <p className="text-xs truncate">
                        {activeTab === 'images' ? (item.title || 'Sem título') : item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedItems.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adicionando...
                </div>
              ) : (
                `Adicionar ${selectedItems.size} ite${selectedItems.size !== 1 ? 'ns' : 'm'}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemSelector;