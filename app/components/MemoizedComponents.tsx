'use client';

import Image from 'next/image';
import { memo, useMemo, useCallback } from 'react';

import { NewsCard, CompactNewsCard, FeaturedNewsCard, HorizontalNewsCard } from './NewsCard';

import type { NewsItem } from './NewsCard';

// ========================================
// TYPE DEFINITIONS
// ========================================

/** Props para componentes de notícias */
interface NewsCardProps {
  news: NewsItem;
  variant?: string;
}

/** Props para componente de banner */
interface BannerItemProps {
  id: string;
  title: string | null;
  image_url: string;
  link: string | null;
  isActive: boolean;
  onNavigate?: (url: string) => void;
}

/** Props para componente de vídeo */
interface VideoItemProps {
  id: string;
  title: string;
  thumbnail_url: string | null;
  video_url: string;
  type: 'youtube' | 'file';
  duration?: string;
}

/** Props para componente de galeria */
interface GalleryItemProps {
  id: string;
  image_url: string;
  title: string;
  category?: string;
  onClick?: () => void;
}

/** Props para componente de sistema lateral */
interface SystemLinkProps {
  id: string;
  name: string;
  url: string;
  icon_url?: string;
  description?: string;
  is_active: boolean;
}

/** Props para lista de notícias */
interface NewsListProps {
  news: NewsItem[];
  compact?: boolean;
}

// ========================================
// MEMOIZED COMPONENTS
// ========================================

// Memoização do NewsCard com comparação customizada
export const MemoizedNewsCard = memo(NewsCard, (prevProps: NewsCardProps, nextProps: NewsCardProps) => {
  // Re-renderiza apenas se dados essenciais mudaram
  return (
    prevProps.news?.id === nextProps.news?.id &&
    prevProps.news?.title === nextProps.news?.title &&
    prevProps.news?.summary === nextProps.news?.summary &&
    prevProps.news?.image_url === nextProps.news?.image_url &&
    prevProps.variant === nextProps.variant
  );
});

// Memoização do CompactNewsCard
export const MemoizedCompactNewsCard = memo(CompactNewsCard);

// Memoização do FeaturedNewsCard
export const MemoizedFeaturedNewsCard = memo(FeaturedNewsCard);

// Memoização do HorizontalNewsCard
export const MemoizedHorizontalNewsCard = memo(HorizontalNewsCard);

export const MemoizedNewsList = memo<NewsListProps>(function MemoizedNewsList({ news, compact = false }) {
  // Memoiza a renderização dos itens
  const newsItems = useMemo(
    () => news.map((item) => {
      if (compact) {
        return <MemoizedCompactNewsCard key={item.id} news={item} />;
      }
      return <MemoizedNewsCard key={item.id} news={item} />;
    }),
    [news, compact]
  );
  
  return <>{newsItems}</>;
});

