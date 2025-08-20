// Hook para gerenciamento de notícias do subsetor

import { useState } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { SubsectorNews, ModalState, DeleteConfirmationState } from '../types/subsector.types';
import { sectorContentApi } from '../utils/apiClient';

interface UseNewsManagementReturn {
  newsModal: ModalState<SubsectorNews>;
  deleteConfirmation: DeleteConfirmationState<SubsectorNews>;
  handleOpenNewsModal: (news?: SubsectorNews) => void;
  handleSaveNews: (news: Partial<SubsectorNews>, subsectorId: string) => Promise<void>;
  handleDeleteNews: (newsId: string) => Promise<void>;
  toggleNewsPublished: (newsId: string, currentStatus: boolean) => Promise<void>;
  setNewsModal: React.Dispatch<React.SetStateAction<ModalState<SubsectorNews>>>;
  setDeleteConfirmation: React.Dispatch<React.SetStateAction<DeleteConfirmationState<SubsectorNews>>>;
}

export function useNewsManagement(onRefresh: () => Promise<void>): UseNewsManagementReturn {
  const supabase = useSupabaseClient();
  
  const [newsModal, setNewsModal] = useState<ModalState<SubsectorNews>>({
    isOpen: false,
    isEditing: false,
    currentItem: {}
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState<SubsectorNews>>({
    isOpen: false,
    itemToDelete: null,
    isDeleting: false
  });

  const handleOpenNewsModal = (news?: SubsectorNews) => {
    if (news) {
      setNewsModal({
        isOpen: true,
        isEditing: true,
        currentItem: news
      });
    } else {
      setNewsModal({
        isOpen: true,
        isEditing: false,
        currentItem: {
          title: '',
          summary: '',
          content: '',
          is_featured: false,
          is_published: false
        }
      });
    }
  };

  const handleSaveNews = async (news: Partial<SubsectorNews>, subsectorId: string) => {
    if (!news.title || !news.summary) {
      throw new Error('Por favor, preencha todos os campos obrigatórios.');
    }

    try {
      if (newsModal.isEditing && news.id) {
        await sectorContentApi.update('subsector_news', news.id, {
          title: news.title,
          summary: news.summary,
          content: news.content || '',
          is_featured: news.is_featured ?? false,
          is_published: news.is_published ?? false
        });
      } else {
        const now = new Date().toISOString();
        await sectorContentApi.create('subsector_news', {
          subsector_id: subsectorId,
          title: news.title,
          summary: news.summary,
          content: news.content || '',
          image_url: null, // Campo obrigatório no tipo
          is_featured: news.is_featured ?? false,
          is_published: news.is_published ?? false,
          updated_at: now // Campo obrigatório no tipo (created_at omitido no payload)
        });
      }

      setNewsModal({ isOpen: false, isEditing: false, currentItem: {} });
      await onRefresh();
    } catch (error) {
      // Error handled silently
      throw error;
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const { error } = await supabase
        .from('subsector_news')
        .delete()
        .eq('id', newsId);

      if (error) throw error;

      await onRefresh();
      setDeleteConfirmation({ isOpen: false, itemToDelete: null, isDeleting: false });
    } catch (error) {
      // Error handled silently
      throw error;
    } finally {
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const toggleNewsPublished = async (newsId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('subsector_news')
        .update({ is_published: !currentStatus })
        .eq('id', newsId);

      if (error) throw error;
      await onRefresh();
    } catch (error) {
      // Error handled silently
      throw error;
    }
  };

  return {
    newsModal,
    deleteConfirmation,
    handleOpenNewsModal,
    handleSaveNews,
    handleDeleteNews,
    toggleNewsPublished,
    setNewsModal,
    setDeleteConfirmation
  };
}