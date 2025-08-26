'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';

import { useAlert } from '@/app/components/alerts';
import { ChakraSelect, ChakraSelectOption } from '@/app/components/forms';
import OptimizedImage from '@/app/components/OptimizedImage';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
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
  sector_id: string;
  position?: string;
  is_from_subsector: boolean;
  subsector_id?: string;
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
  subsectors?: {
    id: string;
    name: string;
  };
}

interface Sector {
  id: string;
  name: string;
  description?: string;
}

export default function SectorTeamPage() {
  const router = useRouter();
  const params = useParams();
  const sectorId = params?.id as string;
  const { showSuccess, showError, showWarning } = useAlert();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sector, setSector] = useState<Sector | null>(null);
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

  const fetchSector = useCallback(async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name, description')
      .eq('id', sectorId)
      .single();

    if (error) {
      console.error('Erro ao buscar setor:', error);
    } else {
      setSector(data);
    }
  }, [sectorId]);

  const fetchTeamMembers = useCallback(async () => {
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
    }
  }, [sectorId]);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setCurrentUser(userData.user);

      // Verificar permissões
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      // Usuário pode editar se for admin geral ou admin do setor
      if (profile?.role === 'admin') {
        setCanEdit(true);
      } else if (profile?.role === 'sector_admin') {
        // Verificar se é admin deste setor específico
        const { data: sectorAdmin } = await supabase
          .from('sector_admins')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('sector_id', sectorId);

        if (sectorAdmin?.length) {
          setCanEdit(true);
        }
      }

      await Promise.all([
        fetchSector(),
        fetchTeamMembers(),
        fetchAllUsers(),
        fetchPositions()
      ]);
      
      setLoading(false);
    };

    if (sectorId) {
      checkUserAndFetchData();
    }
  }, [sectorId, router, fetchSector, fetchTeamMembers]);

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
      console.error('Erro ao buscar usuários:', error);
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
      console.error('Erro ao buscar cargos:', error);
    } else {
      setPositions(data || []);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !sectorId) {
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

      const response = await fetch('/api/admin/sector-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          sector_id: sectorId,
          position: positionName
        })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Membro adicionado com sucesso!');
        setShowAddModal(false);
        setSelectedUserId('');
        setMemberPositionId('');
        fetchTeamMembers();
      } else {
        showError('Erro ao adicionar membro', data.error);
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
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

      const response = await fetch('/api/admin/sector-team', {
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
    if (member.is_from_subsector) {
      showWarning('Este membro foi adicionado através de um sub-setor. Para removê-lo, acesse o sub-setor correspondente.');
      return;
    }
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleRemoveMemberConfirm = async () => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/sector-team?member_id=${memberToDelete.id}`, {
        method: 'DELETE'
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Erro ao remover membro';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use text
            errorMessage = await response.text() || errorMessage;
          }
        } else {
          // Non-JSON response
          errorMessage = await response.text() || errorMessage;
        }
        
        showError('Erro ao remover membro', errorMessage);
        return;
      }

      // Parse successful response
      const data = await response.json();
      fetchTeamMembers();
      setShowDeleteModal(false);
      setMemberToDelete(null);
      showSuccess('Membro removido da equipe com sucesso!');
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      // Network error or other exception
      showError('Erro ao remover membro', 'Ocorreu um erro de rede. Verifique sua conexão e tente novamente.');
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

  // Separar membros diretos e de subsetores
  const directMembers = teamMembers.filter(m => !m.is_from_subsector);
  const subsectorMembers = teamMembers.filter(m => m.is_from_subsector);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <UnifiedLoadingSpinner 
            fullScreen={true}
            size="large" 
            message={LOADING_MESSAGES.loading}
          />
        </div>
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-cresol-gray">Setor não encontrado</p>
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
                  Equipe - {sector.name}
                </h1>
                <p className="text-sm text-cresol-gray">
                  Setor
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
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Setores', href: '/setores' },
              { label: sector.name, href: `/setores/${sectorId}` },
              { label: 'Equipe' }
            ]} 
          />
        </div>

        {/* Descrição do Setor */}
        {sector.description && (
          <div className="bg-white rounded-lg border border-cresol-gray-light p-6 mb-8">
            <div className="flex items-center mb-3">
              <Icon name="building-2" className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold text-cresol-gray-dark">Sobre o Setor</h2>
            </div>
            <p className="text-cresol-gray">{sector.description}</p>
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
                    Colaboradores que fazem parte deste setor
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
              <div className="space-y-6">
                {/* Membros diretos do setor */}
                {directMembers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-cresol-gray-dark uppercase tracking-wider mb-4">
                      Membros Diretos do Setor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {directMembers.map(member => (
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
                              <span className="truncate">{member.profiles.email}</span>
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
                  </div>
                )}

                {/* Membros de subsetores */}
                {subsectorMembers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-cresol-gray-dark uppercase tracking-wider mb-4">
                      Membros dos Sub-setores
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subsectorMembers.map(member => (
                        <div key={member.id} className="border border-cresol-gray-light rounded-lg p-4 bg-secondary/5">
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
                                  <div className="flex h-full w-full items-center justify-center bg-secondary/10 text-secondary">
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
                                {member.subsectors && (
                                  <p className="text-xs text-secondary font-medium mt-1">
                                    {member.subsectors.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-cresol-gray">
                            <div className="flex items-center">
                              <Icon name="mail" className="h-4 w-4 mr-2" />
                              <span className="truncate">{member.profiles.email}</span>
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
                  </div>
                )}
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
                Adicionar Membro ao Setor
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
        message={`Tem certeza que deseja remover ${memberToDelete?.profiles?.full_name} da equipe?\n\nEsta ação não pode ser desfeita e o membro será removido permanentemente da equipe do setor.`}
        isLoading={isDeleting}
        confirmButtonText="Remover Membro"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}