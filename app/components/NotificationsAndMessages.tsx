'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Icon } from './icons/Icon';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'announcement';
  created_at: string;
  is_read: boolean;
}

interface Message {
  id: string;
  subject: string;
  sender_name: string;
  created_at: string;
  is_read: boolean;
}

export default function NotificationsAndMessages() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationsAndMessages();
  }, []);

  const fetchNotificationsAndMessages = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Buscar notificações do usuário
      const { data: notificationsData } = await supabase
        .from('notification_recipients')
        .select(`
          id,
          is_read,
          notifications (
            id,
            title,
            message,
            type,
            created_at
          )
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsData) {
        const formattedNotifications = notificationsData.map((item: any) => ({
          id: item.id,
          title: item.notifications?.title || 'Notificação',
          message: item.notifications?.message || '',
          type: item.notifications?.type || 'info',
          created_at: item.notifications?.created_at || new Date().toISOString(),
          is_read: item.is_read,
        }));
        setNotifications(formattedNotifications);
      }

      // Para mensagens internas, buscar dados reais quando disponível
      // Por enquanto, deixar vazio até implementar sistema de mensagens
      setMessages([]);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Agora';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <Icon name="triangle-alert" className="w-4 h-4 text-warning-text" />;
      case 'success':
        return <Icon name="check" className="w-4 h-4 text-success-text" />;
      case 'announcement':
        return <Icon name="bell" className="w-4 h-4 text-primary" />;
      default:
        return <Icon name="bell" className="w-4 h-4 text-info-text" />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const unreadMessages = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="heading-3 text-title">Notificações e Mensagens</h2>
          <p className="body-text-small text-muted mt-1">Fique sempre atualizado</p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-body'
            }`}
          >
            <div className="flex items-center justify-center">
              <Icon name="bell" className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Notif.</span>
              {unreadNotifications > 0 && (
                <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadNotifications}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-2 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'messages'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-body'
            }`}
          >
            <div className="flex items-center justify-center">
              <Icon name="chat-line" className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Mensagens</span>
              <span className="sm:hidden">Msgs</span>
              {unreadMessages > 0 && (
                <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadMessages}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'notifications' ? (
          notifications.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="bell" className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="body-text-small text-muted">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors duration-150 ${
                  notification.is_read ? 'bg-white border-gray-200/40 hover:border-gray-200/70' : 'bg-blue-50 border-blue-200/40 hover:border-blue-200/70'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`body-text-bold ${notification.is_read ? 'text-body' : 'text-title'} truncate`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted flex-shrink-0 ml-2">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="body-text-small text-muted line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          messages.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="chat-line" className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="body-text-small text-muted">Nenhuma mensagem</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border transition-colors duration-150 cursor-pointer ${
                  message.is_read ? 'bg-white border-gray-200/40 hover:border-gray-200/70' : 'bg-blue-50 border-blue-200/40 hover:border-blue-200/70'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {message.sender_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`body-text-bold ${message.is_read ? 'text-body' : 'text-title'} truncate`}>
                        {message.subject}
                      </h4>
                      <span className="text-xs text-muted flex-shrink-0 ml-2">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="body-text-small text-muted mt-1">
                      De: {message.sender_name}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href={activeTab === 'notifications' ? '/notifications' : '/messages'}
          className="text-primary hover:text-primary-dark text-sm font-medium flex items-center justify-center"
        >
          Ver todas {activeTab === 'notifications' ? 'notificações' : 'mensagens'}
          <Icon name="external-link" className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}