export const MemoizedBannerItem = memo<BannerItemProps>(
  function MemoizedBannerItem({ title, image_url, link, isActive, onNavigate }) {
    // Memoiza o handler de clique
    const handleClick = useCallback(() => {
      if (link && onNavigate) {
        onNavigate(link);
      }
    }, [link, onNavigate]);
    
    return (
      <div
        className={`transition-opacity duration-700 ${
          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
        onClick={handleClick}
        style={{ cursor: link ? 'pointer' : 'default' }}
      >
        <div className="banner-container relative overflow-hidden rounded-md">
          {image_url && (
            <div className="relative w-full h-full">
              <Image
                src={image_url}
                alt={title || 'Banner'}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-white text-lg font-medium">{title}</h3>
            </div>
          )}
        </div>
      </div>
    );
  },
  // Comparação customizada para evitar re-render desnecessário
  (prevProps: BannerItemProps, nextProps: BannerItemProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.image_url === nextProps.image_url
    );
  }
);

export const MemoizedVideoItem = memo<VideoItemProps>(
  function MemoizedVideoItem({ title, thumbnail_url, video_url, type, duration }) {
    // Memoiza a URL do thumbnail
    const thumbnailSrc = useMemo(() => {
      if (thumbnail_url) return thumbnail_url;
      if (type === 'youtube') {
        const videoId = video_url.split('v=')[1]?.split('&')[0];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      return '/images/video-placeholder.jpg';
    }, [thumbnail_url, video_url, type]);
    
    return (
      <div className="video-item">
        <div className="video-container relative group">
          <div className="aspect-video overflow-hidden rounded-lg">
            {type === 'youtube' ? (
              <div className="relative w-full h-full">
                <Image
                  src={thumbnailSrc}
                  alt={title}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <video
                className="w-full h-full object-cover"
                controls
                preload="metadata"
                poster={thumbnailSrc}
                aria-label={title}
              >
                <source src={video_url} type="video/mp4" />
                <p>Seu navegador não suporta reprodução de vídeo.</p>
              </video>
            )}
          </div>
          <div className="mt-2">
            <h4 className="font-medium text-gray-900 line-clamp-2">{title}</h4>
            {duration && (
              <span className="text-sm text-gray-500">{duration}</span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// ========================================
// CUSTOM HOOKS
// ========================================

/**
 * Hook para memoizar dados de lista com dependências adicionais
 * @param items - Array de itens a serem memoizados
 * @param dependencies - Dependências adicionais para recalcular a memoização
 * @returns Array memoizado dos itens
 */
export function useMemoizedList<T>(
  items: T[],
  dependencies: unknown[] = []
): T[] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => items, [items, ...dependencies]);
}

/**
 * Hook para memoizar callbacks de lista (clique e remoção)
 * @param items - Array de itens da lista
 * @returns Objeto com callbacks memoizados para clique e remoção
 */
export function useMemoizedListCallbacks<T>(items: T[]) {
  const handleItemClick = useCallback(
    (index: number) => {
      const item: T = items[index];
      // Lógica de clique
      if (process.env.NODE_ENV !== 'production') {
      }
    },
    [items]
  );
  
  const handleItemRemove = useCallback(
    (index: number) => {
      // Lógica de remoção
      if (process.env.NODE_ENV !== 'production') {
      }
    },
    []
  );
  
  return {
    handleItemClick,
    handleItemRemove,
  };
}

export const MemoizedGalleryItem = memo<GalleryItemProps>(
  function MemoizedGalleryItem({ image_url, title, category, onClick }) {
    return (
      <div 
        className="gallery-item cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onClick}
      >
        <div className="gallery-content relative overflow-hidden rounded-lg bg-gray-100">
          <div className="relative w-full h-48">
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <h4 className="text-white font-medium text-sm line-clamp-1">{title}</h4>
            {category && (
              <p className="text-white/80 text-xs mt-1">{category}</p>
            )}
          </div>
        </div>
      </div>
    );
  },
  // Re-renderiza apenas se propriedades visuais mudaram
  (prevProps: GalleryItemProps, nextProps: GalleryItemProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.image_url === nextProps.image_url &&
      prevProps.title === nextProps.title
    );
  }
);

export const MemoizedSystemLink = memo<SystemLinkProps>(
  function MemoizedSystemLink({ name, url, icon_url, description, is_active }) {
    // Memoiza o handler de navegação
    const handleNavigate = useCallback(() => {
      if (is_active) {
        window.open(url, '_blank');
      }
    }, [url, is_active]);
    
    return (
      <div 
        className={`system-link ${is_active ? 'cursor-pointer' : 'opacity-50'}`}
        onClick={handleNavigate}
      >
        <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-card-hover transition-colors">
          {icon_url && (
            <div className="relative w-8 h-8 mr-3 flex-shrink-0">
              <Image
                src={icon_url}
                alt={`${name} icon`}
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{name}</h4>
            {description && (
              <p className="text-sm text-gray-600 truncate">{description}</p>
            )}
          </div>
          {is_active && (
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </div>
      </div>
    );
  }
);

/**
 * Hook para usar memoização condicional baseada em uma flag
 * @param value - Valor a ser memoizado
 * @param shouldMemoize - Se true, aplica memoização; se false, retorna valor direto
 * @param dependencies - Dependências para recalcular a memoização
 * @returns Valor memoizado condicionalmente
 */
export function useConditionalMemo<T>(
  value: T,
  shouldMemoize: boolean,
  dependencies: unknown[] = []
): T {
  // Usa diferentes estratégias de memoização baseado na flag
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(() => value, shouldMemoize ? [value, ...dependencies] : [value]);
  return shouldMemoize ? memoized : value;
}