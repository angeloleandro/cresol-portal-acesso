// Modal para envio de mensagens e notificações

import { useState } from 'react';
import { Message, Group, User } from '../../types/subsector.types';

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
      console.error('Erro ao enviar mensagem:', error);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Enviar Mensagem
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <select
                value={currentMessage.type}
                onChange={(e) => onChange(prev => ({...prev, type: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="general">Geral</option>
                <option value="urgent">Urgente</option>
                <option value="info">Informativo</option>
              </select>
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

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
              disabled={selectedCount === 0}
            >
              Enviar Mensagem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}