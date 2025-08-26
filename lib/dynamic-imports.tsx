import dynamic from 'next/dynamic';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';

// ADMIN COMPONENTS - Lazy load componentes pesados de admin
export const AdminDashboard = dynamic(
  () => import('@/app/components/admin/AdminDashboard'),
  {
    loading: () => <UnifiedLoadingSpinner size="large" message="Carregando painel administrativo..." />,
    ssr: false
  }
);

export const UserManagement = dynamic(
  () => import('@/app/admin/users/components/UsersClient'),
  {
    loading: () => <UnifiedLoadingSpinner size="large" message="Carregando gestão de usuários..." />,
    ssr: false
  }
);

export const BannerManagement = dynamic(
  () => import('@/app/admin/banners/page'),
  {
    loading: () => <UnifiedLoadingSpinner size="large" message="Carregando gestão de banners..." />,
    ssr: false
  }
);

export const GalleryManagement = dynamic(
  () => import('@/app/admin/gallery/page'),
  {
    loading: () => <UnifiedLoadingSpinner size="large" message="Carregando gestão da galeria..." />,
    ssr: false
  }
);

export const VideoManagement = dynamic(
  () => import('@/app/admin/videos/page'),
  {
    loading: () => <UnifiedLoadingSpinner size="large" message="Carregando gestão de vídeos..." />,
    ssr: false
  }
);

// UI COMPONENTS - Componentes de interface pesados
export const ImageGallery = dynamic(
  () => import('@/app/components/ImageGallery'),
  {
    loading: () => <UnifiedLoadingSpinner message="Carregando galeria..." />,
    ssr: false
  }
);

export const VideoGallery = dynamic(
  () => import('@/app/components/VideoGallery'),
  {
    loading: () => <UnifiedLoadingSpinner message="Carregando galeria de vídeos..." />,
    ssr: false
  }
);

export const BannerCarousel = dynamic(
  () => import('@/app/components/BannerCarousel'),
  {
    loading: () => <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />,
    ssr: true // Banner pode ser SSR
  }
);

// MODAL COMPONENTS - Modais podem ser lazy loaded
export const ConfirmationModal = dynamic(
  () => import('@/app/components/ui/ConfirmationModal'),
  {
    loading: () => null, // Modais não precisam de loading
    ssr: false
  }
);

export const DeleteModal = dynamic(
  () => import('@/app/components/ui/DeleteModal'),
  {
    loading: () => null,
    ssr: false
  }
);

export const RoleModal = dynamic(
  () => import('@/app/admin/users/components/RoleModal'),
  {
    loading: () => null,
    ssr: false
  }
);

// FORM COMPONENTS - Formulários complexos
export const ImageUploadForm = dynamic(
  () => import('@/app/components/ImageUploadForm'),
  {
    loading: () => <UnifiedLoadingSpinner message="Carregando formulário..." />,
    ssr: false
  }
);

export const BannerUploadForm = dynamic(
  () => import('@/app/components/BannerUploadForm'),
  {
    loading: () => <UnifiedLoadingSpinner message="Carregando formulário..." />,
    ssr: false
  }
);

// COMPLEX FEATURES - Funcionalidades complexas que podem ser lazy loaded
export const EconomicIndicators = dynamic(
  () => import('@/app/components/EconomicIndicators'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
    ssr: true // Indicadores podem ser SSR
  }
);

export const SystemLinks = dynamic(
  () => import('@/app/components/SystemLinks'),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
    ssr: true
  }
);

// EDITOR COMPONENTS - Editores pesados
// export const RichTextEditor = dynamic(
//   () => import('@/app/components/ui/RichTextEditor').then(mod => ({ default: mod.RichTextEditor })),
//   {
//     loading: () => <div className="h-40 bg-gray-100 animate-pulse rounded border" />,
//     ssr: false
//   }
// );

// CHART COMPONENTS - Gráficos e visualizações
// export const ChartComponent = dynamic(
//   () => import('@/app/components/charts/ChartComponent'),
//   {
//     loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />,
//     ssr: false
//   }
// );

// Função helper para criar dynamic imports com configurações padrão
export function createDynamicImport(importFn: () => Promise<any>, options?: {
  loading?: () => JSX.Element;
  ssr?: boolean;
  message?: string;
}) {
  return dynamic(importFn, {
    loading: options?.loading || (() => <UnifiedLoadingSpinner message={options?.message} />),
    ssr: options?.ssr ?? false
  });
}

// Configurações de code splitting por rota
export const routeBasedImports = {
  admin: {
    users: () => import('@/app/admin/users/page'),
    sectors: () => import('@/app/admin/sectors/page'),
    banners: () => import('@/app/admin/banners/page'),
    gallery: () => import('@/app/admin/gallery/page'),
    videos: () => import('@/app/admin/videos/page'),
  },
  public: {
    home: () => import('@/app/home/page'),
    sectors: () => import('@/app/setores/page'),
    gallery: () => import('@/app/galeria/page'),
    videos: () => import('@/app/videos/page'),
  }
};

const dynamicComponents = {
  AdminDashboard,
  UserManagement,
  BannerManagement,
  GalleryManagement,
  VideoManagement,
  ImageGallery,
  VideoGallery,
  BannerCarousel,
  ConfirmationModal,
  DeleteModal,
  RoleModal,
  ImageUploadForm,
  BannerUploadForm,
  EconomicIndicators,
  SystemLinks,
  // RichTextEditor,
  // ChartComponent,
  createDynamicImport,
  routeBasedImports
};

export default dynamicComponents;