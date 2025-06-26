'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function NotificationCenter({ isOpen, onClose, userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Notification['type']>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showActions, setShowActions] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    applyFilters();
  }, [notifications, filter, typeFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles(full_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        // Dados de exemplo para demonstração
        setNotifications([
          {
            id: '1',
            title: 'Nova mensagem do setor',
            message: 'Você recebeu uma nova mensagem do setor de RH sobre o treinamento de segurança.',
            type: 'info',
            read: false,
            created_at: new Date().toISOString(),
            sender_name: 'Sistema RH',
            priority: 'normal'
          },
          {
            id: '2',
            title: 'Evento adicionado ao calendário',
            message: 'O evento "Workshop de Crédito Rural" foi adicionado ao seu calendário.',
            type: 'success',
            read: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            sender_name: 'Sistema',
            priority: 'low'
          },
          {
            id: '3',
            title: 'Manutenção programada',
            message: 'O sistema estará em manutenção no domingo das 02:00 às 06:00.',
            type: 'warning',
            read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            sender_name: 'TI',
            priority: 'high'
          },
          {
            id: '4',
            title: 'Documentos pendentes',
            message: 'Você possui 3 documentos pendentes de aprovação.',
            type: 'warning',
            read: false,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            sender_name: 'Sistema',
            priority: 'urgent'
          }
        ]);
      } else {
        const formattedNotifications = data?.map(notif => ({
          ...notif,
          sender_name: notif.sender?.full_name || 'Sistema',
          priority: notif.priority || 'normal'
        })) || [];
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
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

    // Ordenar por prioridade e data
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: false })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: false } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como não lida:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const handleBulkAction = async (action: 'read' | 'unread' | 'delete') => {
    const selectedIds = Array.from(selectedNotifications);
    
    try {
      if (action === 'delete') {
        await supabase
          .from('notifications')
          .delete()
          .in('id', selectedIds);
        
        setNotifications(prev => prev.filter(notif => !selectedIds.includes(notif.id)));
      } else {
        const readValue = action === 'read';
        await supabase
          .from('notifications')
          .update({ read: readValue })
          .in('id', selectedIds);

        setNotifications(prev => 
          prev.map(notif => 
            selectedIds.includes(notif.id) ? { ...notif, read: readValue } : notif
          )
        );
      }

      setSelectedNotifications(new Set());
      setShowActions(false);
    } catch (error) {
      console.error('Erro na ação em lote:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
    setShowActions(newSelected.size > 0);
  };

  const selectAll = () => {
    const allIds = new Set(filteredNotifications.map(notif => notif.id));
    setSelectedNotifications(allIds);
    setShowActions(allIds.size > 0);
  };

  const deselectAll = () => {
    setSelectedNotifications(new Set());
    setShowActions(false);
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></div>
        );
      case 'system':
        return (
          <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full"></div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
        );
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">Urgente</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">Alta</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">Baixa</span>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25"></div>
      
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl">
        <div ref={panelRef} className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="mt-4 space-y-3">
              <div className="flex space-x-2">
                {['all', 'unread', 'read'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption as any)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      filter === filterOption
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption === 'all' ? 'Todas' : 
                     filterOption === 'unread' ? 'Não lidas' : 'Lidas'}
                  </button>
                ))}
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos os tipos</option>
                <option value="info">Informação</option>
                <option value="success">Sucesso</option>
                <option value="warning">Aviso</option>
                <option value="error">Erro</option>
                <option value="system">Sistema</option>
              </select>
            </div>

            {/* Ações em lote */}
            {showActions && (
              <div className="mt-3 p-2 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.size} selecionada{selectedNotifications.size !== 1 ? 's' : ''}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkAction('read')}
                      className="text-xs px-2 py-1 text-primary hover:bg-primary hover:text-white rounded"
                    >
                      Marcar como lidas
                    </button>
                    <button
                      onClick={() => handleBulkAction('unread')}
                      className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-600 hover:text-white rounded"
                    >
                      Marcar como não lidas
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-600 hover:text-white rounded"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-primary hover:underline"
                  >
                    Selecionar todas visíveis
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-xs text-gray-600 hover:underline"
                  >
                    Limpar seleção
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zm-5-7h10v6H10V10zm5-7h5v6h-5V3z" />
                </svg>
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative p-4 hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Checkbox para seleção */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />

                      {/* Indicador de tipo */}
                      <div className="mt-2">
                        {getTypeIcon(notification.type)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {getPriorityBadge(notification.priority)}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            
                            {/* Menu de ações */}
                            <div className="relative group">
                              <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                              
                              <div className="absolute right-0 top-6 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                                <div className="py-1">
                                  <button
                                    onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                                    className="w-full px-3 py-1 text-left text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    {notification.read ? 'Marcar como não lida' : 'Marcar como lida'}
                                  </button>
                                  <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>

                        {notification.sender_name && (
                          <p className="mt-1 text-xs text-gray-500">
                            De: {notification.sender_name}
                          </p>
                        )}

                        {notification.action_url && (
                          <div className="mt-2">
                            <a
                              href={notification.action_url}
                              className="text-xs text-primary hover:text-primary-dark font-medium"
                            >
                              Ver detalhes →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Indicador de não lida */}
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {filteredNotifications.length} de {notifications.length} notificações
              </span>
              
              <button
                onClick={fetchNotifications}
                className="text-primary hover:text-primary-dark"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 