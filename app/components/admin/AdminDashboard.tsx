'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import AdminHeader from '../AdminHeader';
import Breadcrumb from '../Breadcrumb';
import StatisticsGrid from './StatisticsGrid';
import AdminModulesGrid from './AdminModulesGrid';

interface DashboardStats {
  totalUsers: number;
  pendingRequests: number;
  totalSectors: number;
  totalSubsectors: number;
}

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
}

interface AdminDashboardProps {
  initialUser?: User;
  initialStats?: DashboardStats;
}

export default function AdminDashboard({ initialUser, initialStats }: AdminDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [stats, setStats] = useState<DashboardStats>(initialStats || {
    totalUsers: 0,
    pendingRequests: 0,
    totalSectors: 0,
    totalSubsectors: 0,
  });

  useEffect(() => {
    // Skip if we already have initial data
    if (initialUser && initialStats) {
      setLoading(false);
      return;
    }

    // Only execute on client side
    if (typeof window === 'undefined') return;
    
    const checkUser = async () => {
      try {
        const { data: userData } = await getSupabaseClient().auth.getUser();
        
        if (!userData.user) {
          router.replace('/login');
          return;
        }

        setUser(userData.user as User);

        // Check if user is admin
        const { data: profile } = await getSupabaseClient()
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single();

        if (profile?.role === 'admin') {
          await fetchStats();
        } else {
          // Redirect non-admin users to dashboard
          router.replace('/dashboard');
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        router.replace('/login');
        setLoading(false);
      }
    };

    checkUser();
  }, [router, initialUser, initialStats]);

  const fetchStats = async () => {
    try {
      // Fetch basic statistics
      const [usersResult, requestsResult, sectorsResult, subsectorsResult] = await Promise.all([
        getSupabaseClient().from('profiles').select('id', { count: 'exact' }),
        getSupabaseClient().from('access_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        getSupabaseClient().from('sectors').select('id', { count: 'exact' }),
        getSupabaseClient().from('subsectors').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        totalSectors: sectorsResult.count || 0,
        totalSubsectors: subsectorsResult.count || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="body-text text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
        <div className="mb-8">
          <h1 className="heading-1 heading-modern text-title mb-3">
            Painel Administrativo
          </h1>
          <p className="body-text text-muted max-w-2xl">
            Gerencie usuários, setores e sistemas do portal de acesso Cresol.
          </p>
        </div>

        {/* Statistics Grid */}
        <StatisticsGrid stats={stats} className="mb-12" />

        {/* Administrative Modules */}
        <div>
          <h2 className="heading-3 text-title mb-6">
            Módulos Administrativos
          </h2>
          <AdminModulesGrid />
        </div>
      </main>
    </div>
  );
}