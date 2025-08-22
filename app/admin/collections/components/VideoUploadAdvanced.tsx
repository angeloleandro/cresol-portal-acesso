'use client';

/**
 * VideoUploadAdvanced Component
 * Wrapper component que oferece opção avançada de upload para vídeos nas coleções
 * Integração entre BulkUpload e VideoUploadModal
 * Suporta upload de vídeos do YouTube e diretos com geração de thumbnails
 */

import type React from 'react';
import Button from '@/app/components/ui/Button';
import { useState } from 'react';
import { Collection } from '@/lib/types/collections';
import VideoUploadModal from './VideoUploadModal';
import { Icon } from '@/app/components/icons/Icon';
import { motion } from 'framer-motion';

interface VideoUploadAdvancedProps {
  collection: Collection;
  onVideoAdded?: (videoData: any) => void;
  className?: string;
  showAsButton?: boolean;
  buttonText?: string;
  buttonVariant?: 'youtube' | 'video';
  disabled?: boolean;
}

export const VideoUploadAdvanced: React.FC<VideoUploadAdvancedProps> = ({
  collection,
  onVideoAdded,
  className = '',
  showAsButton = true,
  buttonText = 'Adicionar Vídeo',
  buttonVariant = 'video',
  disabled = false
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleVideoAdded = (videoData: any) => {
    if (onVideoAdded) {
      onVideoAdded(videoData);
    }
    setShowModal(false);
  };

  // Verificar se a coleção suporta vídeos
  const supportsVideos = collection.type === 'videos' || collection.type === 'mixed';

  if (!supportsVideos) {
    return null;
  }

  if (showAsButton) {
    const isYouTube = buttonVariant === 'youtube';
    
    return (
      <>
        <Button
          onClick={() => setShowModal(true)}
          disabled={disabled}
          className={`
            inline-flex items-center gap-2 px-3 py-2
            ${isYouTube 
              ? 'bg-[#FF0000] hover:bg-[#CC0000] focus:ring-red-500/20' 
              : 'bg-primary hover:bg-primary/90 focus:ring-primary/20'
            }
            text-white text-sm font-medium rounded-md
            transition-colors duration-200
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md
            ${className}
          `}
        >
          <Icon name={isYouTube ? 'play' : 'video'} className="w-4 h-4" />
          {buttonText}
        </Button>

        <VideoUploadModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          collection={collection}
          onVideoAdded={handleVideoAdded}
        />
      </>
    );
  }

  // Se não for um botão, renderiza apenas o modal controlado externamente
  return (
    <VideoUploadModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      collection={collection}
      onVideoAdded={handleVideoAdded}
    />
  );
};

export default VideoUploadAdvanced;
