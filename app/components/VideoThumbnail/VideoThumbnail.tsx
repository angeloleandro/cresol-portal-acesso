/**
 * VideoThumbnail Component
 * Enterprise-grade thumbnail system with performance optimizations and elegant fallbacks
 */

"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import OptimizedImage from '../OptimizedImage';
import { Icon } from '../icons/Icon';
import { 
  VideoThumbnailProps, 
  ThumbnailVariant,
  AspectRatio,
  OverlayVariant
} from './VideoThumbnail.types';
import { 
  ThumbnailPlaceholder,
  LoadingThumbnailPlaceholder,
  ErrorThumbnailPlaceholder,
  CompactThumbnailPlaceholder
} from './VideoThumbnail.Placeholder';
import { 
  useThumbnail,
  useThumbnailLazyLoading
} from './VideoThumbnail.hooks';
import { 
  getThumbnailSizeConfig,
  getAspectRatioClass,
  calculateOptimalSizes
} from './VideoThumbnail.utils';

/**
 * Main VideoThumbnail Component
 */
export function VideoThumbnail({
  video,
  aspectRatio = '16/9',
  variant = 'default',
  showOverlay = true,
  showDuration = false,
  showBadge = true,
  priority = false,
  sizes,
  quality = 80,
  className,
  onClick,
  onLoad,
  onError,
  placeholder,
  overlay
}: VideoThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Thumbnail loading logic
  const { src, state, retry } = useThumbnail(video, {
    priority,
    onLoad: () => {
      setImageLoaded(true);
      onLoad?.();
    },
    onError
  });

  // Lazy loading
  const { inView } = useThumbnailLazyLoading(containerRef, {
    enabled: !priority,
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  });

  // Handle click
  const handleClick = useCallback(() => {
    onClick?.(video);
  }, [onClick, video]);

  // Get component classes
  const aspectClass = getAspectRatioClass(aspectRatio);
  const shouldLoad = priority || inView;

  const containerClasses = clsx(
    'relative overflow-hidden group',
    'cursor-pointer select-none',
    'focus-within:ring-2 focus-within:ring-primary/20',
    'transition-all duration-300',
    aspectClass,
    {
      'hover:border-gray-300': variant !== 'compact',
      'rounded-lg': variant === 'default',
      'rounded-md': variant === 'compact',
      'rounded-xl': variant === 'hero',
      'border border-gray-200': variant === 'default' || variant === 'card'
    },
    className
  );

  // Render based on variant
  if (variant === 'minimal') {
    return <MinimalThumbnail {...{ video, src, state, shouldLoad, onClick, aspectRatio, className }} />;
  }

  if (variant === 'compact') {
    return <CompactThumbnail {...{ video, src, state, shouldLoad, onClick, className }} />;
  }

  return (
    <motion.div
      ref={containerRef}
      className={containerClasses}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `Reproduzir vídeo: ${video.title}` : video.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ 
        y: variant === 'hero' ? -5 : -2,
        transition: { duration: 0.2 }
      }}
    >
      <ThumbnailContent
        video={video}
        src={src}
        state={state}
        shouldLoad={shouldLoad}
        imageLoaded={imageLoaded}
        isHovered={isHovered}
        variant={variant}
        aspectRatio={aspectRatio}
        showOverlay={showOverlay}
        showDuration={showDuration}
        showBadge={showBadge}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        overlay={overlay}
        onRetry={retry}
      />
    </motion.div>
  );
}

/**
 * Thumbnail Content Component
 */
interface ThumbnailContentProps {
  video: VideoThumbnailProps['video'];
  src: string | null;
  state: any;
  shouldLoad: boolean;
  imageLoaded: boolean;
  isHovered: boolean;
  variant: ThumbnailVariant;
  aspectRatio: AspectRatio;
  showOverlay: boolean;
  showDuration: boolean;
  showBadge: boolean;
  sizes?: string;
  quality: number;
  placeholder?: VideoThumbnailProps['placeholder'];
  overlay?: VideoThumbnailProps['overlay'];
  onRetry: () => void;
}

