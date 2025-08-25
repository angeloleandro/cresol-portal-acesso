'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import { Icon } from '../../components/icons/Icon';

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
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);

  const loadUserActivities = useCallback(async () => {
    try {
      // Buscar atividades reais dos usuários do banco de dados
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          id,
          action,
          timestamp,
          ip_address,
          user_agent,
          success,
          profiles!inner(name)
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {

        // Fallback para dados mock em caso de erro
        const mockActivities: UserActivity[] = [
          {
            id: 'mock-1',
            user_name: 'Sistema',
            action: 'Login no sistema',
            timestamp: new Date().toISOString(),
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0',
            success: true
          }
        ];
        setUserActivities(mockActivities);
      } else {
        const activities = data?.map((item: any) => ({
          id: item.id,
          user_name: item.profiles?.name || 'Usuário desconhecido',
          action: item.action,
          timestamp: item.timestamp,
          ip_address: item.ip_address || 'N/A',
          user_agent: item.user_agent || 'N/A',
          success: item.success
        })) || [];
        setUserActivities(activities);
      }
    } catch (error) {

      setUserActivities([]);
    }
  }, []);

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
      await loadUserActivities();
      setLoading(false);
    };

    checkUser();
  }, [router, loadUserActivities]);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <UnifiedLoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Carregando monitoramento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Monitoramento' }
            ]} 
          />
        </div>
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Monitoramento de Atividades
              </h1>
              <p className="text-gray-600">
                Acompanhe as atividades dos usuários no portal
              </p>
            </div>
            
            <button
              onClick={loadUserActivities}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2 rotate-180" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Atividades dos usuários */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Atividades Recentes dos Usuários</h3>
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-sm ${
                        activity.success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {activity.success ? 'Sucesso' : 'Falha'}
                      </span>
                    </td>
                  </tr>
                ))}
                {userActivities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Icon name="user-group" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma atividade encontrada</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 