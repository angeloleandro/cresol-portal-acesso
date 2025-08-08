/**
 * VideoThumbnail Accessibility Features
 * WCAG 2.1 AA compliance and accessibility enhancements
 */

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { DashboardVideo } from '../VideoGallery/VideoGallery.types';
import { ThumbnailAccessibilityConfig } from './VideoThumbnail.types';

/**
 * Default accessibility configuration
 */
export const defaultAccessibilityConfig: ThumbnailAccessibilityConfig = {
  altText: {
    template: 'Thumbnail do vídeo: {title}',
    includeType: true,
    includeDuration: false
  },
  focusIndicator: {
    enabled: true,
    color: '#F58220',
    width: 2
  },
  highContrast: {
    enabled: true,
    threshold: 0.7
  }
};

/**
 * Generate accessible alt text for video thumbnail
 */
export function generateAccessibleAltText(
  video: DashboardVideo,
  config: ThumbnailAccessibilityConfig['altText'] = defaultAccessibilityConfig.altText
): string {
  let altText = config.template.replace('{title}', video.title);

  if (config.includeType) {
    const typeText = video.upload_type === 'youtube' ? 'YouTube' : 'upload direto';
    altText += ` (${typeText})`;
  }

  if (config.includeDuration && video.upload_type === 'direct') {
    // Duration would be added if available
    altText += ', duração não especificada';
  }

  return altText;
}

/**
 * Accessible Video Thumbnail Component
 */
interface AccessibleVideoThumbnailProps {
  video: DashboardVideo;
  children: React.ReactNode;
  onClick?: (video: DashboardVideo) => void;
  config?: Partial<ThumbnailAccessibilityConfig>;
  className?: string;
  disabled?: boolean;
}

