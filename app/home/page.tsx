'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import NoticiasDestaque from '../components/NoticiasDestaque';
import EventosDestaque from '../components/EventosDestaque';
import BannerCarousel from '@/app/components/BannerCarousel';
import VideoGallery from '@/app/components/VideoGallery';
import ImageGallery from '../components/ImageGallery';
import Footer from '../components/Footer';

interface System {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  sector_id: string | null;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image_url?: string;
  created_at: string;
  category: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

interface Stats {
  upcomingEvents: number
  totalNews: number
  totalUsers: number
  totalLocations: number
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userSystems, setUserSystems] = useState<System[]>([]);
  const [featuredSystems, setFeaturedSystems] = useState<System[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    upcomingEvents: 0,
    totalNews: 0,
    totalUsers: 0,
    totalLocations: 0
  });

  // Dados de exemplo para notícias (remover quando implementar a busca no Supabase)
  const sampleNews = [
    {
      id: '1',
      title: 'Resultados financeiros do 3º trimestre superaram expectativas',
      summary: 'Os resultados financeiros do terceiro trimestre de 2025 superaram todas as expectativas, com crescimento de 15% nas operações de crédito.',
      image_url: '/images/news/financial-results.jpg',
      created_at: '2025-05-12T10:30:00Z',
      category: 'Financeiro'
    },
    {
      id: '2',
      title: 'Nova campanha de captação de associados',
      summary: 'A Cresol lança hoje sua nova campanha de captação de associados com condições especiais para novos cooperados.',
      image_url: '/images/news/campaign.jpg',
      created_at: '2025-05-10T14:15:00Z',
      category: 'Marketing'
    },
    {
      id: '3',
      title: 'Treinamento sobre sustentabilidade para colaboradores',
      summary: 'Participe do novo treinamento sobre práticas sustentáveis e ESG que será realizado no próximo mês.',
      image_url: '/images/news/sustainability.jpg',
      created_at: '2025-05-08T09:45:00Z',
      category: 'Treinamento'
    },
  ];

  // Dados de exemplo para eventos (remover quando implementar a busca no Supabase)
  const sampleEvents = [
    {
      id: '1',
      title: 'Reunião do Conselho Administrativo',
      date: '2025-05-20T14:00:00Z',
      location: 'Sede Central - Sala de Reuniões',
      description: 'Reunião mensal do Conselho Administrativo para discussão de pautas estratégicas.'
    },
    {
      id: '2',
      title: 'Workshop de Cooperativismo',
      date: '2025-06-05T09:00:00Z',
      location: 'Centro de Treinamento',
      description: 'Workshop para novos colaboradores sobre princípios do cooperativismo.'
    },
    {
      id: '3',
      title: 'Confraternização de Aniversariantes do Mês',
      date: '2025-05-31T16:00:00Z',
      location: 'Espaço de Convivência',
      description: 'Celebração dos aniversariantes do mês de maio.'
    },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);

      // Buscar perfil do usuário para obter o papel
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setRole(profile.role);
      }

      // Se for um admin, buscar todos os sistemas
      if (profile?.role === 'admin' || profile?.role === 'sector_admin') {
        await fetchAllSystems();
      } else {
        // Senão, buscar apenas sistemas permitidos para o usuário
        await fetchUserSystems(data.user.id);
      }

      // Carregar notícias e eventos
      // TODO: Implementar busca de notícias e eventos do Supabase
      setNews(sampleNews);
      setEvents(sampleEvents);

      // Buscar estatísticas dinâmicas
      await fetchStats();
      
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const fetchAllSystems = async () => {
    // Buscar todos os sistemas
    const { data: systems, error } = await supabase
      .from('systems')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao buscar sistemas:', error);
      return;
    }

    setUserSystems(systems || []);
    // Selecionar alguns sistemas em destaque (limite de 4)
    setFeaturedSystems(systems?.slice(0, 4) || []);
  };

  const fetchUserSystems = async (userId: string) => {
    // Buscar sistemas permitidos para o usuário
    const { data: userSystemsData, error: userSystemsError } = await supabase
      .rpc('get_user_systems', { user_uuid: userId });

    if (userSystemsError) {
      console.error('Erro ao buscar sistemas do usuário:', userSystemsError);
      // Implementar alternativa como no código original se necessário
      setUserSystems([]);
    } else {
      setUserSystems(userSystemsData || []);
      // Selecionar alguns sistemas em destaque (limite de 4)
      setFeaturedSystems(userSystemsData?.slice(0, 4) || []);
    }
  };

  const fetchStats = async () => {
    try {
      // Buscar eventos próximos (publicados e no futuro)
      const { count: upcomingEventsCount } = await supabase
        .from('sector_events')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .gte('start_date', new Date().toISOString())

      // Buscar total de notícias publicadas
      const { count: totalNewsCount } = await supabase
        .from('sector_news')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      // Buscar total de usuários (colaboradores)
      const { count: totalUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Buscar total de localidades
      const { count: totalLocationsCount } = await supabase
        .from('work_locations')
        .select('*', { count: 'exact', head: true })

      setStats({
        upcomingEvents: upcomingEventsCount || 0,
        totalNews: totalNewsCount || 0,
        totalUsers: totalUsersCount || 0,
        totalLocations: totalLocationsCount || 0
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const isAdmin = role === 'admin' || role === 'sector_admin';

  // Formatador de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Carrossel de Banners */}
        <BannerCarousel />

        {/* Banner Hero Minimalista */}
        <section className="relative overflow-hidden rounded-xl shadow-lg mb-6" style={{ background: 'linear-gradient(135deg, #F58220, #E5751F, #D9691D)' }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-radial from-white/20 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-radial from-white/10 to-transparent rounded-full blur-2xl"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 px-6 py-8 lg:px-8 lg:py-10">
            <div className="max-w-4xl">
              {/* Logo + Título */}
              <div className="flex items-center mb-4">
                <div className="relative h-8 w-20 mr-3">
                  <Image 
                    src="/logo-cresol.png" 
                    alt="Logo Cresol" 
                    fill
                    sizes="80px"
                    style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <div className="h-6 w-px bg-white/40 mr-3"></div>
                <span className="text-white/90 text-xs font-medium tracking-wider">HUB FRONTEIRAS</span>
              </div>
              
              {/* Hero Text */}
              <h1 className="text-2xl lg:text-3xl font-light text-white mb-3 leading-tight">
                Bem-vindo ao seu
                <span className="block font-medium text-white">
                  portal corporativo
                </span>
              </h1>
              
              <p className="text-white/90 leading-relaxed mb-6 max-w-2xl">
                Centro de comunicação interna da Cresol Fronteiras. Acesse notícias, eventos e recursos.
              </p>
              
              {/* CTAs Minimalistas */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/noticias" 
                  className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-orange-600 bg-white rounded-lg hover:bg-orange-50 transition-all duration-200"
                >
                  Explorar Notícias
                </Link>
                
                <Link 
                  href="/eventos" 
                  className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  Ver Agenda
                </Link>
              </div>
              
              {/* Stats Dinâmicos */}
              <div className="mt-8 pt-6 border-t border-white/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-white mb-1">{stats.upcomingEvents}</div>
                    <div className="text-xs text-white/70">Próximos Eventos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-white mb-1">{stats.totalNews}</div>
                    <div className="text-xs text-white/70">Notícias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-white mb-1">{stats.totalUsers}</div>
                    <div className="text-xs text-white/70">Colaboradores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-white mb-1">{stats.totalLocations}</div>
                    <div className="text-xs text-white/70">Localidades</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layout de duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Últimas Notícias */}
            <NoticiasDestaque />
            
            {/* Galeria de Imagens */}
            <ImageGallery limit={6} />
            
            {/* Galeria de Vídeos */}
            <VideoGallery limit={4} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Próximos Eventos */}
            <EventosDestaque />

            {/* Links Rápidos */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-medium component-title mb-6">Links Rápidos</h3>
              <div className="space-y-3">
                <Link 
                  href="/sistemas" 
                  className="flex items-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group bg-gray-50/50 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-lg mr-4 transition-colors" style={{ backgroundColor: '#F38332' }}>
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Sistemas</div>
                    <div className="text-xs text-gray-500">Acessar plataformas</div>
                  </div>
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link 
                  href="/setores" 
                  className="flex items-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group bg-gray-50/50 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-lg mr-4 transition-colors" style={{ backgroundColor: '#F38332' }}>
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Setores</div>
                    <div className="text-xs text-gray-500">Ver departamentos</div>
                  </div>
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link 
                  href="/profile" 
                  className="flex items-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group bg-gray-50/50 hover:bg-gray-50"
                >
                  <div className="p-2 rounded-lg mr-4 transition-colors" style={{ backgroundColor: '#F38332' }}>
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Perfil</div>
                    <div className="text-xs text-gray-500">Gerenciar conta</div>
                  </div>
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 