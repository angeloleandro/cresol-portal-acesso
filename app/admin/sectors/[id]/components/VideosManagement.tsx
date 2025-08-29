// Componente de gerenciamento de vídeos do setor

import Image from 'next/image';
import React, { useState } from 'react';

import { ToggleDraftsButton } from '@/app/components/admin/shared/ToggleDraftsButton';
import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { VideoUploadFormRoot } from '@/app/components/VideoUploadForm/VideoUploadForm.Root';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { VIDEO_HELPERS } from '@/lib/constants/video-ui';
import { FormatDate } from '@/lib/utils/formatters';

import { VideoPlayer } from './VideoPlayerAdapter';
import { SectorVideo } from '../types/sector.types';

interface VideosManagementProps {
  sectorId: string;
  videos: SectorVideo[];
  showDrafts: boolean;
  totalDraftVideosCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/**
 * VideosManagement function
 * @todo Add proper documentation
 */
export function VideosManagement({
  sectorId,
  videos,
  showDrafts,
  totalDraftVideosCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: VideosManagementProps) {
  const alert = useAlert();
  const deleteModal = useDeleteModal<SectorVideo>('vídeo');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<SectorVideo | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const handleOpenModal = (video?: SectorVideo) => {
    setCurrentVideo(video || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
  };

  const handleDeleteVideo = async (videoToDelete: SectorVideo) => {
    try {
      await onDelete(videoToDelete.id);
      alert.showSuccess('Vídeo excluído', 'O vídeo foi removido com sucesso.');
    } catch (error) {

      alert.showError('Erro ao deletar vídeo', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };
  
  const getVideoThumbnail = (video: SectorVideo): string => {
    // 1. Prioridade para thumbnail_url se existir
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    
    // 2. Para vídeos do YouTube, gerar thumbnail
    if (video.upload_type === 'youtube' && video.video_url) {
      const videoId = VIDEO_HELPERS.extractYouTubeId(video.video_url);
      if (videoId) {
        return VIDEO_HELPERS.getYouTubeThumbnail(videoId);
      }
    }
    
    // 3. Fallback para placeholder
    return '/images/video-placeholder.svg';
  };

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Vídeos</h2>
          <ToggleDraftsButton
            showDrafts={showDrafts}
            onToggle={onToggleDrafts}
            draftCount={totalDraftVideosCount}
            type="videos"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Novo Vídeo
        </button>
      </div>

      {/* Grid de vídeos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {showDrafts 
                ? 'Nenhum rascunho de vídeo encontrado'
                : 'Nenhum vídeo publicado ainda'
              }
            </p>
          </div>
        ) : (
          videos.map((video) => (
            <div key={video.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-card-hover transition-colors">
              {/* Thumbnail */}
              <div 
                className="relative aspect-video cursor-pointer group"
                onClick={() => setPlayingVideoId(video.id)}
              >
                <Image
                  src={getVideoThumbnail(video)}
                  alt={video.title}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/video-placeholder.svg';
                  }}
                />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  {video.is_featured && (
                    <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">
                      Destaque
                    </span>
                  )}
                  {!video.is_published && (
                    <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded">
                      Rascunho
                    </span>
                  )}
                </div>
              </div>
              
              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {video.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mb-3">
                  {FormatDate(video.created_at)}
                </p>
                
                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(video);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteModal.openDeleteModal(video, video.title);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de criação/edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <VideoUploadFormRoot
              customContext={{
                sectorId: sectorId,
                mode: 'sector'
              }}
              initialData={currentVideo ? {
                id: currentVideo.id,
                title: currentVideo.title,
                description: currentVideo.description ?? undefined,
                video_url: currentVideo.video_url,
                thumbnail_url: currentVideo.thumbnail_url ?? undefined,
                thumbnail_timestamp: currentVideo.thumbnail_timestamp ?? undefined,
                is_active: currentVideo.is_published,
                order_index: currentVideo.order_index || 0,
                upload_type: currentVideo.upload_type === 'upload' ? 'direct' : 'youtube',
                file_size: currentVideo.file_size ?? undefined,
                videoFile: null,
                thumbnailFile: null
              } : undefined}
              onSave={async () => {
                setIsModalOpen(false);
                setCurrentVideo(null);
                await onRefresh();
              }}
              onCancel={() => {
                setIsModalOpen(false);
                setCurrentVideo(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Player de vídeo */}
      {playingVideoId && (
        <VideoPlayer
          video={videos.find(v => v.id === playingVideoId)!}
          onClose={() => setPlayingVideoId(null)}
        />
      )}

      {/* Modal de exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDeleteVideo)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}