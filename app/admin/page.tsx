'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import { 
  LuUserPlus, 
  LuUsers, 
  LuBuilding2, 
  LuAppWindow, 
  LuMapPin, 
  LuImage, 
  LuLayoutPanelTop, 
  LuVideo,
  LuFolderOpen,
  LuShield,
  LuTrendingUp,
  LuSettings
} from 'react-icons/lu';

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
    icon: <LuUserPlus className="h-6 w-6" />,
    link: '/admin/access-requests',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    title: 'Usuários',
    description: 'Gerenciar usuários e suas permissões',
    icon: <LuUsers className="h-6 w-6" />,
    link: '/admin/users',
    color: 'text-primary',
    bgColor: 'bg-primary/5 border-primary/20',
  },
  {
    title: 'Setores & Sub-setores',
    description: 'Gerenciar estrutura organizacional e hierarquia',
    icon: <LuBuilding2 className="h-6 w-6" />,
    link: '/admin/sectors',
    color: 'text-secondary',
    bgColor: 'bg-secondary/5 border-secondary/20',
  },
  {
    title: 'Sistemas',
    description: 'Configurar sistemas e aplicações disponíveis',
    icon: <LuAppWindow className="h-6 w-6" />,
    link: '/admin/systems',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  {
    title: 'Locais de Trabalho',
    description: 'Gerenciar locais de atuação disponíveis',
    icon: <LuMapPin className="h-6 w-6" />,
    link: '/admin/work-locations',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  {
    title: 'Banners',
    description: 'Gerencie os banners iniciais do portal',
    icon: <LuLayoutPanelTop className="h-6 w-6" />,
    link: '/admin/banners',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
  },
  {
    title: 'Vídeos',
    description: 'Gerencie os vídeos exibidos no dashboard',
    icon: <LuVideo className="h-6 w-6" />,
    link: '/admin/videos',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
  {
    title: 'Galeria de Imagens',
    description: 'Gerencie as imagens exibidas na galeria do portal',
    icon: <LuImage className="h-6 w-6" />,
    link: '/admin/gallery',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
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
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cresol-gray-light/20 to-white">
      {/* Header */}
      <AdminHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com estatísticas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-primary flex items-center">
                <LuShield className="mr-3 h-8 w-8" />
                Painel Administrativo
              </h2>
              <p className="text-cresol-gray mt-2">Gerencie usuários, setores e sistemas do portal de acesso Cresol.</p>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-cresol-gray-light/50 p-4">
              <div className="flex items-center">
                <div className="bg-primary/10 rounded-full p-3">
                  <LuUsers className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-cresol-gray">Total de Usuários</p>
                  <p className="text-2xl font-bold text-cresol-gray-dark">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-cresol-gray-light/50 p-4">
              <div className="flex items-center">
                <div className="bg-blue-50 rounded-full p-3">
                  <LuUserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-cresol-gray">Solicitações Pendentes</p>
                  <p className="text-2xl font-bold text-cresol-gray-dark">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-cresol-gray-light/50 p-4">
              <div className="flex items-center">
                <div className="bg-secondary/10 rounded-full p-3">
                  <LuBuilding2 className="h-6 w-6 text-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-cresol-gray">Setores</p>
                  <p className="text-2xl font-bold text-cresol-gray-dark">{stats.totalSectors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-cresol-gray-light/50 p-4">
              <div className="flex items-center">
                <div className="bg-secondary/10 rounded-full p-3">
                  <LuFolderOpen className="h-6 w-6 text-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-cresol-gray">Sub-setores</p>
                  <p className="text-2xl font-bold text-cresol-gray-dark">{stats.totalSubsectors}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cards de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ADMIN_CARDS.map((card) => (
            <Link 
              key={card.title}
              href={card.link}
              className={`${card.bgColor} rounded-xl shadow-sm border p-6 flex flex-col items-start hover:shadow-md transition-all hover:scale-105 group`}
            >
              <div className={`${card.bgColor.includes('primary') ? 'bg-primary/20' : card.bgColor.includes('secondary') ? 'bg-secondary/20' : 'bg-white'} rounded-full p-3 mb-4 group-hover:scale-110 transition-transform`}>
                <div className={card.color}>
                  {card.icon}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 text-cresol-gray-dark group-hover:text-primary transition-colors">
                {card.title}
              </h3>
              
              <p className="text-sm text-cresol-gray mb-4 leading-relaxed">
                {card.description}
              </p>
              
              <div className="mt-auto">
                <span className={`${card.color} text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform`}>
                  Acessar
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Seção de Ações Rápidas */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-cresol-gray-dark mb-4 flex items-center">
            <LuSettings className="mr-2 h-5 w-5" />
            Ações Rápidas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="bg-white rounded-lg border border-cresol-gray-light/50 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <LuUserPlus className="h-5 w-5 text-primary mr-3" />
                <span className="font-medium text-cresol-gray-dark">Criar Novo Usuário</span>
              </div>
            </Link>
            
            <Link
              href="/admin/sectors"
              className="bg-white rounded-lg border border-cresol-gray-light/50 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <LuBuilding2 className="h-5 w-5 text-secondary mr-3" />
                <span className="font-medium text-cresol-gray-dark">Adicionar Setor</span>
              </div>
            </Link>
            
            <Link
              href="/admin/access-requests"
              className="bg-white rounded-lg border border-cresol-gray-light/50 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <LuTrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-cresol-gray-dark">Ver Solicitações</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 