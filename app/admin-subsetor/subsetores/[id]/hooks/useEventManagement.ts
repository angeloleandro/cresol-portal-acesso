// Hook para gerenciamento de eventos do subsetor

import { useState } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { SubsectorEvent, ModalState, DeleteConfirmationState } from '../types/subsector.types';
import { sectorContentApi } from '../utils/apiClient';

interface UseEventManagementReturn {
  eventModal: ModalState<SubsectorEvent>;
  deleteConfirmation: DeleteConfirmationState<SubsectorEvent>;
  handleOpenEventModal: (event?: SubsectorEvent) => void;
  handleSaveEvent: (event: Partial<SubsectorEvent>, subsectorId: string) => Promise<void>;
  handleDeleteEvent: (eventId: string) => Promise<void>;
  toggleEventPublished: (eventId: string, currentStatus: boolean) => Promise<void>;
  setEventModal: React.Dispatch<React.SetStateAction<ModalState<SubsectorEvent>>>;
  setDeleteConfirmation: React.Dispatch<React.SetStateAction<DeleteConfirmationState<SubsectorEvent>>>;
}

export function useEventManagement(onRefresh: () => Promise<void>): UseEventManagementReturn {
  const supabase = useSupabaseClient();
  
  const [eventModal, setEventModal] = useState<ModalState<SubsectorEvent>>({
    isOpen: false,
    isEditing: false,
    currentItem: {}
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState<SubsectorEvent>>({
    isOpen: false,
    itemToDelete: null,
    isDeleting: false
  });

  const handleOpenEventModal = (event?: SubsectorEvent) => {
    if (event) {
      setEventModal({
        isOpen: true,
        isEditing: true,
        currentItem: event
      });
    } else {
      setEventModal({
        isOpen: true,
        isEditing: false,
        currentItem: {
          title: '',
          description: '',
          start_date: new Date().toISOString(),
          is_featured: false,
          is_published: false
        }
      });
    }
  };

  const handleSaveEvent = async (event: Partial<SubsectorEvent>, subsectorId: string) => {
    if (!event.title || !event.description || !event.start_date) {
      throw new Error('Por favor, preencha todos os campos obrigatórios.');
    }

    try {
      if (eventModal.isEditing && event.id) {
        await sectorContentApi.update('subsector_events', event.id, {
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          is_featured: event.is_featured ?? false,
          is_published: event.is_published ?? false
        });
      } else {
        const now = new Date().toISOString();
        await sectorContentApi.create('subsector_events', {
          subsector_id: subsectorId,
          title: event.title,
          description: event.description,
          location: '', // Campo obrigatório no tipo
          start_date: event.start_date,
          end_date: null, // Campo obrigatório no tipo
          is_featured: event.is_featured ?? false,
          is_published: event.is_published ?? false,
          created_at: now, // Campo obrigatório no tipo
          updated_at: now // Campo obrigatório no tipo
        });
      }

      setEventModal({ isOpen: false, isEditing: false, currentItem: {} });
      await onRefresh();
    } catch (error) {
      // Error handled silently
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const { error } = await supabase
        .from('subsector_events')
        .delete()
        .eq('id', eventId);

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

  const toggleEventPublished = async (eventId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('subsector_events')
        .update({ is_published: !currentStatus })
        .eq('id', eventId);

      if (error) throw error;
      await onRefresh();
    } catch (error) {
      // Error handled silently
      throw error;
    }
  };

  return {
    eventModal,
    deleteConfirmation,
    handleOpenEventModal,
    handleSaveEvent,
    handleDeleteEvent,
    toggleEventPublished,
    setEventModal,
    setDeleteConfirmation
  };
}