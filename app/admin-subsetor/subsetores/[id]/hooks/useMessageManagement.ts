// Hook para gerenciamento de envio de mensagens

import { useState } from 'react';
import { Message, MessageType } from '../types/subsector.types';
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

    // Validar destinatários - prioritizar grupos
    if (currentMessage.groups.length === 0 && currentMessage.users.length === 0) {
      throw new Error('Por favor, selecione pelo menos um grupo ou usuário para enviar a mensagem.');
    }

    try {
      // Mapear dados para formato compatível com API
      const apiData = {
        title: currentMessage.title,
        content: currentMessage.message,
        type: currentMessage.type,
        group_id: currentMessage.groups[0] || '', // Usar primeiro grupo selecionado
        expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        links: []
      };

      // Se não há grupo selecionado mas há usuários, alertar
      if (!apiData.group_id && currentMessage.users.length > 0) {
        throw new Error('Esta versão requer envio por grupos. Por favor, selecione um grupo.');
      }

      await messagesApi.send(apiData);

      setIsMessageModalOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      } else {
        const message =
          typeof error === 'string'
            ? error
            : error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string'
            ? (error as any).message
            : 'Erro ao enviar mensagem';
        throw new Error(message);
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