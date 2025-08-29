// Componente de gerenciamento de mensagens do setor - SIMPLIFICADO
import React, { useState } from 'react';

import { ToggleDraftsButton } from '@/app/components/admin/shared/ToggleDraftsButton';
import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { FormatDate } from '@/lib/utils/formatters';

interface SectorMessage {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  sector_id: string;
  [key: string]: unknown;
}

interface MessagesManagementProps {
  sectorId: string;
  messages: SectorMessage[];
  showDrafts: boolean;
  totalDraftMessagesCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/**
 * MessagesManagement function
 * @todo Add proper documentation
 */
export function MessagesManagement({
  sectorId,
  messages,
  showDrafts,
  totalDraftMessagesCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: MessagesManagementProps) {
  const alert = useAlert();
  const deleteModal = useDeleteModal<SectorMessage>('mensagem');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Partial<SectorMessage>>({
    is_published: true
  });

  const handleOpenModal = (message?: SectorMessage) => {
    if (message) {
      setCurrentMessage(message);
      setIsEditing(true);
    } else {
      setCurrentMessage({
        is_published: true
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMessage({
      is_published: true
    });
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!currentMessage.title?.trim()) {
      alert.showError('Campo obrigatório', 'Título é obrigatório');
      return;
    }
    
    if (!currentMessage.content?.trim()) {
      alert.showError('Campo obrigatório', 'Conteúdo é obrigatório');
      return;
    }

    setIsSaving(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = '/api/admin/sector-content';
      
      const requestData = {
        type: 'messages',
        sectorId,
        data: {
          ...currentMessage,
          sector_id: sectorId,
          title: currentMessage.title?.trim(),
          content: currentMessage.content?.trim()
        }
      };
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Erro ao salvar mensagem');
      }
      
      // Close modal first
      handleCloseModal();
      
      // Then refresh data to show the new/updated message
      await onRefresh();
      
      // Show success message
      if (isEditing) {
        alert.content.messageUpdated();
      } else {
        alert.content.messageCreated();
      }
      
    } catch (error: any) {
      alert.showError('Erro ao salvar mensagem', error.message || 'Erro ao salvar mensagem');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMessage = async (messageToDelete: SectorMessage) => {
    try {
      await onDelete(messageToDelete.id);
      alert.content.messageDeleted();
      // onDelete já chama refreshContent internamente
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      alert.showError('Erro ao deletar mensagem', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Mensagens</h2>
          <ToggleDraftsButton
            showDrafts={showDrafts}
            onToggle={onToggleDrafts}
            draftCount={totalDraftMessagesCount}
            type="messages"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Nova Mensagem
        </button>
      </div>

      {/* Lista de mensagens */}
      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {showDrafts 
                ? 'Nenhum rascunho de mensagem encontrado'
                : 'Nenhuma mensagem publicada ainda'
              }
            </p>
          </div>
        ) : (
          messages.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-card-hover transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    {!item.is_published && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Rascunho
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{item.content}</p>
                  <p className="text-sm text-gray-500">{FormatDate(item.created_at)}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteModal.openDeleteModal(item, item.title)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de criação/edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? 'Editar Mensagem' : 'Nova Mensagem'}
              </h2>

              <form onSubmit={handleSaveMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentMessage.title || ''}
                    onChange={(e) => setCurrentMessage({ ...currentMessage, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Digite o título da mensagem..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={currentMessage.content || ''}
                    onChange={(e) => setCurrentMessage({ ...currentMessage, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Digite o conteúdo da mensagem..."
                    required
                  />
                </div>

                <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-md">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentMessage.is_published !== false}
                      onChange={(e) => setCurrentMessage({ ...currentMessage, is_published: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {currentMessage.is_published !== false ? 'Publicar imediatamente' : 'Salvar como rascunho'}
                    </span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>Salvar</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDeleteMessage)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}