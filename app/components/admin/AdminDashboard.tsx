'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, startTransition } from 'react';

import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { createClient } from '@/lib/supabase/client';

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

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
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
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          router.replace('/login');
          return;
        }

        setUser(userData.user as User);

        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single();

        if (profile?.role === 'admin') {
          // Usar transição para não bloquear UI
          startTransition(() => {
            fetchStats();
          });
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
      const supabase = createClient();
      // Fetch basic statistics
      const [usersResult, requestsResult, sectorsResult, subsectorsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('access_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('sectors').select('id', { count: 'exact' }),
        supabase.from('subsectors').select('id', { count: 'exact' }),
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
      <UnifiedLoadingSpinner 
        fullScreen
        size="large" 
        message={LOADING_MESSAGES.dashboard}
      />
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
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h1 className="text-3xl font-bold text-primary mb-1">
              Painel Administrativo
            </h1>
            <p className="text-sm text-gray-600">Gerencie usuários, setores e sistemas do portal de acesso Cresol.</p>
          </div>
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