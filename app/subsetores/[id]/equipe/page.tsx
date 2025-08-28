'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';

import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';
import { useAlert } from '@/app/components/alerts';
import { logger } from '@/lib/production-logger';
import { ChakraSelect, ChakraSelectOption } from '@/app/components/forms';
import OptimizedImage from '@/app/components/OptimizedImage';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import Breadcrumb from '../../../components/Breadcrumb';
import { Icon } from '../../../components/icons';


interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  position?: string;
  work_location_id?: string;
  role: 'admin' | 'sector_admin' | 'subsector_admin' | 'user';
}

interface TeamMember {
  id: string;
  user_id: string;
  subsector_id: string;
  position?: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    position?: string;
    work_location_id?: string;
    work_locations?: { name: string };
    phone?: string;
    bio?: string;
  };
}

interface Subsector {
  id: string;
  name: string;
  description?: string;
  sectors: { id: string; name: string } | { id: string; name: string }[];
}

function SubsectorTeamPageContent() {
  const router = useRouter();
  const params = useParams();
  const subsectorId = params?.id as string;
  const { user, profile } = useAuth();
  const { showSuccess, showError, showWarning, subsectors } = useAlert();
  
  const [subsector, setSubsector] = useState<Subsector | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<{id: string, name: string, department?: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  
  // Estados para modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberPositionId, setMemberPositionId] = useState('');
  const [memberDescription, setMemberDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Opções para o select de posições (ChakraSelect)
  const positionOptions = useMemo((): ChakraSelectOption[] => [
    { value: '', label: 'Selecione um cargo' },
    ...positions.map(position => ({
      value: position.id,
      label: position.department 
        ? `${position.name} - ${position.department}`
        : position.name
    }))
  ], [positions]);

  const fetchSubsector = useCallback(async () => {
    const { data, error } = await supabase
      .from('subsectors')
      .select(`
        id,
        name,
        description,
        sectors!inner(id, name)
      `)
      .eq('id', subsectorId)
      .single();

    if (error) {
      logger.error('Erro ao buscar Subsetor', error, { subsectorId });
    } else {
      setSubsector(data);
    }
  }, [subsectorId]);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/subsector-team?subsector_id=${subsectorId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTeamMembers(data.teamMembers || []);
      } else {
        logger.error('Erro ao buscar equipe', data.error, { subsectorId });
      }
    } catch (error) {
      logger.error('Erro ao buscar equipe', error, { subsectorId });
    }
  }, [subsectorId]);

  useEffect(() => {
    const checkPermissionsAndFetchData = async () => {
      if (!user || !profile) return;

      // Verificar permissões
      // Usuário pode editar se for admin geral, admin do setor ou admin do Subsetor
      if (profile.role === 'admin') {
        setCanEdit(true);
      } else {
        // Verificar se é admin do setor ou Subsetor
        const [sectorAdmin, subsectorAdmin] = await Promise.all([
          supabase
            .from('sector_admins')
            .select('id')
            .eq('user_id', user.id),
          supabase
            .from('subsector_admins')
            .select('id')
            .eq('user_id', user.id)
            .eq('subsector_id', subsectorId)
        ]);

        if (sectorAdmin.data?.length || subsectorAdmin.data?.length) {
          setCanEdit(true);
        }
      }

      await Promise.all([
        fetchSubsector(),
        fetchTeamMembers(),
        fetchAllUsers(),
        fetchPositions()
      ]);
      
      setLoading(false);
    };

    if (subsectorId && user && profile) {
      checkPermissionsAndFetchData();
    }
  }, [subsectorId, user, profile, fetchSubsector, fetchTeamMembers]);

  const fetchAllUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        position,
        work_location_id,
        role
      `)
      .order('full_name');

    if (error) {
      logger.error('Erro ao buscar usuários', error, { context: 'loadUsers' });
    } else {
      setAllUsers(data || []);
    }
  };

  const fetchPositions = async () => {
    const { data, error } = await supabase
      .from('positions')
      .select('id, name, department')
      .order('name');

    if (error) {
      logger.error('Erro ao buscar cargos', error, { context: 'loadPositions' });
    } else {
      setPositions(data || []);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !subsectorId) {
      showWarning('Selecione um usuário');
      return;
    }

    try {
      // Buscar o nome da position pelo ID se selecionado
      let positionName = '';
      if (memberPositionId) {
        const selectedPosition = positions.find(pos => pos.id === memberPositionId);
        positionName = selectedPosition ? selectedPosition.name : '';
      }

      const response = await fetch('/api/admin/subsector-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          subsector_id: subsectorId,
          position: positionName
        })
      });

      const data = await response.json();

      if (response.ok) {
        subsectors.teamUpdated();
        setShowAddModal(false);
        setSelectedUserId('');
        setMemberPositionId('');
        fetchTeamMembers();
      } else {
        showError('Erro ao adicionar membro', data.error);
      }
    } catch (error) {
      logger.error('Erro ao adicionar membro', error, { 
        userId: selectedUserId, 
        positionId: memberPositionId,
        subsectorId 
      });
      showError('Erro ao adicionar membro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      // Buscar o nome da position pelo ID se selecionado
      let positionName = '';
      if (memberPositionId) {
        const selectedPosition = positions.find(pos => pos.id === memberPositionId);
        positionName = selectedPosition ? selectedPosition.name : '';
      }

      const response = await fetch('/api/admin/subsector-team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: editingMember.id,
          position: positionName
        })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Cargo atualizado com sucesso!');
        setShowEditModal(false);
        setEditingMember(null);
        setMemberPositionId('');
        fetchTeamMembers();
      } else {
        showError('Erro ao atualizar cargo', data.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      showError('Erro ao atualizar cargo', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  const handleRemoveMemberClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleRemoveMemberConfirm = async () => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/subsector-team?member_id=${memberToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchTeamMembers();
        setShowDeleteModal(false);
        setMemberToDelete(null);
        showSuccess('Membro removido da equipe com sucesso!');
      } else {
        showError('Erro ao remover membro', data.error);
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      showError('Erro ao remover membro', 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveMemberCancel = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    // Encontrar o ID da position baseado no nome armazenado
    const positionName = member.position || '';
    const matchingPosition = positions.find(pos => pos.name === positionName);
    setMemberPositionId(matchingPosition ? matchingPosition.id : '');
    setShowEditModal(true);
  };

  const filteredUsers = allUsers.filter(user => {
    const isAlreadyMember = teamMembers.some(member => member.user_id === user.id);
    const matchesSearch = searchTerm === '' || 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return !isAlreadyMember && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-cresol-gray">Carregando equipe...</p>
        </div>
      </div>
    );
  }

  if (!subsector) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-cresol-gray">Subsetor não encontrado</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-primary hover:underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      {/* Header */}
      <header className="bg-white border-b border-cresol-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-cresol-gray hover:text-primary hover:bg-primary/10 rounded-sm-lg transition-colors"
              >
                <Icon name="arrow-left" className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-cresol-gray-dark">
                  Equipe - {subsector.name}
                </h1>
                <p className="text-sm text-cresol-gray">
                  {Array.isArray(subsector.sectors) ? subsector.sectors[0]?.name : subsector.sectors?.name}
                </p>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Icon name="user-add" className="h-4 w-4" />
                Adicionar Membro
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors mr-4"
            title="Voltar"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          
          <div className="flex-1">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/home', icon: 'house' },
                { label: 'Setores', href: '/setores' },
                { label: Array.isArray(subsector?.sectors) ? subsector.sectors[0]?.name || 'Setor' : subsector?.sectors?.name || 'Setor', href: `/setores/${Array.isArray(subsector?.sectors) ? subsector.sectors[0]?.id : subsector?.sectors?.id}` },
                { label: subsector?.name || 'Subsetor', href: `/subsetores/${subsectorId}` },
                { label: 'Equipe' }
              ]} 
            />
          </div>
        </div>

        {/* Descrição do Subsetor */}
        {subsector.description && (
          <div className="bg-white rounded-lg border border-cresol-gray-light p-6 mb-8">
            <div className="flex items-center mb-3">
              <Icon name="building-2" className="h-5 w-5 text-secondary mr-2" />
              <h2 className="text-lg font-semibold text-cresol-gray-dark">Sobre o Subsetor</h2>
            </div>
            <p className="text-cresol-gray">{subsector.description}</p>
          </div>
        )}

        {/* Equipe */}
        <div className="bg-white rounded-lg border border-cresol-gray-light">
          <div className="p-6 border-b border-cresol-gray-light">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon name="user-group" className="h-6 w-6 text-primary mr-3" />
                <div>
                  <h2 className="text-xl font-semibold text-cresol-gray-dark">
                    Equipe ({teamMembers.length} membros)
                  </h2>
                  <p className="text-sm text-cresol-gray">
                    Colaboradores que fazem parte desta equipe
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="user-group" className="mx-auto h-12 w-12 text-cresol-gray mb-4" />
                <h3 className="text-lg font-medium text-cresol-gray-dark mb-2">
                  Nenhum membro na equipe
                </h3>
                <p className="text-cresol-gray mb-4">
                  {canEdit 
                    ? 'Comece adicionando o primeiro membro da equipe.'
                    : 'Esta equipe ainda não possui membros cadastrados.'
                  }
                </p>
                {canEdit && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Adicionar Primeiro Membro
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map(member => (
                  <div key={member.id} className="border border-cresol-gray-light rounded-lg p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-cresol-gray-light mr-3">
                          {member.profiles.avatar_url ? (
                            <OptimizedImage
                              src={member.profiles.avatar_url}
                              alt={member.profiles.full_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                              <Icon name="user-group" className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-cresol-gray-dark">
                            {member.profiles.full_name}
                          </h3>
                          <p className="text-sm text-cresol-gray">
                            {member.position || member.profiles.position || 'Membro da equipe'}
                          </p>
                        </div>
                      </div>
                      
                      {canEdit && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1 text-cresol-gray hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                            title="Editar cargo"
                          >
                            <Icon name="pencil" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveMemberClick(member)}
                            className="p-1 text-cresol-gray hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                            title="Remover da equipe"
                          >
                            <Icon name="close" className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-cresol-gray">
                      <div className="flex items-center">
                        <Icon name="mail" className="h-4 w-4 mr-2" />
                        <span>{member.profiles.email}</span>
                      </div>
                      {member.profiles.phone && (
                        <div className="flex items-center">
                          <Icon name="phone" className="h-4 w-4 mr-2" />
                          <span>{member.profiles.phone}</span>
                        </div>
                      )}
                      {member.profiles.work_locations?.name && (
                        <div className="flex items-center">
                          <Icon name="map" className="h-4 w-4 mr-2" />
                          <span>{member.profiles.work_locations.name}</span>
                        </div>
                      )}
                      {member.profiles.bio && (
                        <div className="mt-2 pt-2 border-t border-cresol-gray-light">
                          <p className="text-xs text-cresol-gray italic">
                            {member.profiles.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Adicionar Membro */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-cresol-gray-dark mb-4">
                Adicionar Membro à Equipe
              </h3>
              
              {/* Busca */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-cresol-gray-dark mb-2">
                  Buscar Usuário
                </label>
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cresol-gray h-4 w-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-cresol-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Buscar por nome ou email..."
                  />
                </div>
              </div>

              {/* Lista de Usuários */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-cresol-gray-dark mb-2">
                  Selecionar Usuário *
                </label>
                <div className="border border-cresol-gray-light rounded-lg max-h-48 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-cresol-gray">
                      Nenhum usuário disponível
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className={`p-3 border-b border-cresol-gray-light last:border-b-0 cursor-pointer hover:bg-cresol-gray-light/50 ${
                          selectedUserId === user.id ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="flex items-center">
                          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-cresol-gray-light mr-3">
                            {user.avatar_url ? (
                              <OptimizedImage
                                src={user.avatar_url}
                                alt={user.full_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                                <Icon name="user-group" className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-cresol-gray-dark">{user.full_name}</p>
                            <p className="text-sm text-cresol-gray">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cargo na Equipe */}
              <div className="mb-6">
                <ChakraSelect
                  label="Cargo na Equipe (opcional)"
                  options={positionOptions}
                  value={memberPositionId}
                  onChange={(value) => setMemberPositionId(value as string)}
                  placeholder="Selecione um cargo"
                  size="md"
                  variant="outline"
                  fullWidth
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUserId('');
                    setMemberPositionId('');
                    setSearchTerm('');
                  }}
                  className="flex-1 px-4 py-2 border border-cresol-gray-light text-cresol-gray hover:bg-cresol-gray-light/50 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                  className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cargo */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-cresol-gray-dark mb-4">
                Editar Cargo na Equipe
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-cresol-gray mb-2">
                  <strong>{editingMember.profiles.full_name}</strong>
                </p>
              </div>

              <div className="mb-6">
                <ChakraSelect
                  label="Cargo na Equipe"
                  options={positionOptions}
                  value={memberPositionId}
                  onChange={(value) => setMemberPositionId(value as string)}
                  placeholder="Selecione um cargo"
                  size="md"
                  variant="outline"
                  fullWidth
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMember(null);
                    setMemberPositionId('');
                  }}
                  className="flex-1 px-4 py-2 border border-cresol-gray-light text-cresol-gray hover:bg-cresol-gray-light/50 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateMember}
                  className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-md transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação para remover membro */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleRemoveMemberCancel}
        onConfirm={handleRemoveMemberConfirm}
        title="Confirmar Remoção"
        message={`Tem certeza que deseja remover <strong>${memberToDelete?.profiles?.full_name}</strong> da equipe?<br><br>Esta ação não pode ser desfeita e o membro será removido permanentemente da equipe do subsetor.`}
        isLoading={isDeleting}
        confirmButtonText="Remover Membro"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}

export default function SubsectorTeamPage() {
  return (
    <AuthGuard loadingMessage={LOADING_MESSAGES.loading}>
      <SubsectorTeamPageContent />
    </AuthGuard>
  );
}