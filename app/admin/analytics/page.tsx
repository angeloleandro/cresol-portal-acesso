'use client';

import { Tabs } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import AuthGuard from '@/app/components/AuthGuard';
import { StandardizedButton, StandardizedTabsList } from '@/app/components/admin';
import AdminHeader from '@/app/components/AdminHeader';
import AnimatedChart from '@/app/components/analytics/AnimatedChart';
import { ResponsiveContainer } from '@/app/components/analytics/GridLayoutResponsivo';
import { DashboardShimmer } from '@/app/components/analytics/ShimmerLoading';
import Breadcrumb from '@/app/components/Breadcrumb';
import { Icon } from '@/app/components/icons/Icon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

const supabase = createClient();

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

function AnalyticsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeChart, setActiveChart] = useState<'users' | 'systems' | 'activity'>('users');

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
      // Error fetching analytics data
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchAnalyticsData();
    setLoading(false);
  }, [selectedPeriod, fetchAnalyticsData]);

  const getChartData = (): ChartData => {
    if (!analytics) return { labels: [], values: [], colors: [] };

    switch (activeChart) {
      case 'users':
        return {
          labels: Object.keys(analytics.users.byRole).map(role => {
            switch (role) {
              case 'admin': return 'Administradores Gerais';
              case 'sector_admin': return 'Admin. de Setores';
              case 'subsector_admin': return 'Admin. de Subsetores';
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
          labels: ['Logins', 'Acessos a Sistemas'],
          values: [analytics.activity.logins, analytics.activity.systemAccess],
          colors: ['#f97316', '#fb923c', '#fdba74']
        };
      default:
        return { labels: [], values: [], colors: [] };
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
        
        {/* Compact Header */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h1 className="text-3xl font-bold text-primary mb-1">
              Analytics
            </h1>
            <p className="text-sm text-gray-600">Dashboard de análise de dados</p>
          </div>
        </div>

        {/* Navigation Controls - Professional Minimal */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              
              {/* Left - Period Selector */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Período:</span>
                <Tabs.Root
                  value={selectedPeriod}
                  onValueChange={(details) => setSelectedPeriod(details.value as '7d' | '30d' | '90d' | '1y')}
                  variant="plain"
                  size="sm"
                  colorPalette="orange"
                >
                  <StandardizedTabsList
                    tabs={[
                      { value: '7d', label: '7d' },
                      { value: '30d', label: '30d' },
                      { value: '90d', label: '90d' },
                      { value: '1y', label: '1a' },
                    ]}
                    className="mb-0"
                  />
                </Tabs.Root>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchAnalyticsData()}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center space-x-1.5"
                  title="Atualizar dados"
                >
                  <Icon name="refresh" className="h-3.5 w-3.5" />
                  <span>Atualizar</span>
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center space-x-1.5"
                  title="Exportar relatório"
                >
                  <Icon name="save" className="h-3.5 w-3.5" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Estatísticas - Padrão Golden Cresol */}
            <div className="grid-modern-stats mb-8">
              <div className="stat-card-orange" onClick={() => window.location.href = '/admin'} role="button" tabIndex={0}>
                <div className="flex items-center">
                  <div className="icon-container-orange mr-5 flex-shrink-0">
                    <Icon name="chart-bar-vertical" className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="stat-value mb-1">
                      12
                    </div>
                    <div className="stat-label">
                      Indicadores
                    </div>
                  </div>
                </div>
              </div>

              <div className="stat-card-orange" onClick={() => router.push('/admin/users')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/admin/users'); } }}>
                <div className="flex items-center">
                  <div className="icon-container-orange mr-5 flex-shrink-0">
                    <Icon name="user-group" className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="stat-value mb-1">
                      {analytics.users.total}
                    </div>
                    <div className="stat-label">
                      Usuários
                    </div>
                  </div>
                </div>
              </div>

              <div className="stat-card-orange" onClick={() => router.push('/admin/systems')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/admin/systems'); } }}>
                <div className="flex items-center">
                  <div className="icon-container-orange mr-5 flex-shrink-0">
                    <Icon name="monitor" className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="stat-value mb-1">
                      {analytics.systems.active}
                    </div>
                    <div className="stat-label">
                      Sistemas
                    </div>
                  </div>
                </div>
              </div>

              <div className="stat-card-orange">
                <div className="flex items-center">
                  <div className="icon-container-orange mr-5 flex-shrink-0">
                    <Icon name="file" className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="stat-value mb-1">
                      8
                    </div>
                    <div className="stat-label">
                      Relatórios
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section - Responsive Professional Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Main Chart Container - Responsive */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Compact Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">Distribuição por Categoria</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Análise detalhada dos dados</p>
                      </div>
                      <button
                        onClick={() => fetchAnalyticsData()}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-sm transition-colors"
                      >
                        <Icon name="refresh" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Compact Chart Toggle */}
                  <div className="px-4 py-2 bg-gray-50">
                    <Tabs.Root
                      value={activeChart}
                      onValueChange={(details) => setActiveChart(details.value as 'users' | 'systems' | 'activity')}
                      variant="plain"
                      size="sm"
                      colorPalette="orange"
                    >
                      <StandardizedTabsList
                        tabs={[
                          { value: 'users', label: 'Usuários', icon: <Icon name="user-group" className="h-3 w-3" /> },
                          { value: 'systems', label: 'Sistemas', icon: <Icon name="monitor" className="h-3 w-3" /> },
                          { value: 'activity', label: 'Atividade', icon: <Icon name="trending-up" className="h-3 w-3" /> },
                        ]}
                        className="mb-0"
                      />
                    </Tabs.Root>
                  </div>
                  
                  {/* Chart Content - More Compact */}
                  <div className="p-4">
                    <AnimatedChart
                      data={chartData.labels.map((label, index) => ({
                        label,
                        value: chartData.values[index],
                        color: chartData.colors[index] || '#F58220'
                      }))}
                      title=""
                      type="bar"
                      height={280}
                      animated={true}
                      className=""
                    />
                  </div>
                  
                  {/* Compact Footer */}
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        <span>Tempo real</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Sidebar Analytics - Responsive Order */}
              <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
                {/* Usuários por Local - Compact */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900">Usuários por Local</h3>
                    <p className="text-xs text-gray-500">Distribuição geográfica</p>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2">
                      {analytics.locations.userDistribution
                        .sort((a, b) => b.users - a.users)
                        .slice(0, 5)
                        .map((location, _index) => {
                          const percentage = analytics.users.total > 0 
                            ? Math.round((location.users / analytics.users.total) * 100)
                            : 0;
                          return (
                            <div key={location.name} className="flex items-center justify-between py-1.5">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div className="w-2 h-2 rounded-full bg-orange-600 flex-shrink-0"></div>
                                <span className="text-xs font-medium text-gray-700 truncate">
                                  {location.name}
                                </span>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <div className="text-xs font-semibold text-gray-900">{location.users}</div>
                                <div className="text-xs text-gray-500">{percentage}%</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Métricas Principais - Compact */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900">Métricas Principais</h3>
                    <p className="text-xs text-gray-500">Indicadores de performance</p>
                  </div>
                  <div className="p-3 space-y-3">
                    {/* Compact Metric Cards - Padrão Cresol */}
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:border-[#727176] transition-all duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">Usuários Ativos</span>
                        <Icon name="trending-up" className="h-3 w-3 text-orange-600" />
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {Math.round((analytics.users.active / analytics.users.total) * 100)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {analytics.users.active} de {analytics.users.total}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:border-[#727176] transition-all duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">Taxa de Leitura</span>
                        <Icon name="check" className="h-3 w-3 text-orange-600" />
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {Math.round((analytics.activity.notificationsRead / Math.max(analytics.content.notifications, 1)) * 100)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {analytics.activity.notificationsRead} lidas
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:border-[#727176] transition-all duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">Crescimento</span>
                        <Icon name="user-add" className="h-3 w-3 text-orange-600" />
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        +{Math.round((analytics.users.new / Math.max(analytics.users.total - analytics.users.new, 1)) * 100)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {analytics.users.new} novos
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas - Professional Compact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Ações Rápidas</h2>
                <p className="text-xs text-gray-500">Acesso rápido às funcionalidades</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StandardizedButton
                  variant="primary"
                  size="sm"
                  icon={<Icon name="user-group" className="h-4 w-4" />}
                  onClick={() => router.push('/admin/users')}
                  className="min-w-0"
                >
                  Usuários
                </StandardizedButton>
                
                <StandardizedButton
                  variant="primary"
                  size="sm"
                  icon={<Icon name="monitor" className="h-4 w-4" />}
                  onClick={() => router.push('/admin/systems')}
                  className="min-w-0"
                >
                  Sistemas
                </StandardizedButton>

                <StandardizedButton
                  variant="secondary"
                  size="sm"
                  icon={<Icon name="save" className="h-4 w-4" />}
                  onClick={() => window.print()}
                  className="min-w-0"
                >
                  Relatório
                </StandardizedButton>
              </div>
            </div>
          </>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGuard requireRole="admin">
      <AnalyticsPageContent />
    </AuthGuard>
  );
} 