function ThumbnailContent({
  video,
  src,
  state,
  shouldLoad,
  imageLoaded,
  isHovered,
  variant,
  aspectRatio,
  showOverlay,
  showDuration,
  showBadge,
  sizes,
  quality,
  placeholder,
  overlay,
  onRetry
}: ThumbnailContentProps) {
  // Loading state
  if (!shouldLoad || state.loading) {
    return (
      <LoadingThumbnailPlaceholder 
        aspectRatio={aspectRatio}
        progress={video.upload_progress}
        status={video.processing_status === 'processing' ? 'Processando...' : 'Carregando...'}
      />
    );
  }

  // Error state
  if (state.error || (!src && state.retryCount > 0)) {
    return (
      <ErrorThumbnailPlaceholder
        aspectRatio={aspectRatio}
        message="Thumbnail indisponível"
        onRetry={onRetry}
        retryable={state.retryCount < 3}
      />
    );
  }

  // No thumbnail available - show placeholder
  if (!src) {
    return (
      <ThumbnailPlaceholder
        variant={placeholder?.variant || 'gradient'}
        aspectRatio={aspectRatio}
        size={variant}
        config={placeholder}
        animated={placeholder?.animated !== false}
      />
    );
  }

  // Main thumbnail content
  return (
    <>
      {/* Main Image */}
      <OptimizedImage
        src={src}
        alt={video.title}
        fill
        sizes={sizes || calculateOptimalSizes('lg')}
        quality={quality}
        priority={false}
        className={clsx(
          'object-cover transition-all duration-500',
          {
            'group-hover:scale-105': variant === 'hero',
            'group-hover:scale-102': variant === 'default'
          }
        )}
        fallbackText="Thumbnail"
      />

      {/* Gradient Overlay */}
      {showOverlay && (
        <ThumbnailOverlay 
          variant={overlay?.variant || 'hover'}
          opacity={overlay?.opacity}
          gradient={overlay?.gradient}
          isHovered={isHovered}
          content={overlay?.content}
        />
      )}

      {/* Video Type Badge */}
      {showBadge && (
        <ThumbnailBadge
          uploadType={video.upload_type}
          variant={variant}
          isHovered={isHovered}
        />
      )}

      {/* Play Button */}
      <PlayButton variant={variant} isHovered={isHovered} />

      {/* Duration Badge */}
      {showDuration && video.upload_type === 'direct' && (
        <DurationBadge duration="HD" variant={variant} />
      )}

      {/* Processing Status */}
      {video.processing_status === 'processing' && (
        <ProcessingOverlay progress={video.upload_progress} />
      )}
    </>
  );
}

/**
 * Thumbnail Overlay Component
 */
interface ThumbnailOverlayProps {
  variant: OverlayVariant;
  opacity?: number;
  gradient?: boolean;
  isHovered: boolean;
  content?: React.ReactNode;
}

function ThumbnailOverlay({
  variant,
  opacity = 0.3,
  gradient = true,
  isHovered,
  content
}: ThumbnailOverlayProps) {
  if (variant === 'none') return null;

  const shouldShow = variant === 'always' || 
                   (variant === 'hover' && isHovered) ||
                   (variant === 'focus' && isHovered);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className={clsx(
            'absolute inset-0',
            gradient 
              ? 'bg-gradient-to-t from-black/50 via-transparent to-transparent'
              : 'bg-black'
          )}
          style={{ opacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Thumbnail Badge Component
 */
interface ThumbnailBadgeProps {
  uploadType: 'youtube' | 'vimeo' | 'direct';
  variant: ThumbnailVariant;
  isHovered: boolean;
}

function ThumbnailBadge({ uploadType, variant, isHovered }: ThumbnailBadgeProps) {
  const getBadgeConfig = () => {
    switch (uploadType) {
      case 'youtube':
        return {
          icon: 'monitor-play' as const,
          label: 'YouTube',
          color: 'bg-red-600'
        };
      case 'direct':
        return {
          icon: 'video' as const,
          label: 'Interno',
          color: 'bg-green-600'
        };
      default:
        return {
          icon: 'video' as const,
          label: 'Vídeo',
          color: 'bg-neutral-600'
        };
    }
  };

  const config = getBadgeConfig();
  const size = variant === 'compact' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <motion.div
      className="absolute top-2 right-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <span className={clsx(
        'inline-flex items-center gap-1 rounded-full',
        'text-white font-medium',
        'backdrop-blur-sm',
        config.color,
        size
      )}>
        <Icon name={config.icon} className="w-3 h-3" />
        <span className="sr-only sm:not-sr-only">{config.label}</span>
      </span>
    </motion.div>
  );
}

