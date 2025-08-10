/**
 * Unified Video Modal System
 * Enterprise-grade modal with focus management and accessibility
 */

"use client";

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import { Icon } from '../icons/Icon';
import { formatFileSize } from '@/lib/video-utils';
import { modalAnimations } from './VideoGallery.animations';
import { useFocusManagement, useEscapeKey } from './VideoGallery.hooks';
import { VideoModalProps, DashboardVideo } from './VideoGallery.types';

/**
 * Main Video Modal Component
 */
export function VideoModal({ isOpen, video, onClose }: VideoModalProps) {
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
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
            exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
            className="relative w-full max-w-4xl mx-4 bg-white border border-gray-200 rounded-md overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            tabIndex={-1}
          >
            {/* Close Button */}
            <button
              className={clsx(
                'absolute top-4 right-4 z-10',
                'w-10 h-10 bg-white/90 hover:bg-white',
                'border border-neutral-200 rounded-full',
                'flex items-center justify-center',
                'transition-all duration-200',
                'hover:border-gray-300 focus:border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <Icon name="x" className="w-5 h-5 text-neutral-600" />
            </button>

            {/* Video Player Container */}
            <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
              <VideoPlayer video={video} />
            </div>
            
            {/* Video Information */}
            <VideoInfo video={video} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Video Player Component
 */
interface VideoPlayerProps {
  video: DashboardVideo;
  autoplay?: boolean;
  controls?: boolean;
}

function VideoPlayer({ video, autoplay = false, controls = true }: VideoPlayerProps) {
  if (video.upload_type === 'youtube' && video.video_url) {
    return <YouTubePlayer video={video} autoplay={autoplay} />;
  }
  
  if (video.upload_type === 'direct' && video.video_url) {
    return <DirectVideoPlayer video={video} autoplay={autoplay} controls={controls} />;
  }
  
  return <VideoPlayerError message="Tipo de vídeo não suportado" />;
}

/**
 * YouTube Player Component
 */
function YouTubePlayer({ video, autoplay }: { video: DashboardVideo; autoplay: boolean }) {
  const embedUrl = video.video_url
    .replace('watch?v=', 'embed/')
    .replace('youtu.be/', 'youtube.com/embed/');

  const urlParams = new URLSearchParams();
  if (autoplay) urlParams.append('autoplay', '1');
  urlParams.append('rel', '0'); // Não mostrar vídeos relacionados
  urlParams.append('modestbranding', '1'); // Logo menos proeminente
  
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
 * Direct Video Player Component
 */
function DirectVideoPlayer({ 
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
        <div className="text-center">
          <Icon name="video" className="w-8 h-8 mx-auto mb-4 text-neutral-400" />
          <p className="mb-4">
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
    </video>
  );
}

/**
 * Video Player Error State
 */
function VideoPlayerError({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-white bg-neutral-800">
      <div className="text-center">
        <Icon name="alert-circle" className="w-8 h-8 mx-auto mb-4 text-red-400" />
        <p className="text-lg font-medium mb-2">Erro no player</p>
        <p className="text-neutral-300">{message}</p>
      </div>
    </div>
  );
}

/**
 * Video Player Loading State
 */
function VideoPlayerLoading() {
  return (
    <div className="flex items-center justify-center h-full text-white bg-neutral-800">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-b-2 border-primary rounded-full mx-auto mb-4"
        />
        <p className="text-lg font-medium">Carregando vídeo...</p>
      </div>
    </div>
  );
}

/**
 * Video Information Panel
 */
function VideoInfo({ video }: { video: DashboardVideo }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return null;
    }
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h2 
            id="modal-title"
            className="text-xl font-bold text-neutral-900 mb-3"
          >
            {video.title}
          </h2>
          
          {/* Video Details */}
          <div 
            id="modal-description"
            className="space-y-2"
          >
            {/* File Info for Direct Uploads */}
            {video.upload_type === 'direct' && video.original_filename && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Icon name="folder" className="w-4 h-4 text-neutral-400" />
                <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded">
                  {video.original_filename}
                </span>
              </div>
            )}
            
            {/* File Size */}
            {video.file_size && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Icon name="file" className="w-4 h-4 text-neutral-400" />
                <span>Tamanho: {formatFileSize(video.file_size)}</span>
              </div>
            )}
            
            {/* Upload Date */}
            {video.created_at && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Icon name="calendar" className="w-4 h-4 text-neutral-400" />
                <span>Adicionado em {formatDate(video.created_at)}</span>
              </div>
            )}
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-3 mt-4">
            <VideoTypeBadge uploadType={video.upload_type} />
            
            {video.upload_type === 'direct' && (
              <VideoStatusBadge 
                status={video.processing_status} 
                progress={video.upload_progress}
              />
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {video.upload_type === 'direct' && video.video_url && (
            <a
              href={video.video_url}
              download
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-2',
                'bg-neutral-100 hover:bg-neutral-200',
                'text-neutral-700 text-sm font-medium',
                'rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            >
              <Icon name="download" className="w-4 h-4" />
              Baixar
            </a>
          )}
          
          {video.upload_type === 'youtube' && (
            <a
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-2',
                'bg-red-600 hover:bg-red-700',
                'text-white text-sm font-medium',
                'rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-red-500/20'
              )}
            >
              <Icon name="external-link" className="w-4 h-4" />
              YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Video Type Badge
 */
function VideoTypeBadge({ uploadType }: { uploadType: DashboardVideo['upload_type'] }) {
  const config = {
    direct: {
      icon: 'video' as const,
      label: 'Upload Interno',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    youtube: {
      icon: 'monitor-play' as const,
      label: 'YouTube',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    vimeo: {
      icon: 'video' as const,
      label: 'Vimeo',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  };

  const { icon, label, className } = config[uploadType] || config.direct;

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-3 py-1.5',
      'text-sm font-medium rounded-lg border',
      className
    )}>
      <Icon name={icon} className="w-4 h-4" />
      {label}
    </span>
  );
}

/**
 * Video Status Badge for Direct Uploads
 */
function VideoStatusBadge({ 
  status, 
  progress 
}: { 
  status?: string; 
  progress?: number;
}) {
  if (status === 'ready' && progress === 100) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 border border-green-200 text-sm font-medium rounded-lg">
        <Icon name="check-circle" className="w-4 h-4" />
        Pronto
      </span>
    );
  }

  if (status === 'processing' || (progress && progress < 100)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 border border-yellow-200 text-sm font-medium rounded-lg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Icon name="refresh-cw" className="w-4 h-4" />
        </motion.div>
        Processando {progress ? `${Math.round(progress)}%` : ''}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-800 border border-neutral-200 text-sm font-medium rounded-lg">
      <Icon name="clock" className="w-4 h-4" />
      Pendente
    </span>
  );
}

/**
 * Compact Modal for mobile/smaller screens
 */
export function CompactVideoModal({ isOpen, video, onClose }: VideoModalProps) {
  const { containerRef } = useFocusManagement(isOpen);
  
  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!video) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
        >
          <div className="absolute inset-0 bg-black" />
          
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
            exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
            className="relative flex flex-col h-full bg-black"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compact-modal-title"
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
              <h2 
                id="compact-modal-title"
                className="text-white font-medium truncate pr-4"
              >
                {video.title}
              </h2>
              <button
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                onClick={onClose}
                aria-label="Fechar modal"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full aspect-video">
                <VideoPlayer video={video} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VideoModal;