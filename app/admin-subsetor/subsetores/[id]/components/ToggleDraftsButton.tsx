// Componente de botão para alternar visualização de rascunhos


interface ToggleDraftsButtonProps {
  showDrafts: boolean;
  draftCount: number;
  onToggle: () => Promise<void>;
  type: 'events' | 'news';
}

export function ToggleDraftsButton({ showDrafts, draftCount, onToggle, type }: ToggleDraftsButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm transition-colors"
    >
      <span>
        {showDrafts ? 'Ocultar Rascunhos' : 'Mostrar Rascunhos'}
      </span>
      <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded font-medium">
        {draftCount} {draftCount === 1 ? 'rascunho' : 'rascunhos'}
      </span>
    </button>
  );
}