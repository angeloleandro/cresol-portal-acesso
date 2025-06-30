'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import { Icon } from '@/app/components/icons/Icon';

interface DashboardCard {
  title: string;
  description: string;
  icon: JSX.Element;
  link: string;
  color: string;
  bgColor: string;
}

const ADMIN_CARDS: DashboardCard[] = [
  {
    title: 'Solicitações de Acesso',
    description: 'Aprovar ou rejeitar solicitações de acesso ao portal',
    icon: <Icon name="user-add" className="h-5 w-5" />,
    link: '/admin/access-requests',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Usuários',
    description: 'Gerenciar usuários e suas permissões',
    icon: <Icon name="user-group" className="h-5 w-5" />,
    link: '/admin/users',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Setores & Sub-setores',
    description: 'Gerenciar estrutura organizacional e hierarquia',
    icon: <Icon name="building-1" className="h-5 w-5" />,
    link: '/admin/sectors',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Sistemas',
    description: 'Configurar sistemas e aplicações disponíveis',
    icon: <Icon name="settings" className="h-5 w-5" />,
    link: '/admin/systems',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Locais de Trabalho',
    description: 'Gerenciar locais de atuação disponíveis',
    icon: <Icon name="map" className="h-5 w-5" />,
    link: '/admin/work-locations',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Cargos',
    description: 'Gerenciar cargos disponíveis para os usuários',
    icon: <Icon name="suitcase" className="h-5 w-5" />,
    link: '/admin/positions',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Banners',
    description: 'Gerencie os banners iniciais do portal',
    icon: <Icon name="image" className="h-5 w-5" />,
    link: '/admin/banners',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Vídeos',
    description: 'Gerencie os vídeos exibidos no dashboard',
    icon: <Icon name="monitor-play" className="h-5 w-5" />,
    link: '/admin/videos',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Galeria de Imagens',
    description: 'Gerencie as imagens exibidas na galeria do portal',
    icon: <Icon name="image" className="h-5 w-5" />,
    link: '/admin/gallery',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Notificações',
    description: 'Gerenciar notificações e comunicações do sistema',
    icon: <Icon name="bell" className="h-5 w-5" />,
    link: '/admin/notifications',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Analytics',
    description: 'Visualizar métricas e relatórios do sistema',
    icon: <Icon name="chart-bar-vertical" className="h-5 w-5" />,
    link: '/admin/analytics',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Indicadores Econômicos',
    description: 'Gerenciar indicadores econômicos da página inicial',
    icon: <Icon name="work-economi-indicator" className="h-5 w-5" />,
    link: '/admin/economic-indicators',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
  {
    title: 'Links de Sistemas',
    description: 'Gerenciar links de acesso aos sistemas externos',
    icon: <Icon name="link" className="h-5 w-5" />,
    link: '/admin/system-links',
    color: 'text-primary',
    bgColor: 'card-standard',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    totalSectors: 0,
    totalSubsectors: 0,
  });

  useEffect(() => {
    // Só executar no lado do cliente
    if (typeof window === 'undefined') return;
    
    const checkUser = async () => {
      try {
        const { data: userData } = await getSupabaseClient().auth.getUser();
        
        if (!userData.user) {
          router.replace('/login');
          return;
        }

        setUser(userData.user);

        // Verificar se o usuário é admin
        const { data: profile } = await getSupabaseClient()
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single();

        if (profile?.role === 'admin') {
          await fetchStats();
        } else {
          // Redirecionar usuários não-admin para o dashboard
          router.replace('/dashboard');
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        router.replace('/login');
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const fetchStats = async () => {
    try {
      // Buscar estatísticas básicas
      const [usersResult, requestsResult, sectorsResult, subsectorsResult] = await Promise.all([
        getSupabaseClient().from('profiles').select('id', { count: 'exact' }),
        getSupabaseClient().from('access_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        getSupabaseClient().from('sectors').select('id', { count: 'exact' }),
        getSupabaseClient().from('subsectors').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        totalSectors: sectorsResult.count || 0,
        totalSubsectors: subsectorsResult.count || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleLogout = async () => {
    await getSupabaseClient().auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 body-text text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header com estatísticas */}
        <div className="mb-6">
          <div className="mb-6">
            <h1 className="heading-1 text-title mb-2">
              Painel Administrativo
            </h1>
            <p className="body-text text-muted">Gerencie usuários, setores e sistemas do portal de acesso Cresol.</p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card-status">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100 mr-3">
                  <Icon name="user-group" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-title">{stats.totalUsers}</div>
                  <div className="body-text-small text-muted">Usuários</div>
                </div>
              </div>
            </div>
            
            <div className="card-status">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100 mr-3">
                  <Icon name="user-add" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-title">{stats.pendingRequests}</div>
                  <div className="body-text-small text-muted">Pendentes</div>
                </div>
              </div>
            </div>
            
            <div className="card-status">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100 mr-3">
                  <Icon name="building-1" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-title">{stats.totalSectors}</div>
                  <div className="body-text-small text-muted">Setores</div>
                </div>
              </div>
            </div>
            
            <div className="card-status">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100 mr-3">
                  <Icon name="building-1" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-title">{stats.totalSubsectors}</div>
                  <div className="body-text-small text-muted">Subsetores</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Módulos Administrativos */}
        <div>
          <h2 className="heading-4 text-title mb-4">Módulos Administrativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADMIN_CARDS.map((card) => (
              <Link 
                key={card.title}
                href={card.link}
                className="card p-5 flex items-start hover:shadow-md transition-all group"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 mr-4 flex-shrink-0">
                  <div className={card.color}>
                    {card.icon}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="heading-4 text-title mb-1 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  
                  <p className="body-text-small text-muted leading-snug">
                    {card.description}
                  </p>
                </div>
                
                <Icon name="arrow-left" className="h-4 w-4 text-muted group-hover:text-primary flex-shrink-0 mt-1 rotate-180" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}