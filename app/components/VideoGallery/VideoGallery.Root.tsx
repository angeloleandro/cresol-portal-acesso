/**
 * VideoGallery Root Component
 * Enterprise-grade unified video gallery system with advanced thumbnail system
 */

"use client";

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useOptimizedVideoGallery, useOptimizedInView } from '@/hooks/useOptimizedVideoGallery';
import { useKeyboardNavigation, usePerformanceMonitor } from './VideoGallery.hooks';
import { VideoGalleryGrid } from './VideoGallery.Grid';
import { EnhancedVideoCard, SkeletonVideoCard } from './VideoGallery.Card';
import { VideoCleanModal } from './VideoGallery.CleanModal';
import { VideoGalleryHeader } from './VideoGallery.Header';
import { VideoGalleryLoadingState } from './VideoGallery.LoadingState';
import { VideoGalleryEmptyState } from './VideoGallery.EmptyState';
import { containerAnimations } from './VideoGallery.animations';
import { VideoGalleryProps } from './VideoGallery.types';
// Enhanced thumbnail system
import { ThumbnailPerformanceProvider, VideoThumbnail } from '../VideoThumbnail';

/**
 * Main VideoGallery Root Component
 */
export function VideoGalleryRoot({
  limit = 4,
  className,
  showHeader = true,
  showSeeAll = true,
  virtualizeAt = 20
}: VideoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Performance monitoring
  usePerformanceMonitor('VideoGalleryRoot');
  
  // Intersection observer for lazy loading (otimizado)
  const { ref: containerRef, isInView, hasBeenInView } = useOptimizedInView({
    rootMargin: '100px',
    threshold: 0.1
  });

  // Main gallery hook (otimizado)
  const {
    videos,
    loading,
    error,
    modalOpen,
    selectedVideo,
    displayVideos,
    actions: { openModal, closeModal, refetch }
  } = useOptimizedVideoGallery(limit);

  // Keyboard navigation
  useKeyboardNavigation({
    selectedIndex,
    totalItems: displayVideos.length,
    onSelect: setSelectedIndex,
    onAction: (video) => {
      const targetVideo = displayVideos[selectedIndex];
      if (targetVideo) {
        openModal(targetVideo);
      }
    },
    onEscape: modalOpen ? closeModal : undefined
  });

  // Don't render until in view (performance optimization)
  if (!hasBeenInView && !isInView) {
    return (
      <div 
        ref={containerRef} 
        className={clsx('min-h-[300px]', className)}
        aria-label="Carregando galeria de vídeos"
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <section 
        ref={containerRef}
        className={clsx('w-full', className)}
        aria-label="Carregando galeria de vídeos"
      >
        {showHeader && (
          <VideoGalleryHeader
            title="Vídeos em destaque"
            subtitle="Carregando conteúdo..."
            showSeeAll={false}
          />
        )}
        <VideoGalleryLoadingState count={limit} />
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section 
        ref={containerRef}
        className={clsx('w-full', className)}
      >
        {showHeader && (
          <VideoGalleryHeader
            title="Vídeos em destaque"
            showSeeAll={false}
          />
        )}
        <VideoGalleryEmptyState
          variant="error"
          message={error}
          actionLabel="Tentar novamente"
          onAction={refetch}
        />
      </section>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <section 
        ref={containerRef}
        className={clsx('w-full', className)}
      >
        {showHeader && (
          <VideoGalleryHeader
            title="Vídeos em destaque"
            showSeeAll={false}
          />
        )}
        <VideoGalleryEmptyState
          variant="default"
          actionLabel="Explorar conteúdo"
          actionHref="/videos"
        />
      </section>
    );
  }

  return (
    <ThumbnailPerformanceProvider
      config={{
        preloading: {
          enabled: true,
          priorityCount: Math.min(6, displayVideos.length),
          adjacentCount: 2,
          strategy: 'smart'
        },
        caching: {
          enabled: true,
          maxSize: 50,
          ttl: 1800000, // 30 minutes
          storage: 'memory'
        },
        compression: {
          webp: {
            enabled: true,
            quality: 85,
            fallback: true
          },
          jpeg: {
            quality: 90,
            progressive: true
          },
          png: {
            enabled: true
          }
        }
      }}
    >
      <motion.section
        ref={containerRef}
        variants={containerAnimations}
        initial="hidden"
        animate="visible"
        className={clsx(
          'w-full space-y-6',
          // Base spacing (mobile)
          'px-4 py-6',
          // Tablet adjustments
          'sm:px-6 sm:py-8',
          // Desktop refinements  
          'lg:px-8 lg:py-10',
          className
        )}
        aria-label="Galeria de vídeos em destaque"
      >
      {/* Header */}
      {showHeader && (
        <VideoGalleryHeader
          title="Vídeos em destaque"
          subtitle="Assista aos conteúdos mais relevantes"
          videoCount={videos.length}
          showSeeAll={showSeeAll && videos.length > limit}
          seeAllHref="/videos"
          seeAllText="Ver todos os vídeos"
        />
      )}

      {/* Video Grid */}
      <VideoGalleryGrid
        videoCount={displayVideos.length}
        limit={limit}
        enableAnimations={true}
      >
        {displayVideos.map((video, index) => (
          <EnhancedVideoCard
            key={video.id}
            video={video}
            index={index}
            priority={index < 4} // Priority loading for first 4 videos
            onClick={openModal}
            className={clsx(
              'w-full',
              selectedIndex === index && 'ring-2 ring-primary ring-opacity-50'
            )}
          />
        ))}
      </VideoGalleryGrid>

      {/* Show more indicator */}
      {videos.length > limit && (
        <ShowMoreIndicator 
          totalVideos={videos.length}
          displayedVideos={limit}
          href="/videos"
        />
      )}

      {/* Video Modal */}
      <VideoCleanModal
        isOpen={modalOpen}
        video={selectedVideo}
        onClose={closeModal}
      />

      {/* Screen Reader Announcements */}
      <ScreenReaderSupport 
        videos={displayVideos}
        currentVideo={selectedVideo}
        loading={loading}
      />
      </motion.section>
    </ThumbnailPerformanceProvider>
  );
}

