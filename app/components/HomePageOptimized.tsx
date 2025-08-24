'use client';

import { lazy } from 'react';

import { useHomePageData } from '@/hooks/useParallelDataFetch';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

import Navbar from './Navbar';
import { InlineSuspense } from './OptimizedSuspense';
import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';

// Lazy load componentes pesados
const BannerCarousel = lazy(() => import('./BannerCarousel'));
const NoticiasDestaque = lazy(() => import('./NoticiasDestaque'));
const EventosDestaque = lazy(() => import('./EventosDestaque'));
const MensagensDestaque = lazy(() => import('./MensagensDestaque'));
const VideoGallery = lazy(() => import('./VideoGallery'));
const ImageGalleryHome = lazy(() => import('./ImageGalleryHome'));
const Footer = lazy(() => import('./Footer'));
const GlobalSearch = lazy(() => import('./GlobalSearch'));
const SistemasLateral = lazy(() => import('./SistemasLateral'));
const ParecerSolicitacao = lazy(() => import('./ParecerSolicitacao'));

export default function HomePageOptimized() {
  // Carrega todos os dados em paralelo
  const { loading, error, banners: _banners, news: _news, events: _events, videos: _videos, gallery: _gallery, systemLinks: _systemLinks } = useHomePageData();
  
  // Se ainda está carregando dados críticos, mostra loading
  if (loading) {
    return <UnifiedLoadingSpinner fullScreen message={LOADING_MESSAGES.home} />;
  }
  
  // Se houve erro crítico
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600">Por favor, recarregue a página</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Banner Carousel - Renderiza imediatamente com dados pré-carregados */}
      <div className="py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InlineSuspense message="Carregando banners...">
            <BannerCarousel />
          </InlineSuspense>
        </div>
      </div>
      
      {/* Seções de Conteúdo - Com dados pré-carregados */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Primeira Coluna - 2/3 do espaço */}
            <div className="lg:col-span-2 space-y-6">
              <InlineSuspense message="Carregando notícias...">
                <NoticiasDestaque />
              </InlineSuspense>
              
              <InlineSuspense message="Carregando vídeos...">
                <VideoGallery />
              </InlineSuspense>
              
              <InlineSuspense message="Carregando galeria...">
                <ImageGalleryHome />
              </InlineSuspense>
              
              <InlineSuspense message="Carregando solicitações...">
                <ParecerSolicitacao />
              </InlineSuspense>
            </div>
            
            {/* Segunda Coluna - 1/3 do espaço */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card">
                <h3 className="heading-4 text-title mb-4">Busca Global</h3>
                <InlineSuspense message="Carregando busca...">
                  <GlobalSearch compact />
                </InlineSuspense>
              </div>
              
              <InlineSuspense message="Carregando eventos...">
                <EventosDestaque limit={4} />
              </InlineSuspense>
              
              <InlineSuspense message="Carregando mensagens...">
                <MensagensDestaque compact limit={3} />
              </InlineSuspense>
              
              <InlineSuspense message="Carregando sistemas...">
                <SistemasLateral />
              </InlineSuspense>
            </div>
          </div>
        </div>
      </div>
      
      <InlineSuspense message="Carregando rodapé...">
        <Footer />
      </InlineSuspense>
    </div>
  );
}