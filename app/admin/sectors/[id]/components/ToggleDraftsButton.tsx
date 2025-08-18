// Componente de botão toggle para mostrar/ocultar rascunhos

import { useState } from 'react';

interface ToggleDraftsButtonProps {
  showDrafts: boolean;
  draftCount: number;
  onToggle: () => Promise<void>;
  isLoading?: boolean;
  type?: 'news' | 'events' | 'messages';
}

export function ToggleDraftsButton({ 
  showDrafts, 
  draftCount, 
  onToggle, 
  isLoading = false,
  type = 'news' 
}: ToggleDraftsButtonProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleClick = async () => {
    if (isToggling || isLoading) return;
    
    setIsToggling(true);
    try {
      await onToggle();
    } finally {
      setIsToggling(false);
    }
  };

  const label = type === 'news' ? 'rascunho' : 'rascunho';
  const pluralLabel = type === 'news' ? 'rascunhos' : 'rascunhos';

  return (
    <button
      onClick={handleClick}
      disabled={isToggling || isLoading}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
        transition-all duration-200
        ${isToggling || isLoading 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }
      `}
    >
      {isToggling ? (
        <>
          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Carregando...</span>
        </>
      ) : (
        <>
          <span>{showDrafts ? 'Ocultar Rascunhos' : 'Mostrar Rascunhos'}</span>
          <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded font-medium">
            {draftCount} {draftCount === 1 ? label : pluralLabel}
          </span>
        </>
      )}
    </button>
  );
}