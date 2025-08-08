/**
 * VideoThumbnail Advanced Features
 * Sophisticated hover effects, duration overlays, and aspect ratio handling
 */

"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import clsx from 'clsx';
import Icon from '../icons/Icon';
import { DashboardVideo } from '../VideoGallery/VideoGallery.types';
import { 
  AspectRatio, 
  ThumbnailVariant, 
  ThumbnailAnimationConfig 
} from './VideoThumbnail.types';

/**
 * Advanced Hover Effects Configuration
 */
export interface AdvancedHoverConfig {
  variant: 'subtle' | 'pronounced' | 'cinematic' | 'minimal';
  enableParallax?: boolean;
  enableMagnify?: boolean;
  enableGlow?: boolean;
  enableTilt?: boolean;
  intensity?: number; // 0-1 scale
}

/**
 * Duration Overlay Configuration
 */
export interface DurationOverlayConfig {
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center-bottom';
  style: 'pill' | 'rounded' | 'square' | 'transparent';
  showProgress?: boolean;
  animated?: boolean;
  autoHide?: boolean;
}

/**
 * Advanced Aspect Ratio Handler
 */
export interface AdvancedAspectRatioConfig {
  ratio: AspectRatio;
  cropMode?: 'cover' | 'contain' | 'fill' | 'scale-down';
  alignment?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  responsive?: {
    sm?: AspectRatio;
    md?: AspectRatio;
    lg?: AspectRatio;
    xl?: AspectRatio;
  };
}

/**
 * Advanced Video Thumbnail with Sophisticated Effects
 */
interface AdvancedVideoThumbnailProps {
  video: DashboardVideo;
  children: React.ReactNode;
  hoverConfig?: AdvancedHoverConfig;
  durationConfig?: DurationOverlayConfig;
  aspectConfig?: AdvancedAspectRatioConfig;
  animationConfig?: ThumbnailAnimationConfig;
  className?: string;
  onHover?: (isHovered: boolean) => void;
  disabled?: boolean;
}

