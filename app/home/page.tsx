'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, lazy } from 'react';

import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import Navbar from '../components/Navbar';
import { InlineSuspense } from '../components/OptimizedSuspense';
import UnifiedLoadingSpinner from '../components/ui/UnifiedLoadingSpinner';

// Lazy load componentes pesados para melhorar o tempo de carregamento inicial
const BannerCarousel = lazy(() => import('@/app/components/BannerCarousel'));
const NoticiasDestaque = lazy(() => import('../components/NoticiasDestaque'));
const EventosDestaque = lazy(() => import('../components/EventosDestaque'));
const MensagensDestaque = lazy(() => import('../components/MensagensDestaque'));
const DocumentosDestaque = lazy(() => import('../components/DocumentosDestaque'));
const VideoGallery = lazy(() => import('@/app/components/VideoGallery'));
const ImageGalleryHome = lazy(() => import('../components/ImageGalleryHome'));
const Footer = lazy(() => import('../components/Footer'));
const GlobalSearch = lazy(() => import('../components/GlobalSearch'));
const SistemasLateral = lazy(() => import('../components/SistemasLateral'));
const ParecerSolicitacao = lazy(() => import('../components/ParecerSolicitacao'));

interface QuickStats {
  activeUsers: number;
  systemsOnline: number;
  unreadNotifications: number;
  pendingApprovals: number;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<QuickStats>({
    activeUsers: 15,
    systemsOnline: 0,
    unreadNotifications: 3,
    pendingApprovals: 2
  });

  const checkUser = useCallback(async () => {
    const pageTimer = logger.componentStart('HomePage.checkUser');
    logger.info('Iniciando verificação de usuário na home page');
    
    try {
      const authTimer = logger.dbStart('supabase.auth.getUser');
      const { data: userData } = await supabase.auth.getUser();
      logger.dbEnd(authTimer);
      
      if (!userData.user) {
        logger.warn('Usuário não autenticado - redirecionando para login');
        logger.componentEnd(pageTimer);
        router.replace('/login');
        return;
      }

      setUser(userData.user);
      logger.info('Usuário autenticado na home page', { userId: userData.user.id });
      
      // Simular dados de estatísticas rápidas
      const statsTimer = logger.componentStart('HomePage.loadStats');
      setStats({
        activeUsers: 15,
        systemsOnline: 25, // Todos os sistemas ativos
        unreadNotifications: 3,
        pendingApprovals: 2
      });
      logger.componentEnd(statsTimer);
      
      setLoading(false);
      logger.componentEnd(pageTimer);
    } catch (error) {
      logger.error('Erro crítico ao verificar usuário na home', error instanceof Error ? error : new Error(String(error)));
      logger.componentEnd(pageTimer);
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) {
    return <UnifiedLoadingSpinner fullScreen message={LOADING_MESSAGES.home} />;
  }

  // Log de renderização da página
  logger.info('Renderizando página home', { 
    userId: user?.id,
    stats,
    componentsLoaded: ['BannerCarousel', 'NoticiasDestaque', 'VideoGallery', 'ImageGalleryHome']
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Banner Carousel - Compacto */}
      <div className="py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InlineSuspense message="Carregando banners...">
            <BannerCarousel />
          </InlineSuspense>
        </div>
      </div>
          
      {/* Seções de Conteúdo - Layout 2/3 + 1/3 */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Primeira Coluna - 2/3 do espaço (Notícias, Vídeos, Galeria, Indicadores) */}
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

            {/* Segunda Coluna - 1/3 do espaço (Busca + Eventos + Mensagens + Sistemas) */}
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
              <InlineSuspense message="Carregando documentos...">
                <DocumentosDestaque compact limit={3} />
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