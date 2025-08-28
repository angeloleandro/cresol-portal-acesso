'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';

import { 
  StandardizedAdminLayout, 
  StandardizedPageHeader,
  type BreadcrumbItem
} from '@/app/components/admin';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { ADMIN_LAYOUT, ADMIN_TYPOGRAPHY, ADMIN_COLORS, ADMIN_BUTTONS, ADMIN_MEDIA, ADMIN_STATES, ADMIN_DIMENSIONS } from '@/lib/constants/admin-config';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { SUBSECTOR_ROLES, SUBSECTOR_CARD_LAYOUT, SUBSECTOR_EMPTY_STATE, SUBSECTOR_PAGE_CONFIG, SUBSECTOR_ACTIONS, SUBSECTOR_ERRORS, SUBSECTOR_STATS, SUBSECTOR_PERMISSIONS } from '@/lib/constants/subsector-config';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

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

function AdminSubsectorPageContent() {
  const { user, profile } = useAuth();
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [stats, setStats] = useState<Record<string, SubsectorStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSubsectors = useCallback(async () => {
    if (!user) return;
    const userId = user.id;
    try {
      // Usar a função RPC para obter Subsetores do usuário
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

        // Buscar estatísticas para cada Subsetor
        for (const subsector of subsectorList) {
          await fetchSubsectorStats(subsector.id);
        }
      }
    } catch (error) {
      // Debug log removed
      setError('Erro ao carregar Subsetores');
    }
  }, [user]);

  // Carregar subsetores e estatísticas  
  const loadData = useCallback(async () => {
    try {
      await fetchUserSubsectors();
    } catch (error) {
      setError('Erro ao carregar Subsetores');
    } finally {
      setLoading(false);
    }
  }, [fetchUserSubsectors]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          <a
            href="/home"
            className={`inline-block mt-4 ${ADMIN_BUTTONS.primary}`}
          >
            {SUBSECTOR_ERRORS.actions.goHome}
          </a>
        </div>
      </div>
    );
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/home', icon: 'house' },
    { label: 'Administração de Subsetores' }
  ];

  return (
    <StandardizedAdminLayout user={user} breadcrumbs={breadcrumbs}>
      <StandardizedPageHeader
        title={SUBSECTOR_PAGE_CONFIG.title}
        subtitle={SUBSECTOR_PAGE_CONFIG.subtitle}
      />

      {subsectors.length === 0 ? (
        <div className={SUBSECTOR_EMPTY_STATE.noSubsectors.container}>
          <div className={SUBSECTOR_EMPTY_STATE.noSubsectors.iconSize}>📂</div>
          <h3 className={SUBSECTOR_EMPTY_STATE.noSubsectors.title}>
            Nenhum Subsetor encontrado
          </h3>
          <p className={SUBSECTOR_EMPTY_STATE.noSubsectors.message}>
            Você não possui Subsetores atribuídos no momento.
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
                    <a
                      href={`/admin-subsetor/subsetores/${subsector.id}`}
                      className={`inline-block text-center ${SUBSECTOR_ACTIONS.manage.classes}`}
                    >
                      {SUBSECTOR_ACTIONS.manage.label}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StandardizedAdminLayout>
  );
}

export default function AdminSubsectorPage() {
  return (
    <AuthGuard 
      requireRole="subsector_admin"
      loadingMessage={LOADING_MESSAGES.subsectors}
    >
      <AdminSubsectorPageContent />
    </AuthGuard>
  );
} 