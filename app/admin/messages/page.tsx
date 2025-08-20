'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { useAlert } from '@/app/components/alerts';
import { FormSelect, type SelectOption } from '@/app/components/forms';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { Icon } from '@/app/components/icons/Icon';
import { StandardizedButton } from '@/app/components/admin';
import { Box, Tabs } from "@chakra-ui/react";
import { MessageForm } from './components/MessageForm';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import DeleteModal from '@/app/components/ui/DeleteModal';

interface Message {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  type: 'sector' | 'subsector';
  location_name?: string;
  location_id?: string;
  sector_name?: string;
  author_name?: string;
  group_name?: string;
  group_color?: string;
}

interface MessageStats {
  total: number;
  published: number;
  drafts: number;
  bySector: { [key: string]: number };
  byType: { sector: number; subsector: number };
}

interface Filters {
  search: string;
  type: 'all' | 'sector' | 'subsector';
  status: 'all' | 'published' | 'draft';
  sector_id: string;
  subsector_id: string;
}

export default function MessagesAdminPage() {
  const router = useRouter();
  const alert = useAlert();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [subsectors, setSubsectors] = useState<any[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    published: 0,
    drafts: 0,
    bySector: {},
    byType: { sector: 0, subsector: 0 }
  });
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    status: 'all',
    sector_id: '',
    subsector_id: ''
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
  // Modal de exclusão
  const deleteModal = useDeleteModal('mensagem');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Ref para debounce
  const debounceTimer = useRef<NodeJS.Timeout>();

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        alert.showError('Acesso negado', 'Apenas administradores gerais podem acessar esta página');
        router.replace('/admin');
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error('Erro na verificação de auth:', error);
      router.replace('/login');
    }
  }, [router, alert]);

  const loadInitialData = async () => {
    try {
      // Carregar setores
      const { data: sectorsData } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');
      
      setSectors(sectorsData || []);

      // Carregar subsetores
      const { data: subsectorsData } = await supabase
        .from('subsectors')
        .select('id, name, sector_id, sectors(name)')
        .order('name');
      
      setSubsectors(subsectorsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const loadMessages = useCallback(async () => {
    if (!user) return;

    try {
      // Não setar loading se já temos dados (evita piscagem)
      if (messages.length === 0) {
        setLoading(true);
      }
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        router.replace('/login');
        return;
      }

      // Construir parâmetros de busca
      const searchParams = new URLSearchParams();
      
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.type !== 'all') searchParams.set('type', filters.type);
      if (filters.status !== 'all') searchParams.set('status', filters.status);
      if (filters.sector_id) searchParams.set('sector_id', filters.sector_id);
      if (filters.subsector_id) searchParams.set('subsector_id', filters.subsector_id);
      
      searchParams.set('page', pagination.currentPage.toString());
      searchParams.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/admin/messages?${searchParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar mensagens');
      }

      const result = await response.json();

      if (result.success) {
        setMessages(result.data.messages);
        setPagination(result.data.pagination);
        
        // Calcular estatísticas
        const newStats = calculateStats(result.data.messages);
        setStats(newStats);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error);
      alert.showError('Erro', error.message || 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters.search, filters.type, filters.status, filters.sector_id, filters.subsector_id, pagination.currentPage, pagination.limit]);

  // Verificar autenticação e permissões
  useEffect(() => {
    checkAuth();
    loadInitialData();
  }, [checkAuth]);

  // Carregar mensagens quando filtros mudarem (com debounce para search)
  useEffect(() => {
    if (user) {
      // Cancelar timer anterior se existir
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Se for mudança no search, aplicar debounce
      if (filters.search !== '') {
        debounceTimer.current = setTimeout(() => {
          loadMessages();
        }, 500); // 500ms de debounce
      } else {
        // Para outros filtros, carregar imediatamente
        loadMessages();
      }
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.currentPage, user]);

  const calculateStats = (messagesData: Message[]): MessageStats => {
    const stats: MessageStats = {
      total: messagesData.length,
      published: 0,
      drafts: 0,
      bySector: {},
      byType: { sector: 0, subsector: 0 }
    };

    messagesData.forEach(msg => {
      if (msg.is_published) {
        stats.published++;
      } else {
        stats.drafts++;
      }

      stats.byType[msg.type]++;

      const sectorName = msg.type === 'sector' ? msg.location_name : msg.sector_name;
      if (sectorName) {
        stats.bySector[sectorName] = (stats.bySector[sectorName] || 0) + 1;
      }
    });

    return stats;
  };

  const handleToggleStatus = async (message: Message) => {
    const action = message.is_published ? 'unpublish' : 'publish';
    const messageKey = `${message.type}-${message.id}`;
    
    try {
      setActionLoading(messageKey);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        return;
      }

      const response = await fetch(
        `/api/admin/messages?id=${message.id}&type=${message.type}&action=${action}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro na operação');
      }

      const result = await response.json();

      if (result.success) {
        alert.showSuccess(
          'Sucesso',
          `Mensagem ${action === 'publish' ? 'publicada' : 'despublicada'} com sucesso`
        );
        loadMessages(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      alert.showError('Erro', error.message || 'Erro ao alterar status da mensagem');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (message: Message) => {
    deleteModal.openDeleteModal(message, message.title);
  };

  const handleDeleteConfirm = async (message: Message) => {
    const messageKey = `${message.type}-${message.id}`;
    
    try {
      setActionLoading(messageKey);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        return;
      }

      const response = await fetch(
        `/api/admin/messages?id=${message.id}&type=${message.type}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir mensagem');
      }

      const result = await response.json();

      if (result.success) {
        alert.showSuccess('Sucesso', 'Mensagem excluída com sucesso');
        loadMessages(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao excluir mensagem:', error);
      alert.showError('Erro', error.message || 'Erro ao excluir mensagem');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (message: Message) => {
    const messageKey = `${message.type}-${message.id}`;
    
    try {
      setActionLoading(messageKey);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert.showError('Sessão expirada', 'Faça login novamente');
        return;
      }

      const response = await fetch(
        `/api/admin/messages?id=${message.id}&type=${message.type}&action=duplicate`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao duplicar mensagem');
      }

      const result = await response.json();

      if (result.success) {
        alert.showSuccess('Sucesso', 'Mensagem duplicada com sucesso');
        loadMessages(); // Recarregar lista
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao duplicar mensagem:', error);
      alert.showError('Erro', error.message || 'Erro ao duplicar mensagem');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      minute: '2-digit'
    }).format(date);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      sector_id: '',
      subsector_id: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getFilteredSubsectors = () => {
    if (!filters.sector_id) return subsectors;
    return subsectors.filter(sub => sub.sector_id === filters.sector_id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      {/* Loading Overlay */}
      {loading && messages.length === 0 && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
          <UnifiedLoadingSpinner 
            size="default" 
            message="Carregando mensagens..."
          />
        </div>
      )}

      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Mensagens' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 mb-2">Gerenciamento de Mensagens</h1>
              <p className="body-text text-muted">
                Administre todas as mensagens do sistema de forma centralizada
              </p>
            </div>
            <StandardizedButton
              variant="primary"
              icon={<Icon name="plus" className="h-4 w-4" />}
              onClick={() => {
                setEditingMessage(null);
                setIsModalOpen(true);
              }}
            >
              Nova Mensagem
            </StandardizedButton>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Icon name="message-square" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <Icon name="check-circle" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Publicadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <Icon name="edit" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Rascunhos</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <Icon name="building-1" className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Setores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.byType.sector}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Busca */}
            <div className="xl:col-span-2">
              <label className="label">Buscar</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="search" className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Título ou conteúdo..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="label">Tipo</label>
              <FormSelect
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'sector', label: 'Setor' },
                  { value: 'subsector', label: 'Subsetor' }
                ]}
                placeholder="Selecione o tipo"
              />
            </div>

            {/* Status */}
            <div>
              <label className="label">Status</label>
              <FormSelect
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'published', label: 'Publicadas' },
                  { value: 'draft', label: 'Rascunhos' }
                ]}
                placeholder="Selecione o status"
              />
            </div>

            {/* Setor */}
            <div>
              <label className="label">Setor</label>
              <FormSelect
                value={filters.sector_id}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  sector_id: e.target.value,
                  subsector_id: '' // Reset subsetor quando setor muda
                }))}
                options={[
                  { value: '', label: 'Todos os setores' },
                  ...sectors.map(sector => ({
                    value: sector.id,
                    label: sector.name
                  }))
                ]}
                placeholder="Selecione o setor"
              />
            </div>

            {/* Subsetor */}
            <div>
              <label className="label">Subsetor</label>
              <FormSelect
                value={filters.subsector_id}
                onChange={(e) => setFilters(prev => ({ ...prev, subsector_id: e.target.value }))}
                options={[
                  { value: '', label: 'Todos os subsetores' },
                  ...getFilteredSubsectors().map(subsector => ({
                    value: subsector.id,
                    label: subsector.name
                  }))
                ]}
                placeholder="Selecione o subsetor"
                disabled={!filters.sector_id}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted">
              {pagination.totalCount} mensagem{pagination.totalCount !== 1 ? 's' : ''} encontrada{pagination.totalCount !== 1 ? 's' : ''}
            </p>
            
            <StandardizedButton
              variant="secondary"
              size="sm"
              icon={<Icon name="refresh" className="h-4 w-4" />}
              onClick={resetFilters}
            >
              Limpar Filtros
            </StandardizedButton>
          </div>
        </div>

        {/* Lista de Mensagens */}
        {loading ? (
          <div className="card p-12 text-center">
            <UnifiedLoadingSpinner 
              size="default" 
              message="Carregando mensagens..."
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="card p-12 text-center">
            <Icon name="message-square" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-3 mb-2">Nenhuma mensagem encontrada</h3>
            <p className="body-text text-muted mb-6">
              {Object.values(filters).some(f => f !== '' && f !== 'all')
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando uma nova mensagem.'
              }
            </p>
            <StandardizedButton
              variant="primary"
              icon={<Icon name="plus" className="h-4 w-4" />}
              onClick={() => {
                setEditingMessage(null);
                setIsModalOpen(true);
              }}
            >
              Nova Mensagem
            </StandardizedButton>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const messageKey = `${message.type}-${message.id}`;
              const isLoading = actionLoading === messageKey;
              
              return (
                <div key={message.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-6">
                      {/* Cabeçalho */}
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`badge ${message.is_published ? 'badge-success' : 'badge-warning'}`}>
                          {message.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                        
                        <span className={`badge ${message.type === 'sector' ? 'badge-info' : 'badge-secondary'}`}>
                          {message.type === 'sector' ? 'Setor' : 'Subsetor'}
                        </span>
                        
                        {message.group_name && (
                          <span 
                            className="badge"
                            style={{ 
                              color: 'white' 
                            }}
                          >
                            {message.group_name}
                          </span>
                        )}
                      </div>

                      {/* Título */}
                      <h3 className="heading-3 mb-2 truncate" title={message.title}>
                        {message.title}
                      </h3>

                      {/* Conteúdo */}
                      <p className="body-text text-muted mb-4 line-clamp-2">
                        {message.content}
                      </p>

                      {/* Metadados */}
                      <div className="flex items-center space-x-4 text-xs text-muted">
                        <span className="flex items-center">
                          <Icon name="building-1" className="h-3 w-3 mr-1" />
                          {message.location_name}
                          {message.sector_name && message.type === 'subsector' && (
                            <span className="ml-1">({message.sector_name})</span>
                          )}
                        </span>
                        
                        {message.author_name && (
                          <span className="flex items-center">
                            <Icon name="user" className="h-3 w-3 mr-1" />
                            {message.author_name}
                          </span>
                        )}
                        
                        <span className="flex items-center">
                          <Icon name="calendar" className="h-3 w-3 mr-1" />
                          {formatDate(message.created_at)}
                        </span>
                        
                        {message.updated_at !== message.created_at && (
                          <span className="flex items-center">
                            <Icon name="edit" className="h-3 w-3 mr-1" />
                            Editado em {formatDate(message.updated_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      <StandardizedButton
                        variant="secondary"
                        size="sm"
                        icon={<Icon name="edit" className="h-4 w-4" />}
                        onClick={() => {
                          setEditingMessage(message);
                          setIsModalOpen(true);
                        }}
                        disabled={isLoading}
                      >
                        Editar
                      </StandardizedButton>

                      <StandardizedButton
                        variant={message.is_published ? "warning" : "success"}
                        size="sm"
                        icon={<Icon name={message.is_published ? "eye-slash" : "eye"} className="h-4 w-4" />}
                        onClick={() => handleToggleStatus(message)}
                        disabled={isLoading}
                        loading={isLoading}
                      >
                        {message.is_published ? 'Despublicar' : 'Publicar'}
                      </StandardizedButton>

                      <StandardizedButton
                        variant="secondary"
                        size="sm"
                        icon={<Icon name="copy" className="h-4 w-4" />}
                        onClick={() => handleDuplicate(message)}
                        disabled={isLoading}
                      >
                        Duplicar
                      </StandardizedButton>

                      <StandardizedButton
                        variant="danger"
                        size="sm"
                        icon={<Icon name="trash" className="h-4 w-4" />}
                        onClick={() => handleDeleteClick(message)}
                        disabled={isLoading}
                      >
                        Excluir
                      </StandardizedButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-muted">
              Página {pagination.currentPage} de {pagination.totalPages}
            </p>
            
            <div className="flex items-center space-x-2">
              <StandardizedButton
                variant="secondary"
                size="sm"
                icon={<Icon name="chevron-left" className="h-4 w-4" />}
                onClick={() => setPagination(prev => ({ 
                  ...prev, 
                  currentPage: Math.max(1, prev.currentPage - 1) 
                }))}
                disabled={pagination.currentPage <= 1 || loading}
              >
                Anterior
              </StandardizedButton>

              <StandardizedButton
                variant="secondary"
                size="sm"
                icon={<Icon name="chevron-right" className="h-4 w-4" />}
                onClick={() => setPagination(prev => ({ 
                  ...prev, 
                  currentPage: Math.min(prev.totalPages, prev.currentPage + 1) 
                }))}
                disabled={pagination.currentPage >= pagination.totalPages || loading}
              >
                Próxima
              </StandardizedButton>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Mensagem */}
      <MessageForm
        message={editingMessage}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMessage(null);
        }}
        onSuccess={() => {
          loadMessages();
        }}
      />

      {/* Modal de Exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDeleteConfirm)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}