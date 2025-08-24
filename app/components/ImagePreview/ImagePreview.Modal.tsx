

"use client";

import clsx from 'clsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback, useEffect } from 'react';

import { Icon } from '../icons/Icon';
import OptimizedImage from '../OptimizedImage';
import { 
  backdropVariants, 
  GetResponsiveModalVariants,
  imageLoadingVariants,
  navButtonVariants,
  infoOverlayVariants,
  zoomVariants
} from './ImagePreview.animations';
import { 
  useFocusManagement, 
  useBodyScrollLock, 
  useKeyboardNavigation,
  useSwipeNavigation,
  useResponsiveModal,
  useImagePreloading
} from './ImagePreview.hooks';
import { ImageModalProps, GalleryImage } from './ImagePreview.types';

import { FormatDate } from '@/lib/utils/formatters';
/**
 * Main Image Modal Component
 */
/**
 * ImageModal function
 * @todo Add proper documentation
 */
export function ImageModal({ 
  image, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious, 
  showNavigation = true,
  showInfo = true,
  currentIndex = 0,
  totalImages = 0
}: ImageModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { containerRef } = useFocusManagement(isOpen);
  const { isMobile } = useResponsiveModal();
  
  useBodyScrollLock(isOpen);
  useKeyboardNavigation(
    isOpen, 
    onClose, 
    onNext, 
    onPrevious, 
    { 
      next: Boolean(onNext && currentIndex < totalImages - 1), 
      previous: Boolean(onPrevious && currentIndex > 0) 
    }
  );

  const canNavigate = {
    next: Boolean(onNext && currentIndex < totalImages - 1),
    previous: Boolean(onPrevious && currentIndex > 0)
  };

  const swipeHandlers = useSwipeNavigation(onNext, onPrevious, canNavigate);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(false);
    setImageError(true);
  }, []);

  // Reset image loading state when image changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setIsZoomed(false); // Also reset zoom state
  }, [image?.id, currentIndex]);

  const toggleZoom = useCallback(() => {
    setIsZoomed(prev => !prev);
  }, []);

  if (!image) return null;

  const modalVariants = GetResponsiveModalVariants(isMobile);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <motion.div
            ref={containerRef}
            className={clsx(
              'relative w-full mx-4 bg-white border border-gray-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300',
              isMobile ? 'h-full' : 'max-w-6xl max-h-[90vh] rounded-md'
            )}
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            tabIndex={-1}
            {...swipeHandlers}
          >
            {/* Header with title and close button */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Visualizador de Imagem
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {image.title || 'Imagem da galeria'}
                  </p>
                </div>
                <button
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  onClick={onClose}
                  aria-label="Fechar modal"
                >
                  <Icon name="x" className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            {showNavigation && totalImages > 1 && (
              <>
                {/* Previous Button */}
                <motion.button
                  className={clsx(
                    'absolute left-4 top-1/2 -translate-y-1/2 z-20',
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    canNavigate.previous ? 'cursor-pointer' : 'cursor-not-allowed'
                  )}
                  variants={navButtonVariants}
                  initial="idle"
                  whileHover={canNavigate.previous ? "hover" : "disabled"}
                  whileTap={canNavigate.previous ? "tap" : undefined}
                  onClick={canNavigate.previous ? onPrevious : undefined}
                  disabled={!canNavigate.previous}
                  aria-label="Imagem anterior"
                >
                  <Icon 
                    name="chevron-left" 
                    className={clsx(
                      'w-6 h-6 text-white',
                      !canNavigate.previous && 'opacity-50'
                    )} 
                  />
                </motion.button>

                {/* Next Button */}
                <motion.button
                  className={clsx(
                    'absolute right-4 top-1/2 -translate-y-1/2 z-20',
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    canNavigate.next ? 'cursor-pointer' : 'cursor-not-allowed'
                  )}
                  variants={navButtonVariants}
                  initial="idle"
                  whileHover={canNavigate.next ? "hover" : "disabled"}
                  whileTap={canNavigate.next ? "tap" : undefined}
                  onClick={canNavigate.next ? onNext : undefined}
                  disabled={!canNavigate.next}
                  aria-label="Próxima imagem"
                >
                  <Icon 
                    name="chevron-right" 
                    className={clsx(
                      'w-6 h-6 text-white',
                      !canNavigate.next && 'opacity-50'
                    )} 
                  />
                </motion.button>
              </>
            )}

            {/* Image Container - Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className={clsx(
                'relative bg-black flex items-center justify-center overflow-hidden',
                isMobile ? 'h-full' : 'aspect-video max-h-[70vh]'
              )}>
              {/* Loading State */}
              {!imageLoaded && !imageError && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  variants={imageLoadingVariants}
                  initial="loading"
                  animate="loading"
                >
                  <div className="text-white text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-b-2 border-primary rounded-full mx-auto mb-4"
                    />
                    <p className="text-lg font-medium">Carregando imagem...</p>
                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {imageError && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  variants={imageLoadingVariants}
                  initial="loading"
                  animate="error"
                >
                  <div className="text-white text-center p-8">
                    <Icon name="image" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Erro ao carregar imagem</p>
                    <p className="text-gray-300 mb-4">A imagem não pôde ser exibida</p>
                    <button
                      onClick={() => {
                        setImageError(false);
                        setImageLoaded(false);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Image */}
              {!imageError && (
                <motion.div
                  className="relative w-full h-full cursor-zoom-in"
                  variants={zoomVariants}
                  animate={isZoomed ? "zoomed" : "initial"}
                  onClick={toggleZoom}
                  key={`image-${image.id}-${currentIndex}`} // Force re-render on navigation
                >
                  <OptimizedImage
                    key={`optimized-${image.id}-${currentIndex}`} // Critical: Force image component re-mount
                    src={image.image_url}
                    alt={image.alt_text || image.title || "Imagem da galeria"}
                    fill
                    className={clsx(
                      'object-contain transition-opacity duration-300',
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    sizes="90vw"
                    quality={90}
                    priority
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    context="gallery"
                  />
                </motion.div>
              )}

              {/* Zoom Indicator */}
              {imageLoaded && !imageError && (
                <div className="absolute bottom-4 left-4 z-10">
                  <div className="bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm">
                    {isZoomed ? (
                      <span className="flex items-center gap-1">
                        <Icon name="search" className="w-4 h-4" />
                        Clique para diminuir
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Icon name="search" className="w-4 h-4" />
                        Clique para ampliar
                      </span>
                    )}
                  </div>
                </div>
              )}
              </div>

              {/* Image Information */}
              {showInfo && !isMobile && (
                <ImageInfo 
                  image={image} 
                  currentIndex={currentIndex} 
                  totalImages={totalImages} 
                />
              )}
            </div>
          </motion.div>

          {/* Mobile Info Overlay */}
          {showInfo && isMobile && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-10"
              variants={infoOverlayVariants}
              initial="hidden"
              animate="visible"
            >
              <MobileImageInfo 
                image={image} 
                currentIndex={currentIndex} 
                totalImages={totalImages} 
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Desktop Image Information Panel
 */
function ImageInfo({ 
  image, 
  currentIndex = 0, 
  totalImages = 0 
}: { 
  image: GalleryImage; 
  currentIndex?: number; 
  totalImages?: number; 
}) {

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="p-6 bg-gray-50 border-t border-gray-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h2 
            id="modal-title"
            className="text-xl font-bold text-gray-900 mb-3 truncate"
          >
            {image.title || 'Imagem da galeria'}
          </h2>
          
          {/* Image Details */}
          <div 
            id="modal-description"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600"
          >
            {/* File Info */}
            {image.file_size && (
              <div className="flex items-center gap-2">
                <Icon name="file" className="w-4 h-4 text-gray-400" />
                <span>Tamanho: {formatFileSize(image.file_size)}</span>
              </div>
            )}
            
            {/* Upload Date */}
            {image.created_at && (
              <div className="flex items-center gap-2">
                <Icon name="calendar" className="w-4 h-4 text-gray-400" />
                <span>Adicionado em {FormatDate(image.created_at)}</span>
              </div>
            )}

            {/* Image Type */}
            {image.mime_type && (
              <div className="flex items-center gap-2">
                <Icon name="image" className="w-4 h-4 text-gray-400" />
                <span className="uppercase font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {image.mime_type.split('/')[1] || 'IMG'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Counter and Actions */}
        <div className="flex flex-col items-end gap-3">
          {/* Image Counter */}
          {totalImages > 1 && (
            <div className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700">
              {currentIndex + 1} de {totalImages}
            </div>
          )}
          
          {/* Download Button */}
          <a
            href={image.image_url}
            download
            className={clsx(
              'inline-flex items-center gap-2 px-3 py-1.5 text-sm',
              'bg-primary hover:bg-primary-dark',
              'text-white font-medium',
              'rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          >
            <Icon name="download" className="w-4 h-4" />
            Baixar
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile Image Information Overlay
 */
function MobileImageInfo({ 
  image, 
  currentIndex = 0, 
  totalImages = 0 
}: { 
  image: GalleryImage; 
  currentIndex?: number; 
  totalImages?: number; 
}) {
  return (
    <div className="bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold mb-1 truncate">
            {image.title || 'Imagem da galeria'}
          </h2>
          {totalImages > 1 && (
            <p className="text-sm text-gray-300">
              {currentIndex + 1} de {totalImages}
            </p>
          )}
        </div>
        
        {/* Download Button */}
        <a
          href={image.image_url}
          download
          className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          aria-label="Baixar imagem"
        >
          <Icon name="download" className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

export default ImageModal;