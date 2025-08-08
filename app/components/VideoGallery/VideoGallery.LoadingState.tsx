/**
 * VideoGallery Loading States
 * Enterprise-grade skeleton loading components
 */

"use client";

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { loadingAnimations } from './VideoGallery.animations';
import { GridSystem } from './VideoGallery.Grid';

interface LoadingStateProps {
  count?: number;
  layout?: 'grid' | 'list' | 'compact';
  className?: string;
}

/**
 * Main Loading State Component
 */
export function VideoGalleryLoadingState({ 
  count = 4, 
  layout = 'grid',
  className 
}: LoadingStateProps) {
  const layoutType = GridSystem.getGridLayout(count, count);
  const layoutConfig = GridSystem.layouts[layoutType];

  if (layout === 'list') {
    return <ListLoadingState count={count} className={className} />;
  }

  if (layout === 'compact') {
    return <CompactLoadingState count={count} className={className} />;
  }

  return (
    <div className={clsx(layoutConfig.gridClass, layoutConfig.containerClass, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          custom={index}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1, 0.98],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
          className="flex"
        >
          <SkeletonVideoCard />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Skeleton Video Card
 */
export function SkeletonVideoCard() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden w-full animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video bg-neutral-200 relative">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        
        {/* Badge Placeholder */}
        <div className="absolute top-3 right-3">
          <div className="w-16 h-6 bg-neutral-300 rounded-full" />
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title Lines */}
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 rounded w-1/2" />
        </div>
        
        {/* File Size */}
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
          <div className="h-3 bg-neutral-200 rounded w-1/4" />
          <div className="h-6 bg-neutral-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * List Loading State
 */
function ListLoadingState({ count, className }: { count: number; className?: string }) {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          custom={index}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1, 0.98],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        >
          <SkeletonListItem />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Skeleton List Item
 */
function SkeletonListItem() {
  return (
    <div className="flex gap-3 p-3 bg-white rounded-lg border border-neutral-200 animate-pulse">
      {/* Thumbnail */}
      <div className="w-24 h-16 bg-neutral-200 rounded flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
      </div>
    </div>
  );
}

/**
 * Compact Loading State
 */
function CompactLoadingState({ count, className }: { count: number; className?: string }) {
  return (
    <div className={clsx('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          custom={index}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1, 0.98],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        >
          <SkeletonCompactCard />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Skeleton Compact Card
 */
function SkeletonCompactCard() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-3 animate-pulse">
      <div className="flex gap-3">
        {/* Small Thumbnail */}
        <div className="w-16 h-12 bg-neutral-200 rounded flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-neutral-200 rounded w-full" />
          <div className="h-3 bg-neutral-200 rounded w-2/3" />
          <div className="h-2 bg-neutral-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

/**
 * Header Loading State
 */
export function VideoGalleryHeaderSkeleton() {
  return (
    <div className="flex justify-between items-center mb-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 bg-neutral-200 rounded w-64" />
        <div className="h-4 bg-neutral-200 rounded w-48" />
      </div>
      <div className="h-10 bg-neutral-200 rounded w-24" />
    </div>
  );
}

/**
 * Modal Loading State
 */
export function VideoModalLoadingState() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 overflow-hidden">
        {/* Video Area */}
        <div className="aspect-video bg-neutral-800 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-b-2 border-white rounded-full"
          />
        </div>
        
        {/* Info Area */}
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
            <div className="h-4 bg-neutral-200 rounded w-1/3" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-neutral-200 rounded w-24" />
            <div className="h-8 bg-neutral-200 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Progressive Loading Component
 */
interface ProgressiveLoadingProps {
  stage: 'initial' | 'loading' | 'error' | 'complete';
  progress?: number;
  message?: string;
  className?: string;
}

export function ProgressiveLoading({ 
  stage, 
  progress, 
  message,
  className 
}: ProgressiveLoadingProps) {
  const getStageConfig = () => {
    switch (stage) {
      case 'initial':
        return {
          icon: '⏳',
          title: 'Preparando...',
          description: 'Inicializando carregamento'
        };
      case 'loading':
        return {
          icon: '🔄',
          title: 'Carregando vídeos...',
          description: message || 'Buscando conteúdo'
        };
      case 'error':
        return {
          icon: '❌',
          title: 'Erro no carregamento',
          description: message || 'Falha ao carregar vídeos'
        };
      case 'complete':
        return {
          icon: '✅',
          title: 'Carregamento concluído',
          description: 'Vídeos prontos para visualização'
        };
    }
  };

  const config = getStageConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={clsx(
        'flex flex-col items-center justify-center',
        'p-8 text-center space-y-4',
        className
      )}
    >
      <div className="text-4xl mb-2">
        {config.icon}
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-neutral-900">
          {config.title}
        </h3>
        <p className="text-sm text-neutral-600">
          {config.description}
        </p>
      </div>
      
      {progress !== undefined && stage === 'loading' && (
        <div className="w-64 bg-neutral-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}
      
      {stage === 'loading' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-b-2 border-primary rounded-full"
        />
      )}
    </motion.div>
  );
}

export default VideoGalleryLoadingState;