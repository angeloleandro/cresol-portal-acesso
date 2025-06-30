'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onError?: () => void;
  fallbackSrc?: string;
  fallbackText?: string;
  unoptimized?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  className = '',
  sizes,
  priority = false,
  width,
  height,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onError,
  fallbackSrc,
  fallbackText,
  unoptimized = false,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleImageError = () => {
    setImageError(true);
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else {
      onError?.();
    }
  };

  // Verificar se a URL é válida
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Se a URL não é válida ou houve erro e não há fallback
  if (!isValidUrl(imageSrc) || (imageError && !fallbackSrc)) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={fill ? { position: 'absolute', inset: 0 } : { width, height }}
      >
        <div className="text-center p-4">
          <svg 
            className="w-8 h-8 mx-auto mb-2 text-gray-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          {fallbackText && (
            <p className="text-xs text-gray-400">{fallbackText}</p>
          )}
        </div>
      </div>
    );
  }

  const imageProps = {
    src: imageSrc,
    alt,
    className,
    onError: handleImageError,
    priority,
    sizes,
    quality,
    placeholder,
    blurDataURL,
    unoptimized,
    ...props
  };

  if (fill) {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...imageProps} fill />;
  }

  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...imageProps} width={width} height={height} />;
}