/**
 * Play Button Component
 */
interface PlayButtonProps {
  variant: ThumbnailVariant;
  isHovered: boolean;
}

function PlayButton({ variant, isHovered }: PlayButtonProps) {
  const size = variant === 'hero' ? 'w-20 h-20' : 
               variant === 'compact' ? 'w-8 h-8' : 'w-14 h-14';
  const iconSize = variant === 'hero' ? 'w-8 h-8' : 
                   variant === 'compact' ? 'w-3 h-3' : 'w-5 h-5';

  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={clsx(
              'flex items-center justify-center rounded-full',
              'bg-white/95 text-primary border border-gray-200',
              'backdrop-blur-sm',
              size
            )}
          >
            <Icon 
              name="play" 
              className={clsx(iconSize, 'ml-0.5')}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Duration Badge Component
 */
interface DurationBadgeProps {
  duration: string;
  variant: ThumbnailVariant;
}

function DurationBadge({ duration, variant }: DurationBadgeProps) {
  const size = variant === 'compact' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <motion.div
      className="absolute bottom-2 left-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <span className={clsx(
        'inline-block rounded',
        'bg-black/70 text-white font-medium',
        'backdrop-blur-sm',
        size
      )}>
        {duration}
      </span>
    </motion.div>
  );
}

/**
 * Processing Overlay Component
 */
interface ProcessingOverlayProps {
  progress?: number;
}

function ProcessingOverlay({ progress }: ProcessingOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 bg-black/60 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center text-white space-y-2">
        <motion.div
          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        <p className="text-xs font-medium">Processando...</p>
        {typeof progress === 'number' && (
          <div className="w-16 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Minimal Thumbnail Variant
 */
function MinimalThumbnail({
  video,
  src,
  state,
  shouldLoad,
  onClick,
  aspectRatio,
  className
}: {
  video: any;
  src: string | null;
  state: any;
  shouldLoad: boolean;
  onClick?: (video: any) => void;
  aspectRatio: AspectRatio;
  className?: string;
}) {
  if (!shouldLoad || state.loading) {
    return <CompactThumbnailPlaceholder className={className} animated />;
  }

  if (state.error || !src) {
    return <CompactThumbnailPlaceholder className={className} />;
  }

  return (
    <div 
      className={clsx(
        'relative overflow-hidden cursor-pointer',
        getAspectRatioClass(aspectRatio),
        className
      )}
      onClick={() => onClick?.(video)}
    >
      <OptimizedImage
        src={src}
        alt={video.title}
        fill
        sizes="120px"
        quality={60}
        className="object-cover hover:scale-105 transition-transform duration-300"
        fallbackText="Thumb"
      />
    </div>
  );
}

/**
 * Compact Thumbnail Variant
 */
function CompactThumbnail({
  video,
  src,
  state,
  shouldLoad,
  onClick,
  className
}: {
  video: any;
  src: string | null;
  state: any;
  shouldLoad: boolean;
  onClick?: (video: any) => void;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="compact-thumbnail-wrapper">{/* Compact thumbnail container */}
    <motion.div
      className={clsx(
        'relative w-24 h-16 bg-neutral-100 rounded overflow-hidden',
        'cursor-pointer flex-shrink-0 group',
        className
      )}
      onClick={() => onClick?.(video)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {!shouldLoad || state.loading ? (
        <CompactThumbnailPlaceholder animated />
      ) : state.error || !src ? (
        <CompactThumbnailPlaceholder />
      ) : (
        <>
          <OptimizedImage
            src={src}
            alt={video.title}
            fill
            sizes="96px"
            quality={70}
            className="object-cover"
            fallbackText="Thumb"
          />
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon name="play" className="w-3 h-3 text-primary ml-0.5" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      </motion.div>
    </div>
  );
}

export default VideoThumbnail;