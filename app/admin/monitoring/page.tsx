'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '../../components/Navbar';
import Breadcrumbs from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  history: { timestamp: string; value: number }[];
  change_24h: number;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: number;
  response_time: number;
  last_check: string;
  incidents: number;
  url?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  details?: Record<string, any>;
  user_id?: string;
  ip_address?: string;
}

interface Alert {
  id: string;
  type: 'system' | 'security' | 'performance' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  source: string;
}

interface UserActivity {
  id: string;
  user_name: string;
  action: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
}

export default function MonitoringPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'logs' | 'alerts' | 'users'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 segundos
  
  // Estados dos dados
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  
  // Filtros
  const [logLevel, setLogLevel] = useState<string>('all');
  const [alertSeverity, setAlertSeverity] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('1h');
  
  const refreshTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }

      setUser(data.user);
      await loadAllData();
      setLoading(false);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (autoRefresh && !loading) {
      refreshTimer.current = setInterval(() => {
        loadAllData();
      }, refreshInterval);

      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, loading]);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadSystemMetrics(),
        loadServiceStatuses(),
        loadLogs(),
        loadAlerts(),
        loadUserActivities()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do monitoramento:', error);
    }
  };

  const loadSystemMetrics = async () => {
    // Simular dados de métricas do sistema (implementar com dados reais depois)
    const mockMetrics: SystemMetric[] = [
      {
        id: '1',
        name: 'CPU Usage',
        value: 45.2,
        unit: '%',
        status: 'healthy',
        threshold: { warning: 70, critical: 85 },
        history: generateMockHistory(45.2),
        change_24h: -2.1
      },
      {
        id: '2',
        name: 'Memory Usage',
        value: 67.8,
        unit: '%',
        status: 'healthy',
        threshold: { warning: 80, critical: 90 },
        history: generateMockHistory(67.8),
        change_24h: 1.5
      },
      {
        id: '3',
        name: 'Disk Usage',
        value: 82.3,
        unit: '%',
        status: 'warning',
        threshold: { warning: 80, critical: 95 },
        history: generateMockHistory(82.3),
        change_24h: 3.2
      },
      {
        id: '4',
        name: 'Active Users',
        value: 156,
        unit: 'users',
        status: 'healthy',
        threshold: { warning: 500, critical: 800 },
        history: generateMockHistory(156),
        change_24h: 12
      },
      {
        id: '5',
        name: 'Database Connections',
        value: 23,
        unit: 'connections',
        status: 'healthy',
        threshold: { warning: 80, critical: 100 },
        history: generateMockHistory(23),
        change_24h: -1
      },
      {
        id: '6',
        name: 'Response Time',
        value: 245,
        unit: 'ms',
        status: 'healthy',
        threshold: { warning: 1000, critical: 2000 },
        history: generateMockHistory(245),
        change_24h: -15
      }
    ];
    setSystemMetrics(mockMetrics);
  };

  const loadServiceStatuses = async () => {
    // Simular status de serviços
    const mockServices: ServiceStatus[] = [
      {
        id: '1',
        name: 'Portal Web',
        status: 'online',
        uptime: 99.8,
        response_time: 180,
        last_check: new Date().toISOString(),
        incidents: 0,
        url: window.location.origin
      },
      {
        id: '2',
        name: 'API Supabase',
        status: 'online',
        uptime: 99.95,
        response_time: 95,
        last_check: new Date().toISOString(),
        incidents: 0
      },
      {
        id: '3',
        name: 'Banco de Dados',
        status: 'online',
        uptime: 99.9,
        response_time: 25,
        last_check: new Date().toISOString(),
        incidents: 1
      },
      {
        id: '4',
        name: 'Sistema de Notificações',
        status: 'degraded',
        uptime: 97.2,
        response_time: 850,
        last_check: new Date().toISOString(),
        incidents: 3
      },
      {
        id: '5',
        name: 'Storage de Arquivos',
        status: 'online',
        uptime: 99.5,
        response_time: 320,
        last_check: new Date().toISOString(),
        incidents: 2
      }
    ];
    setServiceStatuses(mockServices);
  };

  const loadLogs = async () => {
    // Simular logs do sistema
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        service: 'auth',
        message: 'User login successful',
        user_id: 'user123',
        ip_address: '192.168.1.100'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'warning',
        service: 'notifications',
        message: 'High response time detected',
        details: { response_time: 1250, threshold: 1000 }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'error',
        service: 'database',
        message: 'Connection timeout',
        details: { timeout: 5000, query: 'SELECT * FROM profiles' }
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: 'info',
        service: 'api',
        message: 'New user registration',
        user_id: 'user124',
        ip_address: '192.168.1.101'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        level: 'critical',
        service: 'storage',
        message: 'Disk space critically low',
        details: { available_space: '2GB', threshold: '5GB' }
      }
    ];
    setLogs(mockLogs);
  };

  const loadAlerts = async () => {
    // Simular alertas do sistema
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'performance',
        severity: 'medium',
        title: 'Disk Usage Warning',
        description: 'Disk usage has exceeded 80% threshold',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        acknowledged: false,
        resolved: false,
        source: 'system_monitor'
      },
      {
        id: '2',
        type: 'system',
        severity: 'high',
        title: 'Service Degradation',
        description: 'Notification service showing high response times',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: true,
        resolved: false,
        source: 'health_check'
      },
      {
        id: '3',
        type: 'security',
        severity: 'low',
        title: 'Multiple Failed Login Attempts',
        description: 'User attempted login 5 times with wrong password',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        acknowledged: true,
        resolved: true,
        source: 'auth_system'
      }
    ];
    setAlerts(mockAlerts);
  };

  const loadUserActivities = async () => {
    // Simular atividades de usuários
    const mockActivities: UserActivity[] = [
      {
        id: '1',
        user_name: 'João Silva',
        action: 'Login',
        timestamp: new Date().toISOString(),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        success: true
      },
      {
        id: '2',
        user_name: 'Maria Santos',
        action: 'Update Profile',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0...',
        success: true
      },
      {
        id: '3',
        user_name: 'Pedro Costa',
        action: 'Failed Login',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0...',
        success: false
      }
    ];
    setUserActivities(mockActivities);
  };

  const generateMockHistory = (currentValue: number) => {
    const history = [];
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 3600000).toISOString();
      const variance = (Math.random() - 0.5) * (currentValue * 0.2);
      const value = Math.max(0, currentValue + variance);
      history.push({ timestamp, value });
    }
    return history;
  };

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const resolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'offline':
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 bg-blue-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const filteredLogs = logs.filter(log => 
    logLevel === 'all' || log.level === logLevel
  );

  const filteredAlerts = alerts.filter(alert => 
    alertSeverity === 'all' || alert.severity === alertSeverity
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando monitoramento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Monitoramento do Sistema
              </h1>
              <p className="text-gray-600">
                Visão em tempo real do status e performance do portal
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Controles de refresh */}
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
                </label>
                
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  disabled={!autoRefresh}
                >
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1min</option>
                  <option value={300000}>5min</option>
                </select>
              </div>
              
              <button
                onClick={loadAllData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Visão Geral', icon: '📊' },
              { key: 'services', label: 'Serviços', icon: '🔧' },
              { key: 'logs', label: 'Logs', icon: '📋' },
              { key: 'alerts', label: 'Alertas', icon: '🚨' },
              { key: 'users', label: 'Atividades', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das tabs */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métricas do sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemMetrics.map((metric) => (
                <div key={metric.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {metric.value.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">{metric.unit}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <span className={`${metric.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change_24h >= 0 ? '↗' : '↘'} {Math.abs(metric.change_24h)}
                    </span>
                    <span className="text-gray-500 ml-1">nas últimas 24h</span>
                  </div>
                  
                  {/* Mini gráfico */}
                  <div className="mt-4">
                    <div className="h-20 flex items-end space-x-1">
                      {metric.history.slice(-12).map((point, index) => {
                        const height = Math.max(4, (point.value / Math.max(...metric.history.map(h => h.value))) * 100);
                        return (
                          <div
                            key={index}
                            className="bg-primary/20 flex-1 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Status dos serviços */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Status dos Serviços</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceStatuses.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Uptime: {service.uptime}%</div>
                        <div>Resposta: {service.response_time}ms</div>
                        <div>Incidentes: {service.incidents}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alertas recentes */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Alertas Recentes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(alert.timestamp)}</p>
                      </div>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-sm text-primary hover:text-primary-dark"
                        >
                          Reconhecer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Status Detalhado dos Serviços</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serviço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resposta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Verificação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Incidentes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {serviceStatuses.map((service) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.uptime}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.response_time}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimeAgo(service.last_check)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.incidents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary hover:text-primary-dark mr-4">
                          Testar
                        </button>
                        {service.url && (
                          <a
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark"
                          >
                            Acessar
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            {/* Filtros de logs */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível
                  </label>
                  <select
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="1h">Última hora</option>
                    <option value="6h">Últimas 6 horas</option>
                    <option value="24h">Últimas 24 horas</option>
                    <option value="7d">Últimos 7 dias</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de logs */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Logs do Sistema</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        log.level === 'info' ? 'text-blue-600 bg-blue-100' :
                        log.level === 'warning' ? 'text-yellow-600 bg-yellow-100' :
                        log.level === 'error' ? 'text-red-600 bg-red-100' :
                        'text-purple-600 bg-purple-100'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{log.service}</span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(log.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{log.message}</p>
                        
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">
                              Ver detalhes
                            </summary>
                            <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                        
                        {(log.user_id || log.ip_address) && (
                          <div className="mt-2 text-xs text-gray-500">
                            {log.user_id && <span>User: {log.user_id}</span>}
                            {log.ip_address && <span className="ml-4">IP: {log.ip_address}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {/* Filtros de alertas */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severidade
                  </label>
                  <select
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Todas</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de alertas */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Alertas do Sistema</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                          <span className="text-xs text-gray-500">{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Tipo: {alert.type}</span>
                          <span>Fonte: {alert.source}</span>
                          {alert.acknowledged && <span className="text-green-600">✓ Reconhecido</span>}
                          {alert.resolved && <span className="text-blue-600">✓ Resolvido</span>}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="text-sm text-primary hover:text-primary-dark"
                          >
                            Reconhecer
                          </button>
                        )}
                        {alert.acknowledged && !alert.resolved && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="text-sm text-green-600 hover:text-green-700"
                          >
                            Resolver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Atividades dos Usuários</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.user_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.ip_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          activity.success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                        }`}>
                          {activity.success ? 'Sucesso' : 'Falha'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 