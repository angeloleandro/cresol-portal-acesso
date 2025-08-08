/**
 * HomeVideoCard Component
 * Clean video card following Chakra UI pattern for home page
 * Adapted for React/Next.js with Tailwind CSS
 */

"use client";

import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Icon } from './icons/Icon';
import { DashboardVideo } from '@/app/types/video';
import OptimizedImage from './OptimizedImage';

interface HomeVideoCardProps {
  video: DashboardVideo;
  onClick: (video: DashboardVideo) => void;
  className?: string;
  priority?: boolean;
}

/**
 * Clean Video Card following Chakra UI pattern
 * Simplified card without file metadata
 */
export const HomeVideoCard = memo(function HomeVideoCard({ 
  video, 
  onClick, 
  className,
  priority = false
}: HomeVideoCardProps) {
  const [imageError, setImageError] = useState(false);
  const handleClick = useCallback(() => {
    onClick(video);
  }, [onClick, video]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <motion.article
      className={clsx(
        // Card.Root equivalent - following project's standardized pattern
        'bg-white rounded-xl border border-gray-200/40 hover:border-gray-200/70',
        'overflow-hidden cursor-pointer group',
        'transition-colors duration-150',
        'max-w-sm w-full', // maxW="sm" equivalent
        className
      )}
      onClick={handleClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      role="button"
      tabIndex={0}
      aria-label={`Reproduzir vídeo: ${video.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Image section - Chakra UI Image equivalent */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {!imageError ? (
          <OptimizedImage
            src={video.thumbnail_url || '/placeholder-video.jpg'}
            alt={video.title || 'Thumbnail do vídeo'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Icon name="monitor-play" className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Icon name="play" className="w-6 h-6 text-gray-800" />
          </div>
        </div>

        {/* Video type badge */}
        {video.upload_type && (
          <div className="absolute top-3 left-3">
            <span className={clsx(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              'bg-white/90 backdrop-blur-sm text-gray-700'
            )}>
              <Icon 
                name={video.upload_type === 'youtube' ? 'monitor-play' : 'monitor-play'} 
                className="w-3 h-3" 
              />
              {video.upload_type === 'youtube' ? 'YouTube' : 'Vídeo'}
            </span>
          </div>
        )}
      </div>

      {/* Card.Body equivalent - altura mínima garantida */}
      <div className="p-4 space-y-2 min-h-[80px] flex flex-col">
        {/* Card.Title equivalent - truncado para 2 linhas */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-150 flex-1">
          {video.title || 'Vídeo sem título'}
        </h3>
        
        {/* Card.Description equivalent - simplificado */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-auto">
          <Icon name="clock" className="w-4 h-4 flex-shrink-0" />
          <span>Clique para assistir</span>
        </div>
      </div>

      {/* Card.Footer equivalent - altura mínima consistente */}
      <div className="px-4 pb-4 min-h-[48px] flex items-center justify-end">
        {/* Action button - removida tag "Ativo" */}
        <motion.button
          className={clsx(
            'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg',
            'bg-primary text-white text-sm font-medium',
            'hover:bg-primary/90 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/20'
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Reproduzir ${video.title}`}
        >
          <Icon name="play" className="w-4 h-4" />
          Assistir
        </motion.button>
      </div>
    </motion.article>
  );
});

export default HomeVideoCard;