/**
 * ImagePreview - Complete Image Preview System
 * Main component that combines grid, modal, and all features
 */

"use client";

import { useImagePreview, useImagePreloading } from './ImagePreview.hooks';
import { ImageGrid, ImageMasonryGrid } from './ImagePreview.Grid';
import { ImageModal } from './ImagePreview.Modal';
import { ImagePreviewProps, ImagePreviewWithGridProps, GalleryImage } from './ImagePreview.types';

/**
 * Complete ImagePreview System
 * Includes grid display and modal preview with navigation
 */
export function ImagePreview({
  images,
  currentIndex: externalCurrentIndex,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onImageChange,
  showNavigation = true,
  showInfo = true,
  closeOnBackdrop = true,
  enableKeyboard = true,
  quality = 90
}: ImagePreviewProps) {
  const {
    currentImage,
    currentIndex: internalCurrentIndex,
    isOpen: internalIsOpen,
    openModal,
    closeModal,
    nextImage,
    previousImage,
    goToImage
  } = useImagePreview(images);

  // Use external state if provided, otherwise use internal state
  const currentIndex = externalCurrentIndex ?? internalCurrentIndex;
  const isOpen = externalIsOpen ?? internalIsOpen;
  const onClose = externalOnClose ?? closeModal;

  // Preload adjacent images for better UX
  useImagePreloading(images, currentIndex);

  const handleImageChange = (index: number) => {
    if (onImageChange) {
      onImageChange(index);
    } else {
      goToImage(index);
    }
  };

  const handleNext = () => {
    const newIndex = currentIndex + 1;
    if (newIndex < images.length) {
      handleImageChange(newIndex);
    }
  };

  const handlePrevious = () => {
    const newIndex = currentIndex - 1;
    if (newIndex >= 0) {
      handleImageChange(newIndex);
    }
  };

  const selectedImage = images[currentIndex] || null;

  return (
    <ImageModal
      image={selectedImage}
      isOpen={isOpen}
      onClose={onClose}
      onNext={showNavigation ? handleNext : undefined}
      onPrevious={showNavigation ? handlePrevious : undefined}
      showNavigation={showNavigation}
      showInfo={showInfo}
      currentIndex={currentIndex}
      totalImages={images.length}
    />
  );
}

/**
 * ImagePreview with Grid Display
 * Complete solution with both grid and modal
 */
export function ImagePreviewWithGrid({
  images,
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
  thumbnailQuality = 75,
  showNavigation = true,
  showInfo = true,
  enableKeyboard = true,
  modalQuality = 90,
  layout = 'grid'
}: ImagePreviewWithGridProps) {
  const {
    currentImage,
    currentIndex,
    isOpen,
    openModal,
    closeModal,
    nextImage,
    previousImage
  } = useImagePreview(images);

  // Preload adjacent images
  useImagePreloading(images, currentIndex);

  const GridComponent = layout === 'masonry' ? ImageMasonryGrid : ImageGrid;

  return (
    <>
      <GridComponent
        images={images}
        onImageClick={openModal}
        columns={columns}
        aspectRatio={aspectRatio}
        loading={loading}
        emptyState={emptyState}
        lazyLoading={lazyLoading}
        thumbnailQuality={thumbnailQuality}
      />
      
      <ImageModal
        image={currentImage}
        isOpen={isOpen}
        onClose={closeModal}
        onNext={showNavigation ? nextImage : undefined}
        onPrevious={showNavigation ? previousImage : undefined}
        showNavigation={showNavigation}
        showInfo={showInfo}
        currentIndex={currentIndex}
        totalImages={images.length}
      />
    </>
  );
}

/**
 * Lightweight Image Grid Only (without modal)
 * For cases where you want to handle modal externally
 */
export function ImagePreviewGrid({
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
  thumbnailQuality = 75,
  layout = 'grid'
}: {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage, index: number) => void;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  aspectRatio?: '1:1' | '4:3' | '16:9' | 'auto';
  loading?: boolean;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: string;
  };
  lazyLoading?: boolean;
  thumbnailQuality?: number;
  layout?: 'grid' | 'masonry';
}) {
  const GridComponent = layout === 'masonry' ? ImageMasonryGrid : ImageGrid;
  
  return (
    <GridComponent
      images={images}
      onImageClick={onImageClick}
      columns={columns}
      aspectRatio={aspectRatio}
      loading={loading}
      emptyState={emptyState}
      lazyLoading={lazyLoading}
      thumbnailQuality={thumbnailQuality}
    />
  );
}

/**
 * Modal Only Component
 * For cases where you have your own grid implementation
 */
export function ImagePreviewModal({
  image,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  showNavigation = true,
  showInfo = true,
  currentIndex = 0,
  totalImages = 0
}: {
  image: GalleryImage | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
  showInfo?: boolean;
  currentIndex?: number;
  totalImages?: number;
}) {
  return (
    <ImageModal
      image={image}
      isOpen={isOpen}
      onClose={onClose}
      onNext={onNext}
      onPrevious={onPrevious}
      showNavigation={showNavigation}
      showInfo={showInfo}
      currentIndex={currentIndex}
      totalImages={totalImages}
    />
  );
}

// Export all components and hooks for external use
export * from './ImagePreview.types';
export * from './ImagePreview.hooks';
export * from './ImagePreview.Grid';
export * from './ImagePreview.Modal';
export * from './ImagePreview.animations';

// Default export is the complete system
export default ImagePreviewWithGrid;