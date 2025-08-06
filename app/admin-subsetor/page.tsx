'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/app/components/OptimizedImage';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Profile {
  id: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  full_name: string;
  email: string;
}

interface Subsector {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
  sector_name: string;
}

interface SubsectorStats {
  total_events: number;
  published_events: number;
  total_news: number;
  published_news: number;
  total_systems: number;
}

export default function AdminSubsectorPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [stats, setStats] = useState<Record<string, SubsectorStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSubsectors = useCallback(async (userId: string) => {
    try {
      // Usar a função RPC para obter sub-setores do usuário
      const { data, error } = await supabase.rpc('get_user_subsectors', {
        p_user_id: userId
      });

      if (error) throw error;

      if (data) {
        const subsectorList = data.map((item: any) => ({
          id: item.subsector_id,
          name: item.subsector_name,
          sector_id: item.sector_id,
          sector_name: item.sector_name
        }));

        setSubsectors(subsectorList);

        // Buscar estatísticas para cada sub-setor
        for (const subsector of subsectorList) {
          await fetchSubsectorStats(subsector.id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar sub-setores:', error);
      setError('Erro ao carregar sub-setores');
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        
        // Verificar se o usuário tem permissão para acessar esta página
        if (data.role !== 'subsector_admin' && data.role !== 'admin' && data.role !== 'sector_admin') {
          router.replace('/home');
          return;
        }

        await fetchUserSubsectors(userId);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setError('Erro ao carregar perfil do usuário');
    } finally {
      setLoading(false);
    }
  }, [fetchUserSubsectors, router]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }

      setUser(data.user);
      await fetchProfile(data.user.id);
    };

    checkUser();
  }, [router, fetchProfile]);

  const fetchSubsectorStats = async (subsectorId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_subsector_stats', {
        p_subsector_id: subsectorId
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setStats(prev => ({
          ...prev,
          [subsectorId]: {
            total_events: data[0].total_events || 0,
            published_events: data[0].published_events || 0,
            total_news: data[0].total_news || 0,
            published_news: data[0].published_news || 0,
            total_systems: data[0].total_systems || 0
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do sub-setor:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/home')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-cresol-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center"
              type="button"
            >
              <div className="relative h-10 w-24 mr-3">
                <OptimizedImage 
                  src="/logo-cresol.png" 
                  alt="Logo Cresol" 
                  fill
                  sizes="(max-width: 768px) 100vw, 96px"
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-semibold text-cresol-gray">Portal Cresol</h1>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-cresol-gray">
              Bem-vindo, {profile?.full_name}
            </span>
            <button
              onClick={() => router.push('/home')}
              className="inline-flex items-center text-sm text-cresol-gray hover:text-primary"
              type="button"
            >
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Voltar para Home
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary">Administração de Sub-setores</h2>
          <p className="text-cresol-gray mt-2">
            Gerencie os sub-setores sob sua responsabilidade
          </p>
        </div>

        {subsectors.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-6xl text-gray-300 mb-4">📂</div>
            <h3 className="text-lg font-semibold text-cresol-gray mb-2">
              Nenhum sub-setor encontrado
            </h3>
            <p className="text-cresol-gray">
              Você não possui sub-setores atribuídos no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subsectors.map((subsector) => {
              const subsectorStats = stats[subsector.id] || {
                total_events: 0,
                published_events: 0,
                total_news: 0,
                published_news: 0,
                total_systems: 0
              };

              return (
                <div key={subsector.id} className="bg-white rounded-lg border border-gray-200 hover:border-primary/30 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-cresol-gray">
                        {subsector.name}
                      </h3>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4">
                      Setor: {subsector.sector_name}
                    </p>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {subsectorStats.published_events}
                        </div>
                        <div className="text-xs text-cresol-gray">Eventos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {subsectorStats.published_news}
                        </div>
                        <div className="text-xs text-cresol-gray">Notícias</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => router.push(`/admin-subsetor/subsetores/${subsector.id}`)}
                        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm"
                      >
                        Gerenciar Sub-setor
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
} 