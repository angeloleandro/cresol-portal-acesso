'use client';

import { memo, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import clsx from 'clsx';
import OptimizedImage from './OptimizedImage';

/**
 * News Item Interface
 */
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image_url?: string;
  created_at: string;
  category: string;
  is_featured?: boolean;
}

/**
 * News Card Props
 */
export interface NewsCardProps {
  news: NewsItem;
  variant?: 'horizontal' | 'compact' | 'featured';
  className?: string;
  priority?: boolean;
  showCategory?: boolean;
  showDate?: boolean;
  showImage?: boolean;
}

/**
 * Horizontal News Card Component
 * Adapts Chakra UI Card horizontal pattern for news content
 */
export const HorizontalNewsCard = memo(({
  news,
  className,
  priority = false,
  showCategory = true,
  showDate = true,
  showImage = true
}: Omit<NewsCardProps, 'variant'>) => {
  
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ptBR });
    } catch {
      return '';
    }
  }, []);

  return (
    <Link 
      href={`/noticias/${news.id}`}
      className={clsx(
        // Card.Root equivalent - horizontal flex layout
        'group block',
        'bg-white rounded-md overflow-hidden',
        'border border-gray-200/40 hover:border-gray-200/70',
        'transition-colors duration-150',
        'flex flex-col md:flex-row',
        'max-w-4xl', // Chakra's maxW="xl" equivalent
        className
      )}
    >
      {/* Image Section - Chakra UI Image equivalent */}
      {showImage && (
        <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden flex-shrink-0">
          {news.image_url ? (
            <OptimizedImage
              src={news.image_url}
              alt={news.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary/60">Cresol</span>
            </div>
          )}
        </div>
      )}
      
      {/* Content Section - Chakra UI Box equivalent */}
      <div className="flex-1 flex flex-col">
        {/* Card.Body equivalent */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Card.Title with badges */}
          <div className="mb-3">
            <h3 className="heading-4 text-title mb-2 leading-tight group-hover:text-primary transition-colors duration-150">
              {news.title}
            </h3>
            
            {/* HStack equivalent for badges */}
            {(showCategory || showDate) && (
              <div className="flex items-center gap-2 mt-2">
                {showCategory && (
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    'bg-primary/10 text-primary border border-primary/20'
                  )}>
                    {news.category}
                  </span>
                )}
                {showDate && (
                  <span className="text-xs text-muted">
                    {formatDate(news.created_at)}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Card.Description equivalent */}
          <p className="body-text text-body leading-relaxed line-clamp-3 flex-grow">
            {news.summary}
          </p>
        </div>
        
        {/* Card.Footer equivalent */}
        <div className="px-6 pb-6">
          <span className="inline-flex items-center text-sm font-medium text-primary group-hover:text-primary-dark transition-colors duration-150">
            Leia mais
            <svg className="ml-1 w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
});

HorizontalNewsCard.displayName = 'HorizontalNewsCard';

/**
 * Compact News Card Component
 * For sidebar or reduced space layouts
 */
export const CompactNewsCard = memo(({
  news,
  className,
  showCategory = true,
  showDate = true
}: Omit<NewsCardProps, 'variant' | 'showImage'>) => {
  
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '';
    }
  }, []);

  return (
    <Link 
      href={`/noticias/${news.id}`}
      className={clsx(
        'group block p-3',
        'bg-white border border-gray-200/40 hover:border-gray-200/70',
        'rounded-md transition-colors duration-150',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="body-text-bold text-title line-clamp-2 mb-1 group-hover:text-primary transition-colors duration-150">
            {news.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted">
            {showDate && <span>{formatDate(news.created_at)}</span>}
            {showCategory && showDate && <span>•</span>}
            {showCategory && <span>{news.category}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
});

CompactNewsCard.displayName = 'CompactNewsCard';

/**
 * Featured News Card Component
 * Larger card for highlighting important news
 */
export const FeaturedNewsCard = memo(({
  news,
  className,
  priority = true,
  showCategory = true,
  showDate = true,
  showImage = true
}: Omit<NewsCardProps, 'variant'>) => {
  
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ptBR });
    } catch {
      return '';
    }
  }, []);

  return (
    <Link 
      href={`/noticias/${news.id}`}
      className={clsx(
        'group block',
        'bg-white rounded-md overflow-hidden',
        'border border-gray-200/40 hover:border-gray-200/70',
        'transition-colors duration-150',
        'shadow-sm hover:shadow-md',
        className
      )}
    >
      {/* Featured Image */}
      {showImage && (
        <div className="aspect-video relative overflow-hidden">
          {news.image_url ? (
            <OptimizedImage
              src={news.image_url}
              alt={news.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary/60">Cresol</span>
            </div>
          )}
          
          {/* Overlay Badge */}
          {showCategory && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 text-primary backdrop-blur-sm border border-white/20">
                {news.category}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="heading-3 text-title leading-tight group-hover:text-primary transition-colors duration-150">
            {news.title}
          </h3>
          {showDate && (
            <span className="text-sm text-muted ml-4 flex-shrink-0">
              {formatDate(news.created_at)}
            </span>
          )}
        </div>
        
        <p className="body-text text-body leading-relaxed line-clamp-3 mb-4">
          {news.summary}
        </p>
        
        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:text-primary-dark transition-colors duration-150">
          Leia mais
          <svg className="ml-1 w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
});

FeaturedNewsCard.displayName = 'FeaturedNewsCard';

/**
 * Main News Card Component with variant support
 */
export const NewsCard = memo(({
  variant = 'horizontal',
  ...props
}: NewsCardProps) => {
  switch (variant) {
    case 'compact':
      return <CompactNewsCard {...props} />;
    case 'featured':
      return <FeaturedNewsCard {...props} />;
    case 'horizontal':
    default:
      return <HorizontalNewsCard {...props} />;
  }
});

NewsCard.displayName = 'NewsCard';

export default NewsCard;