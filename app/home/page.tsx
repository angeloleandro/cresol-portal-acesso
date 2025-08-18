'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import NoticiasDestaque from '../components/NoticiasDestaque';
import EventosDestaque from '../components/EventosDestaque';
import BannerCarousel from '@/app/components/BannerCarousel';
import VideoGallery from '@/app/components/VideoGallery';
import ImageGalleryHome from '../components/ImageGalleryHome';
import Footer from '../components/Footer';
import GlobalSearch from '../components/GlobalSearch';
import SistemasLateral from '../components/SistemasLateral';
import ParecerSolicitacao from '../components/ParecerSolicitacao';
import { handleComponentError, devLog } from '@/lib/error-handler';
import UnifiedLoadingSpinner from '../components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { Icon } from '../components/icons';
import { logger } from '@/lib/logger';

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
      logger.success('Usuário autenticado na home page', { userId: userData.user.id });
      
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
        <BannerCarousel />
        </div>
          </div>
          
      {/* Seções de Conteúdo - Layout 2/3 + 1/3 */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Primeira Coluna - 2/3 do espaço (Notícias, Vídeos, Galeria, Indicadores) */}
            <div className="lg:col-span-2 space-y-6">
              <NoticiasDestaque />
              <VideoGallery />
              <ImageGalleryHome />
              <ParecerSolicitacao />
            </div>

            {/* Segunda Coluna - 1/3 do espaço (Busca + Eventos + Notificações) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card">
                <h3 className="heading-4 text-title mb-4">Busca Global</h3>
                <GlobalSearch compact />
              </div>
              <EventosDestaque limit={4} />
              <SistemasLateral />
            </div>
          </div>
        </div>
      </div>
      

      <Footer />
    </div>
  );
} 