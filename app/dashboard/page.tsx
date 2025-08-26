'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import OptimizedImage from '@/app/components/OptimizedImage';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import Breadcrumbs from '../components/Breadcrumbs';
import EventosDestaque from '../components/EventosDestaque';
import Footer from '../components/Footer';
import GlobalSearch from '../components/GlobalSearch';
import { Icon } from '../components/icons/Icon';
// import Navbar from '../components/Navbar' // NextUI version
import ChakraNavbar from '../components/ChakraNavbar' // Chakra UI version;
import NoticiasDestaque from '../components/NoticiasDestaque';

interface DashboardStats {
  newsCount: number;
  eventsCount: number;
  messagesCount: number;
  documentsCount: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    newsCount: 0,
    eventsCount: 0,
    messagesCount: 0,
    documentsCount: 0
  });
  const [recentSystems, setRecentSystems] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      
      setUser(data.user);
      await Promise.all([
        fetchProfile(data.user.id),
        fetchDashboardData(data.user.id) // OTIMIZADO: 1 chamada em vez de 2
      ]);
      
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, position, role, work_location_id, work_locations(name)')
        .eq('id', userId)
        .single();

      if (error) {

        return;
      }

      setProfile(data);
    } catch (error) {

    }
  };

  // FUNÇÃO OTIMIZADA: 1 chamada para API batch em vez de 4 queries separadas
  const fetchDashboardData = async (userId: string) => {
    try {
      
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error(`Erro API dashboard: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido na API dashboard');
      }
      
      const { newsCount, eventsCount, messagesCount, documentsCount, recentSystems } = result.data;
      
      setStats({
        newsCount,
        eventsCount,
        messagesCount,
        documentsCount
      });
      
      setRecentSystems(recentSystems);

    } catch (error: any) {

    }
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <UnifiedLoadingSpinner 
        fullScreen
        size="large" 
        message={LOADING_MESSAGES.dashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChakraNavbar />
      
      <main className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Header com saudação */}
        <div className="mb-8">
          <h1 className="heading-1 mb-2">
            {getCurrentGreeting()}, {profile?.full_name || user?.user_metadata?.full_name || 'Colaborador'}!
          </h1>
          <p className="body-text-small text-muted">
            {profile?.position && `${profile.position} • `}
            {profile?.work_locations?.name || 'Portal Cresol'}
          </p>
        </div>

        {/* Busca Global */}
        <div className="mb-8">
          <div className="max-w-2xl">
            <GlobalSearch placeholder="Buscar sistemas, eventos, notícias..." />
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-primary rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 rounded-lg">
                <Icon name="file-text" className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.newsCount}</p>
                <p className="text-sm opacity-90">NOTÍCIAS</p>
                <p className="text-xs opacity-75 mt-1">Últimos 30 dias</p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 rounded-lg">
                <Icon name="calendar" className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.eventsCount}</p>
                <p className="text-sm opacity-90">EVENTOS</p>
                <p className="text-xs opacity-75 mt-1">Próximos 30 dias</p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 rounded-lg">
                <Icon name="chat-line" className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.messagesCount}</p>
                <p className="text-sm opacity-90">MENSAGENS</p>
                <p className="text-xs opacity-75 mt-1">Últimos 30 dias</p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 rounded-lg">
                <Icon name="folder" className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.documentsCount}</p>
                <p className="text-sm opacity-90">DOCUMENTOS</p>
                <p className="text-xs opacity-75 mt-1">Últimos 30 dias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sistemas Recentes */}
        {recentSystems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-2">Sistemas Disponíveis</h2>
              <Link href="/sistemas" className="text-primary hover:text-primary font-medium text-sm">
                Ver todos →
              </Link>
            </div>
            <div className="grid-responsive">
              {recentSystems.slice(0, 6).map((system) => (
                <a
                  key={system.id}
                  href={system.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card transition-all duration-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      {system.icon ? (
                        <OptimizedImage 
                          src={system.icon} 
                          alt={system.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      ) : (
                        <Icon name="monitor" className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="heading-4 line-clamp-1">{system.name}</h3>
                      {system.sectors && (
                        <span className="badge-text text-muted">{system.sectors.name}</span>
                      )}
                    </div>
                  </div>
                  <p className="body-text-small text-muted line-clamp-2">{system.description}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Grid com Eventos e Notícias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Eventos em Destaque */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-2">Próximos Eventos</h2>
              <Link href="/eventos" className="text-primary hover:text-primary font-medium text-sm">
                Ver todos →
              </Link>
            </div>
            <EventosDestaque compact limit={3} />
          </div>

          {/* Notícias em Destaque */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-2">Últimas Notícias</h2>
              <Link href="/noticias" className="text-primary hover:text-primary font-medium text-sm">
                Ver todas →
              </Link>
            </div>
            <NoticiasDestaque compact limit={3} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}