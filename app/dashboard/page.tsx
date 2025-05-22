'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import NoticiasDestaque from '../components/NoticiasDestaque';
import EventosDestaque from '../components/EventosDestaque';

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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userSystems, setUserSystems] = useState<System[]>([]);
  const [featuredSystems, setFeaturedSystems] = useState<System[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

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
    <div className="min-h-screen bg-cresol-gray-light/30">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner principal */}
        <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full hidden md:block">
            <div className="bg-primary/10 h-full w-full transform rotate-6 translate-x-10 translate-y-[-10%]"></div>
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-bold text-primary mb-4">Bem-vindo ao Portal Cresol</h1>
            <p className="text-cresol-gray mb-6">
              Este é o seu portal de comunicação interna. Aqui você encontra todas as informações, 
              notícias e recursos necessários para seu dia a dia na Cresol.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/noticias" 
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
              >
                Ver todas as notícias
              </Link>
              <Link 
                href="/eventos" 
                className="bg-white text-primary border border-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
              >
                Ver todos os eventos
              </Link>
            </div>
          </div>
        </div>

        {/* Layout em duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal (Notícias) - 2/3 da largura */}
          <div className="lg:col-span-2">
            {/* Seção de Notícias */}
            <section className="mb-8">
              <NoticiasDestaque />
            </section>

            {/* Seção de Sistemas */}
            <section className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Sistemas</h2>
                <Link href="/sistemas" className="text-sm text-primary hover:text-primary-dark">
                  Ver todos
                </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featuredSystems.map((system) => (
                  <a 
                    key={system.id}
                    href={system.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cresol-gray-light/20 rounded-lg p-3 flex flex-col items-center hover:bg-primary/5 transition-colors"
                  >
                    <div className="h-8 w-8 mb-2 relative">
                      <Image 
                        src={system.icon || '/icons/default-app.svg'} 
                        alt={system.name}
                        width={32}
                        height={32}
                      />
                    </div>
                    <span className="text-sm font-medium text-cresol-gray text-center">{system.name}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>

          {/* Coluna lateral (Eventos e Links Rápidos) - 1/3 da largura */}
          <div>
            {/* Seção de Eventos com cards menores */}
            <section className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Próximos Eventos</h2>
                <Link href="/eventos" className="text-sm text-primary hover:text-primary-dark">
                  Ver todos
                </Link>
              </div>
              
              {/* Versão compacta do componente EventosDestaque */}
              <div className="divide-y divide-cresol-gray-light/50">
                <EventosDestaque compact={true} limit={3} />
              </div>
            </section>
            
            {/* Links Rápidos */}
            <section className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-5">
              <h2 className="text-xl font-bold text-primary mb-4">Links Rápidos</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="https://cresol.com.br/" target="_blank" rel="noopener noreferrer" className="flex items-center text-cresol-gray hover:text-primary">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    Site Cresol
                  </Link>
                </li>
                <li>
                  <Link href="https://cresol.com.br/institucional/" target="_blank" rel="noopener noreferrer" className="flex items-center text-cresol-gray hover:text-primary">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z" clipRule="evenodd"></path>
                    </svg>
                    Institucional
                  </Link>
                </li>
                <li>
                  <Link href="https://cresol.workplace.com/work/landing/input/" target="_blank" rel="noopener noreferrer" className="flex items-center text-cresol-gray hover:text-primary">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                    </svg>
                    Workplace
                  </Link>
                </li>
                <li>
                  <Link href="https://cresol.com.br/baser/" target="_blank" rel="noopener noreferrer" className="flex items-center text-cresol-gray hover:text-primary">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    Cresol Baser
                  </Link>
                </li>
                <li>
                  <Link href="https://cresolcarreiras.gupy.io/" target="_blank" rel="noopener noreferrer" className="flex items-center text-cresol-gray hover:text-primary">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
                    </svg>
                    Gupy
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}