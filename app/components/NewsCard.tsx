'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { memo } from 'react';

import OptimizedImage from './OptimizedImage';
import { FormatDate } from '@/lib/utils/formatters';

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
 * Main NewsCard Component
 */
export const NewsCard = memo(({
  news,
  variant = 'horizontal',
  className,
  priority = false,
  showCategory = true,
  showDate = true,
  showImage = true
}: NewsCardProps) => {
  if (variant === 'compact') {
    return <CompactNewsCard news={news} className={className} />;
  }
  
  if (variant === 'featured') {
    return <FeaturedNewsCard news={news} className={className} priority={priority} />;
  }
  
  return <HorizontalNewsCard news={news} className={className} priority={priority} showCategory={showCategory} showDate={showDate} showImage={showImage} />;
});

/**
 * Horizontal News Card Component
 */
export const HorizontalNewsCard = memo(({
  news,
  className,
  priority = false,
  showCategory = true,
  showDate = true,
  showImage = true
}: Omit<NewsCardProps, 'variant'>) => {
  return (
    <Link 
      href={`/noticias/${news.id}`}
      className={clsx(
        'block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex">
        {showImage && news.image_url && (
          <div className="relative w-48 h-32 flex-shrink-0">
            <OptimizedImage
              src={news.image_url}
              alt={news.title}
              fill
              className="object-cover rounded-l-lg"
              priority={priority}
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-2">
            {showCategory && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {news.category}
              </span>
            )}
            {showDate && (
              <span className="text-xs text-gray-500">
                {FormatDate(news.created_at)}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{news.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{news.summary}</p>
        </div>
      </div>
    </Link>
  );
});

/**
 * Compact News Card Component
 */
export const CompactNewsCard = memo(({
  news,
  className
}: Omit<NewsCardProps, 'variant'>) => {
  return (
    <Link 
      href={`/noticias/${news.id}`}
      className={clsx(
        'block p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200',
        className
      )}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{news.title}</h3>
      <p className="text-xs text-gray-600 line-clamp-2">{news.summary}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-500">
          {FormatDate(news.created_at)}
        </span>
      </div>
    </Link>
  );
});

/**
 * Featured News Card Component
 */
export const FeaturedNewsCard = memo(({
  news,
  className,
  priority = false
}: Omit<NewsCardProps, 'variant'>) => {
  return (
    <Link 
      href={`/noticias/${news.id}`}
      className={clsx(
        'block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200',
        className
      )}
    >
      {news.image_url && (
        <div className="relative h-48">
          <OptimizedImage
            src={news.image_url}
            alt={news.title}
            fill
            className="object-cover"
            priority={priority}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {news.category}
          </span>
          <span className="text-xs text-gray-500">
            {FormatDate(news.created_at)}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{news.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{news.summary}</p>
      </div>
    </Link>
  );
});

// Display names for debugging
NewsCard.displayName = 'NewsCard';
HorizontalNewsCard.displayName = 'HorizontalNewsCard';
CompactNewsCard.displayName = 'CompactNewsCard';
FeaturedNewsCard.displayName = 'FeaturedNewsCard';

export default NewsCard;