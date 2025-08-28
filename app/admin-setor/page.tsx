'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';
import { 
  StandardizedAdminLayout, 
  StandardizedPageHeader,
  type BreadcrumbItem
} from '@/app/components/admin';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// Removed unused SectorAdmin interface

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'sector_admin' | 'admin';
}

function AdminSetorDashboardContent() {
  const { user, profile } = useAuth();
  const [managedSectors, setManagedSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar os setores que o administrador gerencia
  const fetchManagedSectors = useCallback(async () => {
    if (!user) return;
    
    try {
      // Para admins normais, trazer todos os setores
      if (profile?.role === 'admin') {
        const { data: allSectors, error: sectorsError } = await supabase
          .from('sectors')
          .select('*')
          .order('name', { ascending: true });
          
        if (sectorsError) throw sectorsError;
        setManagedSectors(allSectors || []);
        return;
      }
      
      // Para admins de setor, buscar os setores que ele gerencia
      const { data: sectorAdmins, error: adminError } = await supabase
        .from('sector_admins')
        .select('sector_id')
        .eq('user_id', user.id);
      
      if (adminError) throw adminError;
      
      if (!sectorAdmins || sectorAdmins.length === 0) {
        // Se não administra nenhum setor, mostrar lista vazia
        setManagedSectors([]);
        return;
      }
      
      // Extrair os IDs dos setores
      const sectorIds = sectorAdmins.map(admin => admin.sector_id);
      
      // Buscar detalhes dos setores
      const { data: sectors, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .in('id', sectorIds)
        .order('name', { ascending: true });
      
      if (sectorsError) throw sectorsError;
      
      setManagedSectors(sectors || []);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role]);

  useEffect(() => {
    fetchManagedSectors();
  }, [fetchManagedSectors]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando setores...</p>
        </div>
      </div>
    );
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/home', icon: 'house' },
    { label: 'Administração Setorial' }
  ];

  return (
    <StandardizedAdminLayout user={user} breadcrumbs={breadcrumbs}>
      <StandardizedPageHeader
        title="Administração Setorial"
        subtitle="Gerencie conteúdos e sistemas dos setores designados a você"
      />

      {managedSectors.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <p className="text-cresol-gray">
            Você ainda não foi designado como administrador de nenhum setor.
          </p>
          <p className="text-cresol-gray mt-2">
            Entre em contato com um administrador para solicitar acesso.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managedSectors.map((sector) => (
            <div key={sector.id} className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{sector.name}</h3>
              <p className="text-gray-600 mb-6">{sector.description || 'Sem descrição'}</p>
              
              <div className="flex flex-col space-y-2">
                <Link 
                  href={`/admin-setor/setores/${sector.id}`}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Gerenciar conteúdo do setor →
                </Link>
                <Link 
                  href={`/admin-setor/setores/${sector.id}/sistemas`}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Gerenciar sistemas do setor →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </StandardizedAdminLayout>
  );
}

export default function AdminSetorDashboard() {
  return (
    <AuthGuard 
      requireRole="sector_admin"
      loadingMessage={LOADING_MESSAGES.sectors}
    >
      <AdminSetorDashboardContent />
    </AuthGuard>
  );
} 