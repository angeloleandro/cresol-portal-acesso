'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import NoticiasDestaque from '../components/NoticiasDestaque';
import EventosDestaque from '../components/EventosDestaque';
import BannerCarousel from '@/app/components/BannerCarousel';
import VideoGallery from '@/app/components/VideoGallery';
import ImageGallery from '../components/ImageGallery';
import Footer from '../components/Footer';
import GlobalSearch from '../components/GlobalSearch';
import SystemLinks from '../components/SystemLinks';
import ParecerSolicitacao from '../components/ParecerSolicitacao';
import NotificationsAndMessages from '../components/NotificationsAndMessages';
import { handleComponentError, devLog } from '@/lib/error-handler';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Icon } from '../components/icons';

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
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);
      
      // Simular dados de estatísticas rápidas
      setStats({
        activeUsers: 15,
        systemsOnline: 25, // Todos os sistemas ativos
        unreadNotifications: 3,
        pendingApprovals: 2
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando página inicial..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Banner Carousel - Compacto */}
      <div className="py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BannerCarousel />
        </div>
          </div>
          
      {/* Sistemas - Compacto */}
      <div className="py-6 bg-white border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center lg:text-left mb-4">
            <h2 className="heading-3 text-title">Hub Cresol Fronteiras PR/SC/SP/ES</h2>
            <p className="body-text-small text-muted">Acesso centralizado aos sistemas</p>
          </div>
          <SystemLinks />
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
              <ImageGallery />
              <ParecerSolicitacao />
            </div>

            {/* Segunda Coluna - 1/3 do espaço (Busca + Eventos + Notificações) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card">
                <h3 className="heading-4 text-title mb-4">Busca Global</h3>
                <GlobalSearch compact />
              </div>
              <EventosDestaque />
              <NotificationsAndMessages />
            </div>
          </div>
        </div>
      </div>
      

      <Footer />
    </div>
  );
} 