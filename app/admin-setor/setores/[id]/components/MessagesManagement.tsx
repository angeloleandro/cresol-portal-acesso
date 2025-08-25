// Componente para gerenciar mensagens do setor

'use client';

import { useState } from 'react';

import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';

import type { SectorMessage } from '../types/sector.types';

interface MessagesManagementProps {
  sectorId: string;
  messages: SectorMessage[];
  showDrafts: boolean;
  totalDraftMessagesCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MessagesManagement({
  sectorId,
  messages,
  showDrafts,
  totalDraftMessagesCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: MessagesManagementProps) {
  const { showError, showSuccess } = useAlert();
  const deleteModal = useDeleteModal('mensagem');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SectorMessage>>({
    title: '',
    content: '',
    priority: 'medium',
    is_published: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const messageData = {
        sector_id: sectorId,
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        is_published: formData.is_published
      };

      const url = '/api/admin/sector-content';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { type: 'sector_messages', id: editingId, data: messageData }
        : { type: 'sector_messages', data: messageData };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar mensagem');
      }

      showSuccess(editingId ? 'Mensagem atualizada' : 'Mensagem criada', 'A mensagem foi salva com sucesso.');
      setShowForm(false);
      setFormData({ title: '', content: '', priority: 'medium', is_published: true });
      setEditingId(null);
      await onRefresh();
    } catch (error) {
      showError('Erro ao salvar mensagem', 'Tente novamente.');
    }
  };

  const handleEdit = (message: SectorMessage) => {
    setFormData({
      title: message.title,
      content: message.content,
      priority: message.priority,
      is_published: message.is_published
    });
    setEditingId(message.id);
    setShowForm(true);
  };

  const handleDeleteClick = (message: SectorMessage) => {
    deleteModal.openDeleteModal(message, message.title);
  };

  const handleDelete = async (message: SectorMessage) => {
    try {
      await onDelete(message.id);
      showSuccess('Mensagem excluída', 'A mensagem foi removida com sucesso.');
    } catch (error) {
      showError('Erro ao excluir mensagem', 'Tente novamente.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Mensagens do Setor</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleDrafts}
            className="flex items-center space-x-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
          >
            <span>{showDrafts ? 'Ocultar Rascunhos' : 'Mostrar Rascunhos'}</span>
            <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded font-medium">
              {totalDraftMessagesCount} {totalDraftMessagesCount === 1 ? 'rascunho' : 'rascunhos'}
            </span>
          </button>
          <button
            onClick={() => {
              setFormData({ title: '', content: '', priority: 'medium', is_published: true });
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm"
          >
            Adicionar Mensagem
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
          <h4 className="text-lg font-medium mb-3">
            {editingId ? 'Editar Mensagem' : 'Nova Mensagem'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">
                  Publicar imediatamente
                </label>
                {!formData.is_published && (
                  <span className="text-xs text-yellow-600 ml-2">
                    (Será salvo como rascunho)
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
          <p className="text-gray-500">Nenhuma mensagem cadastrada para este setor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="bg-white p-4 rounded-md border border-gray-200">
              <div className="flex justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium">{message.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                    {getPriorityLabel(message.priority)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(message)}
                    className="text-primary hover:text-primary-dark"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(message)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{message.content}</p>
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <span>{new Date(message.created_at).toLocaleDateString('pt-BR')}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  message.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {message.is_published ? 'Publicado' : 'Não publicado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDelete)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}