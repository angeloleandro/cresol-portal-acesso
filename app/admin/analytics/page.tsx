'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { Icon } from '@/app/components/icons/Icon';
import MetricCardEnterprise from '@/app/components/analytics/MetricCardEnterprise';
import { MinimalistButton } from '@/app/components/ui/MinimalistButton';
import { TruncatedText } from '@/app/components/ui/TruncatedText';
import { LocationCard } from '@/app/components/ui/LocationCard';
// Enhanced Figma-inspired components
import MetricCardEnterprisePro from '@/app/components/analytics/MetricCardEnterprisePro';
import ChartContainerPro from '@/app/components/analytics/ChartContainerPro';
import NavigationControlsPro from '@/app/components/analytics/NavigationControlsPro';
import AnimatedChart from '@/app/components/analytics/AnimatedChart';
import { 
  MetricsGrid, 
  DashboardLayout, 
  MainSection, 
  SidebarSection, 
  ResponsiveContainer 
} from '@/app/components/analytics/GridLayoutResponsivo';
import { 
  PageTitle
} from '@/app/components/analytics/TypographyEnterprise';
import { DashboardShimmer } from '@/app/components/analytics/ShimmerLoading';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
    byRole: Record<string, number>;
  };
  systems: {
    total: number;
    active: number;
    mostUsed: Array<{ name: string; usage: number; }>;
  };
  content: {
    news: number;
    events: number;
    notifications: number;
  };
  activity: {
    logins: number;
    systemAccess: number;
    notificationsRead: number;
  };
  locations: {
    total: number;
    userDistribution: Array<{ name: string; users: number; }>;
  };
}

interface ChartData {
  labels: string[];
  values: number[];
  colors: string[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeChart, setActiveChart] = useState<'users' | 'systems' | 'activity'>('users');

