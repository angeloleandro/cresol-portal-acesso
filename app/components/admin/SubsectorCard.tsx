'use client';

import Link from 'next/link';
import { Icon } from '../icons/Icon';

interface SubsectorCardProps {
  subsector: {
    id: string;
    name: string;
    description: string;
    sector_id: string;
    sector_name?: string;
    created_at: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export default function SubsectorCard({ 
  subsector, 
  onEdit, 
  onDelete,
  className = '' 
}: SubsectorCardProps) {
  const createdDate = new Date(subsector.created_at);
  const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`card-modern p-6 ${className}`}>
      {/* Header com ícone e badge de tempo */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-container-modern">
            <Icon name="folder" className="h-5 w-5 text-primary" />
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {daysAgo === 0 ? 'Hoje' : `${daysAgo} dias atrás`}
          </span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Editar sub-setor"
          >
            <Icon name="pencil" className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir sub-setor"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Título e setor pai */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        {subsector.name}
      </h3>
      
      <p className="text-sm font-medium text-primary mb-3">
        {subsector.sector_name}
      </p>

      {/* Descrição */}
      {subsector.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {subsector.description}
        </p>
      )}

      {/* Informações do sub-setor */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        <div className="text-xs text-gray-600 mb-2">
          Criado em {createdDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <Link
          href={`/admin-subsetor/subsetores/${subsector.id}`}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary text-sm font-medium rounded-md hover:bg-primary/20 transition-colors"
        >
          <Icon name="settings" className="h-4 w-4" />
          Gerenciar
        </Link>
        <Link
          href={`/subsetores/${subsector.id}/equipe`}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
        >
          <Icon name="user-group" className="h-4 w-4" />
          Equipe
        </Link>
      </div>
    </div>
  );
}
