'use client';

import { useState } from 'react';

import { useAlert } from '@/app/components/alerts';
import OptimizedImage from '@/app/components/OptimizedImage';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal'; // Importe o modal

import UserEditModal from './UserEditModal';


interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  position_id?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
  created_at?: string;
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
  description?: string;
}

interface Subsector {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
}

interface UserListProps {
  users: UserProfile[];
  workLocations: WorkLocation[];
  positions: Position[];
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
  positions,
  sectors,
  subsectors,
  userSectors,
  userSubsectors,
  onUserUpdate,
  onOpenRoleModal,
  onRefreshUserSectors,
  onRefreshUserSubsectors
}: UserListProps) {
  const alert = useAlert();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const handleDeleteUser = async (userId: string, userEmail: string, userFullName: string) => {
    setDeletingUserId(userId);
    try {
      // Excluir usuário usando a API
      const response = await fetch('/api/admin/delete-user', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao excluir usuário');
      }

      alert.users.deleted();
      onUserUpdate(); // Atualizar lista de usuários
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert.showError('Erro ao excluir usuário', errorMessage);
    } finally {
      setDeletingUserId(null);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const openDeleteModal = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete.id, userToDelete.email, userToDelete.full_name);
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200/60 hover:border-gray-200 transition-colors duration-150 p-8 text-center">
        <p className="text-cresol-gray">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 overflow-hidden transition-colors duration-150">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-cresol-gray-light flex-shrink-0">
                  {user.avatar_url ? (
                    <OptimizedImage
                      src={user.avatar_url}
                      alt={user.full_name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      quality={80}
                      fallbackText="Avatar"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cresol-gray-dark text-lg font-semibold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name}
                  </h3>
                  <p className="text-xs text-cresol-gray truncate">
                    {user.email}
                  </p>
                  {user.position_id && (() => {
                    const userPosition = positions.find(pos => pos.id === user.position_id);
                    return userPosition && (
                      <p className="text-xs text-cresol-gray-dark truncate">
                        {userPosition.name}
                        {userPosition.department && ` - ${userPosition.department}`}
                      </p>
                    );
                  })()}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cresol-gray">Role:</span>
                  <span className="text-xs px-2 py-1 bg-cresol-gray-light text-cresol-gray-dark rounded-sm">
                    {user.role}
                  </span>
                </div>
                
                {user.work_location_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-cresol-gray">Local:</span>
                    <span className="text-xs text-cresol-gray-dark">
                      {workLocations.find(loc => loc.id === user.work_location_id)?.name || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
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
                  onClick={() => openDeleteModal(user)}
                  disabled={deletingUserId === user.id}
                >
                  {deletingUserId === user.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
              
              <button
                type="button"
                className="text-xs bg-primary hover:bg-primary-dark text-white px-2 py-1 rounded-md transition-colors duration-150"
                onClick={() => onOpenRoleModal(user.id, user.role)}
              >
                Gerenciar Role
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingUserId && (
        <UserEditModal
          user={users.find(u => u.id === editingUserId)!}
          workLocations={workLocations}
          positions={positions}
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

      {userToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Exclusão de Usuário"
          message={`Atenção! Você está prestes a remover o usuário <strong>${userToDelete.full_name}</strong>, revogando permanentemente seu acesso. Para confirmar, digite o e-mail do usuário (<strong>${userToDelete.email}</strong>) no campo abaixo.`}
          isLoading={deletingUserId === userToDelete.id}
          requiresConfirmationInput={true}
          confirmationText={userToDelete.email}
          confirmationLabel={`Digite "${userToDelete.email}" para confirmar`}
          confirmButtonText="Excluir Usuário"
        />
      )}
    </>
  );
} 