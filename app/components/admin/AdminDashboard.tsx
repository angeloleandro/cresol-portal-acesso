'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, startTransition } from 'react';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

import AdminHeader from '../AdminHeader';
import Breadcrumb from '../Breadcrumb';
import AdminModulesGrid from './AdminModulesGrid';
import StatisticsGrid from './StatisticsGrid';

interface DashboardStats {
  totalUsers: number;
  pendingRequests: number;
  totalSectors: number;
  totalSubsectors: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth(); // Usar o AuthProvider ao invés de verificação própria
  const supabase = createClient();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingRequests: 0,
    totalSectors: 0,
    totalSubsectors: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      // Fetch basic statistics
      const [usersResult, requestsResult, sectorsResult, subsectorsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('access_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('sectors').select('id', { count: 'exact' }),
        supabase.from('subsectors').select('id', { count: 'exact' })
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        totalSectors: sectorsResult.count || 0,
        totalSubsectors: subsectorsResult.count || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, [supabase]);

  useEffect(() => {
    // Carregar estatísticas assim que o componente montar
    // Não precisa verificar auth pois o AuthGuard já garantiu
    startTransition(() => {
      fetchStats();
    });
  }, [fetchStats]);

  // Usuário já está autenticado e é admin graças ao AuthGuard
  // Não precisa de loading ou verificações aqui
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração' }
            ]} 
          />
        </div>

        {/* Header Section */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h1 className="text-3xl font-bold text-primary mb-1">
              Painel Administrativo
            </h1>
            <p className="text-sm text-gray-600">Gerencie usuários, setores e sistemas do portal de acesso Cresol.</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <StatisticsGrid stats={stats} />

        {/* Admin Modules Grid */}
        <AdminModulesGrid />
      </main>
    </div>
  );
}