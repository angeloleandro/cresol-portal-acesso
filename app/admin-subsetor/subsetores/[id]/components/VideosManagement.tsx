// Componente para gerenciar vídeos do subsetor - versão padronizada com upload completo

'use client';

import Image from 'next/image';
import React, { useState } from 'react';

import { ToggleDraftsButton } from '@/app/components/admin/shared/ToggleDraftsButton';
import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { VideoUploadFormRoot } from '@/app/components/VideoUploadForm/VideoUploadForm.Root';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { VIDEO_HELPERS, VIDEO_API_CONFIG } from '@/lib/constants/video-ui';
import { FormatDate } from '@/lib/utils/formatters';

import type { SubsectorVideo } from '../types/subsector.types';
import type { VideoUploadFormData } from '@/lib/types/video-system';

interface VideosManagementProps {
  subsectorId: string;
  videos: SubsectorVideo[];
  showDrafts: boolean;
  totalDraftVideosCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// Componente para player de vídeo
const VideoPlayer = ({ video, onClose }: { video: SubsectorVideo; onClose: () => void }) => {
  if (video.upload_type === 'youtube' && video.video_url) {
    const videoId = VIDEO_HELPERS.extractYouTubeId(video.video_url);
    if (videoId) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
          <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={video.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      );
    }
  }

  // Player para vídeos diretos
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <video
          src={video.video_url}
          controls
          autoPlay
          className="w-full rounded-lg"
        >
          Seu navegador não suporta a tag de vídeo.
        </video>
      </div>
    </div>
  );
};

export function VideosManagement({
  subsectorId,
  videos,
  showDrafts,
  totalDraftVideosCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: VideosManagementProps) {
  const alert = useAlert();
  const deleteModal = useDeleteModal<SubsectorVideo>('vídeo');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<SubsectorVideo | null>(null);
  const [playingVideo, setPlayingVideo] = useState<SubsectorVideo | null>(null);

  const handleOpenModal = (video?: SubsectorVideo) => {
    setCurrentVideo(video || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
  };

  const handleSaveComplete = async () => {
    alert.showSuccess(
      currentVideo ? 'Vídeo atualizado' : 'Vídeo criado', 
      'O vídeo foi salvo com sucesso.'
    );
    handleCloseModal();
    await onRefresh();
  };

  const handleDeleteVideo = async (videoToDelete: SubsectorVideo) => {
    try {
      await onDelete(videoToDelete.id);
      alert.showSuccess('Vídeo excluído', 'O vídeo foi removido com sucesso.');
    } catch (error) {
      alert.showError('Erro ao deletar vídeo', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const getVideoThumbnail = (video: SubsectorVideo): string => {
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

  // Converter SubsectorVideo para formato esperado pelo VideoUploadFormRoot
  const convertToFormData = (video: SubsectorVideo): Partial<VideoUploadFormData> => ({
    id: video.id,
    title: video.title,
    description: video.description || '',
    video_url: video.video_url,
    thumbnail_url: video.thumbnail_url || undefined,
    thumbnail_timestamp: video.thumbnail_timestamp || undefined,
    upload_type: video.upload_type === 'youtube' ? 'youtube' : 'direct',
    is_active: video.is_published,
    order_index: 0,
    file_size: undefined,
    original_filename: undefined,
    videoFile: null,
    thumbnailFile: null,
  });

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
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
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
            <div key={video.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div 
                className="relative aspect-video cursor-pointer group"
                onClick={() => setPlayingVideo(video)}
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
                    <span className="px-2 py-1 text-xs bg-gray-500 text-white rounded">
                      Rascunho
                    </span>
                  )}
                  {video.upload_type === 'youtube' && (
                    <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                      YouTube
                    </span>
                  )}
                </div>
              </div>
              
              {/* Informações */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {video.description}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {FormatDate(video.created_at)}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(video);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModal.openDeleteModal(video, video.title);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Excluir"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Upload/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <VideoUploadFormRoot
                initialData={currentVideo ? convertToFormData(currentVideo) : undefined}
                onSave={handleSaveComplete}
                onCancel={handleCloseModal}
                customContext={{
                  entityType: 'subsector',
                  entityId: subsectorId,
                  apiEndpoint: VIDEO_API_CONFIG.endpoints.subsectorVideoUpload(subsectorId),
                  thumbnailEndpoint: currentVideo 
                    ? VIDEO_API_CONFIG.endpoints.subsectorVideoThumbnail(subsectorId, currentVideo.id)
                    : undefined
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Player de Vídeo */}
      {playingVideo && (
        <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDeleteVideo)}
        itemName={deleteModal.itemName}
        itemType="vídeo"
      />
    </div>
  );
}