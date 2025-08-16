'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/app/components/OptimizedImage';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { SUBSECTOR_ROLES, SUBSECTOR_CARD_LAYOUT, SUBSECTOR_EMPTY_STATE, SUBSECTOR_PAGE_CONFIG, SUBSECTOR_ACTIONS, SUBSECTOR_ERRORS, SUBSECTOR_STATS, SUBSECTOR_PERMISSIONS } from '@/lib/constants/subsector-config';
import { ADMIN_LAYOUT, ADMIN_TYPOGRAPHY, ADMIN_COLORS, ADMIN_BUTTONS, ADMIN_MEDIA, ADMIN_STATES, ADMIN_DIMENSIONS } from '@/lib/constants/admin-config';

interface Profile {
  id: string;
  role: keyof typeof SUBSECTOR_ROLES;
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
      // Debug log removed
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
        if (!SUBSECTOR_PERMISSIONS.actions.canView(data.role)) {
          router.replace('/home');
          return;
        }

        await fetchUserSubsectors(userId);
      }
    } catch (error) {
      // Debug log removed
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
            total_events: data[0].total_events || SUBSECTOR_STATS.defaultStats.totalEvents,
            published_events: data[0].published_events || SUBSECTOR_STATS.defaultStats.publishedEvents,
            total_news: data[0].total_news || SUBSECTOR_STATS.defaultStats.totalNews,
            published_news: data[0].published_news || SUBSECTOR_STATS.defaultStats.publishedNews,
            total_systems: data[0].total_systems || SUBSECTOR_STATS.defaultStats.totalSystems
          }
        }));
      }
    } catch (error) {
      // Debug log removed
    }
  };

  if (loading) {
    return (
      <UnifiedLoadingSpinner 
        fullScreen={true}
        size="large" 
        message={LOADING_MESSAGES.subsectors}
      />
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className={ADMIN_STATES.error.content}>
          <p className={ADMIN_STATES.error.message}>{error}</p>
          <button
            onClick={() => router.push('/home')}
            className={`mt-4 ${ADMIN_BUTTONS.primary}`}
          >
            {SUBSECTOR_ERRORS.actions.goHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${ADMIN_LAYOUT.container.fullHeight} ${ADMIN_COLORS.backgrounds.page}`}>
      {/* Header */}
      <header className={`${ADMIN_COLORS.backgrounds.card} border-b border-cresol-gray-light`}>
        <div className={`${ADMIN_LAYOUT.container.maxWidth} ${ADMIN_LAYOUT.container.margin} ${ADMIN_LAYOUT.header.padding.container} flex items-center justify-between`}>
          <div className="flex items-center">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center"
              type="button"
            >
              <div className={`relative ${ADMIN_LAYOUT.header.logoHeight} ${ADMIN_LAYOUT.header.logoWidth} mr-3`}>
                <OptimizedImage 
                  src={ADMIN_MEDIA.logo.src}
                  alt={ADMIN_MEDIA.logo.alt}
                  fill
                  sizes={ADMIN_MEDIA.logo.sizes}
                  className="object-contain"
                />
              </div>
              <h1 className={`${ADMIN_TYPOGRAPHY.headings.section} text-cresol-gray`}>Portal Cresol</h1>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`${ADMIN_TYPOGRAPHY.sizes.small} text-cresol-gray`}>
              Bem-vindo, {profile?.full_name}
            </span>
            <button
              onClick={() => router.push('/home')}
              className={`inline-flex items-center ${ADMIN_TYPOGRAPHY.sizes.small} ${ADMIN_COLORS.secondary.main} ${ADMIN_COLORS.secondary.hover}`}
              type="button"
            >
              <svg className={`${ADMIN_DIMENSIONS.icon.medium} mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Voltar para Home
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className={`${ADMIN_LAYOUT.container.maxWidth} ${ADMIN_LAYOUT.container.margin} ${ADMIN_LAYOUT.header.padding.content}`}>
        <div className={SUBSECTOR_PAGE_CONFIG.header.container}>
          <h2 className={`${SUBSECTOR_PAGE_CONFIG.header.title}`}>{SUBSECTOR_PAGE_CONFIG.title}</h2>
          <p className={`${SUBSECTOR_PAGE_CONFIG.header.subtitle} mt-2`}>
            {SUBSECTOR_PAGE_CONFIG.subtitle}
          </p>
        </div>

        {subsectors.length === 0 ? (
          <div className={SUBSECTOR_EMPTY_STATE.noSubsectors.container}>
            <div className={SUBSECTOR_EMPTY_STATE.noSubsectors.iconSize}>📂</div>
            <h3 className={SUBSECTOR_EMPTY_STATE.noSubsectors.title}>
              Nenhum sub-setor encontrado
            </h3>
            <p className={SUBSECTOR_EMPTY_STATE.noSubsectors.message}>
              Você não possui sub-setores atribuídos no momento.
            </p>
          </div>
        ) : (
          <div className={SUBSECTOR_CARD_LAYOUT.grid}>
            {subsectors.map((subsector) => {
              const subsectorStats = stats[subsector.id] || SUBSECTOR_STATS.defaultStats;

              return (
                <div key={subsector.id} className={SUBSECTOR_CARD_LAYOUT.card.base}>
                  <div className={SUBSECTOR_CARD_LAYOUT.card.content}>
                    <div className={SUBSECTOR_CARD_LAYOUT.card.header}>
                      <h3 className={SUBSECTOR_CARD_LAYOUT.card.title}>
                        {subsector.name}
                      </h3>
                      <div className={SUBSECTOR_CARD_LAYOUT.icon.container}>
                        <svg className={SUBSECTOR_CARD_LAYOUT.icon.svg} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    
                    <p className={SUBSECTOR_CARD_LAYOUT.card.subtitle}>
                      Setor: {subsector.sector_name}
                    </p>

                    {/* Estatísticas */}
                    <div className={SUBSECTOR_CARD_LAYOUT.card.stats}>
                      <div className={SUBSECTOR_CARD_LAYOUT.stat.container}>
                        <div className={`${SUBSECTOR_CARD_LAYOUT.stat.value} ${SUBSECTOR_STATS.colors.events}`}>
                          {subsectorStats.published_events}
                        </div>
                        <div className={SUBSECTOR_CARD_LAYOUT.stat.label}>Eventos</div>
                      </div>
                      <div className={SUBSECTOR_CARD_LAYOUT.stat.container}>
                        <div className={`${SUBSECTOR_CARD_LAYOUT.stat.value} ${SUBSECTOR_STATS.colors.news}`}>
                          {subsectorStats.published_news}
                        </div>
                        <div className={SUBSECTOR_CARD_LAYOUT.stat.label}>Notícias</div>
                      </div>
                    </div>

                    <div className={SUBSECTOR_CARD_LAYOUT.card.actions}>
                      <button
                        onClick={() => router.push(`/admin-subsetor/subsetores/${subsector.id}`)}
                        className={SUBSECTOR_ACTIONS.manage.classes}
                      >
                        {SUBSECTOR_ACTIONS.manage.label}
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