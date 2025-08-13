'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { StandardizedButton } from '@/app/components/admin';
import StandardizedTabs from '@/app/components/admin/StandardizedTabs';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button 
} from '@nextui-org/react';
import { InlineSpinner } from '@/app/components/ui/StandardizedSpinner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Breadcrumb from '../components/Breadcrumb';
import { Icon } from '../components/icons';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  read: boolean;
  created_at: string;
  sender_name?: string;
  sender_id?: string;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  
  // Filtros e controles
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Notification['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  
  // Estados para confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Verificar usuário
  const checkUser = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      router.replace('/login');
    }
  }, [router]);

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_recipients')
        .select(`
          read_at,
          notifications!inner (
            id,
            title,
            message,
            type,
            priority,
            created_at,
            expires_at,
            action_url,
            sent_by,
            sender:profiles!notifications_sent_by_fkey(full_name)
          )
        `)
        .eq('recipient_id', user.id)
        .order('notifications(created_at)', { ascending: false });

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        // Dados de exemplo para demonstração
        setNotifications([
          {
            id: '1',
            title: 'Nova mensagem do setor',
            message: 'Você recebeu uma nova mensagem do setor de RH sobre o treinamento de segurança que será realizado na próxima semana.',
            type: 'info',
            read: false,
            created_at: new Date().toISOString(),
            sender_name: 'Sistema RH',
            priority: 'normal'
          },
          {
            id: '2',
            title: 'Evento adicionado ao calendário',
            message: 'O evento "Workshop de Crédito Rural" foi adicionado ao seu calendário para o dia 15 de dezembro.',
            type: 'success',
            read: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            sender_name: 'Sistema',
            priority: 'low'
          },
          {
            id: '3',
            title: 'Manutenção programada',
            message: 'O sistema estará em manutenção no domingo das 02:00 às 06:00. Durante este período, alguns serviços poderão ficar indisponíveis.',
            type: 'warning',
            read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            sender_name: 'TI',
            priority: 'high'
          },
          {
            id: '4',
            title: 'Documentos pendentes',
            message: 'Você possui 3 documentos pendentes de aprovação que precisam ser analisados até o final desta semana.',
            type: 'warning',
            read: false,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            sender_name: 'Sistema',
            priority: 'urgent'
          },
          {
            id: '5',
            title: 'Backup realizado com sucesso',
            message: 'O backup automático do sistema foi realizado com sucesso na madrugada de hoje.',
            type: 'success',
            read: true,
            created_at: new Date(Date.now() - 259200000).toISOString(),
            sender_name: 'Sistema',
            priority: 'low'
          }
        ]);
      } else {
        const formattedNotifications = data?.map((recipient: any) => ({
          ...recipient.notifications,
          read: !!recipient.read_at,
          sender_name: recipient.notifications.sender?.full_name || 'Sistema',
          priority: recipient.notifications.priority || 'normal'
        })) || [];
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    let filtered = [...notifications];

    // Filtrar por status de leitura
    if (filter === 'unread') {
      filtered = filtered.filter(notif => !notif.read);
    } else if (filter === 'read') {
      filtered = filtered.filter(notif => notif.read);
    }

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notif => notif.type === typeFilter);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(notif => 
        notif.title.toLowerCase().includes(term) ||
        notif.message.toLowerCase().includes(term) ||
        notif.sender_name?.toLowerCase().includes(term)
      );
    }

    // Ordenar por prioridade e data
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredNotifications(filtered);
  }, [notifications, filter, typeFilter, searchTerm]);

  // Marcar como lida/não lida
  const markAsRead = async (notificationId: string, read: boolean = true) => {
    try {
      const readAtValue = read ? new Date().toISOString() : null;
      await supabase
        .from('notification_recipients')
        .update({ read_at: readAtValue })
        .eq('notification_id', notificationId)
        .eq('recipient_id', user?.id);

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notification_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', user?.id)
        .is('read_at', null);

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Excluir notificação
  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return;

    setIsDeleting(true);
    try {
      await supabase
        .from('notification_recipients')
        .delete()
        .eq('notification_id', notificationToDelete.id)
        .eq('recipient_id', user?.id);

      setNotifications(prev => prev.filter(notif => notif.id !== notificationToDelete.id));
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  // Ações em lote
  const handleBulkAction = async (action: 'read' | 'unread' | 'delete') => {
    const selectedIds = Array.from(selectedNotifications);
    
    if (action === 'delete') {
      setShowBulkDeleteModal(true);
      return;
    }

    try {
      const readValue = action === 'read';
      const readAtValue = readValue ? new Date().toISOString() : null;
      await supabase
        .from('notification_recipients')
        .update({ read_at: readAtValue })
        .in('notification_id', selectedIds)
        .eq('recipient_id', user?.id);

      setNotifications(prev => 
        prev.map(notif => 
          selectedIds.includes(notif.id) ? { ...notif, read: readValue } : notif
        )
      );

      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Erro na ação em lote:', error);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const selectedIds = Array.from(selectedNotifications);
    
    setIsBulkDeleting(true);
    try {
      await supabase
        .from('notification_recipients')
        .delete()
        .in('notification_id', selectedIds)
        .eq('recipient_id', user?.id);
      
      setNotifications(prev => prev.filter(notif => !selectedIds.includes(notif.id)));
      setSelectedNotifications(new Set());
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Erro ao excluir notificações:', error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setShowBulkDeleteModal(false);
  };

  // Seleção de notificações
  const toggleNotificationSelection = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(filteredNotifications.map(notif => notif.id));
    setSelectedNotifications(allIds);
  };

  const deselectAll = () => {
    setSelectedNotifications(new Set());
  };

  // Funções auxiliares
  const getTypeConfig = (type: Notification['type'] | 'all') => {
    const configMap = {
      all: { icon: 'bell' as const, color: 'text-gray-500', label: 'Todos os tipos' },
      success: { icon: 'check' as const, color: 'text-green-500', label: 'Sucesso' },
      warning: { icon: 'triangle-alert' as const, color: 'text-yellow-500', label: 'Aviso' },
      error: { icon: 'close' as const, color: 'text-red-500', label: 'Erro' },
      system: { icon: 'settings' as const, color: 'text-purple-500', label: 'Sistema' },
      info: { icon: 'bell' as const, color: 'text-blue-500', label: 'Informação' }
    };
    
    return configMap[type] || configMap.info;
  };

  const getTypeIcon = (type: Notification['type']) => {
    const config = getTypeConfig(type);
    return <Icon name={config.icon} className={`h-5 w-5 ${config.color}`} />;
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Urgente</span>;
      case 'high':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Alta</span>;
      case 'low':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Baixa</span>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Effects
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    applyFilters();
  }, [notifications, filter, typeFilter, searchTerm, applyFilters]);

  const unreadCount = notifications.filter(notif => !notif.read).length;
  const selectedCount = selectedNotifications.size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <InlineSpinner size="xl" variant="home" />
            <p className="mt-4 text-cresol-gray">Carregando notificações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Notificações' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Notificações</h1>
              <p className="text-cresol-gray">
                Gerencie suas notificações e mensagens do sistema
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
                  {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                </span>
              )}
              
              {unreadCount > 0 && (
                <StandardizedButton
                  onClick={markAllAsRead}
                  variant="outline"
                >
                  Marcar todas como lidas
                </StandardizedButton>
              )}
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="card mb-6">
          <div className="p-6">
            {/* Busca */}
            <div className="mb-4">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cresol-gray pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar notificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-with-left-icon"
                />
              </div>
            </div>

            {/* Filtros por Status */}
            <StandardizedTabs
              tabs={[
                { 
                  id: 'all', 
                  label: 'Todas', 
                  count: notifications.length,
                  icon: 'bell'
                },
                { 
                  id: 'unread', 
                  label: 'Não lidas', 
                  count: notifications.filter(n => !n.read).length,
                  icon: 'mail'
                },
                { 
                  id: 'read', 
                  label: 'Lidas', 
                  count: notifications.filter(n => n.read).length,
                  icon: 'check'
                }
              ]}
              activeTab={filter}
              onChange={(tabId) => setFilter(tabId as any)}
              className="mb-4"
            />

            {/* Filtros por Tipo */}
            <div className="flex justify-end">
              <Dropdown 
                placement="bottom-end"
                classNames={{
                  content: "border-0 shadow-lg bg-white rounded-lg overflow-hidden p-0"
                }}
              >
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    className="max-w-xs justify-between border-gray-200 hover:border-gray-300"
                    startContent={
                      <Icon 
                        name={getTypeConfig(typeFilter).icon} 
                        className={`h-4 w-4 ${getTypeConfig(typeFilter).color}`} 
                      />
                    }
                    endContent={<Icon name="chevron-down" className="h-4 w-4" />}
                  >
                    {getTypeConfig(typeFilter).label}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Filtro por tipo de notificação"
                  selectedKeys={new Set([typeFilter])}
                  selectionMode="single"
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setTypeFilter(selectedKey as any);
                  }}
                  itemClasses={{
                    base: [
                      "rounded-none",
                      "border-0",
                      "outline-none",
                      "ring-0",
                      "shadow-none",
                      "data-[hover=true]:bg-primary/10",
                      "data-[selected=true]:bg-primary/20",
                      "data-[focus=true]:bg-primary/10",
                      "data-[focus-visible=true]:bg-primary/10",
                      "data-[focus-visible=true]:outline-none",
                      "data-[focus-visible=true]:ring-0",
                      "data-[focus-visible=true]:shadow-none",
                      "transition-colors",
                      "first:border-t-0",
                      "last:border-b-0",
                      "before:hidden",
                      "after:hidden"
                    ]
                  }}
                >
                  {['all', 'info', 'success', 'warning', 'error', 'system'].map((type) => {
                    const config = getTypeConfig(type as any);
                    return (
                      <DropdownItem 
                        key={type} 
                        startContent={
                          <Icon name={config.icon} className={`h-4 w-4 ${config.color}`} />
                        }
                      >
                        {config.label}
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </Dropdown>
            </div>

            {/* Ações em lote */}
            {selectedCount > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <span className="text-sm text-blue-800 font-medium">
                    {selectedCount} notificação{selectedCount !== 1 ? 'ões' : ''} selecionada{selectedCount !== 1 ? 's' : ''}
                  </span>
                  
                  <div className="flex flex-wrap gap-2">
                    <StandardizedButton
                      onClick={() => handleBulkAction('read')}
                      variant="outline"
                      size="sm"
                    >
                      Marcar como lidas
                    </StandardizedButton>
                    <StandardizedButton
                      onClick={() => handleBulkAction('unread')}
                      variant="outline"
                      size="sm"
                    >
                      Marcar como não lidas
                    </StandardizedButton>
                    <StandardizedButton
                      onClick={() => handleBulkAction('delete')}
                      variant="danger"
                      size="sm"
                    >
                      Excluir
                    </StandardizedButton>
                    <button
                      onClick={deselectAll}
                      className="text-cresol-gray hover:text-gray-800 text-sm px-2"
                    >
                      Limpar seleção
                    </button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    Selecionar todas visíveis ({filteredNotifications.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="card">
              <div className="p-12 text-center">
                <Icon name="bell" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-cresol-gray mb-2">
                  {searchTerm || filter !== 'all' || typeFilter !== 'all' 
                    ? 'Nenhuma notificação encontrada'
                    : 'Você não possui notificações'
                  }
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filter !== 'all' || typeFilter !== 'all'
                    ? 'Tente ajustar os filtros para encontrar o que procura.'
                    : 'Suas notificações aparecerão aqui quando você recebê-las.'
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`card hover:border-primary/30 transition-colors duration-200 ${
                  !notification.read ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox para seleção */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleNotificationSelection(notification.id)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded-sm"
                    />

                    {/* Ícone do tipo */}
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-semibold ${
                              !notification.read ? 'text-gray-900' : 'text-cresol-gray'
                            }`}>
                              {notification.title}
                            </h3>
                            {getPriorityBadge(notification.priority)}
                          </div>
                          
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {notification.sender_name && (
                                <span>De: {notification.sender_name}</span>
                              )}
                              <span>{formatTimeAgo(notification.created_at)}</span>
                            </div>

                            {notification.action_url && (
                              <a
                                href={notification.action_url}
                                className="text-primary hover:text-primary-dark font-medium text-sm"
                              >
                                Ver detalhes →
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => markAsRead(notification.id, !notification.read)}
                            className="p-2 text-cresol-gray hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title={notification.read ? 'Marcar como não lida' : 'Marcar como lida'}
                          >
                            <Icon name="mail" className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClick(notification)}
                            className="p-2 text-cresol-gray hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir notificação"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Indicador de não lida */}
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Estatísticas */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Mostrando {filteredNotifications.length} de {notifications.length} notificações
          </div>
        )}
      </main>

      <Footer />

      {/* Modal de confirmação para excluir notificação única */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a notificação <strong>"${notificationToDelete?.title}"</strong>?<br><br>Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
        confirmButtonText="Excluir Notificação"
        cancelButtonText="Cancelar"
      />

      {/* Modal de confirmação para exclusão em lote */}
      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={handleBulkDeleteCancel}
        onConfirm={handleBulkDeleteConfirm}
        title="Confirmar Exclusão em Lote"
        message={`Tem certeza que deseja excluir <strong>${selectedCount} notificação${selectedCount !== 1 ? 'ões' : ''}</strong> selecionada${selectedCount !== 1 ? 's' : ''}?<br><br>Esta ação não pode ser desfeita.`}
        isLoading={isBulkDeleting}
        confirmButtonText={`Excluir ${selectedCount} Notificação${selectedCount !== 1 ? 'ões' : ''}`}
        cancelButtonText="Cancelar"
      />
    </div>
  );
}