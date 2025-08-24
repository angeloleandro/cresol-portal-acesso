

"use client";

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useState, memo } from 'react';

import { useOptimizedVideoGallery, useOptimizedInView } from '@/hooks/useOptimizedVideoGallery';

import HomeVideoCard from './VideoCard';
import { containerAnimations } from './VideoGallery/VideoGallery.animations';
import { VideoCleanModal } from './VideoGallery/VideoGallery.CleanModal';
import { VideoGalleryEmptyState } from './VideoGallery/VideoGallery.EmptyState';
import { AsymmetricGrid } from './VideoGallery/VideoGallery.Grid';
import { VideoGalleryHeader } from './VideoGallery/VideoGallery.Header';
import { useKeyboardNavigation, usePerformanceMonitor } from './VideoGallery/VideoGallery.hooks';
import { VideoGalleryLoadingState } from './VideoGallery/VideoGallery.LoadingState';
import { ThumbnailPerformanceProvider } from './VideoThumbnail';

interface HomeVideoGalleryProps {
  className?: string;
}

/**
 * Home Video Gallery with clean cards (max 3 videos)
 */
export const HomeVideoGallery = memo(function HomeVideoGallery({
  className
}: HomeVideoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Performance monitoring
  usePerformanceMonitor('HomeVideoGallery');
  
  // Intersection observer for lazy loading
  const { ref: containerRef, isInView, hasBeenInView } = useOptimizedInView({
    rootMargin: '100px',
    threshold: 0.1
  });

  // Main gallery hook with limit of 3
  const {
    videos,
    loading,
    error,
    modalOpen,
    selectedVideo,
    displayVideos,
    actions: { openModal, closeModal, refetch }
  } = useOptimizedVideoGallery(3); // Fixed limit of 3

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
        <VideoGalleryHeader
          title="Vídeos em destaque"
          subtitle="Carregando conteúdo..."
          showSeeAll={false}
        />
        <VideoGalleryLoadingState count={3} />
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
        <VideoGalleryHeader
          title="Vídeos em destaque"
          showSeeAll={false}
        />
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
        <VideoGalleryHeader
          title="Vídeos em destaque"
          showSeeAll={false}
        />
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
          priorityCount: 3, // All 3 videos get priority
          adjacentCount: 0, // No adjacent preloading needed
          strategy: 'smart'
        },
        caching: {
          enabled: true,
          maxSize: 10, // Smaller cache for home page
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
        aria-label="Galeria de vídeos em destaque - página inicial"
      >
        {/* Header */}
        <VideoGalleryHeader
          title="Vídeos em destaque"
          subtitle="Assista aos conteúdos em vídeo"
          videoCount={videos.length}
          showSeeAll={videos.length > 0}
          seeAllHref="/videos"
          seeAllText="Ver todos os vídeos"
        />

        {/* Video Grid - Using AsymmetricGrid for 3 videos */}
        <AsymmetricGrid className="justify-items-center">
          {displayVideos.map((video, index) => (
            <HomeVideoCard
              key={video.id}
              video={video}
              onClick={openModal}
              priority={true} // All home videos get priority loading
              className="w-full"
            />
          ))}
        </AsymmetricGrid>

        {/* Video Modal */}
        <VideoCleanModal
          isOpen={modalOpen}
          video={selectedVideo}
          onClose={closeModal}
        />
      </motion.section>
    </ThumbnailPerformanceProvider>
  );
});

export default HomeVideoGallery;