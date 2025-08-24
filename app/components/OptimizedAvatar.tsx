'use client';

import { useState } from 'react';

import OptimizedImage from './OptimizedImage';

interface OptimizedAvatarProps {
  src: string | null | undefined;
  alt: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
  className?: string;
}

const AVATAR_SIZES = {
  sm: { size: 32, quality: 60 },   // Team lists, navbar
  md: { size: 48, quality: 65 },   // User lists  
  lg: { size: 96, quality: 75 },   // Modals/forms
  xl: { size: 128, quality: 80 }   // Profile pages
} as const;

// Placeholder blur otimizado para avatares (imagem 1x1 neutra)
const AVATAR_BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export default function OptimizedAvatar({
  src,
  alt,
  size,
  priority = false,
  className = ''
}: OptimizedAvatarProps) {
  const [error, setError] = useState(false);
  const config = AVATAR_SIZES[size];
  
  const handleError = () => setError(true);
  
  // Fallback elegante quando não há avatar ou erro
  if (!src || error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-cresol-gray-light to-cresol-gray text-white font-semibold ${className}`}
        style={{ width: config.size, height: config.size }}
        title={alt}
      >
        <span className={`
          ${size === 'sm' ? 'text-xs' : 
            size === 'md' ? 'text-sm' : 
            size === 'lg' ? 'text-lg' : 'text-xl'}
        `}>
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden bg-gray-100 ${className}`} 
      style={{ width: config.size, height: config.size }}
      title={alt}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${config.size}px`}
        quality={config.quality}
        priority={priority}
        placeholder="blur"
        blurDataURL={AVATAR_BLUR_DATA_URL}
        onError={handleError}
      />
    </div>
  );
}