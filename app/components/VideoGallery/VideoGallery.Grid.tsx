
import clsx from 'clsx';
import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

import { GridLayoutType, GridLayoutConfig } from './VideoGallery.types';




interface VideoGalleryGridProps {
  children: ReactNode;
  videoCount: number;
  limit?: number;
  className?: string;
  enableAnimations?: boolean;
}

/**
 * Sistema de grid inteligente baseado na quantidade de vídeos
 */
export const GridSystem = {
  getGridLayout: (videoCount: number, limit?: number): GridLayoutType => {
    const count = Math.min(videoCount, limit || videoCount);
    
    switch (count) {
      case 1: return 'single-centered';      // 1 video centralizado
      case 2: return 'dual-columns';         // 2 colunas equilibradas
      case 3: return 'asymmetric-3';         // Layout assimétrico  
      default: return 'responsive-grid';     // Grid responsivo padrão
    }
  },
  
  layouts: {
    'single-centered': {
      name: 'Single Centered',
      gridClass: 'flex justify-center',
      containerClass: 'max-w-md mx-auto',
      maxVideos: 1
    } as GridLayoutConfig,
    
    'dual-columns': {
      name: 'Dual Columns',
      gridClass: clsx(
        'grid gap-6',
        'grid-cols-1 sm:grid-cols-2',
        'items-stretch auto-rows-fr'
      ),
      maxVideos: 2
    } as GridLayoutConfig,
    
    'asymmetric-3': {
      name: 'Asymmetric 3',
      gridClass: clsx(
        'grid gap-4',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        'auto-rows-fr'  // Equal height rows
      ),
      maxVideos: 3
    } as GridLayoutConfig,
    
    'responsive-grid': {
      name: 'Responsive Grid',
      gridClass: clsx(
        'grid gap-6',
        'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        'auto-rows-fr'
      )
    } as GridLayoutConfig,
  }
};

/**
 * Container variants para animações do grid
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

/**
 * Componente principal do sistema de grid
 */
/**
 * VideoGalleryGrid function
 * @todo Add proper documentation
 */
export function VideoGalleryGrid({
  children,
  videoCount,
  limit,
  className,
  enableAnimations = true
}: VideoGalleryGridProps) {
  const layout = GridSystem.getGridLayout(videoCount, limit);
  const layoutConfig = GridSystem.layouts[layout];
  
  const gridClassName = clsx(
    layoutConfig.gridClass,
    layoutConfig.containerClass,
    className
  );

  if (enableAnimations) {
    return (
      <motion.div
        className={gridClassName}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label={`Grade de vídeos em layout ${layoutConfig.name}`}
        role="grid"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div 
      className={gridClassName}
      aria-label={`Grade de vídeos em layout ${layoutConfig.name}`}
      role="grid"
    >
      {children}
    </div>
  );
}

/**
 * Hook para obter configuração de layout
 */
/**
 * useGridLayout function
 * @todo Add proper documentation
 */
export function useGridLayout(videoCount: number, limit?: number) {
  const layoutType = GridSystem.getGridLayout(videoCount, limit);
  const layoutConfig = GridSystem.layouts[layoutType];
  
  return {
    layoutType,
    layoutConfig,
    shouldShowAll: limit ? videoCount > limit : false,
    visibleCount: limit ? Math.min(videoCount, limit) : videoCount,
  };
}

/**
 * Componente de grid especializado para diferentes layouts
 */
interface SpecializedGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * SingleCenteredGrid function
 * @todo Add proper documentation
 */
export function SingleCenteredGrid({ children, className }: SpecializedGridProps) {
  return (
    <motion.div
      className={clsx(
        GridSystem.layouts['single-centered'].gridClass,
        GridSystem.layouts['single-centered'].containerClass,
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="grid"
      aria-label="Vídeo único centralizado"
    >
      {children}
    </motion.div>
  );
}

/**
 * DualColumnsGrid function
 * @todo Add proper documentation
 */
export function DualColumnsGrid({ children, className }: SpecializedGridProps) {
  return (
    <motion.div
      className={clsx(
        GridSystem.layouts['dual-columns'].gridClass,
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="grid"
      aria-label="Grade de duas colunas"
    >
      {children}
    </motion.div>
  );
}

/**
 * AsymmetricGrid function
 * @todo Add proper documentation
 */
export function AsymmetricGrid({ children, className }: SpecializedGridProps) {
  return (
    <motion.div
      className={clsx(
        GridSystem.layouts['asymmetric-3'].gridClass,
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="grid"
      aria-label="Grade assimétrica de três colunas"
    >
      {children}
    </motion.div>
  );
}

/**
 * ResponsiveGrid function
 * @todo Add proper documentation
 */
export function ResponsiveGrid({ children, className }: SpecializedGridProps) {
  return (
    <motion.div
      className={clsx(
        GridSystem.layouts['responsive-grid'].gridClass,
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="grid"
      aria-label="Grade responsiva de múltiplas colunas"
    >
      {children}
    </motion.div>
  );
}

/**
 * Grid item wrapper com suporte a animações
 */
interface GridItemProps {
  children: ReactNode;
  index?: number;
  className?: string;
  enableAnimations?: boolean;
}

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
};

/**
 * GridItem function
 * @todo Add proper documentation
 */
export function GridItem({ 
  children, 
  index = 0, 
  className, 
  enableAnimations = true 
}: GridItemProps) {
  if (enableAnimations) {
    return (
      <motion.div
        className={clsx('flex', className)}
        variants={itemVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
        role="gridcell"
        tabIndex={0}
        aria-label={`Vídeo ${index + 1}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div 
      className={clsx('flex', className)}
      role="gridcell"
      tabIndex={0}
      aria-label={`Vídeo ${index + 1}`}
    >
      {children}
    </div>
  );
}

/**
 * Adaptive grid que muda baseado no viewport
 */
interface AdaptiveGridProps {
  children: ReactNode;
  videoCount: number;
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
}

/**
 * AdaptiveGrid function
 * @todo Add proper documentation
 */
export function AdaptiveGrid({ 
  children, 
  videoCount,
  breakpoints = { mobile: 1, tablet: 2, desktop: 4 },
  className 
}: AdaptiveGridProps) {
  const adaptiveClasses = clsx(
    'grid gap-6 auto-rows-fr',
    `grid-cols-${breakpoints.mobile}`,
    `sm:grid-cols-${breakpoints.tablet}`,
    `lg:grid-cols-${breakpoints.desktop}`,
    className
  );

  return (
    <motion.div
      className={adaptiveClasses}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="grid"
      aria-label={`Grade adaptativa com ${videoCount} vídeos`}
    >
      {children}
    </motion.div>
  );
}