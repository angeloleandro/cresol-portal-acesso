// Componente da aba de grupos

import { Group } from '../../types/subsector.types';

interface GroupsTabProps {
  groups: Group[];
  onOpenGroupModal: () => void;
}

export function GroupsTab({ groups, onOpenGroupModal }: GroupsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Grupos de Notificação</h2>
        <button 
          onClick={onOpenGroupModal}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          + Criar Grupo
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-md p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo cadastrado</h3>
          <p className="text-gray-500">Crie o primeiro grupo de notificação para este subsetor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-md p-6 border border-gray-100 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
              <div className="text-xs text-gray-500">
                Criado em {new Date(group.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}