/**
 * Clean Video Modal System
 * Simplified modal with focus on content and reduced visual noise
 */

"use client";

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Icon } from '../icons/Icon';
import { formatFileSize } from '@/lib/video-utils';
import { useFocusManagement, useEscapeKey } from './VideoGallery.hooks';
import { VideoModalProps, DashboardVideo } from './VideoGallery.types';

/**
 * Clean Video Modal Component
 */
export function VideoCleanModal({ isOpen, video, onClose }: VideoModalProps) {
  const { containerRef } = useFocusManagement(isOpen);
  
  // Handle ESC key
  useEscapeKey(onClose, isOpen);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!video) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
            exit={{ opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden scrollbar-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            tabIndex={-1}
          >
            {/* Close Button */}
            <button
              className="
                absolute top-4 right-4 z-10 w-10 h-10 
                bg-black/20 hover:bg-black/40 text-white 
                rounded-full flex items-center justify-center
                transition-all duration-200 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-white/50
              "
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>

            {/* Video Player Container */}
            <div className="aspect-video bg-black">
              <CleanVideoPlayer video={video} />
            </div>
            
            {/* Clean Video Information */}
            <CleanVideoInfo video={video} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Clean Video Player Component
 */
interface CleanVideoPlayerProps {
  video: DashboardVideo;
  autoplay?: boolean;
  controls?: boolean;
}

function CleanVideoPlayer({ video, autoplay = false, controls = true }: CleanVideoPlayerProps) {
  if (video.upload_type === 'youtube' && video.video_url) {
    return <CleanYouTubePlayer video={video} autoplay={autoplay} />;
  }
  
  if (video.upload_type === 'direct' && video.video_url) {
    return <CleanDirectVideoPlayer video={video} autoplay={autoplay} controls={controls} />;
  }
  
  return <CleanVideoPlayerError message="Tipo de vídeo não suportado" />;
}

/**
 * Clean YouTube Player Component
 */
function CleanYouTubePlayer({ video, autoplay }: { video: DashboardVideo; autoplay: boolean }) {
  const embedUrl = video.video_url
    .replace('watch?v=', 'embed/')
    .replace('youtu.be/', 'youtube.com/embed/');

  const urlParams = new URLSearchParams();
  if (autoplay) urlParams.append('autoplay', '1');
  urlParams.append('rel', '0');
  urlParams.append('modestbranding', '1');
  
  const finalUrl = `${embedUrl}?${urlParams.toString()}`;

  return (
    <iframe
      src={finalUrl}
      title={video.title}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
    />
  );
}

/**
 * Clean Direct Video Player Component
 */
function CleanDirectVideoPlayer({ 
  video, 
  autoplay, 
  controls 
}: { 
  video: DashboardVideo; 
  autoplay: boolean; 
  controls: boolean;
}) {
  return (
    <video
      controls={controls}
      autoPlay={autoplay}
      className="w-full h-full object-contain"
      poster={video.thumbnail_url || undefined}
      preload="metadata"
      controlsList="nodownload"
    >
      <source 
        src={video.video_url} 
        type={video.mime_type || 'video/mp4'} 
      />
      
      {/* Fallback content */}
      <div className="flex items-center justify-center h-full text-white p-8">
        <div className="text-center space-y-4">
          <Icon name="video" className="w-12 h-12 mx-auto text-neutral-400" />
          <div>
            <p className="text-lg font-medium mb-2">
              Seu navegador não suporta reprodução de vídeo.
            </p>
            <a 
              href={video.video_url} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              download
            >
              <Icon name="download" className="w-4 h-4" />
              Baixar vídeo
            </a>
          </div>
        </div>
      </div>
    </video>
  );
}

/**
 * Clean Video Player Error State
 */
function CleanVideoPlayerError({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-white bg-neutral-800">
      <div className="text-center space-y-4">
        <Icon name="alert-circle" className="w-12 h-12 mx-auto text-red-400" />
        <div>
          <p className="text-lg font-medium">Erro no player</p>
          <p className="text-neutral-300 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Clean Video Information Panel - Simplified
 */
function CleanVideoInfo({ video }: { video: DashboardVideo }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-6">
        {/* Main Info */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title */}
          <div>
            <h2 
              id="modal-title"
              className="text-xl font-bold text-neutral-900 line-clamp-2"
            >
              {video.title}
            </h2>
          </div>
          
          {/* Metadata - Simplified and Clean */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            {/* Upload Type Badge */}
            <div className="flex items-center gap-1.5">
              <div className={`
                w-2 h-2 rounded-full 
                ${video.upload_type === 'youtube' ? 'bg-red-500' : 'bg-green-500'}
              `} />
              <span className="font-medium">
                {video.upload_type === 'youtube' ? 'YouTube' : 'Upload Direto'}
              </span>
            </div>
            
            {/* File Size - Only for direct uploads */}
            {video.upload_type === 'direct' && video.file_size && (
              <span>{formatFileSize(video.file_size)}</span>
            )}
            
            {/* Upload Date */}
            {video.created_at && (
              <span>Adicionado em {formatDate(video.created_at)}</span>
            )}
          </div>
        </div>
        
        {/* Action Button - Simplified */}
        <div className="flex-shrink-0">
          {video.upload_type === 'direct' && video.video_url ? (
            <a
              href={video.video_url}
              download
              className="
                inline-flex items-center gap-2 px-4 py-2 
                bg-neutral-100 hover:bg-neutral-200 text-neutral-700 
                rounded-lg text-sm font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary/20
              "
            >
              <Icon name="download" className="w-4 h-4" />
              Baixar
            </a>
          ) : video.upload_type === 'youtube' ? (
            <a
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2 px-4 py-2 
                bg-red-600 hover:bg-red-700 text-white 
                rounded-lg text-sm font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500/20
              "
            >
              <Icon name="external-link" className="w-4 h-4" />
              YouTube
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default VideoCleanModal;