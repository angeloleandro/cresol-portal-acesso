'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface SectorAdmin {
  id: string;
  user_id: string;
  sector_id: string;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'sector_admin' | 'admin';
}

export default function AdminSetorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [managedSectors, setManagedSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar os setores que o administrador gerencia
  const fetchManagedSectors = useCallback(async (userId: string) => {
    try {
      // Para admins normais, trazer todos os setores
      if (user?.role === 'admin') {
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
        .eq('user_id', userId);
      
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
      console.error('Erro ao buscar setores:', error);
    }
  }, [user?.role]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Verificar se o usuário está autenticado
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.error('Erro ao obter usuário:', userError);
          router.replace('/login');
          return;
        }

        // Verificar o papel do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, role')
          .eq('id', userData.user.id)
          .single();
        
        if (profileError || !profileData) {
          console.error('Erro ao obter perfil:', profileError);
          router.replace('/login');
          return;
        }

        // Garantir que o usuário é um administrador de setor
        if (profileData.role !== 'sector_admin' && profileData.role !== 'admin') {
          console.warn('Usuário não é administrador de setor:', profileData.role);
          router.replace('/dashboard');
          return;
        }

        setUser(profileData as AdminUser);
        await fetchManagedSectors(userData.user.id);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, fetchManagedSectors]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-10 w-24 mr-4">
              <Image 
                src="/logo-cresol.png" 
                alt="Logo Cresol" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Painel Admin Setorial</h1>
          </div>
          
          <div className="flex items-center">
            <Link href="/dashboard" className="text-sm text-gray-600 mr-4 hover:text-primary">
              Dashboard
            </Link>
            <span className="text-sm text-gray-600 mr-4">
              Olá, {user?.full_name || user?.email}
            </span>
            <button 
              onClick={handleLogout}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary">Setores sob sua gestão</h2>
          <p className="text-cresol-gray mt-1">
            Gerencie conteúdos e sistemas dos setores designados a você.
          </p>
        </div>

        {managedSectors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
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
              <div key={sector.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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
      </main>
    </div>
  );
} 