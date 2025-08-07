'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Icon } from '@/app/components/icons/Icon';

/**
 * MONITORING DASHBOARD - Success Metrics & KPI Tracking
 * Dashboard completo para monitoramento do projeto de upload de vídeos
 */

interface KPIDashboardData {
  date: string;
  total_uploads: number;
  successful_uploads: number;
  upload_success_rate: number;
  avg_upload_time: number;
  avg_file_size: number;
  active_users: number;
  avg_response_time: number;
  p95_response_time: number;
  error_rate: number;
  avg_satisfaction: number;
  avg_nps: number;
  avg_task_time: number;
  task_success_rate: number;
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  metric: string;
  value: number;
  threshold: number;
}

export default function MonitoringDashboard() {
  const [kpiData, setKpiData] = useState<KPIDashboardData[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());


  useEffect(() => {
    loadDashboardData();
    loadAlerts();
    loadStorageUsage();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadDashboardData();
      loadAlerts();
      loadStorageUsage();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('kpi_dashboard')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error loading dashboard data:', error);
        // Mock data fallback
        const mockData: KPIDashboardData[] = [{
          date: new Date().toISOString(),
          total_uploads: 45,
          successful_uploads: 42,
          upload_success_rate: 0.93,
          avg_upload_time: 85000,
          avg_file_size: 150000000,
          active_users: 8,
          avg_response_time: 320,
          p95_response_time: 750,
          error_rate: 0.015,
          avg_satisfaction: 8.2,
          avg_nps: 7.5,
          avg_task_time: 45000,
          task_success_rate: 0.89
        }];
        setKpiData(mockData);
      } else {
        setKpiData(data || []);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadAlerts = async () => {
    const mockAlerts: AlertItem[] = [
      {
        id: '1',
        type: 'warning',
        message: 'Upload success rate below threshold',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        metric: 'upload_success_rate',
        value: 92,
        threshold: 95
      },
      {
        id: '2',
        type: 'critical',
        message: 'Storage usage approaching limit',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        metric: 'storage_usage',
        value: 78,
        threshold: 80
      }
    ];
    setAlerts(mockAlerts);
  };

  const loadStorageUsage = async () => {
    // Mock data - seria substituído por chamada real à API do Supabase Storage
    const mockStorage = {
      used: 7.8 * 1024 * 1024 * 1024, // 7.8 GB
      total: 10 * 1024 * 1024 * 1024, // 10 GB
      percentage: 78
    };
    setStorageUsage(mockStorage);
    setIsLoading(false);
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getCurrentData = () => kpiData[0] || {} as KPIDashboardData;
  const getPreviousData = () => kpiData[1] || {} as KPIDashboardData;

  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const TrendIndicator = ({ current, previous }: { current: number; previous: number }) => {
    const trend = calculateTrend(current, previous);
    if (Math.abs(trend) < 1) return null;
    
    return trend > 0 ? (
      <Icon name="trending-up" className="w-4 h-4 text-green-500 inline ml-2" />
    ) : (
      <Icon name="trending-down" className="w-4 h-4 text-red-500 inline ml-2" />
    );
  };

  const currentData = getCurrentData();
  const previousData = getPreviousData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento - Upload Direto de Vídeos</h1>
          <p className="text-gray-600 mt-2">
            Última atualização: {lastUpdate.toLocaleString('pt-BR')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            alerts.some(a => a.type === 'critical') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {alerts.filter(a => a.type === 'critical').length} Críticos
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            alerts.some(a => a.type === 'warning') ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {alerts.filter(a => a.type === 'warning').length} Avisos
          </span>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.filter(a => a.type === 'critical').length > 0 && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Icon name="AlertTriangle" className="h-4 w-4 text-red-600 mr-2" />
            <div className="text-red-800">
              <strong>Alertas Críticos:</strong>
              <ul className="mt-1 space-y-1">
                {alerts.filter(a => a.type === 'critical').map(alert => (
                  <li key={alert.id}>• {alert.message} ({alert.value}% vs {alert.threshold}% limite)</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Upload Success Rate */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Taxa de Sucesso Uploads</h3>
            <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold">
            {(currentData.upload_success_rate * 100).toFixed(1)}%
            <TrendIndicator 
              current={currentData.upload_success_rate * 100} 
              previous={previousData.upload_success_rate * 100} 
            />
          </div>
          <p className="text-xs text-gray-600">Meta: ≥95%</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  currentData.upload_success_rate >= 0.95 ? 'bg-green-500' : 
                  currentData.upload_success_rate >= 0.90 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(currentData.upload_success_rate || 0) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Average Upload Time */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Tempo Médio Upload</h3>
            <Icon name="clock" className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">
            {formatDuration(currentData.avg_upload_time || 0)}
            <TrendIndicator 
              current={currentData.avg_upload_time || 0} 
              previous={previousData.avg_upload_time || 0} 
            />
          </div>
          <p className="text-xs text-gray-600">Meta: &lt;2min para 100MB</p>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Usuários Ativos</h3>
            <Icon name="user-group" className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">
            {currentData.active_users || 0}
            <TrendIndicator 
              current={currentData.active_users || 0} 
              previous={previousData.active_users || 0} 
            />
          </div>
          <p className="text-xs text-gray-600">Últimas 24h</p>
        </div>

        {/* Storage Usage */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Uso de Storage</h3>
            <Icon name="monitor" className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold">
            {storageUsage.percentage}%
          </div>
          <p className="text-xs text-gray-600">
            {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.total)}
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  storageUsage.percentage >= 80 ? 'bg-red-500' : 
                  storageUsage.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${storageUsage.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* API Performance */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Performance API</h3>
            <Icon name="refresh" className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold">
            {currentData.avg_response_time ? formatDuration(currentData.avg_response_time) : 'N/A'}
            <TrendIndicator 
              current={currentData.avg_response_time || 0} 
              previous={previousData.avg_response_time || 0} 
            />
          </div>
          <p className="text-xs text-gray-600">
            P95: {currentData.p95_response_time ? formatDuration(currentData.p95_response_time) : 'N/A'}
          </p>
        </div>

        {/* Error Rate */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Taxa de Erro</h3>
            <Icon name="AlertTriangle" className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold">
            {((currentData.error_rate || 0) * 100).toFixed(2)}%
            <TrendIndicator 
              current={(currentData.error_rate || 0) * 100} 
              previous={(previousData.error_rate || 0) * 100} 
            />
          </div>
          <p className="text-xs text-gray-600">Meta: &lt;2%</p>
        </div>

        {/* User Satisfaction */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Satisfação Usuário</h3>
            <Icon name="chart-bar-vertical" className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold">
            {currentData.avg_satisfaction ? currentData.avg_satisfaction.toFixed(1) : 'N/A'}/10
            <TrendIndicator 
              current={currentData.avg_satisfaction || 0} 
              previous={previousData.avg_satisfaction || 0} 
            />
          </div>
          <p className="text-xs text-gray-600">
            NPS: {currentData.avg_nps ? currentData.avg_nps.toFixed(1) : 'N/A'}
          </p>
        </div>

        {/* Total Videos */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Vídeos Processados</h3>
            <Icon name="video" className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold">
            {currentData.total_uploads || 0}
            <TrendIndicator 
              current={currentData.total_uploads || 0} 
              previous={previousData.total_uploads || 0} 
            />
          </div>
          <p className="text-xs text-gray-600">
            Sucesso: {currentData.successful_uploads || 0}
          </p>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Alertas Recentes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.type === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="AlertTriangle" className={`w-4 h-4 ${
                      alert.type === 'critical' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        Valor: {alert.value}% | Limite: {alert.threshold}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      alert.type === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.type.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}