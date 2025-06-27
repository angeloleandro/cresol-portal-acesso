'use client';

import { useEffect, useState } from 'react';
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
import { handleComponentError, devLog } from '@/lib/error-handler';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Users, Bell, Clock, CircleCheckBig } from 'lucide-react';

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

  useEffect(() => {
    checkUser();
  }, []);

    const checkUser = async () => {
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
  };

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
          
      {/* Status do Sistema + Busca Global - Profissional */}
      <div className="py-6 bg-white border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            
            {/* Status do Sistema - Design Profissional */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center lg:text-left">
                Status do Sistema
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Online */}
                <div className="text-center p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl transition-all duration-200 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-center mb-2">
                    <CircleCheckBig className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">Online</div>
                  <div className="text-sm font-medium text-gray-500">Sistemas</div>
                </div>

                {/* Usuários Ativos */}
                <div className="text-center p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl transition-all duration-200 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                  <div className="text-sm font-medium text-gray-500">Usuários</div>
                </div>

                {/* Notificações */}
                <div className="text-center p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl transition-all duration-200 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Bell className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.unreadNotifications}</div>
                  <div className="text-sm font-medium text-gray-500">Notificações</div>
                </div>

                {/* Pendências */}
                <div className="text-center p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl transition-all duration-200 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</div>
                  <div className="text-sm font-medium text-gray-500">Pendências</div>
                </div>
              </div>
            </div>

            {/* Busca Global - Design Harmonioso */}
            <div className="flex-shrink-0 w-full lg:w-80">
              <div className="text-center lg:text-right mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Portal Cresol
                </h2>
                <p className="text-sm text-gray-500">
                  Acesso centralizado
                </p>
              </div>
              <GlobalSearch compact />
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Sistemas e Links - Compacta */}
      <div className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SystemLinks />
        </div>
      </div>

      {/* Seções de Conteúdo - Compactas */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <NoticiasDestaque />
            <EventosDestaque />
                  </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <VideoGallery />
            <ImageGallery />
          </div>
        </div>
      </div>
      
      {/* Parecer da Solicitação - Abaixo da Galeria */}
      <ParecerSolicitacao />

      <Footer />
    </div>
  );
} 