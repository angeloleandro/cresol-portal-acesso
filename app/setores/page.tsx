'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { supabase } from '@/lib/supabase';

import Breadcrumb from '../components/Breadcrumb';
import Navbar from '../components/Navbar';

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function SetoresPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);

      // Buscar setores usando a tabela sectors diretamente
      // As políticas de segurança no Supabase devem permitir que todos os usuários autenticados
      // possam ver os setores, mas apenas administradores podem criar/editar/excluir
      const { data: sectorsData, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {

      } else {
        setSectors(sectorsData || []);
      }
      
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
<UnifiedLoadingSpinner 
            size="default" 
            message={LOADING_MESSAGES.sectors}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Conteúdo principal */}
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Setores' }
            ]} 
          />
        </div>

        <div className="mb-8">
          <h1 className="heading-1 mb-2">Setores</h1>
          <p className="body-text text-muted">Conheça os setores da Cresol e acesse informações específicas de cada área.</p>
        </div>

        {/* Lista de setores */}
        {sectors.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="heading-3 mt-4 mb-2">Nenhum setor cadastrado</h3>
              <p className="body-text text-muted">Ainda não há setores disponíveis no momento.</p>
            </div>
          </div>
        ) : (
          <div className="grid-responsive">
            {sectors.map((sector) => (
              <Link 
                key={sector.id}
                href={`/setores/${sector.id}`}
                className="card transition-all duration-200 block"
              >
                {/* Ícone visual do setor */}
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>

                <h2 className="heading-3 mb-3">{sector.name}</h2>
                <p className="body-text text-muted mb-4 line-clamp-3">
                  {sector.description || 'Clique para ver mais informações sobre este setor.'}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary font-medium text-sm">
                    Ver detalhes →
                  </span>
                  <div className="text-xs text-muted">
                    Setor
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 