/**
 * Clean Video Modal System
 * Simplified modal with focus on content and reduced visual noise
 */

"use client";

import { useEffect, useCallback, memo, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Icon } from '../icons/Icon';
import { formatFileSize } from '@/lib/video-utils';
import { 
  useOptimizedFocusManagement, 
  useOptimizedEscapeKey 
} from '@/hooks/useOptimizedVideoGallery';
import { VideoModalProps, DashboardVideo } from './VideoGallery.types';

/**
 * Clean Video Modal Component
 */
export const VideoCleanModal = memo(function VideoCleanModal({ isOpen, video, onClose }: VideoModalProps) {
  const { containerRef } = useOptimizedFocusManagement(isOpen);

  // ESC
  useOptimizedEscapeKey(onClose, isOpen);

  // Lock scroll
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && e.currentTarget.classList.contains('fixed')) {
      onClose();
    }
  }, [onClose]);

  // Memoized styles to prevent re-renders
  const backdropStyle = useMemo(() => ({
    zIndex: 999999,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 0,
    padding: 0
  }), []);

  const modalContainerStyle = useMemo(() => ({
    zIndex: 999999,
    transition: 'background-color 0.2s ease',
    pointerEvents: 'all' as const
  }), []);

  const videoStyle = useMemo(() => ({
    maxWidth: '95vw',
    maxHeight: '85vh',
    outline: 'none',
    borderRadius: '12px'
  }), []);

  if (!isOpen || !video) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={backdropStyle}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            style={{ zIndex: 999999, pointerEvents: 'none' }}
          />
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
            exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.15 } }}
            className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            tabIndex={-1}
            style={{
              zIndex: 999999,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 32px)',
              position: 'relative',
              margin: '16px',
              pointerEvents: 'all'
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-black/20 text-white rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
              style={modalContainerStyle}
              onMouseEnter={(e) => {
                e.stopPropagation();
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
            <div
              className="aspect-video bg-black"
              style={{ pointerEvents: 'all', userSelect: 'none', WebkitUserSelect: 'none', position: 'relative' }}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseEnter={(e) => e.stopPropagation()}
              onMouseLeave={(e) => e.stopPropagation()}
            >
              <CleanVideoPlayer video={video} />
            </div>
            <CleanVideoInfo video={video} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

/**
 * Clean Video Player Component - Memoized
 */
interface CleanVideoPlayerProps {
  video: DashboardVideo;
  autoplay?: boolean;
  controls?: boolean;
}

const CleanVideoPlayer = memo(function CleanVideoPlayer({ 
  video, 
  autoplay = true, 
  controls = true 
}: CleanVideoPlayerProps) {
  if (video.upload_type === 'youtube' && video.video_url) {
    return <CleanYouTubePlayer video={video} autoplay={autoplay} />;
  }
  
  if (video.upload_type === 'direct' && video.video_url) {
    return <CleanDirectVideoPlayer video={video} autoplay={autoplay} controls={controls} />;
  }
  
  return <CleanVideoPlayerError message="Tipo de vídeo não suportado" />;
});

/**
 * Clean YouTube Player Component - Memoized
 */
const CleanYouTubePlayer = memo(function CleanYouTubePlayer({ 
  video, 
  autoplay 
}: { 
  video: DashboardVideo; 
  autoplay: boolean 
}) {
  const finalUrl = useMemo(() => {
    const embedUrl = video.video_url
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'youtube.com/embed/');

    const urlParams = new URLSearchParams();
    if (autoplay) urlParams.append('autoplay', '1');
    urlParams.append('rel', '0');
    urlParams.append('modestbranding', '1');
    
    return `${embedUrl}?${urlParams.toString()}`;
  }, [video.video_url, autoplay]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <iframe
      src={finalUrl}
      title={video.title}
      className="w-full h-full"
      style={{
        border: 'none',
        outline: 'none',
        backgroundColor: '#000',
        pointerEvents: 'all'
      }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      frameBorder="0"
      onMouseMove={handleMouseMove}
    />
  );
});

/**
 * Clean Direct Video Player Component - Memoized com cleanup
 */
const CleanDirectVideoPlayer = memo(function CleanDirectVideoPlayer({ 
  video, 
  autoplay, 
  controls 
}: { 
  video: DashboardVideo; 
  autoplay: boolean; 
  controls: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cleanup automático ao desmontar
  useEffect(() => {
    const element = videoRef.current;
    return () => {
      if (element) {
        try {
          element.pause();
          element.currentTime = 0;
          // Limpa src para liberar memória
          element.removeAttribute('src');
          element.load();
        } catch (err) {
          // Silencioso: limpeza best-effort
        }
      }
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleError = useCallback(() => {
    // Error handled silently, fallback content will be shown
  }, []);

  return (
    <video
      ref={videoRef}
      controls={controls}
      autoPlay={autoplay}
      className="w-full h-full object-contain"
      style={{
        backgroundColor: '#000',
        outline: 'none',
        pointerEvents: 'all'
      }}
      poster={video.thumbnail_url || undefined}
      preload="metadata"
      controlsList="nodownload"
      onMouseMove={handleMouseMove}
      onError={handleError}
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
});

/**
 * Clean Video Player Error State - Memoized
 */
const CleanVideoPlayerError = memo(function CleanVideoPlayerError({ message }: { message: string }) {
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
});

/**
 * Clean Video Information Panel - Simplified and Memoized
 */
const CleanVideoInfo = memo(function CleanVideoInfo({ video }: { video: DashboardVideo }) {
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return null;
    }
  }, []);

  const formattedDate = useMemo(() => formatDate(video.created_at), [formatDate, video.created_at]);

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
                {video.upload_type === 'youtube' ? 'YouTube' : 'Upload Interno'}
              </span>
            </div>
            
            {/* File Size - Only for direct uploads */}
            {video.upload_type === 'direct' && video.file_size && (
              <span>{formatFileSize(video.file_size)}</span>
            )}
            
            {/* Upload Date */}
            {formattedDate && (
              <span>Adicionado em {formattedDate}</span>
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
});

export default VideoCleanModal;