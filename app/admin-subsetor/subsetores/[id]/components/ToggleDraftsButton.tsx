import React from 'react';

interface ToggleDraftsButtonProps {
  showDrafts: boolean;
  onToggle: () => void;
  draftCount: number;
  type: 'news' | 'events' | 'messages';
}

export function ToggleDraftsButton({
  showDrafts,
  onToggle,
  draftCount,
  type
}: ToggleDraftsButtonProps) {
  const getLabel = () => {
    switch (type) {
      case 'news':
        return 'notícias';
      case 'events':
        return 'eventos';
      case 'messages':
        return 'mensagens';
      default:
        return 'itens';
    }
  };

  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1 text-sm rounded-md transition-colors ${
        showDrafts
          ? 'bg-gray-600 text-white hover:bg-gray-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {showDrafts ? (
        <>
          Mostrando Rascunhos
          {draftCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-gray-500 text-white rounded-full text-xs">
              {draftCount}
            </span>
          )}
        </>
      ) : (
        <>
          Ver Rascunhos
          {draftCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-gray-500 text-white rounded-full text-xs">
              {draftCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}