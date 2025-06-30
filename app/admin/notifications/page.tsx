'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';

interface NotificationGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  sector_id?: string;
  subsector_id?: string;
  created_at: string;
  sectors?: { name: string };
  subsectors?: { name: string };
  profiles?: { full_name?: string; email: string };
}

interface User {
  id: string;
  full_name?: string;
  email: string;
  role: string;
  sector_id?: string;
  subsector_id?: string;
}

export default function NotificationsAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'send' | 'groups' | 'history'>('send');
  
  // Estado para envio de notificações
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'message',
    priority: 'normal',
    isGlobal: false,
    groups: [] as string[],
    users: [] as string[],
    expiresAt: ''
  });
  
  // Estado para grupos
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    sectorId: '',
    subsectorId: '',
    members: [] as string[]
  });
  
  // Estado para usuários disponíveis
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  
  // Estado para seções
  const [sectors, setSectors] = useState<any[]>([]);
  const [subsectors, setSubsectors] = useState<any[]>([]);

  const checkUserAuth = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.replace('/login');
        return;
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'sector_admin', 'subsector_admin'].includes(profile.role)) {
        router.replace('/home');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchUsers();
      fetchSectors();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/notifications/groups');
      
      if (!response.ok) {
        console.error('Erro na API de grupos:', response.status, response.statusText);
        setGroups([]); // Define array vazio em caso de erro
        return;
      }
      
      const result = await response.json();
      
      if (result.error) {
        console.error('Erro ao buscar grupos:', result.error);
        setGroups([]);
        return;
      }
      
      setGroups(result.groups || []);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      setGroups([]); // Define array vazio em caso de erro
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, sector_id, subsector_id')
        .order('full_name');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }

      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchSectors = async () => {
    try {
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');

      if (!sectorsError) {
        setSectors(sectorsData || []);
      }

      const { data: subsectorsData, error: subsectorsError } = await supabase
        .from('subsectors')
        .select('id, name')
        .order('name');

      if (!subsectorsError) {
        setSubsectors(subsectorsData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type,
          priority: notificationForm.priority,
          isGlobal: notificationForm.isGlobal,
          groups: notificationForm.groups,
          recipients: notificationForm.users,
          expiresAt: notificationForm.expiresAt || null
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Notificação enviada com sucesso!');
        setNotificationForm({
          title: '',
          message: '',
          type: 'message',
          priority: 'normal',
          isGlobal: false,
          groups: [],
          users: [],
          expiresAt: ''
        });
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      alert('Erro ao enviar notificação');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/notifications/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupForm.name,
          description: groupForm.description,
          sectorId: groupForm.sectorId || null,
          subsectorId: groupForm.subsectorId || null,
          members: groupForm.members
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Grupo criado com sucesso!');
        setGroupForm({
          name: '',
          description: '',
          sectorId: '',
          subsectorId: '',
          members: []
        });
        setShowCreateGroup(false);
        fetchGroups();
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      alert('Erro ao criar grupo');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Notificações</h1>
          <p className="mt-2 text-gray-600">Envie mensagens e gerencie grupos de notificação</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('send')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'send'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Enviar Notificação
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'groups'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gerenciar Grupos
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Histórico
            </button>
          </nav>
        </div>

        {/* Conteúdo das tabs */}
        {activeTab === 'send' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Nova Notificação</h2>
            
            <form onSubmit={handleSendNotification} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Digite o título da notificação"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="message">Mensagem</option>
                    <option value="system">Sistema</option>
                    <option value="news">Notícia</option>
                    <option value="event">Evento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Expiração (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={notificationForm.expiresAt}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  required
                  rows={4}
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Digite o conteúdo da notificação"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isGlobal"
                    checked={notificationForm.isGlobal}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, isGlobal: e.target.checked }))}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isGlobal" className="ml-2 block text-sm text-gray-700">
                    Enviar para todos os usuários
                  </label>
                </div>

                {!notificationForm.isGlobal && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grupos
                      </label>
                      <select
                        multiple
                        value={notificationForm.groups}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setNotificationForm(prev => ({ ...prev, groups: values }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        size={5}
                      >
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name} {group.sectors?.name && `(${group.sectors.name})`}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd para selecionar múltiplos grupos</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usuários específicos
                      </label>
                      <select
                        multiple
                        value={notificationForm.users}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setNotificationForm(prev => ({ ...prev, users: values }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        size={8}
                      >
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.full_name || user.email} ({user.role})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd para selecionar múltiplos usuários</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Enviar Notificação
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Grupos de Notificação</h2>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Criar Grupo
              </button>
            </div>

            {showCreateGroup && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Criar Novo Grupo</h3>
                
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Grupo *
                      </label>
                      <input
                        type="text"
                        required
                        value={groupForm.name}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Ex: Gerentes, Vendas, TI..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Setor (opcional)
                      </label>
                      <select
                        value={groupForm.sectorId}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, sectorId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Selecione um setor</option>
                        {sectors.map(sector => (
                          <option key={sector.id} value={sector.id}>
                            {sector.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      value={groupForm.description}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Descreva o propósito do grupo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membros
                    </label>
                    <select
                      multiple
                      value={groupForm.members}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setGroupForm(prev => ({ ...prev, members: values }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      size={8}
                    >
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.email} ({user.role})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd para selecionar múltiplos usuários</p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateGroup(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Criar Grupo
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Setor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado por
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Criação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map(group => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {group.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {group.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {group.sectors?.name || group.subsectors?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {group.profiles?.full_name || group.profiles?.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(group.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {groups.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum grupo encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Histórico de Notificações</h2>
            <p className="text-gray-500">Em desenvolvimento...</p>
          </div>
        )}
      </div>
    </div>
  );
} 