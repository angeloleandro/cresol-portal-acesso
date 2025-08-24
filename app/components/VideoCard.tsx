

"use client";

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useState, useCallback, memo } from 'react';

import Button from '@/app/components/ui/Button';
import { DashboardVideo } from '@/app/types/video';

import { Icon } from './icons/Icon';
import OptimizedImage from './OptimizedImage';

interface HomeVideoCardProps {
  video: DashboardVideo;
  onClick: (video: DashboardVideo) => void;
  className?: string;
  priority?: boolean;
}

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
        'bg-white rounded-md border border-gray-200/60 hover:border-gray-200',
        'overflow-hidden cursor-pointer group',
        'transition-colors duration-150',
        'max-w-sm w-full', // maxW="sm" equivalent
        className
      )}
      onClick={handleClick}
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
            src={video.thumbnail_url || '/logo-cresol.svg'}
            alt={video.title || 'Thumbnail do vídeo'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={video.upload_type === 'youtube'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Icon name="monitor-play" className="w-12 h-12 text-gray-400" />
          </div>
        )}

      </div>

      {/* Card.Body equivalent - altura fixa garantida */}
      <div className="p-4 h-[100px] flex flex-col">
        {/* Card.Title equivalent - truncado para 2 linhas */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-150 flex-grow">
          {video.title || 'Vídeo sem título'}
        </h3>
      </div>

      {/* Card.Footer equivalent - badge e botão alinhados */}
      <div className="px-4 pb-4 flex items-center justify-between">
        {/* Video type badge movido para footer */}
        {video.upload_type && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
            <Icon 
              name={video.upload_type === 'youtube' ? 'monitor-play' : 'monitor-play'} 
              className="w-3 h-3" 
            />
            {video.upload_type === 'youtube' ? 'YouTube' : 'Vídeo'}
          </span>
        )}
        
        {/* Action button simplificado */}
        <Button
          className="px-4 py-1.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`Reproduzir ${video.title}`}
        >
          Assistir
        </Button>
      </div>
    </motion.article>
  );
});

export default HomeVideoCard;
