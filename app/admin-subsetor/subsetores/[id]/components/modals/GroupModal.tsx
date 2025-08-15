// Modal para criação e edição de grupos de notificação


interface GroupData {
  name: string;
  description: string;
  members: string[];
}

interface GroupModalProps {
  isOpen: boolean;
  currentGroup: GroupData;
  onClose: () => void;
  onSave: () => Promise<void>;
  onChange: React.Dispatch<React.SetStateAction<GroupData>>;
  users: { id: string; full_name: string; email: string; }[];
}

export function GroupModal({
  isOpen,
  currentGroup,
  onClose,
  onSave,
  onChange,
  users
}: GroupModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave();
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
    }
  };

  const handleMemberToggle = (userId: string) => {
    onChange(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Novo Grupo de Notificação
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Grupo *
            </label>
            <input
              type="text"
              value={currentGroup.name}
              onChange={(e) => onChange(prev => ({...prev, name: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Ex: Coordenação Técnica"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={currentGroup.description}
              onChange={(e) => onChange(prev => ({...prev, description: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              rows={3}
              placeholder="Descreva o propósito deste grupo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Membros do Grupo
            </label>
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
                        checked={currentGroup.members.includes(user.id)}
                        onChange={() => handleMemberToggle(user.id)}
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
            <p className="text-xs text-gray-500 mt-2">
              Selecione os usuários que receberão as notificações deste grupo
            </p>
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
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Criar Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}