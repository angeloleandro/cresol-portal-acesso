'use client';

import { memo, useCallback } from 'react';
import { Icon } from '../icons/Icon';

interface Group {
  id: string;
  name: string;
  description?: string;
  members_count?: number;
  is_active?: boolean;
  created_at?: string;
}

interface GroupsManagementProps<T extends Group = Group> {
  entityId: string;
  groups: T[];
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (group: T) => void;
  onViewMembers?: (group: T) => void;
  config?: {
    entityType: 'sector' | 'subsector' | 'general';
    tableName: string;
    apiPath: string;
  };
}

const GroupsManagement = memo(<T extends Group = Group>({
  entityId,
  groups,
  onRefresh,
  onDelete,
  onEdit,
  onViewMembers,
  config = {
    entityType: 'general',
    tableName: 'groups',
    apiPath: '/api/admin/groups'
  }
}: GroupsManagementProps<T>) => {
  
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
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
              Gerenciar Grupos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'} cadastrado{groups.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Icon name="refresh" className="h-4 w-4 inline mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {groups.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <Icon name="user" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum grupo encontrado</p>
          </div>
        ) : (
          groups.map((group) => (
            <div 
              key={group.id} 
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-card-hover transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon name="user" className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {group.name}
                    </h3>
                    {group.members_count !== undefined && (
                      <p className="text-xs text-gray-500">
                        {group.members_count} {group.members_count === 1 ? 'membro' : 'membros'}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Status Badge */}
                {group.is_active !== undefined && (
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    group.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {group.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                )}
              </div>

              {group.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="text-xs text-gray-500 mb-3">
                Criado em {formatDate(group.created_at)}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                {onViewMembers && (
                  <button
                    onClick={() => onViewMembers(group)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Ver membros"
                  >
                    <Icon name="eye" className="h-4 w-4" />
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(group)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Icon name="edit" className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(group.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Excluir"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

GroupsManagement.displayName = 'GroupsManagement';

export { GroupsManagement };
export type { Group, GroupsManagementProps };