/**
 * Enhanced Video Card Component
 * Enterprise-grade video card with rich visual states and advanced thumbnail system
 * Otimizado com React.memo e hooks otimizados
 */

"use client";

import { useState, useCallback, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import { Icon } from '../icons/Icon';
import { formatFileSize } from '@/lib/video-utils';
import { cardAnimations, playButtonAnimations, badgeAnimations, thumbnailAnimations } from './VideoGallery.animations';
import { useOptimizedImagePreload } from '@/hooks/useOptimizedVideoGallery';
import { VideoCardProps, DashboardVideo } from './VideoGallery.types';
// Enhanced thumbnail system
import { VideoThumbnail } from '../VideoThumbnail';
import { useImagePreload } from './VideoGallery.hooks';

/**
 * Admin Video Card Props - Extends base props with separate action handlers
 */
export interface AdminVideoCardProps extends Omit<VideoCardProps, 'onClick'> {
  onPlay?: (video: DashboardVideo) => void;
  onEdit?: (video: DashboardVideo) => void;
  onDelete?: (video: DashboardVideo) => void;
  onAddToCollection?: (video: DashboardVideo) => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showAddToCollectionButton?: boolean;
}

/**
 * Enhanced Video Card with micro-interactions
 */
export function EnhancedVideoCard({ 
  video, 
  onClick, 
  index = 0, 
  priority = false,
  className 
}: VideoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Preload thumbnail for better UX
  const { isImageLoaded } = useOptimizedImagePreload(
    video.thumbnail_url ? [video.thumbnail_url] : []
  );

  const handleCardClick = useCallback(() => {
    onClick(video);
  }, [video, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      variants={cardAnimations}
      className={clsx(
        'group cursor-pointer',
        'bg-white rounded-md border border-gray-200/40',
        'hover:border-gray-200/70 transition-colors duration-150',
        'overflow-hidden',
        'flex flex-col h-full',
        className
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Reproduzir vídeo: ${video.title}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Enhanced Thumbnail with Advanced System */}
      <div className="rounded-t-lg overflow-hidden">
        <VideoThumbnail
          video={video}
          variant="card"
          aspectRatio="16/9"
          priority={priority || index < 4}
          showOverlay={true}
          showBadge={true}
          showDuration={video.upload_type === 'direct'}
          onClick={handleCardClick}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
          quality={90}
          placeholder={{
            variant: 'gradient',
            gradient: {
              from: '#F58220',
              to: '#005C46',
              direction: 'diagonal-tl'
            },
            icon: {
              name: 'video',
              size: 'lg',
              animated: true
            },
            text: video.upload_type === 'youtube' ? 'YouTube' : 'Vídeo',
            animated: true
          }}
          overlay={{
            variant: 'hover',
            opacity: 0.2,
            gradient: true
          }}
        />
      </div>
      
      {/* Content Area */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Title */}
        <h3 className={clsx(
          'font-semibold text-neutral-900',
          'line-clamp-2 leading-tight text-sm',
          'group-hover:text-primary transition-colors duration-150',
          'flex-grow'
        )}>
          {video.title}
        </h3>
        
        {/* File Info for Direct Uploads */}
        {video.upload_type === 'direct' && (
          <div className="space-y-1">
            {video.original_filename && (
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Icon name="folder" className="w-3 h-3 text-neutral-400" />
                <span className="truncate">{video.original_filename}</span>
              </div>
            )}
            {video.file_size && (
              <p className="text-xs text-neutral-500">
                Tamanho: {formatFileSize(video.file_size)}
              </p>
            )}
          </div>
        )}
        
        {/* Action Area */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200/40 mt-auto">
          <div className="flex flex-col gap-1">
            {video.created_at && (
              <span className="text-xs text-neutral-400">
                {formatDate(video.created_at)}
              </span>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              'px-3 py-1.5 rounded-md text-xs font-medium',
              'bg-primary/10 text-primary',
              'hover:bg-primary hover:text-white',
              'transition-colors duration-150',
              'opacity-0 group-hover:opacity-100',
              'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            aria-label={`Assistir ${video.title}`}
          >
            Assistir
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Admin Video Card with separate Play, Edit, and Delete actions
 * Specialized for administrative interfaces
 */
export function AdminVideoCard({ 
  video, 
  onPlay,
  onEdit,
  onDelete,
  onAddToCollection,
  index = 0, 
  priority = false,
  showEditButton = true,
  showDeleteButton = true,
  showAddToCollectionButton = true,
  className 
}: AdminVideoCardProps) {

  const handlePlayClick = useCallback(() => {
    onPlay?.(video);
  }, [video, onPlay]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(video);
  }, [video, onEdit]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(video);
  }, [video, onDelete]);

  const handleAddToCollectionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCollection?.(video);
  }, [video, onAddToCollection]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePlayClick();
    }
  }, [handlePlayClick]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      variants={cardAnimations}
      className={clsx(
        'group cursor-pointer',
        'bg-white rounded-md border border-gray-200/40',
        'hover:border-gray-200/70 transition-colors duration-150',
        'overflow-hidden',
        'flex flex-col h-full',
        className
      )}
      onClick={handlePlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Reproduzir vídeo: ${video.title}`}
    >
      {/* Enhanced Thumbnail with Advanced System */}
      <div className="rounded-t-lg overflow-hidden">
        <VideoThumbnail
          video={video}
          variant="card"
          aspectRatio="16/9"
          priority={priority || index < 4}
          showOverlay={true}
          showBadge={true}
          showDuration={video.upload_type === 'direct'}
          onClick={handlePlayClick}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
          quality={90}
          placeholder={{
            variant: 'gradient',
            gradient: {
              from: '#F58220',
              to: '#005C46',
              direction: 'diagonal-tl'
            },
            icon: {
              name: 'video',
              size: 'lg',
              animated: true
            },
            text: video.upload_type === 'youtube' ? 'YouTube' : 'Vídeo',
            animated: true
          }}
          overlay={{
            variant: 'hover',
            opacity: 0.2,
            gradient: true
          }}
        />
      </div>
      
      {/* Content Area */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Title */}
        <h3 className={clsx(
          'font-semibold text-neutral-900',
          'line-clamp-2 leading-tight text-sm',
          'group-hover:text-primary transition-colors duration-150',
          'flex-grow'
        )}>
          {video.title}
        </h3>
        
        {/* File Info for Direct Uploads */}
        {video.upload_type === 'direct' && (
          <div className="space-y-1">
            {video.original_filename && (
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Icon name="folder" className="w-3 h-3 text-neutral-400" />
                <span className="truncate">{video.original_filename}</span>
              </div>
            )}
            {video.file_size && (
              <p className="text-xs text-neutral-500">
                Tamanho: {formatFileSize(video.file_size)}
              </p>
            )}
          </div>
        )}
        
        {/* Action Area */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200/40 mt-auto">
          <div className="flex flex-col gap-1">
            {video.created_at && (
              <span className="text-xs text-neutral-400">
                {formatDate(video.created_at)}
              </span>
            )}
          </div>
          
          {/* Admin Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {showEditButton && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  'px-2 py-1 rounded text-xs font-medium',
                  'bg-neutral-100 text-neutral-700',
                  'hover:bg-neutral-200',
                  'transition-colors duration-150',
                  'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-300/50'
                )}
                onClick={handleEditClick}
                aria-label={`Editar ${video.title}`}
              >
                <Icon name="pencil" className="w-3 h-3" />
              </motion.button>
            )}

            {showAddToCollectionButton && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  'px-2 py-1 rounded text-xs font-medium',
                  'bg-blue-50 text-blue-600',
                  'hover:bg-blue-100',
                  'transition-colors duration-150',
                  'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-300/50'
                )}
                onClick={handleAddToCollectionClick}
                aria-label={`Adicionar ${video.title} à coleção`}
              >
                <Icon name="folder-plus" className="w-3 h-3" />
              </motion.button>
            )}
            
            {showDeleteButton && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  'px-2 py-1 rounded text-xs font-medium',
                  'bg-red-50 text-red-600',
                  'hover:bg-red-100',
                  'transition-colors duration-150',
                  'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300/50'
                )}
                onClick={handleDeleteClick}
                aria-label={`Remover ${video.title}`}
              >
                <Icon name="trash" className="w-3 h-3" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


/**
 * Video Badge Component
 * Legacy badge component - keeping for CompactVideoCard compatibility
 */
interface VideoBadgeProps {
  uploadType: DashboardVideo['upload_type'];
  className?: string;
}

function VideoBadge({ uploadType, className }: VideoBadgeProps) {
  const getBadgeConfig = () => {
    switch (uploadType) {
      case 'direct':
        return {
          icon: 'video' as const,
          label: 'Interno',
          className: 'bg-green-600 text-white'
        };
      case 'youtube':
        return {
          icon: 'monitor-play' as const,
          label: 'YouTube',
          className: 'bg-red-600 text-white'
        };
      default:
        return {
          icon: 'video' as const,
          label: 'Vídeo',
          className: 'bg-neutral-600 text-white'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={clsx(
      'inline-flex items-center justify-center gap-1',
      'px-2 py-1 text-xs rounded-full font-medium',
      'shadow-sm backdrop-blur-sm',
      config.className,
      className
    )}>
      <Icon 
        name={config.icon} 
        className="w-3 h-3" 
        aria-hidden="true"
      />
      <span className="sr-only sm:not-sr-only">{config.label}</span>
    </span>
  );
}

/**
 * Skeleton Video Card for Loading States
 */
export function SkeletonVideoCard() {
  return (
    <div className="bg-white rounded-md border border-neutral-200 overflow-hidden animate-pulse">
      <div className="aspect-video bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 rounded-sm w-3/4" />
        <div className="h-3 bg-neutral-200 rounded-sm w-1/2" />
        <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
          <div className="h-3 bg-neutral-200 rounded-sm w-1/4" />
          <div className="h-6 bg-neutral-200 rounded-sm w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State Video Card
 */
export function EmptyVideoCard() {
  return (
    <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-md p-8 text-center">
      <Icon name="video" className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
      <h3 className="font-medium text-neutral-700 mb-2">
        Nenhum vídeo encontrado
      </h3>
      <p className="text-sm text-neutral-500">
        Adicione vídeos para começar a galeria
      </p>
    </div>
  );
}

/**
 * Compact Video Card para listings menores
 */
interface CompactVideoCardProps extends Omit<VideoCardProps, 'className'> {
  showFileSize?: boolean;
  showDate?: boolean;
}

export function CompactVideoCard({
  video,
  onClick,
  index = 0,
  priority = false,
  showFileSize = true,
  showDate = true
}: CompactVideoCardProps) {
  const handleClick = useCallback(() => {
    onClick(video);
  }, [video, onClick]);

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      variants={cardAnimations}
      className={clsx(
        'group cursor-pointer',
        'flex gap-3 p-3',
        'bg-white rounded-lg border border-neutral-200',
        'hover:shadow-md transition-shadow duration-200',
      )}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`Reproduzir vídeo: ${video.title}`}
    >
      {/* Enhanced Compact Thumbnail */}
      <div className="flex-shrink-0">
        <VideoThumbnail
          video={video}
          variant="compact"
          priority={priority}
          showOverlay={true}
          showBadge={false}
          showDuration={false}
          onClick={handleClick}
          sizes="96px"
          quality={75}
          placeholder={{
            variant: 'gradient',
            gradient: {
              from: '#F58220',
              to: '#005C46',
              direction: 'diagonal-tl'
            },
            icon: {
              name: 'video',
              size: 'sm',
              animated: false
            },
            animated: false
          }}
          overlay={{
            variant: 'hover',
            opacity: 0.2,
            gradient: false
          }}
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors">
          {video.title}
        </h4>
        
        <div className="mt-1 space-y-1">
          {showFileSize && video.upload_type === 'direct' && video.file_size && (
            <p className="text-xs text-neutral-500">
              {formatFileSize(video.file_size)}
            </p>
          )}
          
          {showDate && video.created_at && (
            <p className="text-xs text-neutral-400">
              {format(new Date(video.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          )}
        </div>
        
        <VideoBadge 
          uploadType={video.upload_type} 
          className="mt-2 text-xs px-1.5 py-0.5"
        />
      </div>
    </motion.div>
  );
}

export default EnhancedVideoCard;