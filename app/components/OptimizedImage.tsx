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
  context?: 'avatar' | 'gallery' | 'banner' | 'thumbnail' | 'default';
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
  context = 'default',
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // ✅ QUALITY AUTOMÁTICA baseada no contexto e tamanho
  const getOptimalQuality = () => {
    if (quality !== 75) return quality; // Respeitar quality explícita
    
    const contextQuality = {
      avatar: width && width <= 48 ? 60 : width && width <= 96 ? 70 : 80,
      thumbnail: 65,
      gallery: 80,
      banner: 90,
      default: 75
    };
    
    return contextQuality[context] || contextQuality.default;
  };

  // ✅ PLACEHOLDER BLUR automático para contextos específicos
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    if (context === 'avatar') {
      return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
    }
    return undefined;
  };

  // ESTRATÉGIA DEFINITIVA: Usar <img> tag para SVGs (recomendação oficial Vercel)
  // Next.js Image Component não é adequado para SVGs, mesmo com unoptimized=true
  const isVercel = process.env.VERCEL_ENV !== undefined || process.env.VERCEL === '1';
  const isSupabaseImage = imageSrc?.includes('supabase.co');
  const isSvg = imageSrc?.toLowerCase().endsWith('.svg');
  const shouldForceUnoptimized = false; // Supabase funciona com Vercel Optimization

  // Log de debug apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('OptimizedImage Config:', {
      src: imageSrc?.substring(0, 50) + '...',
      alt,
      isVercel,
      isSupabaseImage,
      isSvg,
      shouldForceUnoptimized,
      renderingStrategy: isSvg ? 'HTML_IMG_TAG' : 'NEXT_IMAGE'
    });
  }

  const handleImageError = () => {
    // Log detalhado apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('OptimizedImage Error:', {
        src: imageSrc,
        originalSrc: src,
        alt,
        isValidUrl: isValidUrl(imageSrc),
        shouldForceUnoptimized,
        isSupabaseImage
      });
    }
    
    setImageError(true);
    if (fallbackSrc && fallbackSrc !== imageSrc) {
      setImageSrc(fallbackSrc);
    } else {
      onError?.();
    }
  };

  // Verificar se a URL é válida (URLs externas ou caminhos locais)
  const isValidUrl = (url: string) => {
    // CORREÇÃO: Permitir caminhos relativos locais (pasta public/)
    if (url.startsWith('/')) {
      // Caminhos que começam com / são válidos (arquivos da pasta public)
      return true;
    }

    // Para URLs externas, fazer validações mais rigorosas
    try {
      const parsedUrl = new URL(url);
      
      // Para Vercel, verificar se é HTTPS e se o domínio está permitido
      if (parsedUrl.protocol !== 'https:') {
        console.warn('OptimizedImage: URL externa deve usar HTTPS para Vercel Image Optimization', url);
        return false;
      }
      
      // Verificar se é um domínio Supabase permitido
      if (parsedUrl.hostname.includes('supabase.co')) {
        return true;
      }
      
      // Outros domínios externos permitidos
      const allowedDomains = ['img.youtube.com', 'cresol.com.br'];
      return allowedDomains.some(domain => parsedUrl.hostname.includes(domain));
      
    } catch {
      // Se não conseguiu parsear como URL, rejeitar
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

  // SOLUÇÃO HÍBRIDA: SVGs usam <img> tag, outros formatos usam next/image
  if (isSvg) {
    // Para SVGs, usar elemento HTML <img> nativo (recomendação oficial)
    const imgProps = {
      src: imageSrc,
      alt,
      className: `${className} ${fill ? 'absolute inset-0 w-full h-full object-contain' : ''}`,
      onError: handleImageError,
      style: fill ? { 
        position: 'absolute' as const, 
        inset: 0, 
        width: '100%', 
        height: '100%', 
        objectFit: 'contain' as const 
      } : { width, height },
      ...props
    };

    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imgProps} />;
  }

  // Para outros formatos (PNG, JPG, WebP), usar next/image
  const imageProps = {
    src: imageSrc,
    alt,
    className,
    onError: handleImageError,
    priority,
    sizes,
    quality: getOptimalQuality(), // ✅ Quality dinâmica baseada no contexto
    placeholder: context === 'avatar' ? 'blur' : placeholder, // ✅ Blur automático para avatares
    blurDataURL: getBlurDataURL(), // ✅ Placeholder blur específico
    unoptimized: shouldForceUnoptimized || unoptimized, // Apenas para Supabase
    ...props
  };

  if (fill) {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...imageProps} fill />;
  }

  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...imageProps} width={width} height={height} />;
}