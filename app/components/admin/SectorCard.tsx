'use client';

import Link from 'next/link';
import { Icon, IconName } from '../icons/Icon';

interface SectorCardProps {
  sector: {
    id: string;
    name: string;
    description: string;
    created_at: string;
  };
  subsectorsCount: number;
  adminsCount: number;
  subsectors: Array<{ id: string; name: string }>;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export default function SectorCard({ 
  sector, 
  subsectorsCount, 
  adminsCount, 
  subsectors,
  onEdit, 
  onDelete,
  className = '' 
}: SectorCardProps) {
  const limitedSubsectors = subsectors.slice(0, 3);
  const remainingCount = subsectors.length - 3;

  return (
    <div className={`card-modern p-6 ${className}`}>
      {/* Header com ícone e badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-container-modern">
            <Icon name="building-1" className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {subsectorsCount} sub-setores
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Editar setor"
          >
            <Icon name="pencil" className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir setor"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Título e descrição */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {sector.name}
      </h3>
      
      {sector.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {sector.description}
        </p>
      )}

      {/* Métricas */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sub-setores:</span>
          <span className="font-medium text-primary">{subsectorsCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Administradores:</span>
          <span className="font-medium text-gray-700">{adminsCount}</span>
        </div>
      </div>

      {/* Progresso visual (baseado na proporção de sub-setores) */}
      {subsectorsCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Sub-setores criados</span>
            <span>{subsectorsCount}/50</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subsectorsCount / 50) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de sub-setores */}
      {limitedSubsectors.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mb-4">
          <p className="text-xs text-gray-600 mb-2">Sub-setores:</p>
          <div className="flex flex-wrap gap-1">
            {limitedSubsectors.map(subsector => (
              <span 
                key={subsector.id} 
                className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {subsector.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{remainingCount} mais
              </span>
            )}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-2">
        <Link
          href={`/admin/sectors/${sector.id}`}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors"
        >
          <Icon name="settings" className="h-4 w-4" />
          Gerenciar
        </Link>
        <Link
          href={`/admin/sectors/${sector.id}/systems`}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Icon name="monitor-play" className="h-4 w-4" />
          Sistemas
        </Link>
      </div>
    </div>
  );
}
