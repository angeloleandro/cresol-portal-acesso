'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import { LuUserPlus, LuUsers, LuBuilding2, LuAppWindow, LuMapPin, LuImage, LuLayoutPanelTop, LuVideo } from 'react-icons/lu';

interface DashboardCard {
  title: string;
  description: string;
  iconPath: JSX.Element;
  link: string;
}

const ADMIN_CARDS: DashboardCard[] = [
  {
    title: 'Solicitações de Acesso',
    description: 'Aprovar ou rejeitar solicitações de acesso ao portal',
    iconPath: <LuUserPlus className="h-8 w-8 text-primary" />,
    link: '/admin/access-requests',
  },
  {
    title: 'Usuários',
    description: 'Gerenciar usuários e suas permissões',
    iconPath: <LuUsers className="h-8 w-8 text-primary" />,
    link: '/admin/users',
  },
  {
    title: 'Setores',
    description: 'Gerenciar setores e administradores setoriais',
    iconPath: <LuBuilding2 className="h-8 w-8 text-primary" />,
    link: '/admin/sectors',
  },
  {
    title: 'Sistemas',
    description: 'Configurar sistemas e aplicações disponíveis',
    iconPath: <LuAppWindow className="h-8 w-8 text-primary" />,
    link: '/admin/systems',
  },
  {
    title: 'Locais',
    description: 'Gerenciar locais de atuação disponíveis',
    iconPath: <LuMapPin className="h-8 w-8 text-primary" />,
    link: '/admin/work-locations',
  },
  {
    title: 'Banners',
    description: 'Gerencie os banners iniciais do portal',
    iconPath: <LuLayoutPanelTop className="h-8 w-8 text-primary" />,
    link: '/admin/banners',
  },
  {
    title: 'Vídeos',
    description: 'Gerencie os vídeos exibidos no dashboard',
    iconPath: <LuVideo className="h-8 w-8 text-primary" />,
    link: '/admin/videos',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);

      // Verificar se o usuário é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        // Redirecionar usuários não-admin para o dashboard
        router.replace('/dashboard');
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    <div className="min-h-screen bg-cresol-gray-light/30">
      {/* Header */}
      <AdminHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2">Painel Administrativo</h2>
          <p className="text-cresol-gray">Gerencie usuários, setores e sistemas do portal de acesso Cresol.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...ADMIN_CARDS,
            {
              title: 'Galeria de Imagens',
              description: 'Gerencie as imagens exibidas na galeria do portal',
              iconPath: <LuImage className="h-8 w-8 text-primary" />,
              link: '/admin/gallery',
            }
          ].map((card) => (
            <Link 
              key={card.title}
              href={card.link}
              className="bg-white rounded-lg shadow p-6 flex flex-col items-start hover:shadow-md transition-all"
            >
              <div className="bg-primary/10 rounded-full p-3 mb-4">
                {card.iconPath}
              </div>
              <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
              <p className="text-cresol-gray mb-4">{card.description}</p>
              <span className="mt-auto bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary-dark transition text-sm font-semibold">Acessar</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
} 