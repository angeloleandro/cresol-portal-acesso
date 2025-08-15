import { User, NotificationGroup } from '../../types';

interface RecipientsSelectorProps {
  isGlobal: boolean;
  selectedGroups: string[];
  selectedUsers: string[];
  availableGroups: NotificationGroup[];
  availableUsers: User[];
  onGlobalToggle: (isGlobal: boolean) => void;
  onGroupsChange: (groups: string[]) => void;
  onUsersChange: (users: string[]) => void;
}

export const RecipientsSelector: React.FC<RecipientsSelectorProps> = ({
  isGlobal,
  selectedGroups,
  selectedUsers,
  availableGroups,
  availableUsers,
  onGlobalToggle,
  onGroupsChange,
  onUsersChange
}) => {
  const handleGroupChange = (groupId: string, checked: boolean) => {
    if (checked) {
      onGroupsChange([...selectedGroups, groupId]);
    } else {
      onGroupsChange(selectedGroups.filter(id => id !== groupId));
    }
  };

  const handleUserChange = (userId: string, checked: boolean) => {
    if (checked) {
      onUsersChange([...selectedUsers, userId]);
    } else {
      onUsersChange(selectedUsers.filter(id => id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Destinatários</h3>
        <p className="text-xs text-gray-500 mb-4">Escolha quem receberá esta notificação</p>
      </div>
      
      {/* Toggle Global */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isGlobal"
            checked={isGlobal}
            onChange={(e) => onGlobalToggle(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded-sm"
          />
          <label htmlFor="isGlobal" className="text-sm font-medium text-gray-900">
            Envio Global
          </label>
        </div>
        <div className="text-xs text-gray-500">
          Todos os usuários ({availableUsers.length})
        </div>
      </div>

      {/* Seletores específicos */}
      {!isGlobal && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Grupos */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Grupos Selecionados
              {selectedGroups.length > 0 && (
                <span className="ml-2 bg-secondary text-white text-xs px-2 py-1 rounded-full">
                  {selectedGroups.length}
                </span>
              )}
            </label>
            <div className="bg-white border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
              {availableGroups.map(group => (
                <label key={group.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={(e) => handleGroupChange(group.id, e.target.checked)}
                    className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded-sm"
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{group.name}</div>
                    {group.sectors?.name && (
                      <div className="text-xs text-gray-500">{group.sectors.name}</div>
                    )}
                  </div>
                </label>
              ))}
              {availableGroups.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm">Nenhum grupo disponível</span>
                </div>
              )}
            </div>
          </div>

          {/* Usuários */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Usuários Individuais
              {selectedUsers.length > 0 && (
                <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {selectedUsers.length}
                </span>
              )}
            </label>
            <div className="bg-white border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
              {availableUsers.map(user => (
                <label key={user.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleUserChange(user.id, e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded-sm"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {user.full_name || user.email}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};