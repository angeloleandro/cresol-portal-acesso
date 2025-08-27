'use client';

import { memo, useCallback } from 'react';
import Image from 'next/image';
import { Icon } from '../icons/Icon';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  upload_type?: 'youtube' | 'file';
  is_published?: boolean;
  created_at?: string;
}

interface VideosManagementProps<T extends Video = Video> {
  entityId: string;
  videos: T[];
  showDrafts: boolean;
  totalDraftCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (video: T) => void;
  onPublish?: (video: T) => Promise<void>;
  config?: {
    entityType: 'sector' | 'subsector' | 'general';
    tableName: string;
    apiPath: string;
  };
}

const VideosManagement = memo(<T extends Video = Video>({
  entityId,
  videos,
  showDrafts,
  totalDraftCount,
  onToggleDrafts,
  onRefresh,
  onDelete,
  onEdit,
  onPublish,
  config = {
    entityType: 'general',
    tableName: 'videos',
    apiPath: '/api/admin/videos'
  }
}: VideosManagementProps<T>) => {
  
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este vídeo?')) {
      await onDelete(id);
    }
  }, [onDelete]);

  const getVideoIcon = (uploadType?: string) => {
    return uploadType === 'youtube' ? 'play' : 'video';
  };

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
              Gerenciar Vídeos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {videos.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <Icon name="video" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum vídeo encontrado</p>
          </div>
        ) : (
          videos.map((video) => (
            <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 relative">
                {video.thumbnail_url ? (
                  <Image
                    src={video.thumbnail_url}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name={getVideoIcon(video.upload_type)} className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {!video.is_published ? (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                      Rascunho
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Publicado
                    </span>
                  )}
                </div>

                {/* Upload Type Badge */}
                {video.upload_type && (
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-60 text-white rounded">
                      {video.upload_type === 'youtube' ? 'YouTube' : 'Upload'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 line-clamp-1">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {video.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {formatDate(video.created_at)}
                </p>

                {/* Actions */}
                <div className="mt-4 flex justify-end gap-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(video)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Icon name="edit" className="h-4 w-4" />
                    </button>
                  )}
                  
                  {onPublish && !video.is_published && (
                    <button
                      onClick={() => onPublish(video)}
                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Publicar"
                    >
                      <Icon name="check" className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Excluir"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

VideosManagement.displayName = 'VideosManagement';

export { VideosManagement };
export type { Video, VideosManagementProps };