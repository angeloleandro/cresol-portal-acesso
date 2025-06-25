'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import UserEditModal from './UserEditModal';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  created_at?: string;
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

interface UserListProps {
  users: UserProfile[];
  workLocations: WorkLocation[];
  sectors: Sector[];
  subsectors: Subsector[];
  userSectors: Record<string, string[]>;
  userSubsectors: Record<string, string[]>;
  onUserUpdate: () => void;
  onOpenRoleModal: (userId: string, role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user') => void;
  onRefreshUserSectors: (userId: string) => void;
  onRefreshUserSubsectors: (userId: string) => void;
}

export default function UserList({
  users,
  workLocations,
  sectors,
  subsectors,
  userSectors,
  userSubsectors,
  onUserUpdate,
  onOpenRoleModal,
  onRefreshUserSectors,
  onRefreshUserSubsectors
}: UserListProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleDeleteUser = async (userId: string, userEmail: string, userFullName: string) => {
    setDeletingUserId(userId);
    try {
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) {
        throw new Error('Usuário não encontrado');
      }

      const { data: accessRequests, error: requestError } = await supabase
        .from('access_requests')
        .select('id, status')
        .eq('email', userToDelete.email);
      
      if (requestError) {
        throw new Error(`Erro ao verificar solicitações: ${requestError.message}`);
      }

      if (accessRequests && accessRequests.length > 0) {
        for (const request of accessRequests) {
          if (request.status !== 'rejected') {
            const { data: { session } } = await supabase.auth.getSession();
            const adminToken = session?.access_token;
            
            if (!adminToken) {
              throw new Error('Sessão de administrador inválida');
            }
            
            const response = await fetch('/api/admin/approve-access-request', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accessRequestId: request.id,
                adminUserId: userId,
                adminToken: adminToken,
                editedUserData: {
                  email: userToDelete.email,
                  full_name: userToDelete.full_name,
                  position: userToDelete.position || '',
                  work_location_id: userToDelete.work_location_id || '',
                },
                targetStatus: 'rejected',
              }),
            });

            if (!response.ok) {
              const result = await response.json();
              throw new Error(`Erro ao rejeitar solicitação: ${result.error || 'Erro desconhecido'}`);
            }
          }
        }
      } else {
        const { error: createError } = await supabase
          .from('access_requests')
          .insert({
            email: userToDelete.email,
            full_name: userToDelete.full_name,
            position: userToDelete.position,
            work_location_id: userToDelete.work_location_id,
            status: 'rejected',
            processed_by: userId,
          });
        
        if (createError) {
          throw new Error(`Erro ao criar registro de rejeição: ${createError.message}`);
        }
      }

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (deleteError) {
        throw new Error(`Erro ao deletar usuário: ${deleteError.message}`);
      }

      alert('Usuário removido com sucesso e acesso bloqueado');
      onUserUpdate();
    } catch (error: unknown) {
      console.error('Erro ao deletar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao deletar usuário: ${errorMessage}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-cresol-gray-light p-8 text-center">
        <p className="text-cresol-gray">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-cresol-gray-light overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex items-center p-4 border-b border-cresol-gray-light">
              <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gray-100 border border-cresol-gray-light mr-3">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={`Avatar de ${user.full_name}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-cresol-gray truncate">{user.full_name}</h3>
                <p className="text-xs text-cresol-gray-dark truncate">{user.email}</p>
              </div>
              <div>
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary min-w-[90px] justify-center">
                  {user.role === 'admin' ? 'Administrador' : 
                   user.role === 'sector_admin' ? 'Admin. Setorial' : 
                   user.role === 'subsector_admin' ? 'Admin. Subsetorial' : 'Usuário'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex">
                  <span className="text-xs font-medium text-cresol-gray-dark w-28">Cargo:</span>
                  <span className="text-xs text-cresol-gray flex-1">{user.position || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs font-medium text-cresol-gray-dark w-28">Local:</span>
                  <span className="text-xs text-cresol-gray flex-1">
                    {workLocations.find(loc => loc.id === user.work_location_id)?.name || '-'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-cresol-gray-light flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="text-primary text-sm hover:underline"
                  onClick={() => setEditingUserId(user.id)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.full_name}? Isso bloqueará o acesso permanentemente.`)) {
                      handleDeleteUser(user.id, user.email, user.full_name);
                    }
                  }}
                  disabled={deletingUserId === user.id}
                >
                  {deletingUserId === user.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => onOpenRoleModal(user.id, user.role)}
                className="text-xs border border-cresol-gray-light rounded py-1 px-2 bg-white hover:bg-gray-50"
              >
                {user.role === 'admin' ? 'Administrador' : 
                 user.role === 'sector_admin' ? 'Admin. Setorial' : 
                 user.role === 'subsector_admin' ? 'Admin. Subsetorial' : 'Usuário'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingUserId && (
        <UserEditModal
          user={users.find(u => u.id === editingUserId)!}
          workLocations={workLocations}
          sectors={sectors}
          subsectors={subsectors}
          userSectors={userSectors[editingUserId] || []}
          userSubsectors={userSubsectors[editingUserId] || []}
          onClose={() => setEditingUserId(null)}
          onSave={onUserUpdate}
          onRefreshUserSectors={onRefreshUserSectors}
          onRefreshUserSubsectors={onRefreshUserSubsectors}
        />
      )}
    </>
  );
} 