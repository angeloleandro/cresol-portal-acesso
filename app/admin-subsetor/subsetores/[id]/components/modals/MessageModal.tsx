// Modal para envio de mensagens e notificações

import { useState } from 'react';
import { Message, MessageType, Group, User } from '../../types/subsector.types';
import { FormSelect, type SelectOption } from '@/app/components/forms';

interface MessageModalProps {
  isOpen: boolean;
  currentMessage: Message;
  onClose: () => void;
  onSend: () => Promise<void>;
  onChange: React.Dispatch<React.SetStateAction<Message>>;
  groups: Group[];
  users: User[];
}

export function MessageModal({
  isOpen,
  currentMessage,
  onClose,
  onSend,
  onChange,
  groups,
  users
}: MessageModalProps) {
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSend();
    } catch (error) {
      // Debug log removed
    }
  };

  const handleGroupToggle = (groupId: string) => {
    onChange(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId]
    }));
  };

  const handleUserToggle = (userId: string) => {
    onChange(prev => ({
      ...prev,
      users: prev.users.includes(userId)
        ? prev.users.filter(id => id !== userId)
        : [...prev.users, userId]
    }));
  };

  const selectedCount = currentMessage.groups.length + currentMessage.users.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Enviar Mensagem
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Selecione os destinatários e digite sua mensagem
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Fechar modal"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form id="message-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título da Mensagem *
              </label>
              <input
                type="text"
                value={currentMessage.title}
                onChange={(e) => onChange(prev => ({...prev, title: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Assunto da mensagem..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo da Mensagem
              </label>
              <FormSelect
                value={currentMessage.type}
                onChange={(e) => onChange(prev => ({...prev, type: e.target.value as MessageType}))}
                options={[
                  { value: 'general', label: 'Geral' },
                  { value: 'urgent', label: 'Urgente' },
                  { value: 'info', label: 'Informativo' }
                ]}
                placeholder="Selecione o tipo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem *
            </label>
            <textarea
              value={currentMessage.message}
              onChange={(e) => onChange(prev => ({...prev, message: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              rows={4}
              placeholder="Digite sua mensagem aqui..."
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Destinatários *
              </label>
              {selectedCount > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {selectedCount} selecionado(s)
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('groups')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'groups'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Grupos ({groups.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Usuários ({users.length})
              </button>
            </div>

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {groups.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Nenhum grupo disponível
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {groups.map((group) => (
                      <label 
                        key={group.id} 
                        className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={currentMessage.groups.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-3 mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{group.name}</div>
                          <div className="text-sm text-gray-600">{group.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {group.members?.length || 0} membro(s)
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {users.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Nenhum usuário disponível
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {users.map((user) => (
                      <label 
                        key={user.id} 
                        className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={currentMessage.users.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          </form>
        </div>
        
        {/* Footer - Fixed with small buttons */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-lg">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="message-form"
              className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition-colors disabled:opacity-50"
              disabled={selectedCount === 0}
            >
              Enviar Mensagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}