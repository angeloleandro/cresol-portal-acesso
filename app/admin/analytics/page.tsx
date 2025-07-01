'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { Icon } from '@/app/components/icons/Icon';

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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Relatórios</h1>
              <p className="mt-2 text-gray-600">Insights e estatísticas do portal</p>
            </div>
            
            {/* Seletor de Período */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Período:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="7d">7 dias</option>
                <option value="30d">30 dias</option>
                <option value="90d">90 dias</option>
                <option value="1y">1 ano</option>
              </select>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Cards de Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Usuários */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Icon name="user-group" className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.users.total)}</p>
                    <p className="text-xs text-green-600">+{analytics.users.new} novos</p>
                  </div>
                </div>
              </div>

              {/* Sistemas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Icon name="monitor" className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sistemas Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.systems.active}</p>
                    <p className="text-xs text-gray-500">de {analytics.systems.total} total</p>
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Icon name="chat-line" className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conteúdo Publicado</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.content.news + analytics.content.events}</p>
                    <p className="text-xs text-gray-500">{analytics.content.news} notícias, {analytics.content.events} eventos</p>
                  </div>
                </div>
              </div>

              {/* Atividade */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Icon name="chart-bar-vertical" className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Atividade ({getPeriodLabel(selectedPeriod)})</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.activity.logins)}</p>
                    <p className="text-xs text-gray-500">logins realizados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos e Tabelas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Gráfico Principal */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Distribuição por Categoria</h3>
                  <div className="flex space-x-2">
                    {[
                      { key: 'users', label: 'Usuários' },
                      { key: 'systems', label: 'Sistemas' },
                      { key: 'activity', label: 'Atividade' }
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => setActiveChart(option.key as any)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          activeChart === option.key
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gráfico de Barras Simples */}
                <div className="space-y-4">
                  {chartData.labels.map((label, index) => (
                    <div key={label} className="flex items-center space-x-4">
                      <div className="w-20 text-sm text-gray-600 text-right">{label}</div>
                      <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${(chartData.values[index] / Math.max(...chartData.values)) * 100}%`,
                            backgroundColor: chartData.colors[index] || '#6b7280'
                          }}
                        />
                      </div>
                      <div className="w-16 text-sm text-gray-900 font-medium">
                        {formatNumber(chartData.values[index])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar com Informações Adicionais */}
              <div className="space-y-6">
                {/* Top Localizações */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuários por Local</h3>
                  <div className="space-y-3">
                    {analytics.locations.userDistribution
                      .sort((a, b) => b.users - a.users)
                      .slice(0, 5)
                      .map((location, index) => (
                        <div key={location.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-orange-500' :
                              index === 1 ? 'bg-orange-400' :
                              index === 2 ? 'bg-orange-300' :
                              'bg-gray-400'
                            }`} />
                            <span className="text-sm text-gray-600 truncate">{location.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{location.users}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Sistemas Mais Usados */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistemas Populares</h3>
                  <div className="space-y-3">
                    {analytics.systems.mostUsed.map((system, index) => (
                      <div key={system.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{system.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                              style={{ width: `${system.usage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{system.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo Rápido */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxa de Usuários Ativos</span>
                      <span className="font-medium text-orange-600">
                        {Math.round((analytics.users.active / analytics.users.total) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Notificações Lidas</span>
                      <span className="font-medium text-orange-600">
                        {Math.round((analytics.activity.notificationsRead / analytics.content.notifications) * 100) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Crescimento de Usuários</span>
                      <span className="font-medium text-orange-600">
                        +{Math.round((analytics.users.new / analytics.users.total) * 100) || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                >
                  Gerenciar Usuários
                </button>
                <button
                  onClick={() => router.push('/admin/systems')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                >
                  Gerenciar Sistemas
                </button>
                <button
                  onClick={() => router.push('/admin/notifications')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                >
                  Enviar Notificação
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Imprimir Relatório
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 