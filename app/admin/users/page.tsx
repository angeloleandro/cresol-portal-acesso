'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import AdminHeader from '@/app/components/AdminHeader';
import UserFilters from './components/UserFilters';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import RoleModal from './components/RoleModal';

interface ProfileUser {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  created_at: string;
  avatar_url?: string;
}

interface WorkLocation {
  id: string;
  name: string;
}

interface Sector {
  id: string;
  name: string;
}

interface Subsector {
  id: string;
  name: string;
  sector_id: string;
}

export default function UsersManagement() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  // Estados do modal de role
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalUserId, setRoleModalUserId] = useState<string | null>(null);
  const [roleModalSelectedRole, setRoleModalSelectedRole] = useState<'user' | 'sector_admin' | 'subsector_admin' | 'admin'>('user');
  
  // Estados para associações de usuários
  const [userSectors, setUserSectors] = useState<Record<string, string[]>>({});
  const [userSubsectors, setUserSubsectors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Só executar no lado do cliente
    if (typeof window === 'undefined') return;
    
    const checkUser = async () => {
      try {
        const { data } = await getSupabaseClient().auth.getUser();
        if (!data.user) {
          router.replace('/login');
          return;
        }
        
        const { data: profile } = await getSupabaseClient()
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (!profile || profile.role !== 'admin') {
          router.replace('/home');
          return;
        }
        
        setUser(data.user);
        await Promise.all([
          fetchUsers(),
          fetchWorkLocations(),
          fetchSectors(),
          fetchSubsectors()
        ]);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        router.replace('/login');
      }
    };

    checkUser();
  }, [router]);

  const handleAuthError = (error: string) => {
    if (error.includes('JWT') || error.includes('token') || error.includes('unauthorized')) {
      alert('Sua sessão expirou. Redirecionando para o login...');
      router.replace('/login');
      return true;
    }
    return false;
  };

  const fetchUsers = async () => {
    try {
      // Só executar no lado do cliente
      if (typeof window === 'undefined') return;
      
      // Primeiro verificar se há uma sessão válida
      const { data: { session } } = await getSupabaseClient().auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      // Query específica com campos necessários (removendo created_at que não existe)
      const { data, error } = await getSupabaseClient()
        .from('profiles')
        .select('id, full_name, email, position, work_location_id, role, avatar_url')
        .order('full_name');
      
      if (error) {
        console.error('Erro detalhado do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      if (data) {
        // Mapear os dados para garantir compatibilidade de tipos
        const mappedUsers: ProfileUser[] = data.map(profile => ({
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          position: profile.position,
          work_location_id: profile.work_location_id,
          role: profile.role,
          avatar_url: profile.avatar_url,
          created_at: new Date().toISOString() // Valor padrão já que o campo não existe
        }));
        
        setUsers(mappedUsers);
        
        // Buscar associações para cada usuário
        for (const userProfile of mappedUsers) {
          if (userProfile.role === 'sector_admin') {
            await fetchUserSectors(userProfile.id);
          } else if (userProfile.role === 'subsector_admin') {
            await fetchUserSubsectors(userProfile.id);
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      if (!handleAuthError(errorMessage)) {
        alert(`Erro ao buscar usuários: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkLocations = async () => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('work_locations')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      if (data) setWorkLocations(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      // Apenas log em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar locais de trabalho:', errorMessage);
      }
    }
  };

  const fetchSectors = async () => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('sectors')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      if (data) setSectors(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      // Apenas log em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar setores:', errorMessage);
      }
    }
  };

  const fetchSubsectors = async (sectorId?: string) => {
    try {
      let query = getSupabaseClient()
        .from('subsectors')
        .select('id, name, sector_id')
        .order('name');
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      if (data) setSubsectors(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      // Apenas log em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar sub-setores:', errorMessage);
      }
    }
  };

  const fetchUserSectors = async (userId: string) => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('sector_admins')
        .select('sector_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const sectorIds = data?.map(item => item.sector_id) || [];
      setUserSectors(prev => ({
        ...prev,
        [userId]: sectorIds
      }));
    } catch (error) {
      console.error('Erro ao buscar setores do usuário:', error);
    }
  };

  const fetchUserSubsectors = async (userId: string) => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('subsector_admins')
        .select('subsector_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const subsectorIds = data?.map(item => item.subsector_id) || [];
      setUserSubsectors(prev => ({
        ...prev,
        [userId]: subsectorIds
      }));
    } catch (error) {
      console.error('Erro ao buscar sub-setores do usuário:', error);
    }
  };

  const handleLogout = async () => {
    await getSupabaseClient().auth.signOut();
    router.replace('/login');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesLocation = locationFilter === 'all' || user.work_location_id === locationFilter;
    
    return matchesSearch && matchesRole && matchesLocation;
  });

  if (loading && !users.length) {
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
      <AdminHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b border-cresol-gray-light pb-4 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Gestão de Usuários</h2>
            <p className="text-cresol-gray mb-4 md:mb-0">Gerencie os usuários do portal.</p>
          </div>
          
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            {showForm ? 'Cancelar' : 'Adicionar Usuário'}
          </button>
        </div>
        
        {showForm && (
          <UserForm 
            workLocations={workLocations}
            onSuccess={() => {
              setShowForm(false);
              fetchUsers();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
        
        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          workLocations={workLocations}
          totalUsers={users.length}
          filteredCount={filteredUsers.length}
        />
        
        <UserList
          users={filteredUsers}
          workLocations={workLocations}
          sectors={sectors}
          subsectors={subsectors}
          userSectors={userSectors}
          userSubsectors={userSubsectors}
          onUserUpdate={fetchUsers}
          onOpenRoleModal={(userId, role) => {
            setRoleModalUserId(userId);
            setRoleModalSelectedRole(role);
            setShowRoleModal(true);
          }}
          onRefreshUserSectors={fetchUserSectors}
          onRefreshUserSubsectors={fetchUserSubsectors}
        />
      </main>

      {showRoleModal && roleModalUserId && (
        <RoleModal
          userId={roleModalUserId}
          currentRole={roleModalSelectedRole}
          sectors={sectors}
          subsectors={subsectors}
          userSectors={userSectors[roleModalUserId] || []}
          userSubsectors={userSubsectors[roleModalUserId] || []}
          onClose={() => {
            setShowRoleModal(false);
            setRoleModalUserId(null);
          }}
          onSuccess={() => {
            setShowRoleModal(false);
            setRoleModalUserId(null);
            fetchUsers();
          }}
          onRefreshSubsectors={fetchSubsectors}
        />
      )}
    </div>
  );
}