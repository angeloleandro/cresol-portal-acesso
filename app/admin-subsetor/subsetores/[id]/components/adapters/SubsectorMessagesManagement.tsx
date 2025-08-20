// Adapter for MessagesManagement to work with subsector data
// This component wraps the MessagesManagement component for subsector usage

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAlert } from '@/app/components/alerts';
import { MessagesManagement } from '../MessagesManagement';

interface SubsectorMessage {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  subsector_id: string;
}

interface SubsectorMessagesManagementProps {
  subsectorId: string;
}

export function SubsectorMessagesManagement({
  subsectorId
}: SubsectorMessagesManagementProps) {
  const { showError, content } = useAlert();
  const [messages, setMessages] = useState<SubsectorMessage[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [totalDraftMessagesCount, setTotalDraftMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch messages from subsector_messages table
      let query = supabase
        .from('subsector_messages')
        .select('*')
        .eq('subsector_id', subsectorId)
        .order('created_at', { ascending: false });

      if (!showDrafts) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMessages(data || []);

      // Count drafts
      const { count } = await supabase
        .from('subsector_messages')
        .select('*', { count: 'exact', head: true })
        .eq('subsector_id', subsectorId)
        .eq('is_published', false);

      setTotalDraftMessagesCount(count || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [subsectorId, showDrafts]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleToggleDrafts = async () => {
    setShowDrafts(!showDrafts);
  };

  const handleRefresh = async () => {
    await fetchMessages();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/subsector-content?type=messages&id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      await fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      showError('Erro ao excluir mensagem', 'Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <MessagesManagement
      subsectorId={subsectorId}
      messages={messages}
      showDrafts={showDrafts}
      totalDraftMessagesCount={totalDraftMessagesCount}
      onToggleDrafts={handleToggleDrafts}
      onRefresh={handleRefresh}
      onDelete={handleDelete}
    />
  );
}