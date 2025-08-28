

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
              'relative bg-white border border-gray-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300',
              isMobile 
                ? 'w-full h-full' 
                : 'mx-4 max-w-[90vw] max-h-[95vh] rounded-lg shadow-2xl'
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
            <div className="px-6 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Visualizador de Imagem
                    </h2>
                    {totalImages > 1 && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {currentIndex + 1} de {totalImages}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {image.title || 'Imagem da galeria'}
                  </p>
                </div>
                <button
                  className="p-1 hover:bg-gray-100 rounded transition-colors ml-4"
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
                    'absolute top-1/2 -translate-y-1/2 z-20',
                    'bg-white/90 backdrop-blur-sm rounded-full',
                    'flex items-center justify-center shadow-lg border border-gray-200',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    isMobile 
                      ? 'left-3 w-8 h-8' 
                      : 'left-6 w-10 h-10',
                    canNavigate.previous 
                      ? 'hover:bg-white hover:shadow-xl cursor-pointer' 
                      : 'cursor-not-allowed opacity-50'
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
                      canNavigate.previous ? 'text-gray-700' : 'text-gray-400',
                      isMobile ? 'w-4 h-4' : 'w-5 h-5'
                    )} 
                  />
                </motion.button>

                {/* Next Button */}
                <motion.button
                  className={clsx(
                    'absolute top-1/2 -translate-y-1/2 z-20',
                    'bg-white/90 backdrop-blur-sm rounded-full',
                    'flex items-center justify-center shadow-lg border border-gray-200',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    isMobile 
                      ? 'right-3 w-8 h-8' 
                      : 'right-6 w-10 h-10',
                    canNavigate.next 
                      ? 'hover:bg-white hover:shadow-xl cursor-pointer' 
                      : 'cursor-not-allowed opacity-50'
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
                      canNavigate.next ? 'text-gray-700' : 'text-gray-400',
                      isMobile ? 'w-4 h-4' : 'w-5 h-5'
                    )} 
                  />
                </motion.button>
              </>
            )}

            {/* Image Container - Scrollable body */}
            <div className="flex-1 overflow-auto">
              <div className="relative bg-white flex items-center justify-center h-full">
              {/* Loading State */}
              {!imageLoaded && !imageError && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  variants={imageLoadingVariants}
                  initial="loading"
                  animate="loading"
                >
                  <div className="text-gray-700 text-center">
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
                  className={clsx(
                    'relative cursor-zoom-in flex items-center justify-center',
                    'w-full min-h-[400px] p-4',
                    isMobile ? 'min-h-[50vh]' : 'min-h-[400px]'
                  )}
                  variants={zoomVariants}
                  animate={isZoomed ? "zoomed" : "initial"}
                  onClick={toggleZoom}
                  key={`image-${image.id}-${currentIndex}`}
                >
                  <div className="relative flex items-center justify-center">
                    <OptimizedImage
                      key={`optimized-${image.id}-${currentIndex}`}
                      src={image.image_url}
                      alt={image.alt_text || image.title || "Imagem da galeria"}
                      width={0}
                      height={0}
                      className={clsx(
                        'w-auto h-auto object-contain transition-opacity duration-300',
                        'max-w-[80vw]',
                        isMobile ? 'max-w-[85vw] max-h-[60vh]' : 'max-h-[75vh]',
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      )}
                      sizes="(max-width: 768px) 90vw, 85vw"
                      quality={95}
                      priority
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      context="gallery"
                    />
                  </div>
                </motion.div>
              )}

              {/* Zoom Indicator - Only on mobile or when zoomed */}
              {imageLoaded && !imageError && (isMobile || isZoomed) && (
                <div className="absolute bottom-4 left-4 z-10">
                  <div className="bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                    {isZoomed ? (
                      <span className="flex items-center gap-1">
                        <Icon name="search" className="w-3 h-3" />
                        Toque para diminuir
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Icon name="search" className="w-3 h-3" />
                        Toque para ampliar
                      </span>
                    )}
                  </div>
                </div>
              )}
              </div>

              {/* Image Information */}
              {showInfo && !isMobile && (
                <CompactImageInfo 
                  image={image} 
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
              <CompactMobileImageInfo 
                image={image} 
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact Desktop Image Information Panel
 */
function CompactImageInfo({ 
  image
}: { 
  image: GalleryImage; 
}) {
  return (
    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-medium text-gray-900 truncate">
            {image.title || 'Imagem da galeria'}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Zoom Hint */}
          <span className="text-xs text-gray-500 hidden sm:block">
            Clique para ampliar
          </span>
          
          {/* Download Button */}
          <a
            href={image.image_url}
            download
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm',
              'bg-primary hover:bg-primary-dark',
              'text-white font-medium',
              'rounded-md transition-colors',
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
 * Compact Mobile Image Information Overlay
 */
function CompactMobileImageInfo({ 
  image
}: { 
  image: GalleryImage; 
}) {
  return (
    <div className="bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-medium truncate">
            {image.title || 'Imagem da galeria'}
          </h2>
        </div>
        
        {/* Download Button */}
        <a
          href={image.image_url}
          download
          className="ml-3 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          aria-label="Baixar imagem"
        >
          <Icon name="download" className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default ImageModal;