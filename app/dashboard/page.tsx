'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface System {
  id: number;
  name: string;
  description: string;
  url: string;
  icon: string;
}

// Sistemas fictícios para exemplo - em produção viriam do banco
const SYSTEMS: System[] = [
  {
    id: 1,
    name: 'CRM',
    description: 'Sistema de Gestão de Relacionamento com Cliente',
    url: 'https://crm.cresol.com.br',
    icon: '/icons/crm.svg',
  },
  {
    id: 2,
    name: 'ERP Financeiro',
    description: 'Sistema de Gestão Financeira',
    url: 'https://erp.cresol.com.br',
    icon: '/icons/erp.svg',
  },
  {
    id: 3,
    name: 'Portal RH',
    description: 'Portal de Recursos Humanos',
    url: 'https://rh.cresol.com.br',
    icon: '/icons/rh.svg',
  },
  {
    id: 4,
    name: 'Business Intelligence',
    description: 'Plataforma de análise de dados',
    url: 'https://bi.cresol.com.br',
    icon: '/icons/bi.svg',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);
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
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-10 w-24 mr-4">
              <Image 
                src="/logo-cresol.png" 
                alt="Logo Cresol" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Portal de Acesso</h1>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">
              Olá, {user?.user_metadata?.full_name || user?.email}
            </span>
            <button 
              onClick={handleLogout}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sistemas Disponíveis</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SYSTEMS.map((system) => (
            <a 
              key={system.id}
              href={system.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition-transform hover:scale-105"
            >
              <div className="h-12 w-12 mb-4 relative">
                <Image 
                  src={system.icon} 
                  alt={system.name}
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{system.name}</h3>
              <p className="text-sm text-gray-600 text-center">{system.description}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}