/**
 * Show More Indicator Component
 */
interface ShowMoreIndicatorProps {
  totalVideos: number;
  displayedVideos: number;
  href: string;
}

function ShowMoreIndicator({ 
  totalVideos, 
  displayedVideos, 
  href 
}: ShowMoreIndicatorProps) {
  const remainingCount = totalVideos - displayedVideos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="text-center pt-4"
    >
      <a
        href={href}
        className={clsx(
          'inline-flex items-center gap-2 px-4 py-2',
          'text-sm font-medium text-neutral-600',
          'hover:text-primary transition-colors duration-200',
          'bg-neutral-50 hover:bg-neutral-100',
          'rounded-lg border border-neutral-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/20'
        )}
        aria-label={`Ver mais ${remainingCount} vídeos adicionais`}
      >
        <span>+{remainingCount} vídeos adicionais</span>
        <motion.div
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}
        >
          →
        </motion.div>
      </a>
    </motion.div>
  );
}

/**
 * Screen Reader Support Component
 */
interface ScreenReaderSupportProps {
  videos: any[];
  currentVideo: any;
  loading: boolean;
}

function ScreenReaderSupport({ 
  videos, 
  currentVideo, 
  loading 
}: ScreenReaderSupportProps) {
  return (
    <>
      {/* Live region for dynamic updates */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {loading && "Carregando galeria de vídeos..."}
        {videos.length > 0 && !loading && (
          `Galeria de ${videos.length} vídeos carregada. 
           Use as setas para navegar e Enter para reproduzir.`
        )}
      </div>
      
      {/* Current video announcement */}
      {currentVideo && (
        <div 
          aria-live="assertive" 
          className="sr-only"
        >
          {`Reproduzindo: ${currentVideo.title}`}
        </div>
      )}

      {/* Navigation instructions */}
      <div className="sr-only" id="video-gallery-instructions">
        Use as setas direcionais para navegar pelos vídeos. 
        Pressione Enter ou Espaço para reproduzir. 
        Pressione Escape para fechar o modal.
      </div>
    </>
  );
}

/**
 * Compact VideoGallery variant
 */
interface CompactVideoGalleryProps extends Omit<VideoGalleryProps, 'showHeader'> {
  title?: string;
  maxHeight?: string;
}

export const CompactVideoGallery = memo(function CompactVideoGallery({
  limit = 6,
  title = "Vídeos recentes",
  maxHeight = "400px",
  className,
  ...props
}: CompactVideoGalleryProps) {
  const {
    videos,
    loading,
    error,
    modalOpen,
    selectedVideo,
    displayVideos,
    actions: { openModal, closeModal }
  } = useOptimizedVideoGallery(limit);

  if (loading) {
    return (
      <div className={clsx('space-y-4', className)}>
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        <VideoGalleryLoadingState count={3} layout="compact" />
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div className={clsx('space-y-4', className)}>
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        <div className="text-sm text-neutral-500 text-center py-8">
          {error ? 'Erro ao carregar vídeos' : 'Nenhum vídeo disponível'}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-neutral-500">
            ({videos.length})
          </span>
        </h3>
        {videos.length > limit && (
          <a 
            href="/videos"
            className="text-xs text-primary hover:text-primary-dark transition-colors"
          >
            Ver todos
          </a>
        )}
      </div>

      <div 
        className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300"
        style={{ maxHeight }}
      >
        {displayVideos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => openModal(video)}
            className={clsx(
              'flex gap-3 p-2 rounded-lg cursor-pointer',
              'hover:bg-neutral-50 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
            tabIndex={0}
            role="button"
            aria-label={`Reproduzir: ${video.title}`}
          >
            <div className="flex-shrink-0">
              <VideoThumbnail
                video={video}
                variant="minimal"
                aspectRatio="4/3"
                priority={index < 3}
                showOverlay={false}
                showBadge={false}
                showDuration={false}
                sizes="64px"
                quality={75}
                className="w-16 h-12 rounded"
                placeholder={{
                  variant: 'solid',
                  icon: {
                    name: 'video',
                    size: 'sm'
                  },
                  animated: false
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-neutral-900 line-clamp-1">
                {video.title}
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                {video.upload_type === 'youtube' ? 'YouTube' : 'Upload direto'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <VideoCleanModal
        isOpen={modalOpen}
        video={selectedVideo}
        onClose={closeModal}
      />
    </div>
  );
});

export default VideoGalleryRoot;