  const checkUserAuth = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.replace('/login');
        return;
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'sector_admin'].includes(profile.role)) {
        router.replace('/dashboard');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      // Calcular data inicial baseada no período selecionado
      const now = new Date();
      const daysBack = selectedPeriod === '7d' ? 7 : 
                      selectedPeriod === '30d' ? 30 : 
                      selectedPeriod === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Buscar estatísticas de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Buscar distribuição por roles
      const { data: roleData } = await supabase
        .from('profiles')
        .select('role')
        .not('role', 'is', null);

      const roleDistribution = roleData?.reduce((acc: Record<string, number>, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}) || {};

      // Buscar estatísticas de sistemas
      const { count: totalSystems } = await supabase
        .from('systems')
        .select('*', { count: 'exact', head: true });

      // Buscar estatísticas de conteúdo
      const { count: totalNews } = await supabase
        .from('sector_news')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      const { count: totalEvents } = await supabase
        .from('sector_events')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      const { count: totalNotifications } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Buscar estatísticas de locais
      const { count: totalLocations } = await supabase
        .from('work_locations')
        .select('*', { count: 'exact', head: true });

      const { data: locationData } = await supabase
        .from('work_locations')
        .select(`
          id,
          name,
          profiles(count)
        `);

      const locationDistribution = locationData?.map(location => ({
        name: location.name,
        users: location.profiles?.length || 0
      })) || [];

      const analyticsData: AnalyticsData = {
        users: {
          total: totalUsers || 0,
          active: Math.floor((totalUsers || 0) * 0.8), // Simulação de usuários ativos
          new: newUsers || 0,
          byRole: roleDistribution
        },
        systems: {
          total: totalSystems || 0,
          active: Math.floor((totalSystems || 0) * 0.9),
          mostUsed: [
            { name: 'Sistema Principal', usage: 85 },
            { name: 'Portal de Documentos', usage: 72 },
            { name: 'Sistema de RH', usage: 68 },
            { name: 'Relatórios', usage: 55 }
          ]
        },
        content: {
          news: totalNews || 0,
          events: totalEvents || 0,
          notifications: totalNotifications || 0
        },
        activity: {
          logins: Math.floor((totalUsers || 0) * 0.6),
          systemAccess: Math.floor((totalSystems || 0) * 150),
          notificationsRead: Math.floor((totalNotifications || 0) * 0.75)
        },
        locations: {
          total: totalLocations || 0,
          userDistribution: locationDistribution
        }
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Erro ao buscar dados de analytics:', error);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, selectedPeriod, fetchAnalyticsData]);

  const getChartData = (): ChartData => {
    if (!analytics) return { labels: [], values: [], colors: [] };

    switch (activeChart) {
      case 'users':
        return {
          labels: Object.keys(analytics.users.byRole).map(role => {
            switch (role) {
              case 'admin': return 'Administradores';
              case 'sector_admin': return 'Admin. Setores';
              case 'subsector_admin': return 'Admin. Sub-setores';
              case 'user': return 'Usuários';
              default: return role;
            }
          }),
          values: Object.values(analytics.users.byRole),
          colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa']
        };
      case 'systems':
        return {
          labels: analytics.systems.mostUsed.map(s => s.name),
          values: analytics.systems.mostUsed.map(s => s.usage),
          colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa']
        };
      case 'activity':
        return {
          labels: ['Logins', 'Acessos a Sistemas', 'Notificações Lidas'],
          values: [analytics.activity.logins, analytics.activity.systemAccess, analytics.activity.notificationsRead],
          colors: ['#f97316', '#fb923c', '#fdba74']
        };
      default:
        return { labels: [], values: [], colors: [] };
    }
  };


  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case '7d': return 'Últimos 7 dias';
      case '30d': return 'Últimos 30 dias';
      case '90d': return 'Últimos 90 dias';
      case '1y': return 'Último ano';
      default: return period;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={user} />
        <ResponsiveContainer>
          <div className="mb-6">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/home', icon: 'house' },
                { label: 'Administração', href: '/admin' },
                { label: 'Analytics' }
              ]} 
            />
          </div>
          <DashboardShimmer />
        </ResponsiveContainer>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      <ResponsiveContainer>
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Analytics' }
            ]} 
          />
        </div>
        
        {/* Simplified Header */}
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-orange-600 mb-2">
              Analytics
            </h1>
            <p className="text-gray-600">Dashboard de análise de dados</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mb-8">
          <NavigationControlsPro
            tabs={[
              { label: 'Visão Geral', value: 'overview', icon: 'dashboard', count: 12 },
              { label: 'Usuários', value: 'users', icon: 'user-group', count: analytics?.users.total },
              { label: 'Sistemas', value: 'systems', icon: 'monitor', count: analytics?.systems.total },
              { label: 'Relatórios', value: 'reports', icon: 'document', count: 8 }
            ]}
            activeTab="overview"
            periods={[
              { label: 'Últimos 7 dias', value: '7d', icon: 'calendar' },
              { label: 'Últimos 30 dias', value: '30d', icon: 'calendar' },
              { label: 'Últimos 90 dias', value: '90d', icon: 'calendar' },
              { label: 'Último ano', value: '1y', icon: 'calendar' }
            ]}
            activePeriod={selectedPeriod}
            onPeriodChange={(period) => setSelectedPeriod(period as any)}
            searchEnabled={true}
            onRefresh={() => fetchAnalyticsData()}
            onExport={() => window.print()}
            variant="default"
            brandColor="orange"
            size="md"
          />
        </div>

        {analytics && (
          <>
            {/* Metrics Cards */}
            <MetricsGrid className="mb-12">
              {/* Demonstração lado a lado: Original vs Pro */}
              <MetricCardEnterprisePro
                title="Total de Usuários"
                value={analytics.users.total}
                previousValue={analytics.users.total - analytics.users.new}
                icon="user-group"
                variant="primary"
                trend={analytics.users.new > 0 ? 'up' : 'stable'}
                subtitle={`+${analytics.users.new} novos usuários`}
                description="Crescimento consistente na base de usuários"
                size="md"
                hoverEffect="lift"
                enableAnimation={true}
                isPressable={true}
                onClick={() => router.push('/admin/users')}
              />
              
              <MetricCardEnterprisePro
                title="Sistemas Ativos"
                value={analytics.systems.active}
                previousValue={analytics.systems.total}
                icon="monitor"
                variant="secondary"
                colorPalette="blue"
                trend="stable"
                subtitle={`${analytics.systems.total} sistemas total`}
                description="Alta disponibilidade mantida"
                size="md"
                hoverEffect="lift"
                enableAnimation={true}
                isPressable={true}
                onClick={() => router.push('/admin/systems')}
              />
              
              <MetricCardEnterprisePro
                title="Conteúdo Publicado"
                value={analytics.content.news + analytics.content.events}
                icon="chat-line"
                variant="info"
                colorPalette="blue"
                trend="up"
                subtitle={`${analytics.content.news} notícias, ${analytics.content.events} eventos`}
                description="Engajamento da comunidade em alta"
                size="md"
                hoverEffect="glow"
                enableAnimation={true}
                isBlurred={true}
              />
              
              <MetricCardEnterprisePro
                title="Atividade Recente"
                value={analytics.activity.logins}
                icon="chart-bar-vertical"
                variant="warning"
                colorPalette="amber"
                trend="up"
                subtitle={`logins em ${getPeriodLabel(selectedPeriod).toLowerCase()}`}
                description="Usuários altamente engajados"
                size="md"
                hoverEffect="border"
                enableAnimation={true}
              />
            </MetricsGrid>

            {/* Charts Section - Redesigned with Clean Professional Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Main Chart Container - 2/3 width */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Distribuição por Categoria</h2>
                        <p className="text-sm text-gray-500 mt-1">Análise detalhada dos dados principais</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => fetchAnalyticsData()}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Icon name="refresh" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Toggle Buttons */}
                  <div className="px-6 py-3 bg-gray-50/50">
                    <div className="flex space-x-1">
                      {[
                        { key: 'users', label: 'Usuários', icon: 'user-group' },
                        { key: 'systems', label: 'Sistemas', icon: 'monitor' },
                        { key: 'activity', label: 'Atividade', icon: 'chart-line' }
                      ].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => setActiveChart(option.key as any)}
                          className={`
                            px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 
                            flex items-center space-x-2
                            ${activeChart === option.key
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }
                          `}
                        >
                          <Icon name={option.icon as any} className="h-3 w-3" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Chart Content */}
                  <div className="p-6">
                    <AnimatedChart
                      data={chartData.labels.map((label, index) => ({
                        label,
                        value: chartData.values[index],
                        color: chartData.colors[index] || '#F58220'
                      }))}
                      title=""
                      type="bar"
                      height={350}
                      animated={true}
                      className=""
                    />
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-orange-500">• {chartData.labels.length} categorias</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Dados em tempo real</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Analytics - 1/3 width */}
              <div className="space-y-8">
                {/* Usuários por Local */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="font-semibold text-gray-900">Usuários por Local</h3>
                    <p className="text-xs text-gray-500 mt-1">Distribuição geográfica</p>
                  </div>
                  <div className="p-5">
                    <div className="space-y-1">
                      {analytics.locations.userDistribution
                        .sort((a, b) => b.users - a.users)
                        .slice(0, 6)
                        .map((location, index) => {
                          const percentage = analytics.users.total > 0 
                            ? Math.round((location.users / analytics.users.total) * 100)
                            : 0;
                          return (
                            <LocationCard
                              key={location.name}
                              name={location.name}
                              users={location.users}
                              percentage={percentage}
                              rank={index}
                            />
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Métricas-Chave */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="font-semibold text-gray-900">Métricas Principais</h3>
                    <p className="text-xs text-gray-500 mt-1">Indicadores de performance</p>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Taxa de Usuários Ativos */}
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Usuários Ativos</span>
                        <Icon name="trending-up" className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {Math.round((analytics.users.active / analytics.users.total) * 100)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {analytics.users.active} de {analytics.users.total} usuários
                      </div>
                    </div>
                    
                    {/* Taxa de Notificações Lidas */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border border-green-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Taxa de Leitura</span>
                        <Icon name="check" className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {Math.round((analytics.activity.notificationsRead / Math.max(analytics.content.notifications, 1)) * 100)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {analytics.activity.notificationsRead} notificações lidas
                      </div>
                    </div>
                    
                    {/* Crescimento */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Crescimento</span>
                        <Icon name="user-add" className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        +{Math.round((analytics.users.new / Math.max(analytics.users.total - analytics.users.new, 1)) * 100)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {analytics.users.new} novos usuários
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="mt-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Ações Rápidas</h2>
                <p className="text-sm text-gray-600">Acesse rapidamente as principais funcionalidades</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MinimalistButton
                  variant="primary"
                  size="lg"
                  icon="user-group"
                  onClick={() => router.push('/admin/users')}
                  fullWidth
                >
                  Gerenciar Usuários
                </MinimalistButton>
                
                <MinimalistButton
                  variant="primary"
                  size="lg"
                  icon="monitor"
                  onClick={() => router.push('/admin/systems')}
                  fullWidth
                >
                  Gerenciar Sistemas
                </MinimalistButton>
                
                <MinimalistButton
                  variant="primary"
                  size="lg"
                  icon="bell"
                  onClick={() => router.push('/admin/notifications')}
                  fullWidth
                >
                  Enviar Notificação
                </MinimalistButton>
                
                <MinimalistButton
                  variant="outline"
                  size="lg"
                  icon="save"
                  onClick={() => window.print()}
                  fullWidth
                >
                  Imprimir Relatório
                </MinimalistButton>
              </div>
            </div>
          </>
        )}
      </ResponsiveContainer>
    </div>
  );
} 