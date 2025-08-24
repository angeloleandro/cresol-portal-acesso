'use client';

// Collection Loading Components
// Componentes de loading/skeleton para sistema de coleções

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { CSS_CLASSES } from '@/lib/constants/collections';
import { cn } from '@/lib/utils/cn';

// Loading Spinner
export const CollectionSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center justify-center p-8", className)}>
    <div className={CSS_CLASSES.LOADING_SPINNER} />
  </div>
);

// Card Skeleton
export const CollectionCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn(CSS_CLASSES.CARD_BASE, "animate-pulse", className)}>
    {/* Cover skeleton */}
    <div className="aspect-video bg-gray-200" />
    
    {/* Content skeleton */}
    <div className={CSS_CLASSES.CARD_CONTENT}>
      <div className="h-5 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
    </div>
  </div>
);

// Grid Skeleton
export const CollectionGridSkeleton: React.FC<{ 
  count?: number; 
  className?: string 
}> = ({ count = 8, className }) => (
  <div className={cn(CSS_CLASSES.GRID_RESPONSIVE, className)}>
    {Array.from({ length: count }).map((_, index) => (
      <CollectionCardSkeleton key={index} />
    ))}
  </div>
);

// List Skeleton
export const CollectionListSkeleton: React.FC<{ 
  count?: number; 
  className?: string 
}> = ({ count = 5, className }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="w-20 h-4 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

// Inline Loading
export const CollectionInlineLoading: React.FC<{ 
  message?: string; 
  className?: string 
}> = ({ message = 'Carregando...', className }) => (
  <div className={cn("flex items-center justify-center py-6", className)}>
    <div className={CSS_CLASSES.LOADING_SPINNER} />
    <span className="ml-2 text-sm text-gray-600">{message}</span>
  </div>
);

// Button Loading
export const CollectionButtonLoading: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("inline-flex items-center", className)}>
    <UnifiedLoadingSpinner size="small" className="inline-flex items-center mr-2" />
    <span>Processando...</span>
  </div>
);

// Progress Loading
export const CollectionProgressLoading: React.FC<{ 
  progress: number; 
  message?: string;
  className?: string 
}> = ({ progress, message, className }) => (
  <div className={cn("w-full", className)}>
    {message && (
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{message}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    )}
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);

// Main Loading Component (combines all)
const CollectionLoading = {
  Spinner: CollectionSpinner,
  CardSkeleton: CollectionCardSkeleton,
  GridSkeleton: CollectionGridSkeleton,
  ListSkeleton: CollectionListSkeleton,
  Inline: CollectionInlineLoading,
  Button: CollectionButtonLoading,
  Progress: CollectionProgressLoading,
};

export default CollectionLoading;