/**
 * ImagePreview Custom Hooks
 * Reusable hooks for image preview functionality
 */

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { GalleryImage, ImagePreviewHookReturn, ImageLoadingState } from './ImagePreview.types';

/**
 * Main hook for managing image preview state and navigation
 */
export function useImagePreview(images: GalleryImage[]): ImagePreviewHookReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const currentImage = images[currentIndex] || null;

  const openModal = useCallback((image: GalleryImage, index: number) => {
    const imageIndex = images.findIndex(img => img.id === image.id);
    setCurrentIndex(imageIndex !== -1 ? imageIndex : index);
    setIsOpen(true);
  }, [images]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, images.length]);

  const previousImage = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const goToImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  }, [images.length]);

  const canNavigate = {
    next: currentIndex < images.length - 1,
    previous: currentIndex > 0
  };

  return {
    currentImage,
    currentIndex,
    isOpen,
    openModal,
    closeModal,
    nextImage,
    previousImage,
    goToImage,
    canNavigate
  };
}

/**
 * Hook for managing keyboard navigation
 */
export function useKeyboardNavigation(
  isOpen: boolean,
  onClose: () => void,
  onNext?: () => void,
  onPrevious?: () => void,
  canNavigate?: { next: boolean; previous: boolean }
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (onNext && canNavigate?.next) {
            onNext();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (onPrevious && canNavigate?.previous) {
            onPrevious();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, onNext, onPrevious, canNavigate]);
}

/**
 * Hook for managing focus when modal opens/closes
 */
export function useFocusManagement(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus modal container
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.focus();
        }
      }, 100);
    } else {
      // Restore focus to previous element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return { containerRef };
}

/**
 * Hook for managing body scroll when modal is open
 */
export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Get current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Unlock body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
}

/**
 * Hook for managing image loading state
 */
export function useImageLoading(src: string): ImageLoadingState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setErrorMessage(undefined);
  }, []);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      setError(true);
      setErrorMessage('URL da imagem não fornecida');
      return;
    }

    setLoading(true);
    setError(false);
    setErrorMessage(undefined);

    const img = new Image();
    
    img.onload = () => {
      setLoading(false);
      setError(false);
    };
    
    img.onerror = () => {
      setLoading(false);
      setError(true);
      setErrorMessage('Erro ao carregar imagem');
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return {
    loading,
    error,
    errorMessage,
    retry
  };
}

/**
 * Hook for lazy loading images with Intersection Observer
 */
export function useLazyLoading() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

/**
 * Hook for managing swipe gestures on touch devices
 */
export function useSwipeNavigation(
  onNext?: () => void,
  onPrevious?: () => void,
  canNavigate?: { next: boolean; previous: boolean }
) {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    touchEndX.current = event.changedTouches[0].clientX;
    
    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && onNext && canNavigate?.next) {
        // Swipe left -> next image
        onNext();
      } else if (deltaX < 0 && onPrevious && canNavigate?.previous) {
        // Swipe right -> previous image
        onPrevious();
      }
    }
  }, [onNext, onPrevious, canNavigate]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
}

/**
 * Hook for preloading adjacent images for better performance
 */
export function useImagePreloading(images: GalleryImage[], currentIndex: number) {
  useEffect(() => {
    const preloadImages = [];
    
    // Preload next image
    if (currentIndex < images.length - 1) {
      preloadImages.push(images[currentIndex + 1]);
    }
    
    // Preload previous image
    if (currentIndex > 0) {
      preloadImages.push(images[currentIndex - 1]);
    }

    preloadImages.forEach(image => {
      if (image?.image_url) {
        const img = new Image();
        img.src = image.image_url;
      }
    });
  }, [images, currentIndex]);
}

/**
 * Hook for handling window resize and responsive behavior
 */
export function useResponsiveModal() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return { isMobile };
}