export function AdvancedVideoThumbnail({
  video,
  children,
  hoverConfig = {
    variant: 'subtle',
    enableParallax: true,
    intensity: 0.7
  },
  durationConfig,
  aspectConfig = {
    ratio: '16/9',
    cropMode: 'cover',
    alignment: 'center'
  },
  animationConfig,
  className,
  onHover,
  disabled = false
}: AdvancedVideoThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Handle mouse enter
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    setIsHovered(true);
    onHover?.(true);

    if (hoverConfig.enableParallax) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    }

    controls.start('hover');
  }, [disabled, hoverConfig.enableParallax, onHover, controls]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (disabled || !hoverConfig.enableParallax) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    }
  }, [disabled, hoverConfig.enableParallax]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    
    setIsHovered(false);
    onHover?.(false);
    setMousePosition({ x: 0.5, y: 0.5 });
    controls.start('default');
  }, [disabled, onHover, controls]);

  // Get hover animations based on variant
  const getHoverAnimations = () => {
    const intensity = hoverConfig.intensity ?? 0.7;
    
    switch (hoverConfig.variant) {
      case 'pronounced':
        return {
          scale: 1 + (0.1 * intensity),
          y: -8 * intensity,
          rotateX: hoverConfig.enableTilt ? 5 * intensity : 0,
          rotateY: hoverConfig.enableTilt ? (mousePosition.x - 0.5) * 10 * intensity : 0
        };
      
      case 'cinematic':
        return {
          scale: 1 + (0.15 * intensity),
          y: -12 * intensity,
          rotateX: hoverConfig.enableTilt ? 8 * intensity : 0,
          rotateY: hoverConfig.enableTilt ? (mousePosition.x - 0.5) * 15 * intensity : 0,
          filter: `brightness(${1 + 0.2 * intensity})`
        };
      
      case 'minimal':
        return {
          scale: 1 + (0.02 * intensity),
          y: -2 * intensity
        };
      
      case 'subtle':
      default:
        return {
          scale: 1 + (0.05 * intensity),
          y: -4 * intensity,
          rotateX: hoverConfig.enableTilt ? 2 * intensity : 0
        };
    }
  };

  // Get aspect ratio classes
  const getAspectRatioClasses = () => {
    const { ratio, responsive } = aspectConfig;
    
    let classes = getAspectRatioClass(ratio);
    
    if (responsive) {
      if (responsive.sm) classes += ` sm:${getAspectRatioClass(responsive.sm)}`;
      if (responsive.md) classes += ` md:${getAspectRatioClass(responsive.md)}`;
      if (responsive.lg) classes += ` lg:${getAspectRatioClass(responsive.lg)}`;
      if (responsive.xl) classes += ` xl:${getAspectRatioClass(responsive.xl)}`;
    }
    
    return classes;
  };

  return (
    <motion.div
      ref={containerRef}
      className={clsx(
        'relative overflow-hidden',
        getAspectRatioClasses(),
        {
          'cursor-pointer': !disabled,
          'opacity-50': disabled
        },
        className
      )}
      style={{
        perspective: hoverConfig.enableTilt ? '1000px' : undefined
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={controls}
      variants={{
        default: {
          scale: 1,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          filter: 'brightness(1)'
        },
        hover: getHoverAnimations()
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
    >
      {/* Main Content with Parallax Effect */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transform: hoverConfig.enableParallax && isHovered
            ? `translate(${(mousePosition.x - 0.5) * 5}px, ${(mousePosition.y - 0.5) * 5}px)`
            : undefined
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        {/* Content with crop mode */}
        <div 
          className={clsx(
            'w-full h-full',
            {
              'object-cover': aspectConfig.cropMode === 'cover',
              'object-contain': aspectConfig.cropMode === 'contain',
              'object-fill': aspectConfig.cropMode === 'fill',
              'object-scale-down': aspectConfig.cropMode === 'scale-down'
            }
          )}
        >
          {children}
        </div>

        {/* Glow Effect */}
        {hoverConfig.enableGlow && (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(245, 130, 32, 0.3), transparent 60%)',
                  filter: 'blur(10px)'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
        )}

        {/* Magnify Effect */}
        {hoverConfig.enableMagnify && (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '2px solid rgba(245, 130, 32, 0.5)',
                  left: `${mousePosition.x * 100}%`,
                  top: `${mousePosition.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  backdropFilter: 'blur(0px) scale(1.5)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Duration Overlay */}
      {durationConfig && (
        <DurationOverlay
          video={video}
          config={durationConfig}
          isVisible={!durationConfig.autoHide || isHovered}
        />
      )}

      {/* Interactive Overlay */}
      <InteractiveOverlay
        isHovered={isHovered}
        variant={hoverConfig.variant}
        disabled={disabled}
      />
    </motion.div>
  );
}

/**
 * Duration Overlay Component
 */
interface DurationOverlayProps {
  video: DashboardVideo;
  config: DurationOverlayConfig;
  isVisible: boolean;
}

function DurationOverlay({ video, config, isVisible }: DurationOverlayProps) {
  const [duration, setDuration] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Mock duration - in real app, this would come from video metadata
  useEffect(() => {
    if (video.upload_type === 'direct') {
      // Simulated duration calculation
      setDuration('2:34');
      setProgress(0.3); // 30% watched
    } else if (video.upload_type === 'youtube') {
      setDuration('5:12');
      setProgress(0);
    }
  }, [video]);

  if (!duration) return null;

  const getPositionClasses = () => {
    switch (config.position) {
      case 'top-left':
        return 'top-2 left-2';
      case 'top-right':
        return 'top-2 right-2';
      case 'bottom-right':
        return 'bottom-2 right-2';
      case 'center-bottom':
        return 'bottom-2 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
      default:
        return 'bottom-2 left-2';
    }
  };

  const getStyleClasses = () => {
    const base = 'text-xs font-medium text-white backdrop-blur-sm';
    switch (config.style) {
      case 'rounded':
        return `${base} bg-black/70 px-2 py-1 rounded-md`;
      case 'square':
        return `${base} bg-black/70 px-2 py-1`;
      case 'transparent':
        return `${base} bg-transparent px-1 py-0.5 drop-shadow-lg`;
      case 'pill':
      default:
        return `${base} bg-black/70 px-2.5 py-1 rounded-full`;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={clsx('absolute', getPositionClasses())}
          initial={{ opacity: 0, scale: 0.8, y: config.animated ? 10 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: config.animated ? -10 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={getStyleClasses()}>
            {duration}
            
            {/* Progress indicator */}
            {config.showProgress && progress > 0 && (
              <div className="mt-1 w-full h-0.5 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Interactive Overlay Component
 */
interface InteractiveOverlayProps {
  isHovered: boolean;
  variant: AdvancedHoverConfig['variant'];
  disabled: boolean;
}

function InteractiveOverlay({ isHovered, variant, disabled }: InteractiveOverlayProps) {
  if (disabled) return null;

  const getOverlayIntensity = () => {
    switch (variant) {
      case 'cinematic':
        return 'bg-black/40';
      case 'pronounced':
        return 'bg-black/30';
      case 'minimal':
        return 'bg-black/10';
      case 'subtle':
      default:
        return 'bg-black/20';
    }
  };

  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          className={clsx(
            'absolute inset-0 flex items-center justify-center',
            getOverlayIntensity()
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Play Button with Variant-based Styling */}
          <motion.div
            className={clsx(
              'flex items-center justify-center rounded-full',
              'bg-white/95 text-primary shadow-lg backdrop-blur-sm',
              {
                'w-12 h-12': variant === 'minimal',
                'w-16 h-16': variant === 'subtle',
                'w-20 h-20': variant === 'pronounced',
                'w-24 h-24': variant === 'cinematic'
              }
            )}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ 
              scale: variant === 'cinematic' ? 1.1 : 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
          >
            <Icon 
              name="play" 
              className={clsx(
                'ml-0.5',
                {
                  'w-4 h-4': variant === 'minimal',
                  'w-6 h-6': variant === 'subtle',
                  'w-7 h-7': variant === 'pronounced',
                  'w-8 h-8': variant === 'cinematic'
                }
              )}
            />
          </motion.div>

          {/* Ripple Effect for Cinematic Variant */}
          {variant === 'cinematic' && (
            <motion.div
              className="absolute w-24 h-24 border-2 border-white/30 rounded-full"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Utility function to get aspect ratio class
 */
function getAspectRatioClass(ratio: AspectRatio): string {
  const ratios = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '3/2': 'aspect-[3/2]',
    '21/9': 'aspect-[21/9]',
    'auto': 'aspect-auto',
  };

  return ratios[ratio] || ratios['16/9'];
}

/**
 * Advanced Thumbnail with Multiple Effects
 */
export interface MultiEffectThumbnailProps {
  video: DashboardVideo;
  variant?: ThumbnailVariant;
  effects?: Array<'hover' | 'parallax' | 'glow' | 'magnify' | 'tilt'>;
  intensity?: number;
  className?: string;
  children: React.ReactNode;
}

export function MultiEffectThumbnail({
  video,
  variant = 'default',
  effects = ['hover', 'parallax'],
  intensity = 0.7,
  className,
  children
}: MultiEffectThumbnailProps) {
  const hoverConfig: AdvancedHoverConfig = {
    variant: variant === 'hero' ? 'cinematic' : 'subtle',
    enableParallax: effects.includes('parallax'),
    enableGlow: effects.includes('glow'),
    enableMagnify: effects.includes('magnify'),
    enableTilt: effects.includes('tilt'),
    intensity
  };

  const durationConfig: DurationOverlayConfig = {
    position: 'bottom-right',
    style: 'pill',
    showProgress: variant === 'hero',
    animated: true,
    autoHide: variant !== 'hero'
  };

  return (
    <AdvancedVideoThumbnail
      video={video}
      hoverConfig={hoverConfig}
      durationConfig={durationConfig}
      className={className}
    >
      {children}
    </AdvancedVideoThumbnail>
  );
}

export default AdvancedVideoThumbnail;