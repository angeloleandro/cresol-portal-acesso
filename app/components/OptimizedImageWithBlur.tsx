'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

import { ProcessSupabaseImageUrl } from '@/lib/imageUtils';

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
  const [retryCount, setRetryCount] = useState(0);
  const [timeoutError, setTimeoutError] = useState(false);
  
  // Base64 blur placeholder padrão (cinza claro)
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';
  
  // Cache de URLs processadas para evitar reprocessamento
  const processUrlWithCache = useCallback((url: string) => {
    // Verifica se já está em cache (localStorage para desenvolvimento)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const cacheKey = `img_url_${url}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const processed = ProcessSupabaseImageUrl(url);
    
    // Salva no cache
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && processed) {
      const cacheKey = `img_url_${url}`;
      sessionStorage.setItem(cacheKey, processed);
    }
    
    return processed;
  }, []);

  useEffect(() => {
    if (src) {
      const processedUrl = processUrlWithCache(src);
      setImgSrc(processedUrl || src);
      // Reset estados quando a URL muda
      setRetryCount(0);
      setHasError(false);
      setTimeoutError(false);
      setIsLoading(true);
    }
  }, [src, processUrlWithCache]);
  
  const handleLoad = () => {
    setIsLoading(false);
    setRetryCount(0); // Reset retry count on successful load
    if (onLoad) onLoad();
  };
  
  const handleError = useCallback(() => {
    const maxRetries = 3;
    const isTimeoutLikeError = true; // Assumimos que erros são timeout por padrão
    
    if (isTimeoutLikeError && retryCount < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Força re-render da imagem
        const newSrc = imgSrc + `?retry=${retryCount + 1}`;
        setImgSrc(newSrc);
      }, delay);
      
      // Marca como timeout error para mostrar indicação visual
      if (retryCount >= 1) {
        setTimeoutError(true);
      }
    } else {
      // Após esgotar tentativas ou erro definitivo
      setHasError(true);
      setIsLoading(false);
      if (onError) onError();
      
      // Fallback para imagem padrão local (SVG otimizado)
      setImgSrc('/images/placeholder.svg');
    }
  }, [retryCount, imgSrc, onError]);
  
  if (!imgSrc) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width: width || '100%', height: height || 'auto', ...style }}
      />
    );
  }
  
  // Estado de timeout com retry em progresso
  if (timeoutError && !hasError) {
    return (
      <div 
        className={`bg-gradient-to-br from-orange-100 to-orange-50 flex flex-col items-center justify-center text-orange-600 ${className}`}
        style={{ width: width || '100%', height: height || 'auto', ...style }}
      >
        <div className="animate-spin w-6 h-6 border-2 border-orange-300 border-t-orange-600 rounded-full mb-2"></div>
        <span className="text-xs font-medium">Tentativa {retryCount}/3</span>
      </div>
    );
  }
  
  // Estado de erro final
  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex flex-col items-center justify-center text-gray-400 ${className}`}
        style={{ width: width || '100%', height: height || 'auto', ...style }}
      >
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        <span className="text-xs text-center px-2">Imagem indisponível</span>
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
 * HeroImage function
 * @todo Add proper documentation
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
 * ThumbnailImage function
 * @todo Add proper documentation
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
 * CardImage function
 * @todo Add proper documentation
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