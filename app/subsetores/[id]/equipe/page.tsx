'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
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
  };
}

interface Subsector {
  id: string;
  name: string;
  description?: string;
  sectors: { name: string } | { name: string }[];
}

export default function SubsectorTeamPage() {
  const router = useRouter();
  const params = useParams();
  const subsectorId = params?.id as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subsector, setSubsector] = useState<Subsector | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  
  // Estados para modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberPosition, setMemberPosition] = useState('');
  const [memberDescription, setMemberDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubsector = useCallback(async () => {
    const { data, error } = await supabase
      .from('subsectors')
      .select(`
        id,
        name,
        description,
        sectors!inner(name)
      `)
      .eq('id', subsectorId)
      .single();

    if (error) {
      console.error('Erro ao buscar sub-setor:', error);
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
        console.error('Erro ao buscar equipe:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
    }
  }, [subsectorId]);

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

      // Usuário pode editar se for admin geral, admin do setor ou admin do sub-setor
      if (profile?.role === 'admin') {
        setCanEdit(true);
      } else {
        // Verificar se é admin do setor ou sub-setor
        const [sectorAdmin, subsectorAdmin] = await Promise.all([
          supabase
            .from('sector_admins')
            .select('id')
            .eq('user_id', userData.user.id),
          supabase
            .from('subsector_admins')
            .select('id')
            .eq('user_id', userData.user.id)
            .eq('subsector_id', subsectorId)
        ]);

        if (sectorAdmin.data?.length || subsectorAdmin.data?.length) {
          setCanEdit(true);
        }
      }

      await Promise.all([
        fetchSubsector(),
        fetchTeamMembers(),
        fetchAllUsers()
      ]);
      
      setLoading(false);
    };

    if (subsectorId) {
      checkUserAndFetchData();
    }
  }, [subsectorId, router, fetchSubsector, fetchTeamMembers]);

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

  const handleAddMember = async () => {
    if (!selectedUserId || !subsectorId) {
      alert('Selecione um usuário');
      return;
    }

    try {
      const response = await fetch('/api/admin/subsector-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          subsector_id: subsectorId,
          position: memberPosition
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Membro adicionado com sucesso!');
        setShowAddModal(false);
        setSelectedUserId('');
        setMemberPosition('');
        fetchTeamMembers();
      } else {
        alert(data.error || 'Erro ao adicionar membro');
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      alert('Erro ao adicionar membro');
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      const response = await fetch('/api/admin/subsector-team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: editingMember.id,
          position: memberPosition
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cargo atualizado com sucesso!');
        setShowEditModal(false);
        setEditingMember(null);
        setMemberPosition('');
        fetchTeamMembers();
      } else {
        alert(data.error || 'Erro ao atualizar cargo');
      }
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      alert('Erro ao atualizar cargo');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro da equipe?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subsector-team?member_id=${memberId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        alert('Membro removido com sucesso!');
        fetchTeamMembers();
      } else {
        alert(data.error || 'Erro ao remover membro');
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      alert('Erro ao remover membro');
    }
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setMemberPosition(member.position || '');
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!subsector) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-cresol-gray">Sub-setor não encontrado</p>
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
                className="mr-4 p-2 text-cresol-gray hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Icon name="arrow-left" className="h-5 w-5" />
              </button>
              <div className="relative h-10 w-24 mr-4">
                <Image 
                  src="/logo-cresol.png" 
                  alt="Logo Cresol" 
                  fill
                  sizes="(max-width: 768px) 100vw, 96px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
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
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
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
        {/* Descrição do Sub-setor */}
        {subsector.description && (
          <div className="bg-white rounded-xl shadow-sm border border-cresol-gray-light p-6 mb-8">
            <div className="flex items-center mb-3">
              <Icon name="building-2" className="h-5 w-5 text-secondary mr-2" />
              <h2 className="text-lg font-semibold text-cresol-gray-dark">Sobre o Sub-setor</h2>
            </div>
            <p className="text-cresol-gray">{subsector.description}</p>
          </div>
        )}

        {/* Equipe */}
        <div className="bg-white rounded-xl shadow-sm border border-cresol-gray-light">
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
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Adicionar Primeiro Membro
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map(member => (
                  <div key={member.id} className="border border-cresol-gray-light rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-cresol-gray-light mr-3">
                          {member.profiles.avatar_url ? (
                            <Image
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
                            className="p-1 text-cresol-gray hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Editar cargo"
                          >
                            <Icon name="pencil" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 text-cresol-gray hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
                      {member.profiles.work_locations?.name && (
                        <div className="flex items-center">
                          <Icon name="map" className="h-4 w-4 mr-2" />
                          <span>{member.profiles.work_locations.name}</span>
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
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
                              <Image
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
                <label className="block text-sm font-medium text-cresol-gray-dark mb-2">
                  Cargo na Equipe (opcional)
                </label>
                <input
                  type="text"
                  value={memberPosition}
                  onChange={(e) => setMemberPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-cresol-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex: Coordenador, Analista, Assistente..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUserId('');
                    setMemberPosition('');
                    setSearchTerm('');
                  }}
                  className="flex-1 px-4 py-2 border border-cresol-gray-light text-cresol-gray hover:bg-cresol-gray-light/50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                  className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-xl max-w-md w-full">
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
                <label className="block text-sm font-medium text-cresol-gray-dark mb-2">
                  Cargo na Equipe
                </label>
                <input
                  type="text"
                  value={memberPosition}
                  onChange={(e) => setMemberPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-cresol-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex: Coordenador, Analista, Assistente..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMember(null);
                    setMemberPosition('');
                  }}
                  className="flex-1 px-4 py-2 border border-cresol-gray-light text-cresol-gray hover:bg-cresol-gray-light/50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateMember}
                  className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}