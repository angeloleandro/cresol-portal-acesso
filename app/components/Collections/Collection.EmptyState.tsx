'use client';

// Collection Empty State Component
// Estado vazio para diferentes contextos do sistema de coleções

import React from 'react';
import { CollectionEmptyStateProps } from './Collection.types';
import { cn } from '@/lib/utils/collections';

const EmptyStateMessages = {
  no_collections: {
    title: 'Nenhuma coleção encontrada',
    description: 'Crie sua primeira coleção para organizar imagens e vídeos',
    icon: '📂',
  },
  no_items: {
    title: 'Coleção vazia',
    description: 'Adicione imagens ou vídeos para começar a organizar o conteúdo',
    icon: '🗂️',
  },
  no_results: {
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os filtros de busca ou criar uma nova coleção',
    icon: '🔍',
  },
};

const CollectionEmptyState: React.FC<CollectionEmptyStateProps> = ({
  type,
  message,
  action,
  className,
}) => {
  const emptyState = EmptyStateMessages[type];
  const displayMessage = message || emptyState.description;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      'min-h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200',
      className
    )}>
      {/* Icon */}
      <div className="text-6xl mb-4 opacity-50">
        {emptyState.icon}
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {emptyState.title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
        {displayMessage}
      </p>
      
      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default CollectionEmptyState;