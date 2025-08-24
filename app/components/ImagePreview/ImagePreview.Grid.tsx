

"use client";

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

import { Icon } from '../icons/Icon';
import OptimizedImage from '../OptimizedImage';
import {
  gridContainerVariants,
  gridItemVariants,
  cardHoverVariants,
  overlayVariants,
  skeletonVariants
} from './ImagePreview.animations';
import { useLazyLoading } from './ImagePreview.hooks';
import { ImageGridProps, ImageCardProps, GalleryImage } from './ImagePreview.types';

/**
 * Main Image Grid Component
 */
/**
 * ImageGrid function
 * @todo Add proper documentation
 */
export function ImageGrid({
  images,
  onImageClick,
  columns = {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6
  },
  aspectRatio = '4:3',
  loading = false,
  emptyState,
  lazyLoading = true,
  thumbnailQuality = 75
}: ImageGridProps) {
  const gridClasses = useMemo(() => {
    return clsx(
      'grid gap-4',
      `grid-cols-${columns.xs}`,
      `sm:grid-cols-${columns.sm}`,
      `md:grid-cols-${columns.md}`,
      `lg:grid-cols-${columns.lg}`,
      `xl:grid-cols-${columns.xl}`
    );
  }, [columns]);

  const aspectRatioClass = useMemo(() => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '4:3':
        return 'aspect-[4/3]';
      case '16:9':
        return 'aspect-video';
      default:
        return 'aspect-[4/3]';
    }
  }, [aspectRatio]);

  if (loading) {
    return <ImageGridSkeleton columns={columns} aspectRatioClass={aspectRatioClass} />;
  }

  if (images.length === 0) {
    return (
      <EmptyState
        title={emptyState?.title}
        description={emptyState?.description}
        icon={emptyState?.icon}
      />
    );
  }

  return (
    <motion.div
      className={gridClasses}
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          variants={gridItemVariants}
        >
          <ImageCard
            image={image}
            onClick={() => onImageClick?.(image, index)}
            aspectRatio={aspectRatio}
            lazyLoading={lazyLoading}
            quality={thumbnailQuality}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Individual Image Card Component
 */
/**
 * ImageCard function
 * @todo Add proper documentation
 */
export function ImageCard({
  image,
  onClick,
  aspectRatio = '4:3',
  showOverlay = true,
  lazyLoading = true,
  quality = 75,
  loading = false
}: ImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { ref: lazyRef, inView } = useLazyLoading();

  const aspectRatioClass = useMemo(() => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '4:3':
        return 'aspect-[4/3]';
      case '16:9':
        return 'aspect-video';
      default:
        return 'aspect-[4/3]';
    }
  }, [aspectRatio]);

  const shouldLoad = lazyLoading ? inView : true;

  if (loading) {
    return (
      <div className={clsx('relative w-full bg-gray-200 rounded-lg overflow-hidden', aspectRatioClass)}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
          variants={skeletonVariants}
          animate="loading"
        />
      </div>
    );
  }

  return (
    <motion.div
      ref={lazyRef}
      className={clsx(
        'relative w-full cursor-pointer group overflow-hidden',
        'bg-gray-100 rounded-lg border border-gray-200/50',
        'hover:border-gray-200/80 transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary',
        aspectRatioClass
      )}
      variants={cardHoverVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Ver imagem: ${image.title || 'Imagem da galeria'}`}
    >
      {/* Image Container */}
      <div className="absolute inset-0">
        {shouldLoad && !imageError ? (
          <OptimizedImage
            src={image.image_url}
            alt={image.alt_text || image.title || "Imagem da galeria"}
            fill
            className={clsx(
              'object-cover transition-all duration-300',
              'group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            sizes={`(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw`}
            quality={quality}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            context="thumbnail"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        ) : imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400 p-4">
              <Icon name="image" className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">Erro ao carregar</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>

      {/* Loading Placeholder */}
      {shouldLoad && !imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-b-2 border-gray-300 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Hover Overlay */}
      {showOverlay && imageLoaded && !imageError && (
        <motion.div
          className="absolute inset-0 bg-black/20 flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="hidden"
          whileHover="visible"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <Icon name="search" className="h-6 w-6 text-primary" />
          </div>
        </motion.div>
      )}

      {/* Image Title */}
      {image.title && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-sm font-medium truncate">
            {image.title}
          </p>
        </div>
      )}

      {/* Focus Ring for Accessibility */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 pointer-events-none" />
    </motion.div>
  );
}

/**
 * Loading Skeleton for Grid
 */
function ImageGridSkeleton({ 
  columns, 
  aspectRatioClass 
}: { 
  columns: ImageGridProps['columns']; 
  aspectRatioClass: string;
}) {
  const skeletonItems = Array.from({ length: 12 }, (_, i) => i);
  
  const gridClasses = clsx(
    'grid gap-4',
    `grid-cols-${columns?.xs || 2}`,
    `sm:grid-cols-${columns?.sm || 3}`,
    `md:grid-cols-${columns?.md || 4}`,
    `lg:grid-cols-${columns?.lg || 5}`,
    `xl:grid-cols-${columns?.xl || 6}`
  );

  return (
    <div className={gridClasses}>
      {skeletonItems.map((index) => (
        <motion.div
          key={index}
          className={clsx(
            'relative w-full bg-gray-200 rounded-lg overflow-hidden',
            aspectRatioClass
          )}
          variants={skeletonVariants}
          animate="loading"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ 
  title = "Nenhuma imagem encontrada",
  description = "A galeria ainda não possui imagens disponíveis.",
  icon = "image"
}: {
  title?: string;
  description?: string;
  icon?: string;
}) {
  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon name={icon as any} className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 max-w-sm mx-auto">
        {description}
      </p>
    </motion.div>
  );
}

/**
 * Responsive Masonry Grid Component (Alternative Layout)
 */
/**
 * ImageMasonryGrid function
 * @todo Add proper documentation
 */
export function ImageMasonryGrid({
  images,
  onImageClick,
  loading = false,
  lazyLoading = true,
  thumbnailQuality = 75
}: Omit<ImageGridProps, 'columns' | 'aspectRatio'>) {
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({});

  const handleImageLoad = (imageId: string, naturalHeight: number, naturalWidth: number) => {
    const aspectRatio = naturalHeight / naturalWidth;
    setImageHeights(prev => ({
      ...prev,
      [imageId]: Math.min(Math.max(aspectRatio * 300, 200), 400)
    }));
  };

  if (loading) {
    return <ImageGridSkeleton columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }} aspectRatioClass="aspect-[4/3]" />;
  }

  if (images.length === 0) {
    return <EmptyState />;
  }

  return (
    <motion.div
      className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4"
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          variants={gridItemVariants}
          className="break-inside-avoid mb-4"
        >
          <MasonryImageCard
            image={image}
            onClick={() => onImageClick?.(image, index)}
            height={imageHeights[image.id]}
            onImageLoad={handleImageLoad}
            lazyLoading={lazyLoading}
            quality={thumbnailQuality}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Masonry Image Card Component
 */
function MasonryImageCard({
  image,
  onClick,
  height,
  onImageLoad,
  lazyLoading = true,
  quality = 75
}: {
  image: GalleryImage;
  onClick: () => void;
  height?: number;
  onImageLoad: (id: string, naturalHeight: number, naturalWidth: number) => void;
  lazyLoading?: boolean;
  quality?: number;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { ref: lazyRef, inView } = useLazyLoading();

  const shouldLoad = lazyLoading ? inView : true;

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    onImageLoad(image.id, img.naturalHeight, img.naturalWidth);
    setImageLoaded(true);
  };

  return (
    <motion.div
      ref={lazyRef}
      className="relative cursor-pointer group overflow-hidden bg-gray-100 rounded-lg border border-gray-200/50 hover:border-gray-200/80 transition-all duration-200"
      style={{ height: height || 300 }}
      variants={cardHoverVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {shouldLoad && !imageError ? (
        <>
          <OptimizedImage
            src={image.image_url}
            alt={image.alt_text || image.title || "Imagem da galeria"}
            fill
            className={clsx(
              'object-cover transition-all duration-300 group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            quality={quality}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            context="thumbnail"
          />

          {/* Hover Overlay */}
          {imageLoaded && (
            <motion.div
              className="absolute inset-0 bg-black/20 flex items-center justify-center"
              variants={overlayVariants}
              initial="hidden"
              whileHover="visible"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                <Icon name="search" className="h-6 w-6 text-primary" />
              </div>
            </motion.div>
          )}

          {/* Title */}
          {image.title && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-sm font-medium line-clamp-2">
                {image.title}
              </p>
            </div>
          )}
        </>
      ) : imageError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400 p-4">
            <Icon name="image" className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs">Erro ao carregar</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </motion.div>
  );
}

export default ImageGrid;