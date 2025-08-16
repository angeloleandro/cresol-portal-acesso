// Hook para gerenciamento de envio de mensagens

import { useState } from 'react';
import { Message } from '../types/subsector.types';
import { messagesApi } from '../utils/apiClient';

interface UseMessageManagementReturn {
  isMessageModalOpen: boolean;
  currentMessage: Message;
  handleOpenMessageModal: () => void;
  handleSendMessage: (subsectorId: string) => Promise<void>;
  setIsMessageModalOpen: (open: boolean) => void;
  setCurrentMessage: React.Dispatch<React.SetStateAction<Message>>;
}

export function useMessageManagement(): UseMessageManagementReturn {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message>({
    title: '',
    message: '',
    type: 'general',
    groups: [],
    users: []
  });

  const handleOpenMessageModal = () => {
    setCurrentMessage({
      title: '',
      message: '',
      type: 'general',
      groups: [],
      users: []
    });
    setIsMessageModalOpen(true);
  };

  const handleSendMessage = async (subsectorId: string) => {
    // Validar subsectorId
    if (!subsectorId || typeof subsectorId !== 'string' || !subsectorId.trim()) {
      throw new Error('Por favor, forneça um ID de subsetor válido.');
    }

    // Validar campos obrigatórios
    if (!currentMessage.title.trim() || !currentMessage.message.trim()) {
      throw new Error('Por favor, preencha o título e a mensagem.');
    }

    // Validar destinatários
    if (currentMessage.groups.length === 0 && currentMessage.users.length === 0) {
      throw new Error('Por favor, selecione pelo menos um grupo ou usuário para enviar a mensagem.');
    }

    try {
      await messagesApi.send({
        title: currentMessage.title,
        message: currentMessage.message,
        type: currentMessage.type,
        priority: currentMessage.type === 'urgent' ? 'urgent' : 'normal',
        groups: currentMessage.groups,
        users: currentMessage.users,
        context_type: 'subsector',
        context_id: subsectorId
      });

      setIsMessageModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error((error as Error)?.message || 'Erro ao enviar mensagem');
      }
    }
  };

  return {
    isMessageModalOpen,
    currentMessage,
    handleOpenMessageModal,
    handleSendMessage,
    setIsMessageModalOpen,
    setCurrentMessage
  };
}