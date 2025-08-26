'use client';

import { lazy, Suspense, ComponentType } from 'react';
import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';

// Função helper para lazy loading otimizado
function createLazyComponent<T extends {} = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }> | Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn as () => Promise<{ default: ComponentType<T> }>);
  
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 h-32 rounded" />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// Componentes lazy otimizados com fallbacks específicos
export const LazyBannerCarousel = createLazyComponent(
  () => import('./BannerCarousel'),
  <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
);

export const LazyNoticiasDestaque = createLazyComponent(
  () => import('./NoticiasDestaque'),
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg" />
    ))}
  </div>
);

export const LazyEventosDestaque = createLazyComponent(
  () => import('./EventosDestaque'),
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
    ))}
  </div>
);

export const LazyVideoGallery = createLazyComponent(
  () => import('./VideoGallery'),
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg" />
    ))}
  </div>
);

export const LazyImageGalleryHome = createLazyComponent(
  () => import('./ImageGalleryHome'),
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 aspect-square rounded-lg" />
    ))}
  </div>
);

export const LazySistemasLateral = createLazyComponent(
  () => import('./SistemasLateral'),
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-12 rounded-lg" />
    ))}
  </div>
);

export const LazyGlobalSearch = createLazyComponent(
  () => import('./GlobalSearch'),
  <div className="animate-pulse bg-gray-200 h-12 rounded-lg w-full max-w-md" />
);

export const LazyFooter = createLazyComponent(
  () => import('./Footer'),
  <div className="animate-pulse bg-gray-200 h-32 w-full" />
);

// Componentes admin lazy
export const LazyAdminDashboard = createLazyComponent(
  () => import('./admin/AdminDashboard'),
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
      ))}
    </div>
  </div>
);

// Lazy wrapper para componentes analytics
export const LazyAnalyticsShowcase = createLazyComponent(
  () => import('./analytics/AnalyticsShowcase'),
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-40 rounded-lg" />
    ))}
  </div>
);

export const LazyVideoGalleryRoot = createLazyComponent(
  () => import('./VideoGallery/VideoGallery.Root'),
  <UnifiedLoadingSpinner size="large" message="Carregando galeria de vídeos..." />
);

export const LazyCollectionSection = createLazyComponent(
  () => import('./Collections/CollectionSection'),
  <div className="space-y-4">
    <div className="animate-pulse bg-gray-200 h-6 w-48 rounded" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
      ))}
    </div>
  </div>
);

// Componentes grandes que devem ser lazy loaded
export const LazyChakraNavbar = createLazyComponent(
  () => import('./ChakraNavbar'),
  <div className="animate-pulse bg-gray-100 h-16 w-full border-b" />
);

export const LazyAdvancedSearch = createLazyComponent(
  () => import('./AdvancedSearch'),
  <div className="animate-pulse bg-gray-100 h-12 rounded-lg w-full max-w-md" />
);

export const LazyUserEditModal = createLazyComponent(
  () => import('../admin/users/components/UserEditModal'),
  <UnifiedLoadingSpinner size="md" message="Carregando modal de edição..." />
);

export const LazyVideoUploadForm = createLazyComponent(
  () => import('./VideoUploadForm/VideoUploadForm.Root').then(mod => ({ default: mod.VideoUploadFormRoot })) as any,
  <UnifiedLoadingSpinner size="large" message="Carregando formulário de upload..." />
);

// Export para compatibilidade
const LazyComponents = {
  BannerCarousel: LazyBannerCarousel,
  NoticiasDestaque: LazyNoticiasDestaque,
  EventosDestaque: LazyEventosDestaque,
  VideoGallery: LazyVideoGallery,
  ImageGalleryHome: LazyImageGalleryHome,
  SistemasLateral: LazySistemasLateral,
  GlobalSearch: LazyGlobalSearch,
  Footer: LazyFooter,
  AdminDashboard: LazyAdminDashboard,
  AnalyticsShowcase: LazyAnalyticsShowcase,
  VideoGalleryRoot: LazyVideoGalleryRoot,
  CollectionSection: LazyCollectionSection,
  ChakraNavbar: LazyChakraNavbar,
  AdvancedSearch: LazyAdvancedSearch,
  UserEditModal: LazyUserEditModal,
  VideoUploadForm: LazyVideoUploadForm,
};

export {
  LazyBannerCarousel as BannerCarousel,
  LazyNoticiasDestaque as NoticiasDestaque,
  LazyEventosDestaque as EventosDestaque,
  LazyVideoGallery as VideoGallery,
  LazyImageGalleryHome as ImageGalleryHome,
  LazySistemasLateral as SistemasLateral,
  LazyGlobalSearch as GlobalSearch,
  LazyFooter as Footer,
  LazyAdminDashboard as AdminDashboard,
  LazyAnalyticsShowcase as AnalyticsShowcase,
  LazyVideoGalleryRoot as VideoGalleryRoot,
  LazyCollectionSection as CollectionSection,
  LazyChakraNavbar as ChakraNavbar,
  LazyAdvancedSearch as AdvancedSearch,
  LazyUserEditModal as UserEditModal,
  LazyVideoUploadForm as VideoUploadForm,
};

export default LazyComponents;