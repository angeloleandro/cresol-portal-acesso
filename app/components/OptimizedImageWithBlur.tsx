'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { processSupabaseImageUrl } from '@/lib/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagem super otimizada com:
 * - Blur placeholder automático
 * - Priority para imagens above-the-fold
 * - Lazy loading inteligente
 * - Fallback para erros
 * - Processamento de URLs do Supabase
 */
export default function OptimizedImageWithBlur({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  quality = 80,
  placeholder = 'blur',
  blurDataURL,
  fill = false,
  style,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Base64 blur placeholder padrão (cinza claro)
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';
  
  useEffect(() => {
    if (src) {
      const processedUrl = processSupabaseImageUrl(src);
      setImgSrc(processedUrl || src);
    }
  }, [src]);
  
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };
  
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
    
    // Fallback para imagem padrão
    setImgSrc('/images/placeholder.jpg');
  };
  
  if (!imgSrc) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width: width || '100%', height: height || 'auto', ...style }}
      />
    );
  }
  
  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}
        style={{ width: width || '100%', height: height || 'auto', ...style }}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }
  
  const imageProps: any = {
    src: imgSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    quality,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    ...(fill ? { fill: true } : { width, height }),
    ...(objectFit && { style: { objectFit, ...style } }),
  };
  
  // Adiciona sizes para otimização responsiva
  if (sizes) {
    imageProps.sizes = sizes;
  } else if (!fill && width) {
    // Gera sizes automático baseado na largura
    imageProps.sizes = `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`;
  }
  
  // Adiciona blur placeholder se disponível
  if (placeholder === 'blur') {
    imageProps.placeholder = 'blur';
    imageProps.blurDataURL = blurDataURL || defaultBlurDataURL;
  }
  
  return <Image alt={alt} {...imageProps} />;
}

/**
 * Componente para hero images (imagens grandes no topo)
 * Sempre usa priority e otimizações máximas
 */
export function HeroImage(props: Omit<OptimizedImageProps, 'priority'>) {
  return (
    <OptimizedImageWithBlur
      {...props}
      priority={true}
      quality={90}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
    />
  );
}

/**
 * Componente para thumbnails
 * Otimizado para imagens pequenas em listas
 */
export function ThumbnailImage(props: Omit<OptimizedImageProps, 'priority' | 'sizes'>) {
  return (
    <OptimizedImageWithBlur
      {...props}
      priority={false}
      quality={70}
      sizes="(max-width: 640px) 50vw, 200px"
    />
  );
}

/**
 * Componente para cards
 * Otimizado para imagens médias em cards
 */
export function CardImage(props: Omit<OptimizedImageProps, 'sizes'>) {
  return (
    <OptimizedImageWithBlur
      {...props}
      quality={75}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
    />
  );
}