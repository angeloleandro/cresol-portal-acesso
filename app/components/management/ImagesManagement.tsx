'use client';

import { memo, useCallback } from 'react';
import Image from 'next/image';
import { Icon } from '../icons/Icon';

interface ImageData {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category?: string;
  is_published?: boolean;
  created_at?: string;
}

interface ImagesManagementProps<T extends ImageData = ImageData> {
  entityId: string;
  images: T[];
  showDrafts: boolean;
  totalDraftCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (image: T) => void;
  onPublish?: (image: T) => Promise<void>;
  config?: {
    entityType: 'sector' | 'subsector' | 'general';
    tableName: string;
    apiPath: string;
  };
}

const ImagesManagement = memo(<T extends ImageData = ImageData>({
  entityId,
  images,
  showDrafts,
  totalDraftCount,
  onToggleDrafts,
  onRefresh,
  onDelete,
  onEdit,
  onPublish,
  config = {
    entityType: 'general',
    tableName: 'images',
    apiPath: '/api/admin/images'
  }
}: ImagesManagementProps<T>) => {
  
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta imagem?')) {
      await onDelete(id);
    }
  }, [onDelete]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Gerenciar Imagens
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {images.length} {images.length === 1 ? 'imagem' : 'imagens'}
              {totalDraftCount > 0 && ` (${totalDraftCount} rascunho${totalDraftCount !== 1 ? 's' : ''})`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onToggleDrafts}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                showDrafts
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon name={showDrafts ? 'EyeOff' : 'Eye'} className="h-4 w-4 inline mr-2" />
              {showDrafts ? 'Ocultar' : 'Mostrar'} Rascunhos
            </button>
            <button
              onClick={onRefresh}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Icon name="refresh" className="h-4 w-4 inline mr-2" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
        {images.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <Icon name="image" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma imagem encontrada</p>
          </div>
        ) : (
          images.map((image) => (
            <div key={image.id} className="group relative">
              {/* Image Container */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow">
                <Image
                  src={image.image_url}
                  alt={image.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300">
                  <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Status Badge */}
                    <div className="flex justify-end">
                      {!image.is_published ? (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                          Rascunho
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Publicada
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-1">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(image);
                          }}
                          className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Icon name="edit" className="h-3 w-3" />
                        </button>
                      )}
                      
                      {onPublish && !image.is_published && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPublish(image);
                          }}
                          className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-green-100 hover:text-green-600 transition-colors"
                          title="Publicar"
                        >
                          <Icon name="check" className="h-3 w-3" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image.id);
                        }}
                        className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Icon name="trash" className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title and Info */}
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-900 line-clamp-1" title={image.title}>
                  {image.title}
                </p>
                {image.category && (
                  <p className="text-xs text-gray-500">{image.category}</p>
                )}
                <p className="text-xs text-gray-400">
                  {formatDate(image.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

ImagesManagement.displayName = 'ImagesManagement';

export { ImagesManagement };
export type { ImageData, ImagesManagementProps };