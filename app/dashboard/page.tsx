'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalSearch from '../components/GlobalSearch';
import Breadcrumbs from '../components/Breadcrumbs';
import EventosDestaque from '../components/EventosDestaque';
import NoticiasDestaque from '../components/NoticiasDestaque';

interface QuickAction {
  title: string;
  description: string;
  icon: JSX.Element;
  href: string;
  color: string;
}

interface DashboardStats {
  systemsCount: number;
  upcomingEventsCount: number;
  unreadNotificationsCount: number;
  favoriteSystemsCount: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    systemsCount: 0,
    upcomingEventsCount: 0,
    unreadNotificationsCount: 0,
    favoriteSystemsCount: 0
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
        fetchStats(data.user.id),
        fetchRecentSystems(data.user.id)
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
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const fetchStats = async (userId: string) => {
    try {
      // Buscar quantidade de sistemas disponíveis
      const { data: systems } = await supabase
        .from('systems')
        .select('id')
        .limit(1000);

      // Buscar eventos próximos
      const { data: events } = await supabase
        .from('sector_events')
        .select('id')
        .eq('is_published', true)
        .gte('start_date', new Date().toISOString())
        .limit(50);

      // Buscar notificações não lidas (se houver)
      const { data: notifications } = await supabase
        .from('notification_recipients')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false)
        .limit(100);

      // Buscar favoritos (localStorage por enquanto)
      let favoritesCount = 0;
      try {
        const savedFavorites = localStorage.getItem(`favorites_${userId}`);
        if (savedFavorites) {
          favoritesCount = JSON.parse(savedFavorites).length;
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }

      setStats({
        systemsCount: systems?.length || 0,
        upcomingEventsCount: events?.length || 0,
        unreadNotificationsCount: notifications?.length || 0,
        favoriteSystemsCount: favoritesCount
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchRecentSystems = async (userId: string) => {
    try {
      // Buscar sistemas mais acessados ou todos se não houver histórico
      const { data: systems } = await supabase
        .from('systems')
        .select('id, name, description, url, icon, sectors(name)')
        .limit(6)
        .order('name');

      setRecentSystems(systems || []);
    } catch (error) {
      console.error('Erro ao buscar sistemas recentes:', error);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Sistemas',
      description: 'Acesse todos os sistemas disponíveis',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      href: '/sistemas',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Calendário',
      description: 'Veja eventos e treinamentos',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/eventos?view=calendar',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Notícias',
      description: 'Fique por dentro das novidades',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      href: '/noticias',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Galeria',
      description: 'Fotos e vídeos da Cresol',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/galeria',
      color: 'bg-pink-500 hover:bg-pink-600'
    }
  ];

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-muted">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Header com saudação */}
        <div className="mb-8">
          <h1 className="heading-1 mb-2">
            {getCurrentGreeting()}, {profile?.full_name || user?.user_metadata?.full_name || 'Colaborador'}!
          </h1>
          <p className="body-text text-muted">
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

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-status">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-primary/10 mr-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-semibold text-title">{stats.systemsCount}</p>
                <p className="body-text-small text-muted">Sistemas</p>
              </div>
            </div>
          </div>
          
          <div className="card-status">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-primary/10 mr-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-semibold text-title">{stats.upcomingEventsCount}</p>
                <p className="body-text-small text-muted">Eventos</p>
              </div>
            </div>
          </div>
          
          <div className="card-status">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-primary/10 mr-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 17l5 5v-5H4zM3 3h18v12H3V3z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-semibold text-title">{stats.unreadNotificationsCount}</p>
                <p className="body-text-small text-muted">Notificações</p>
              </div>
            </div>
          </div>
          
          <div className="card-status">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-primary/10 mr-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-semibold text-title">{stats.favoriteSystemsCount}</p>
                <p className="body-text-small text-muted">Favoritos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="heading-2 mb-4">Ações Rápidas</h2>
          <div className="grid-responsive">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="card text-white hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                style={{ backgroundColor: action.color.includes('bg-purple') ? 'var(--color-secondary)' : 
                         action.color.includes('bg-blue') ? '#2563EB' :
                         action.color.includes('bg-green') ? '#15803D' :
                         '#EC4899' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {action.icon}
                  </div>
                </div>
                <h3 className="heading-4 text-white mb-1">{action.title}</h3>
                <p className="body-text-small text-white/90">{action.description}</p>
              </Link>
            ))}
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
                  className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      {system.icon ? (
                        <Image 
                          src={system.icon} 
                          alt={system.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
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