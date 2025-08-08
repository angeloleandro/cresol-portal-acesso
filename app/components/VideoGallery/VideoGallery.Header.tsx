/**
 * VideoGallery Header Component
 * Responsive header with title and navigation
 */

"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import Icon, { IconName } from '../icons/Icon';
import { headerAnimations } from './VideoGallery.animations';

interface VideoGalleryHeaderProps {
  title?: string;
  subtitle?: string;
  showSeeAll?: boolean;
  seeAllHref?: string;
  seeAllText?: string;
  videoCount?: number;
  className?: string;
  enableAnimations?: boolean;
}

export function VideoGalleryHeader({
  title = "Vídeos em destaque",
  subtitle = "Assista aos conteúdos mais relevantes",
  showSeeAll = true,
  seeAllHref = "/videos",
  seeAllText = "Ver todos",
  videoCount,
  className,
  enableAnimations = true
}: VideoGalleryHeaderProps) {
  const HeaderWrapper = enableAnimations ? motion.div : 'div';
  const headerProps = enableAnimations ? {
    variants: headerAnimations,
    initial: "hidden",
    animate: "visible"
  } : {};

  return (
    <HeaderWrapper
      {...headerProps}
      className={clsx(
        'flex items-center justify-between',
        'flex-col gap-4 sm:flex-row sm:gap-0',
        className
      )}
    >
      {/* Title Section */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-1">
          {title}
          {videoCount !== undefined && (
            <span className="ml-2 text-lg font-normal text-neutral-500">
              ({videoCount})
            </span>
          )}
        </h2>
        {subtitle && (
          <p className="text-neutral-600 text-sm sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* See All Button */}
      {showSeeAll && (
        <SeeAllButton 
          href={seeAllHref} 
          text={seeAllText}
          enableAnimations={enableAnimations}
        />
      )}
    </HeaderWrapper>
  );
}

/**
 * See All Button Component
 */
interface SeeAllButtonProps {
  href: string;
  text: string;
  enableAnimations?: boolean;
}

function SeeAllButton({ href, text, enableAnimations = true }: SeeAllButtonProps) {
  const ButtonWrapper = enableAnimations ? motion.div : 'div';
  const buttonProps = enableAnimations ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <ButtonWrapper {...buttonProps}>
      <Link
        href={href}
        className={clsx(
          'inline-flex items-center gap-2 px-4 py-2',
          'text-sm font-medium',
          'text-primary hover:text-primary-dark',
          'bg-primary/10 hover:bg-primary/20',
          'rounded-lg transition-all duration-200',
          'border border-transparent hover:border-primary/20',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          'w-full sm:w-auto justify-center sm:justify-start'
        )}
        aria-label={`${text} - navegar para galeria completa`}
      >
        <span>{text}</span>
        <Icon 
          name="arrow-right" 
          className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </ButtonWrapper>
  );
}

/**
 * Compact Header for smaller spaces
 */
interface CompactHeaderProps {
  title: string;
  count?: number;
  showSeeAll?: boolean;
  seeAllHref?: string;
  className?: string;
}

export function CompactVideoGalleryHeader({
  title,
  count,
  showSeeAll = true,
  seeAllHref = "/videos",
  className
}: CompactHeaderProps) {
  return (
    <div className={clsx(
      'flex items-center justify-between',
      'py-2 border-b border-neutral-200',
      className
    )}>
      <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
        <Icon name="video" className="w-4 h-4 text-primary" />
        {title}
        {count !== undefined && (
          <span className="text-sm font-normal text-neutral-500">
            ({count})
          </span>
        )}
      </h3>
      
      {showSeeAll && (
        <Link
          href={seeAllHref}
          className={clsx(
            'text-sm text-primary hover:text-primary-dark',
            'flex items-center gap-1',
            'transition-colors duration-200'
          )}
        >
          Ver todos
          <Icon name="chevron-right" className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/**
 * Header with Search and Filters
 */
interface AdvancedHeaderProps extends VideoGalleryHeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  filters?: React.ReactNode;
  showSearch?: boolean;
}

export function AdvancedVideoGalleryHeader({
  title,
  subtitle,
  videoCount,
  showSeeAll,
  seeAllHref,
  seeAllText,
  onSearch,
  searchQuery,
  filters,
  showSearch = false,
  className
}: AdvancedHeaderProps) {
  return (
    <motion.div
      variants={headerAnimations}
      initial="hidden"
      animate="visible"
      className={clsx('space-y-4', className)}
    >
      {/* Main Header */}
      <VideoGalleryHeader
        title={title}
        subtitle={subtitle}
        videoCount={videoCount}
        showSeeAll={showSeeAll}
        seeAllHref={seeAllHref}
        seeAllText={seeAllText}
        enableAnimations={false}
      />
      
      {/* Search and Filters */}
      {(showSearch || filters) && (
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Search Input */}
          {showSearch && onSearch && (
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar vídeos..."
                value={searchQuery || ''}
                onChange={(e) => onSearch(e.target.value)}
                className={clsx(
                  'w-full pl-10 pr-4 py-2',
                  'border border-neutral-300 rounded-lg',
                  'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                  'placeholder-neutral-400 text-sm'
                )}
                aria-label="Buscar vídeos"
              />
              <Icon 
                name="search" 
                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              />
            </div>
          )}
          
          {/* Custom Filters */}
          {filters && (
            <div className="flex gap-2">
              {filters}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Stats Header with metrics
 */
interface StatsHeaderProps {
  title: string;
  stats: {
    total: number;
    youtube: number;
    direct: number;
  };
  className?: string;
}

export function VideoGalleryStatsHeader({
  title,
  stats,
  className
}: StatsHeaderProps) {
  return (
    <motion.div
      variants={headerAnimations}
      initial="hidden"
      animate="visible"
      className={clsx('space-y-4', className)}
    >
      <h2 className="text-2xl font-bold text-neutral-900">
        {title}
      </h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon="video"
          label="Total"
          value={stats.total}
          color="neutral"
        />
        <StatCard
          icon="monitor-play"
          label="YouTube"
          value={stats.youtube}
          color="red"
        />
        <StatCard
          icon="download"
          label="Diretos"
          value={stats.direct}
          color="green"
        />
      </div>
    </motion.div>
  );
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  icon: IconName;
  label: string;
  value: number;
  color: 'neutral' | 'red' | 'green' | 'blue';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    neutral: 'bg-neutral-100 text-neutral-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className={clsx(
      'p-3 rounded-lg text-center',
      colorClasses[color]
    )}>
      <Icon name={icon} className="w-4 h-4 mx-auto mb-1" />
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

export default VideoGalleryHeader;