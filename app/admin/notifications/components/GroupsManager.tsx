import React from 'react';
import { useGroups } from '../hooks/useGroups';
import { useFormData } from '../hooks/useFormData';
import { NotificationGroup } from '../types';
import { InlineActionButton } from './shared/InlineActionButton';

export const GroupsManager: React.FC = () => {
  const { 
    groups, 
    showCreateGroup, 
    setShowCreateGroup, 
    groupForm, 
    loading, 
    updateGroupForm, 
    resetGroupForm, 
    handleCreateGroup 
  } = useGroups();
  
  const { availableUsers, sectors } = useFormData();

  const handleMemberToggle = (userId: string, checked: boolean) => {
    const currentMembers = groupForm.members;
    if (checked) {
      updateGroupForm({ members: [...currentMembers, userId] });
    } else {
      updateGroupForm({ members: currentMembers.filter(id => id !== userId) });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/10 p-3 rounded-lg">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Grupos de Notificação</h2>
            <p className="text-sm text-gray-500">Organize usuários em grupos para facilitar o envio de mensagens</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xl font-bold text-secondary">{groups.length}</div>
            <div className="text-xs text-gray-500">Grupos Ativos</div>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="px-3 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors text-sm font-medium"
          >
            Criar Grupo
          </button>
        </div>
      </div>

      {/* Formulário de criação */}
      {showCreateGroup && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Criar Novo Grupo</h3>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => updateGroupForm({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  placeholder="Ex: Gerentes Regionais, Equipe Vendas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Setor Vinculado <span className="text-xs text-gray-500">(Opcional)</span>
                </label>
                <select
                  value={groupForm.sectorId}
                  onChange={(e) => updateGroupForm({ sectorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Todos os Setores</option>
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição <span className="text-xs text-gray-500">(Opcional)</span>
              </label>
              <textarea
                rows={2}
                value={groupForm.description}
                onChange={(e) => updateGroupForm({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Descrição do grupo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membros do Grupo
                {groupForm.members.length > 0 && (
                  <span className="ml-2 bg-secondary text-white text-xs px-2 py-1 rounded-full">
                    {groupForm.members.length}
                  </span>
                )}
              </label>
              <div className="bg-white border border-gray-300 rounded-md max-h-32 overflow-y-auto">
                {availableUsers.map(user => (
                  <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                    <input
                      type="checkbox"
                      checked={groupForm.members.includes(user.id)}
                      onChange={(e) => handleMemberToggle(user.id, e.target.checked)}
                      className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{user.full_name || user.email}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateGroup(false);
                  resetGroupForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Criando...' : 'Criar Grupo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de grupos */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum grupo encontrado</h3>
            <p className="text-gray-600 mb-4">
              Organize seus usuários em grupos para facilitar o envio de notificações direcionadas.
            </p>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Criar Primeiro Grupo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para card individual do grupo
const GroupCard: React.FC<{ group: NotificationGroup }> = ({ group }) => (
  <div className="bg-white rounded-lg border border-gray-200 hover:border-secondary/30 transition-all p-4 group">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-secondary/10 p-1.5 rounded">
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-secondary transition-colors">
            {group.name}
          </h3>
        </div>
        
        {group.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {group.description}
          </p>
        )}
      </div>
      
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <InlineActionButton
          onClick={() => {/* TODO: Implementar editar */}}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          tooltip="Editar grupo"
        />
        <InlineActionButton
          onClick={() => {/* TODO: Implementar excluir */}}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
          tooltip="Excluir grupo"
          variant="danger"
        />
      </div>
    </div>
    
    <div className="space-y-2 text-xs">
      {group.sectors?.name && (
        <div className="flex items-center gap-1 text-primary">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
          </svg>
          <span>{group.sectors.name}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1 text-gray-500">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{new Date(group.created_at).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
    
    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
        {group.id.slice(0, 8)}...
      </code>
      <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full font-medium">
        Ativo
      </span>
    </div>
  </div>
);