export function AccessibleVideoThumbnail({
  video,
  children,
  onClick,
  config = {},
  className,
  disabled = false
}: AccessibleVideoThumbnailProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const finalConfig = {
    ...defaultAccessibilityConfig,
    ...config,
    altText: { ...defaultAccessibilityConfig.altText, ...config.altText },
    focusIndicator: { ...defaultAccessibilityConfig.focusIndicator, ...config.focusIndicator },
    highContrast: { ...defaultAccessibilityConfig.highContrast, ...config.highContrast }
  };

  // Generate accessible descriptions
  const altText = generateAccessibleAltText(video, finalConfig.altText);
  const ariaLabel = onClick 
    ? `Reproduzir vídeo: ${video.title}` 
    : `Thumbnail: ${video.title}`;

  // Keyboard interaction handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsPressed(true);
      onClick?.(video);
    }

    // Escape key support
    if (e.key === 'Escape') {
      elementRef.current?.blur();
    }
  }, [disabled, onClick, video]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(false);
    }
  }, []);

  // Focus management
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsPressed(false);
  }, []);

  // Click handling with accessibility support
  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.(video);
  }, [disabled, onClick, video]);

  // High contrast detection
  const [highContrastMode, setHighContrastMode] = useState(false);

  useEffect(() => {
    if (!finalConfig.highContrast.enabled) return;

    // Check for high contrast preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrastMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrastMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [finalConfig.highContrast.enabled]);

  // Focus indicator styles
  const focusStyles = finalConfig.focusIndicator.enabled && isFocused ? {
    outline: `${finalConfig.focusIndicator.width}px solid ${finalConfig.focusIndicator.color}`,
    outlineOffset: '2px'
  } : {};

  // High contrast adjustments
  const highContrastStyles = highContrastMode ? {
    filter: 'contrast(1.2) brightness(1.1)',
    border: '2px solid currentColor'
  } : {};

  return (
    <div
      ref={elementRef}
      className={clsx(
        'relative transition-all duration-200',
        {
          'cursor-pointer': onClick && !disabled,
          'cursor-default': !onClick || disabled,
          'opacity-50': disabled,
          'transform scale-95': isPressed,
          'ring-2 ring-primary/20': isFocused && onClick
        },
        className
      )}
      style={{ ...focusStyles, ...highContrastStyles }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={onClick && !disabled ? 0 : -1}
      role={onClick ? 'button' : 'img'}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      aria-describedby={`video-description-${video.id}`}
      aria-pressed={onClick && isPressed ? true : undefined}
    >
      {/* Main content */}
      {children}

      {/* Hidden description for screen readers */}
      <div
        id={`video-description-${video.id}`}
        className="sr-only"
      >
        <AccessibleVideoDescription video={video} />
      </div>

      {/* Focus indicator overlay */}
      {finalConfig.focusIndicator.enabled && isFocused && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `${finalConfig.focusIndicator.width}px solid ${finalConfig.focusIndicator.color}`,
            borderRadius: 'inherit'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        />
      )}

      {/* High contrast overlay */}
      {highContrastMode && (
        <div 
          className="absolute inset-0 pointer-events-none border-2 border-current opacity-20"
          style={{ borderRadius: 'inherit' }}
        />
      )}
    </div>
  );
}

/**
 * Accessible Video Description Component
 */
interface AccessibleVideoDescriptionProps {
  video: DashboardVideo;
  detailed?: boolean;
}

function AccessibleVideoDescription({ 
  video, 
  detailed = false 
}: AccessibleVideoDescriptionProps) {
  const getUploadTypeDescription = () => {
    switch (video.upload_type) {
      case 'youtube':
        return 'Vídeo do YouTube';
      case 'direct':
        return 'Upload direto';
      case 'vimeo':
        return 'Vídeo do Vimeo';
      default:
        return 'Vídeo';
    }
  };

  const getStatusDescription = () => {
    if (video.processing_status === 'processing') {
      const progress = video.upload_progress ? `, ${video.upload_progress}% concluído` : '';
      return `Processando${progress}`;
    }
    if (!video.is_active) {
      return 'Inativo';
    }
    return 'Disponível';
  };

  const formatFileInfo = () => {
    if (!detailed || video.upload_type !== 'direct') return '';
    
    const parts = [];
    if (video.file_size) {
      parts.push(`tamanho: ${formatFileSize(video.file_size)}`);
    }
    if (video.original_filename) {
      parts.push(`arquivo: ${video.original_filename}`);
    }
    
    return parts.length > 0 ? `, ${parts.join(', ')}` : '';
  };

  const formatDate = () => {
    if (!video.created_at) return '';
    try {
      return new Date(video.created_at).toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  return (
    <>
      {`${getUploadTypeDescription()}: ${video.title}. `}
      {`Status: ${getStatusDescription()}. `}
      {video.created_at && `Publicado em ${formatDate()}. `}
      {formatFileInfo()}
      {detailed && video.upload_type === 'youtube' && 
        'Use Enter ou Espaço para abrir o vídeo no YouTube. '}
      {detailed && video.upload_type === 'direct' && 
        'Use Enter ou Espaço para reproduzir o vídeo. '}
    </>
  );
}

/**
 * Skip Links Component for Video Gallery
 */
interface SkipLinksProps {
  galleryId: string;
  hasModal?: boolean;
  className?: string;
}

export function VideoGallerySkipLinks({ 
  galleryId, 
  hasModal = true,
  className 
}: SkipLinksProps) {
  return (
    <div className={clsx('sr-only focus-within:not-sr-only', className)}>
      <a
        href={`#${galleryId}-content`}
        className={clsx(
          'absolute top-0 left-0 z-50',
          'bg-primary text-white px-4 py-2 rounded-br-lg',
          'focus:outline-none focus:ring-2 focus:ring-white/20',
          'transform -translate-y-full focus:translate-y-0',
          'transition-transform duration-200'
        )}
      >
        Pular para conteúdo da galeria
      </a>
      
      {hasModal && (
        <a
          href={`#${galleryId}-player`}
          className={clsx(
            'absolute top-0 left-20 z-50',
            'bg-secondary text-white px-4 py-2 rounded-br-lg',
            'focus:outline-none focus:ring-2 focus:ring-white/20',
            'transform -translate-y-full focus:translate-y-0',
            'transition-transform duration-200'
          )}
        >
          Pular para player
        </a>
      )}
    </div>
  );
}

/**
 * Live Region for Dynamic Updates
 */
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
  className
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={clsx('sr-only', className)}
    >
      {children}
    </div>
  );
}

/**
 * Keyboard Navigation Instructions
 */
interface NavigationInstructionsProps {
  id: string;
  hasModal?: boolean;
  hasKeyboardNavigation?: boolean;
}

export function NavigationInstructions({
  id,
  hasModal = true,
  hasKeyboardNavigation = true
}: NavigationInstructionsProps) {
  return (
    <div id={id} className="sr-only">
      <h3>Instruções de navegação</h3>
      <ul>
        <li>Use Tab para navegar entre os elementos</li>
        <li>Use Enter ou Espaço para ativar vídeos</li>
        {hasKeyboardNavigation && (
          <>
            <li>Use as setas direcionais para navegar pela galeria</li>
            <li>Use Home/End para ir ao primeiro/último vídeo</li>
          </>
        )}
        {hasModal && (
          <>
            <li>Use Escape para fechar o modal do vídeo</li>
            <li>Use Tab para navegar pelos controles do player</li>
          </>
        )}
      </ul>
    </div>
  );
}

/**
 * Video Loading Announcement
 */
interface LoadingAnnouncementProps {
  loading: boolean;
  error?: string | null;
  videoCount?: number;
}

export function LoadingAnnouncement({
  loading,
  error,
  videoCount = 0
}: LoadingAnnouncementProps) {
  let message = '';

  if (loading) {
    message = 'Carregando galeria de vídeos...';
  } else if (error) {
    message = `Erro ao carregar vídeos: ${error}`;
  } else if (videoCount > 0) {
    message = `${videoCount} vídeo${videoCount !== 1 ? 's' : ''} carregado${videoCount !== 1 ? 's' : ''}`;
  } else {
    message = 'Nenhum vídeo disponível';
  }

  return (
    <LiveRegion politeness="polite">
      {message}
    </LiveRegion>
  );
}

/**
 * Utility function for file size formatting
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 10) / 10} ${units[unitIndex]}`;
}

/**
 * Custom hook for accessibility features
 */
export function useVideoThumbnailAccessibility(
  video: DashboardVideo,
  config: Partial<ThumbnailAccessibilityConfig> = {}
) {
  const finalConfig = {
    ...defaultAccessibilityConfig,
    ...config
  };

  const altText = generateAccessibleAltText(video, finalConfig.altText);
  const ariaLabel = `Thumbnail do vídeo: ${video.title}`;

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    altText,
    ariaLabel,
    prefersReducedMotion,
    config: finalConfig
  };
}

export default AccessibleVideoThumbnail;