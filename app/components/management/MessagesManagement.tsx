'use client';

import { memo, useCallback } from 'react';
import { Icon } from '../icons/Icon';

interface Message {
  id: string;
  title: string;
  content: string;
  is_published?: boolean;
  created_at?: string;
  published_at?: string | null;
}

interface MessagesManagementProps<T extends Message = Message> {
  entityId: string;
  messages: T[];
  showDrafts: boolean;
  totalDraftCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (message: T) => void;
  onPublish?: (message: T) => Promise<void>;
  config?: {
    entityType: 'sector' | 'subsector' | 'general';
    tableName: string;
    apiPath: string;
  };
}

const MessagesManagement = memo(<T extends Message = Message>({
  entityId,
  messages,
  showDrafts,
  totalDraftCount,
  onToggleDrafts,
  onRefresh,
  onDelete,
  onEdit,
  onPublish,
  config = {
    entityType: 'general',
    tableName: 'messages',
    apiPath: '/api/admin/messages'
  }
}: MessagesManagementProps<T>) => {
  
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      await onDelete(id);
    }
  }, [onDelete]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Gerenciar Mensagens
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {messages.length} {messages.length === 1 ? 'mensagem' : 'mensagens'}
              {totalDraftCount > 0 && ` (${totalDraftCount} rascunho${totalDraftCount !== 1 ? 's' : ''})`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onToggleDrafts}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                showDrafts
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon name={showDrafts ? 'EyeOff' : 'eye'} className="h-4 w-4 inline mr-2" />
              {showDrafts ? 'Ocultar' : 'Mostrar'} Rascunhos
            </button>
            <button
              onClick={onRefresh}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Icon name="refresh" className="h-4 w-4 inline mr-2" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="mail" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma mensagem encontrada</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Icon name="mail" className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {message.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {message.content}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Criado em {formatDate(message.created_at)}
                        </span>
                        {message.is_published && message.published_at && (
                          <span>
                            Publicado em {formatDate(message.published_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!message.is_published ? (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                      Rascunho
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Publicado
                    </span>
                  )}
                  
                  <div className="flex gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(message)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                    )}
                    
                    {onPublish && !message.is_published && (
                      <button
                        onClick={() => onPublish(message)}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Publicar"
                      >
                        <Icon name="check" className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Excluir"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

MessagesManagement.displayName = 'MessagesManagement';

export { MessagesManagement };
export type { Message, MessagesManagementProps };