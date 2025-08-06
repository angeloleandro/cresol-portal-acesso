'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OptimizedImage from '@/app/components/OptimizedImage';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalSearch from '../components/GlobalSearch';
import Breadcrumbs from '../components/Breadcrumbs';
import EventosDestaque from '../components/EventosDestaque';
import NoticiasDestaque from '../components/NoticiasDestaque';
import { Icon } from '../components/icons/Icon';

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
      icon: <Icon name="monitor" className="h-6 w-6" />,
      href: '/sistemas',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Calendário',
      description: 'Veja eventos e treinamentos',
      icon: <Icon name="clock" className="h-6 w-6" />,
      href: '/eventos?view=calendar',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Notícias',
      description: 'Fique por dentro das novidades',
      icon: <Icon name="chat-line" className="h-6 w-6" />,
      href: '/noticias',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Galeria',
      description: 'Fotos e vídeos da Cresol',
      icon: <Icon name="image" className="h-6 w-6" />,
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
          <p className="mt-4 body-text text-muted">Carregando dashboard...</p>
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

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-status">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-primary/10 mr-3">
                <Icon name="monitor" className="w-5 h-5 text-primary" />
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
                <Icon name="clock" className="w-5 h-5 text-primary" />
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
                <Icon name="bell-notification" className="w-5 h-5 text-primary" />
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
                <Icon name="suitcase" className="w-5 h-5 text-primary" />
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
                className="card text-white transition-all duration-200"
                style={{ backgroundColor: action.color.includes('bg-purple') ? 'var(--color-secondary)' : 
                         action.color.includes('bg-blue') ? 'var(--color-info-text)' :
                         action.color.includes('bg-green') ? 'var(--color-success-text)' :
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