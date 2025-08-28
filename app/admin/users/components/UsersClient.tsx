'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { StandardizedButton } from '@/app/components/admin';
import AdminHeader from '@/app/components/AdminHeader';
import { useAlert } from '@/app/components/alerts';
import Breadcrumb from '@/app/components/Breadcrumb';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { createClient } from '@/lib/supabase/client';
import { useUsers, useUpdateUser } from '@/lib/react-query/supabase-queries';

import RoleModal from './RoleModal';
import UserFilters from './UserFilters';
import UserForm from './UserForm';
import UserList from './UserList';

import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileUser {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  position_id?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  updated_at: string | null;
  avatar_url?: string;
}

interface WorkLocation {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
  description?: string;
  department?: string;
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

interface UsersClientProps {
  initialUsers: ProfileUser[];
  initialWorkLocations: WorkLocation[];
  initialPositions: Position[];
  initialSectors: Sector[];
  initialSubsectors: Subsector[];
}

export default function UsersClient({
  initialUsers,
  initialWorkLocations,
  initialPositions,
  initialSectors,
  initialSubsectors,
}: UsersClientProps) {
  const router = useRouter();
  const { showError, auth } = useAlert();
  
  // Usar React Query com dados iniciais
  const { data: users = initialUsers, isLoading } = useUsers();
  const updateUserMutation = useUpdateUser();
  
  const [workLocations] = useState<WorkLocation[]>(initialWorkLocations);
  const [positions] = useState<Position[]>(initialPositions);
  const [sectors] = useState<Sector[]>(initialSectors);
  const [subsectors, setSubsectors] = useState<Subsector[]>(initialSubsectors);
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

  const fetchUserSectors = useCallback(async (userId: string) => {
    try {
      const { data, error } = await createClient()
        .from('sector_admins')
        .select('sector_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const sectorIds = data?.map((item: { sector_id: string }) => item.sector_id) || [];
      setUserSectors(prev => ({
        ...prev,
        [userId]: sectorIds
      }));
    } catch (error) {
      // Silently handle
    }
  }, []);

  const fetchUserSubsectors = useCallback(async (userId: string) => {
    try {
      const { data, error } = await createClient()
        .from('subsector_admins')
        .select('subsector_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const subsectorIds = data?.map((item: { subsector_id: string }) => item.subsector_id) || [];
      setUserSubsectors(prev => ({
        ...prev,
        [userId]: subsectorIds
      }));
    } catch (error) {
      // Silently handle
    }
  }, []);

  const fetchSubsectors = async (sectorId?: string) => {
    try {
      let query = createClient()
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
      // Silently handle
    }
  };

  // Carregamento das associações de usuários após dados iniciais
  useEffect(() => {
    const loadUserAssociations = async () => {
      // Carregar associações apenas para usuários que precisam
      const fetchPromises = initialUsers.map(userProfile => {
        if (userProfile.role === 'sector_admin') {
          return fetchUserSectors(userProfile.id);
        } else if (userProfile.role === 'subsector_admin') {
          return fetchUserSubsectors(userProfile.id);
        }
        return Promise.resolve();
      });
      
      try {
        await Promise.allSettled(fetchPromises);
      } catch (error) {
        // Silently handle errors - individual failures are already caught
      }
    };

    loadUserAssociations();
  }, [initialUsers, fetchUserSectors, fetchUserSubsectors]); // Incluir dependencies necessárias

  const handleLogout = async () => {
    await createClient().auth.signOut();
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

  if (isLoading) {
    return <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.users} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Usuários' }
            ]} 
          />
        </div>

        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-1">Gestão de Usuários</h1>
                <p className="text-sm text-gray-600">Gerencie os usuários do portal.</p>
              </div>
              
              <StandardizedButton
                type="button"
                onClick={() => setShowForm(!showForm)}
                variant={showForm ? 'secondary' : 'primary'}
                className="mt-3 md:mt-0"
              >
                {showForm ? 'Cancelar' : 'Adicionar Usuário'}
              </StandardizedButton>
            </div>
          </div>
        </div>
        
        {showForm && (
          <UserForm 
            workLocations={workLocations}
            positions={positions}
            onSuccess={() => {
              setShowForm(false);
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
          positions={positions}
          sectors={sectors}
          subsectors={subsectors}
          userSectors={userSectors}
          userSubsectors={userSubsectors}
          onUserUpdate={() => {}} // React Query handles updates
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
          }}
          onRefreshSubsectors={fetchSubsectors}
        />
      )}
    </div>
  );
}