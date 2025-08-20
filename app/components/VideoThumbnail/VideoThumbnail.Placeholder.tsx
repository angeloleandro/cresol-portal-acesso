/**
 * VideoThumbnail Placeholder Components
 * Elegant visual fallback system with brand-appropriate design
 */

"use client";

import { motion } from 'framer-motion';
import Button from '@/app/components/ui/Button';
import clsx from 'clsx';
import { Icon } from '../icons/Icon';
import { 
  PlaceholderConfig, 
  PlaceholderVariant, 
  GradientConfig, 
  AspectRatio, 
  ThumbnailVariant 
} from './VideoThumbnail.types';
import { getAspectRatioClass, getPlaceholderGradient } from './VideoThumbnail.utils';

interface ThumbnailPlaceholderProps {
  variant?: PlaceholderVariant;
  aspectRatio?: AspectRatio;
  size?: ThumbnailVariant;
  config?: PlaceholderConfig;
  className?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

/**
 * Main Thumbnail Placeholder Component
 */
export function ThumbnailPlaceholder({
  variant = 'gradient',
  aspectRatio = '16/9',
  size = 'default',
  config,
  className,
  animated = true,
  children
}: ThumbnailPlaceholderProps) {
  const aspectClass = getAspectRatioClass(aspectRatio);
  
  const baseClasses = clsx(
    'relative overflow-hidden flex items-center justify-center',
    'text-white/90 select-none',
    aspectClass,
    className
  );

  const renderPlaceholder = () => {
    switch (variant) {
      case 'solid':
        return <SolidPlaceholder config={config} animated={animated} />;
      case 'gradient':
        return <GradientPlaceholder config={config} animated={animated} />;
      case 'pattern':
        return <PatternPlaceholder config={config} animated={animated} />;
      case 'blur':
        return <BlurPlaceholder config={config} animated={animated} />;
      case 'skeleton':
        return <SkeletonPlaceholder config={config} animated={animated} />;
      default:
        return <GradientPlaceholder config={config} animated={animated} />;
    }
  };

  return (
    <div className={baseClasses} role="img" aria-label="Carregando thumbnail do vídeo">
      {renderPlaceholder()}
      {children}
    </div>
  );
}

/**
 * Solid Color Placeholder
 */
function SolidPlaceholder({ 
  config, 
  animated 
}: { 
  config?: PlaceholderConfig; 
  animated?: boolean; 
}) {
  return (
    <motion.div
      className="absolute inset-0 bg-neutral-400 flex items-center justify-center"
      initial={animated ? { opacity: 0 } : false}
      animate={animated ? { opacity: 1 } : false}
      transition={{ duration: 0.3 }}
    >
      <PlaceholderIcon config={config} animated={animated} />
      {config?.text && (
        <div className="absolute bottom-2 left-2">
          <span className="text-xs opacity-75">{config.text}</span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Gradient Placeholder (Default)
 */
function GradientPlaceholder({ 
  config, 
  animated 
}: { 
  config?: PlaceholderConfig; 
  animated?: boolean; 
}) {
  const gradient = config?.gradient || {
    from: '#F58220', // Cresol Orange
    to: '#005C46',   // Cresol Green
    direction: 'diagonal-tl' as const
  };

  const gradientStyle = {
    background: getPlaceholderGradient(
      gradient.from,
      gradient.to,
      gradient.direction
    )
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={gradientStyle}
      initial={animated ? { opacity: 0, scale: 1.1 } : false}
      animate={animated ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/10" />
      
      <motion.div
        className="relative z-10 text-center"
        initial={animated ? { y: 10, opacity: 0 } : false}
        animate={animated ? { y: 0, opacity: 1 } : false}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <PlaceholderIcon config={config} animated={animated} />
        {config?.text && (
          <motion.div
            className="mt-2"
            initial={animated ? { opacity: 0 } : false}
            animate={animated ? { opacity: 1 } : false}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <span className="text-xs opacity-90 drop-shadow-sm">
              {config.text}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Subtle animation overlay */}
      {animated && (
        <motion.div
          className="absolute inset-0 bg-white/5"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.div>
  );
}

/**
 * Pattern Placeholder
 */
function PatternPlaceholder({ 
  config, 
  animated 
}: { 
  config?: PlaceholderConfig; 
  animated?: boolean; 
}) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `linear-gradient(45deg, #F58220 25%, transparent 25%, transparent 75%, #F58220 75%), 
                     linear-gradient(45deg, #F58220 25%, transparent 25%, transparent 75%, #F58220 75%)`,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      }}
      initial={animated ? { opacity: 0 } : false}
      animate={animated ? { opacity: 0.1 } : false}
      transition={{ duration: 0.3 }}
    >
      {/* Overlay para suavizar o padrão */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80" />
      
      <motion.div
        className="relative z-10 text-center"
        initial={animated ? { scale: 0.8, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
      >
        <PlaceholderIcon config={config} animated={animated} />
      </motion.div>
    </motion.div>
  );
}

/**
 * Blur Placeholder
 */
function BlurPlaceholder({ 
  config, 
  animated 
}: { 
  config?: PlaceholderConfig; 
  animated?: boolean; 
}) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={animated ? { opacity: 0, filter: 'blur(10px)' } : false}
      animate={animated ? { opacity: 1, filter: 'blur(0px)' } : false}
      transition={{ duration: 0.6 }}
    >
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: getPlaceholderGradient('#F58220', '#005C46', 'diagonal-tl')
        }}
      />
      
      {/* Blur circles for visual interest */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/20 rounded-full blur-md"
        animate={animated ? { 
          x: [0, 20, -10, 0],
          y: [0, -15, 10, 0],
          scale: [1, 1.2, 0.8, 1]
        } : false}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-12 h-12 bg-white/15 rounded-full blur-md"
        animate={animated ? { 
          x: [0, -15, 25, 0],
          y: [0, 20, -5, 0],
          scale: [1, 0.7, 1.3, 1]
        } : false}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      
      <div className="relative z-10">
        <PlaceholderIcon config={config} animated={animated} />
      </div>
    </motion.div>
  );
}

/**
 * Skeleton Loading Placeholder
 */
function SkeletonPlaceholder({ 
  config, 
  animated 
}: { 
  config?: PlaceholderConfig; 
  animated?: boolean; 
}) {
  return (
    <div className="absolute inset-0 bg-neutral-200 overflow-hidden">
      {animated && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Skeleton content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-2 w-full max-w-[80%]">
          <div className="h-8 bg-neutral-300 rounded-md mx-auto w-3/4 animate-pulse" />
          <div className="h-4 bg-neutral-300 rounded-sm mx-auto w-1/2 animate-pulse" />
          <div className="h-4 bg-neutral-300 rounded-sm mx-auto w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Placeholder Icon Component
 */
function PlaceholderIcon({ 
  config, 
  animated 
}: { 
  config?: PlaceholderConfig; 
  animated?: boolean; 
}) {
  const iconConfig = config?.icon || {
    name: 'video',
    size: 'lg' as const,
    color: 'currentColor',
    animated: true
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconClass = clsx(
    sizeClasses[iconConfig.size || 'lg'],
    'drop-shadow-sm'
  );

  if (animated && iconConfig.animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, type: 'spring' }}
      >
        <Icon
          name={iconConfig.name as any || 'video'}
          className={clsx(iconClass, iconConfig.color)}
        />
      </motion.div>
    );
  }

  return (
    <Icon
      name={iconConfig.name as any || 'video'}
      className={clsx(iconClass, iconConfig.color)}
    />
  );
}

/**
 * Loading State Placeholder
 */
export function LoadingThumbnailPlaceholder({
  aspectRatio = '16/9',
  className,
  progress,
  status = 'Carregando...'
}: {
  aspectRatio?: AspectRatio;
  className?: string;
  progress?: number;
  status?: string;
}) {
  const aspectClass = getAspectRatioClass(aspectRatio);

  return (
    <motion.div
      className={clsx(
        'relative overflow-hidden flex items-center justify-center',
        'bg-gradient-to-br from-neutral-100 to-neutral-200',
        aspectClass,
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center space-y-3">
        {/* Loading spinner */}
        <motion.div
          className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Status text */}
        <p className="text-xs text-neutral-600 font-medium">
          {status}
        </p>

        {/* Progress bar */}
        {typeof progress === 'number' && (
          <div className="w-24 h-1 bg-neutral-300 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
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
 * Error State Placeholder
 */
export function ErrorThumbnailPlaceholder({
  aspectRatio = '16/9',
  className,
  message = 'Falha ao carregar',
  onRetry,
  retryable = true
}: {
  aspectRatio?: AspectRatio;
  className?: string;
  message?: string;
  onRetry?: () => void;
  retryable?: boolean;
}) {
  const aspectClass = getAspectRatioClass(aspectRatio);

  return (
    <motion.div
      className={clsx(
        'relative overflow-hidden flex items-center justify-center',
        'bg-gradient-to-br from-red-50 to-red-100',
        'border border-red-200',
        aspectClass,
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-2 p-4">
        {/* Error icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
        >
          <Icon
            name="AlertTriangle"
            className="w-6 h-6 text-red-500 mx-auto"
          />
        </motion.div>

        {/* Error message */}
        <p className="text-xs text-red-600 font-medium">
          {message}
        </p>

        {/* Retry button */}
        {retryable && onRetry && (
          <Button
            className={clsx(
              'px-3 py-1 text-xs font-medium rounded-md',
              'bg-red-100 text-red-700 hover:bg-red-200',
              'focus:outline-none focus:ring-2 focus:ring-red-500/20',
              'transition-colors duration-200'
            )}
            onClick={onRetry}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Tentar novamente
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Compact Placeholder for smaller thumbnails
 */
export function CompactThumbnailPlaceholder({
  className,
  animated = false
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <div
      className={clsx(
        'w-full h-full flex items-center justify-center',
        'bg-gradient-to-br from-primary/10 to-secondary/10',
        'text-neutral-400',
        className
      )}
    >
      {animated ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Icon name="video" className="w-4 h-4" />
        </motion.div>
      ) : (
        <Icon name="video" className="w-4 h-4" />
      )}
    </div>
  );
}

export default ThumbnailPlaceholder;
