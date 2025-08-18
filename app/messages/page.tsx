'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons/Icon';
import UnifiedLoadingSpinner from '../components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import Breadcrumb from '../components/Breadcrumb';

interface Message {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'announcement';
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  priority?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 20;

  const fetchMessages = useCallback(async (userId: string, pageNum: number = 1, attempt: number = 1) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // Base delay in ms
    
    try {
      setLoading(true);
      
      const offset = (pageNum - 1) * ITEMS_PER_PAGE;
      
      // Buscar mensagens manuais
      const { data: messagesData, error } = await supabase
        .from('message_recipients')
        .select(`
          id,
          read_at,
          created_at,
          messages (
            id,
            title,
            message,
            type,
            priority,
            created_at,
            sender:profiles!messages_sent_by_fkey(full_name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) {
        // Check if error is transient (network, 5xx) or permanent (4xx, auth)
        const isTransientError = !error.message.includes('permission') && 
                                !error.message.includes('unauthorized') && 
                                !error.message.includes('forbidden');
        
        if (isTransientError && attempt < MAX_RETRIES) {
          console.warn(`Fetch attempt ${attempt} failed, retrying...`, error);
          const delay = RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchMessages(userId, pageNum, attempt + 1);
        }
        
        throw error;
      }

      const formattedMessages = messagesData?.map((item: any) => ({
        id: item.id,
        title: item.messages?.title || 'Mensagem',
        message: item.messages?.message || '',
        type: item.messages?.type || 'info',
        created_at: item.messages?.created_at || item.created_at,
        is_read: !!item.read_at,
        sender_name: item.messages?.sender?.full_name || 'Sistema',
        priority: item.messages?.priority || 'normal'
      })) || [];

      if (pageNum === 1) {
        setMessages(formattedMessages);
      } else {
        setMessages(prev => [...prev, ...formattedMessages]);
      }

      setHasMore(formattedMessages.length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (error) {
      console.error(`Erro ao buscar mensagens (tentativa ${attempt}/${MAX_RETRIES}):`, error);
      
      // Set error state for permanent failures or after all retries exhausted
      if (attempt >= MAX_RETRIES) {
        setFetchError('Erro ao carregar mensagens. Tente novamente mais tarde.');
      }
    } finally {
      if (attempt >= MAX_RETRIES || pageNum === 1) {
        setLoading(false);
      }
    }
  }, [ITEMS_PER_PAGE]);

  const applyFilters = useCallback(() => {
    let filtered = [...messages];

    if (filter === 'unread') {
      filtered = filtered.filter(msg => !msg.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter(msg => msg.is_read);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.title.toLowerCase().includes(term) ||
        msg.message.toLowerCase().includes(term) ||
        msg.sender_name?.toLowerCase().includes(term)
      );
    }

    setFilteredMessages(filtered);
  }, [messages, filter, searchTerm]);

  const checkUserAndFetch = useCallback(async () => {
    try {
      const { data: userData, error } = await supabase.auth.getUser();
      
      if (error || !userData.user) {
        router.replace('/login');
        return;
      }

      setUser(userData.user);
      await fetchMessages(userData.user.id);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      router.replace('/login');
    }
  }, [router, fetchMessages]);

  useEffect(() => {
    checkUserAndFetch();
  }, [checkUserAndFetch]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('message_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('message_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      setMessages(prev => 
        prev.map(msg => ({ ...msg, is_read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const loadMore = () => {
    if (user && !loading && hasMore) {
      fetchMessages(user.id, page + 1);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <Icon name="triangle-alert" className="w-5 h-5 text-warning-text" />;
      case 'success':
        return <Icon name="check" className="w-5 h-5 text-success-text" />;
      case 'announcement':
        return <Icon name="bell" className="w-5 h-5 text-primary" />;
      default:
        return <Icon name="chat-line" className="w-5 h-5 text-info-text" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Urgente</span>;
      case 'high':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Alta</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Baixa</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      return `${diffInDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UnifiedLoadingSpinner fullScreen message={LOADING_MESSAGES.notifications} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Mensagens' }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
              <p className="mt-1 text-sm text-gray-600">
                Suas mensagens pessoais e comunicações do sistema
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
                  {unreadCount} não lidas
                </span>
              )}
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Icon name="check" className="w-4 h-4 mr-2" />
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar mensagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros por Status */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Todas', count: messages.length },
                { key: 'unread', label: 'Não lidas', count: unreadCount },
                { key: 'read', label: 'Lidas', count: messages.length - unreadCount }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    filter === filterOption.key
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de mensagens */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="chat-line" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filter !== 'all' ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'Tente ajustar os filtros para encontrar o que procura.'
                  : 'Você não possui mensagens ainda. Suas mensagens aparecerão aqui quando você recebê-las.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer relative ${
                    !message.is_read ? 'bg-blue-50 border-l-4 border-primary' : ''
                  }`}
                  onClick={() => !message.is_read && markAsRead(message.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(message.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-lg font-medium ${
                              !message.is_read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {message.title}
                            </h3>
                            {message.priority && getPriorityBadge(message.priority)}
                            {!message.is_read && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-2 line-clamp-2">
                            {message.message}
                          </p>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>De: {message.sender_name}</span>
                            <span>{formatDate(message.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                          {!message.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(message.id);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              <Icon name="check" className="w-3 h-3 mr-1" />
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {hasMore && filteredMessages.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Carregando...
                </>
              ) : (
                <>
                  <Icon name="refresh" className="w-4 h-4 mr-2" />
                  Carregar mais
                </>
              )}
            </button>
          </div>
        )}

        {/* Estatísticas */}
        {filteredMessages.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Mostrando {filteredMessages.length} de {messages.length} mensagens
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}