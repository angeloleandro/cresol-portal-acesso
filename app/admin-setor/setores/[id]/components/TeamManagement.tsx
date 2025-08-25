'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import OptimizedImage from '@/app/components/OptimizedImage';
import type { TeamMember as SectorTeamMember, UserProfile as Profile } from '../types/sector.types';

interface TeamManagementProps {
  sectorId: string;
  sectorName: string;
}

export function TeamManagement({ sectorId, sectorName }: TeamManagementProps) {
  const supabase = useSupabaseClient();
  const [teamMembers, setTeamMembers] = useState<SectorTeamMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [position, setPosition] = useState('');
  const [editingMember, setEditingMember] = useState<SectorTeamMember | null>(null);
  const [editPosition, setEditPosition] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [currentUserAdminVisibility, setCurrentUserAdminVisibility] = useState<boolean | null>(null);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
    checkAdminVisibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectorId]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      setAvailableUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/admin/sector-team?sector_id=${sectorId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTeamMembers(data.teamMembers || []);
      } else {
        console.error('Erro ao buscar equipe:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminVisibility = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is a sector admin for this sector
      const { data: adminData, error } = await supabase
        .from('sector_admins')
        .select('show_as_team_member')
        .eq('user_id', user.id)
        .eq('sector_id', sectorId)
        .single();

      if (!error && adminData) {
        setCurrentUserAdminVisibility(adminData.show_as_team_member);
      }
    } catch (error) {
      console.error('Erro ao verificar visibilidade do admin:', error);
    }
  };

  const toggleAdminVisibility = async () => {
    setUpdatingVisibility(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newVisibility = !currentUserAdminVisibility;

      const { error } = await supabase
        .from('sector_admins')
        .update({ 
          show_as_team_member: newVisibility,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('sector_id', sectorId);

      if (error) throw error;

      setCurrentUserAdminVisibility(newVisibility);
      await fetchTeamMembers(); // Refresh the team list
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error);
      alert('Erro ao atualizar visibilidade. Tente novamente.');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const searchUsers = async () => {
    setSearchingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, position, role')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      // Filter out users already in team
      const memberIds = teamMembers.map(m => m.user_id);
      const filtered = data?.filter(user => !memberIds.includes(user.id)) || [];
      setAvailableUsers(filtered);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setAvailableUsers([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    try {
      const response = await fetch('/api/admin/sector-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          sector_id: sectorId,
          position: position || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchTeamMembers();
        setShowAddModal(false);
        setSelectedUserId('');
        setPosition('');
        setSearchTerm('');
        setAvailableUsers([]);
      } else {
        // Map response status to specific messages
        const errorMessage = (() => {
          if (response.status === 400) return 'Dados inválidos. Verifique as informações e tente novamente.';
          if (response.status === 401) return 'Você não tem permissão para adicionar membros.';
          if (response.status === 403) return 'Acesso negado. Entre em contato com o administrador.';
          if (response.status === 404) return 'Usuário não encontrado.';
          if (response.status === 409) return 'Este usuário já é membro da equipe.';
          if (data?.error) return data.error;
          if (data?.message) return data.message;
          return 'Erro ao adicionar membro. Tente novamente mais tarde.';
        })();
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
      alert(isNetworkError 
        ? 'Erro de conexão. Verifique sua internet e tente novamente.' 
        : `Erro inesperado ao adicionar membro: ${error instanceof Error ? error.message : 'Tente novamente.'}`
      );
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      const response = await fetch('/api/admin/sector-team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: editingMember.id,
          position: editPosition || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchTeamMembers();
        setEditingMember(null);
        setEditPosition('');
      } else {
        // Map response status to specific messages
        const errorMessage = (() => {
          if (response.status === 400) return 'Dados inválidos. Verifique as informações e tente novamente.';
          if (response.status === 401) return 'Você não tem permissão para atualizar membros.';
          if (response.status === 403) return 'Acesso negado. Entre em contato com o administrador.';
          if (response.status === 404) return 'Membro não encontrado.';
          if (response.status === 409) return 'Conflito ao atualizar. Tente novamente.';
          if (data?.error) return data.error;
          if (data?.message) return data.message;
          return 'Erro ao atualizar membro. Tente novamente mais tarde.';
        })();
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
      alert(isNetworkError 
        ? 'Erro de conexão. Verifique sua internet e tente novamente.' 
        : `Erro inesperado ao atualizar membro: ${error instanceof Error ? error.message : 'Tente novamente.'}`
      );
    }
  };

  const handleRemoveMember = async (memberId: string, isFromSubsector: boolean) => {
    if (isFromSubsector) {
      alert('Membros de subsetores não podem ser removidos diretamente. Remova-os do subsetor correspondente.');
      return;
    }

    if (!confirm('Tem certeza que deseja remover este membro da equipe?')) return;

    try {
      const response = await fetch(`/api/admin/sector-team?member_id=${memberId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        await fetchTeamMembers();
      } else {
        // Map response status to specific messages
        const errorMessage = (() => {
          if (response.status === 400) return 'Requisição inválida. Tente novamente.';
          if (response.status === 401) return 'Você não tem permissão para remover membros.';
          if (response.status === 403) return 'Acesso negado. Entre em contato com o administrador.';
          if (response.status === 404) return 'Membro não encontrado.';
          if (response.status === 409) return 'Não é possível remover este membro devido a dependências existentes.';
          if (data?.error) return data.error;
          if (data?.message) return data.message;
          return 'Erro ao remover membro. Tente novamente mais tarde.';
        })();
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
      alert(isNetworkError 
        ? 'Erro de conexão. Verifique sua internet e tente novamente.' 
        : `Erro inesperado ao remover membro: ${error instanceof Error ? error.message : 'Tente novamente.'}`
      );
    }
  };

  const adminMembers = teamMembers.filter(m => (m as any).is_admin === true);
  const directMembers = teamMembers.filter(m => !m.is_from_subsector && !(m as any).is_admin);
  const subsectorMembers = teamMembers.filter(m => m.is_from_subsector && !(m as any).is_admin);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciar Equipe do Setor</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          <FiUserPlus className="h-4 w-4" />
          Adicionar Membro
        </button>
      </div>

      {/* Controle de Visibilidade do Admin */}
      {currentUserAdminVisibility !== null && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Visibilidade como Administrador</h3>
              <p className="text-sm text-blue-700 mt-1">
                {currentUserAdminVisibility 
                  ? 'Você está visível como membro da equipe do setor'
                  : 'Você está oculto da lista de membros da equipe'}
              </p>
            </div>
            <button
              onClick={toggleAdminVisibility}
              disabled={updatingVisibility}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                updatingVisibility 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : currentUserAdminVisibility
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {updatingVisibility ? 'Atualizando...' : (currentUserAdminVisibility ? 'Ocultar-me' : 'Mostrar-me')}
            </button>
          </div>
        </div>
      )}

      {/* Administradores do Setor */}
      {adminMembers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <HiUserGroup className="h-5 w-5 text-blue-600" />
            Administradores do Setor
          </h3>
          
          <div className="space-y-3">
            {adminMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                    {member.profiles?.avatar_url ? (
                      <OptimizedImage
                        src={member.profiles.avatar_url}
                        alt={member.profiles?.full_name || 'Admin'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-600/10 text-blue-600">
                        <HiUserGroup className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.profiles?.full_name || 'Nome não disponível'}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      Administrador do Setor
                    </p>
                    {member.profiles?.email && (
                      <p className="text-xs text-gray-500">{member.profiles.email}</p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Admin
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Membros Diretos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
          <HiUserGroup className="h-5 w-5 text-primary" />
          Membros Diretos do Setor
        </h3>
        
        {directMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum membro direto cadastrado
          </p>
        ) : (
          <div className="space-y-3">
            {directMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                    {member.profiles?.avatar_url ? (
                      <OptimizedImage
                        src={member.profiles.avatar_url}
                        alt={member.profiles?.full_name || 'Membro'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        <HiUserGroup className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.profiles?.full_name || 'Nome não disponível'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.position || member.profiles?.position || 'Membro da equipe'}
                    </p>
                    {member.profiles?.email && (
                      <p className="text-xs text-gray-500">{member.profiles.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setEditPosition(member.position || '');
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.id, false)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Membros de Subsetores */}
      {subsectorMembers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <HiUserGroup className="h-5 w-5 text-secondary" />
            Membros dos Subsetores
          </h3>
          
          <div className="space-y-3">
            {subsectorMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                    {member.profiles?.avatar_url ? (
                      <OptimizedImage
                        src={member.profiles.avatar_url}
                        alt={member.profiles?.full_name || 'Membro'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary/10 text-secondary">
                        <HiUserGroup className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.profiles?.full_name || 'Nome não disponível'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.position || member.profiles?.position || 'Membro da equipe'}
                    </p>
                    {member.subsectors && (
                      <p className="text-xs text-secondary font-medium">
                        Subsetor: {member.subsectors.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 italic">
                  Via subsetor
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Adicionar Membro */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Membro à Equipe</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar Usuário
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome ou email..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                {searchingUsers && (
                  <p className="text-sm text-gray-500 mt-2">Buscando...</p>
                )}
                
                {availableUsers.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                    {availableUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSearchTerm(user.full_name || user.email);
                          setAvailableUsers([]);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{user.full_name || 'Sem nome'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo/Função (opcional)
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ex: Coordenador, Analista..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUserId('');
                  setPosition('');
                  setSearchTerm('');
                  setAvailableUsers([]);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Membro */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Membro</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membro
                </label>
                <p className="text-gray-900">{editingMember.profiles?.full_name || 'Nome não disponível'}</p>
                <p className="text-sm text-gray-600">{editingMember.profiles?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo/Função
                </label>
                <input
                  type="text"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  placeholder="Ex: Coordenador, Analista..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingMember(null);
                  setEditPosition('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateMember}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}