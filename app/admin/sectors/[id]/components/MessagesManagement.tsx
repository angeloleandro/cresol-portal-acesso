// Componente de gerenciamento de mensagens/notificações

import React, { useState } from 'react';
import { Group, Message } from '../types/sector.types';
import { getDefaultExpirationDate, formatForDateTimeInput } from '../utils/dateFormatters';

interface MessagesManagementProps {
  groups: Group[];
  automaticGroups: Group[];
  onRefresh: () => Promise<void>;
}

export function MessagesManagement({
  groups,
  automaticGroups,
  onRefresh
}: MessagesManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Partial<Message>>({
    group_id: '',
    title: '',
    content: '',
    type: 'info',
    expire_at: getDefaultExpirationDate(),
    links: []
  });
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleOpenModal = () => {
    setCurrentMessage({
      group_id: '',
      title: '',
      content: '',
      type: 'info',
      expire_at: getDefaultExpirationDate(),
      links: []
    });
    setLinkText('');
    setLinkUrl('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMessage({
      group_id: '',
      title: '',
      content: '',
      type: 'info',
      expire_at: getDefaultExpirationDate(),
      links: []
    });
    setLinkText('');
    setLinkUrl('');
  };

  const handleAddLink = () => {
    if (linkText && linkUrl) {
      setCurrentMessage(prev => ({
        ...prev,
        links: [...(prev.links || []), { text: linkText, url: linkUrl }]
      }));
      setLinkText('');
      setLinkUrl('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setCurrentMessage(prev => ({
      ...prev,
      links: prev.links?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentMessage.group_id) {
      alert('Selecione um grupo para enviar a mensagem');
      return;
    }

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentMessage)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar mensagem');
      }

      alert('Mensagem enviada com sucesso!');
      handleCloseModal();
      await onRefresh();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  const allGroups = [...groups, ...automaticGroups];

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Enviar Mensagem</h2>
          <p className="text-sm text-gray-600 mt-1">
            Envie notificações para grupos de usuários do setor
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Nova Mensagem
        </button>
      </div>

      {/* Informações sobre grupos disponíveis */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Grupos Disponíveis</h3>
        
        {allGroups.length === 0 ? (
          <p className="text-gray-500">
            Nenhum grupo disponível. Crie grupos na aba &quot;Grupos&quot; para enviar mensagens.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {allGroups.map((group) => (
              <div key={group.id} className="bg-white border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{group.name}</h4>
                  {group.is_automatic && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Auto
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{group.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {group.members?.length || 0} membros
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de envio de mensagem */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Nova Mensagem</h2>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grupo Destinatário
                  </label>
                  <select
                    value={currentMessage.group_id || ''}
                    onChange={(e) => setCurrentMessage({ ...currentMessage, group_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Selecione um grupo...</option>
                    {groups.length > 0 && (
                      <optgroup label="Grupos do Setor">
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name} ({group.members?.length || 0} membros)
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {automaticGroups.length > 0 && (
                      <optgroup label="Grupos Automáticos">
                        {automaticGroups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name} ({group.members?.length || 0} membros)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Mensagem
                  </label>
                  <select
                    value={currentMessage.type}
                    onChange={(e) => setCurrentMessage({ ...currentMessage, type: e.target.value as Message['type'] })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="info">Informação</option>
                    <option value="success">Sucesso</option>
                    <option value="warning">Aviso</option>
                    <option value="error">Erro/Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={currentMessage.title || ''}
                    onChange={(e) => setCurrentMessage({ ...currentMessage, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    value={currentMessage.content || ''}
                    onChange={(e) => setCurrentMessage({ ...currentMessage, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Expiração
                  </label>
                  <input
                    type="datetime-local"
                    value={currentMessage.expire_at ? formatForDateTimeInput(currentMessage.expire_at) : ''}
                    onChange={(e) => setCurrentMessage({ 
                      ...currentMessage, 
                      expire_at: new Date(e.target.value).toISOString() 
                    })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A mensagem será removida automaticamente após esta data
                  </p>
                </div>

                {/* Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Links (opcional)
                  </label>
                  
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Texto do link"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <input
                      type="url"
                      placeholder="URL"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Adicionar
                    </button>
                  </div>

                  {currentMessage.links && currentMessage.links.length > 0 && (
                    <div className="space-y-1">
                      {currentMessage.links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm">
                            <span className="font-medium">{link.text}</span>
                            <span className="text-gray-500 ml-2">({link.url})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Enviar Mensagem
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}