'use client';

// Collection Card Component
// Card individual para exibição de coleção - Portal Cresol

import Image from 'next/image';
import { CollectionCardProps } from './Collection.types';
import { formatCollection } from '@/lib/utils/collections';
import { cn } from '@/lib/utils/cn';
import { CSS_CLASSES } from '@/lib/constants/collections';
import Icon from '@/app/components/icons/Icon';

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  showStats = true,
  showActions = false,
  onClick,
  onEdit,
  onDelete,
  onToggleStatus,
  className,
}) => {
  const handleCardClick = () => {
    onClick?.(collection);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(collection);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(collection);
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus?.(collection);
  };

  return (
    <div
      className={cn(
        CSS_CLASSES.CARD_BASE,
        'group overflow-hidden cursor-pointer',
        !collection.is_active && 'opacity-60',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <div className="aspect-video relative bg-gray-100 overflow-hidden">
        {collection.cover_image_url ? (
          <Image
            src={collection.cover_image_url}
            alt={collection.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="mb-2 text-gray-400">
                {collection.type === 'images' && <Icon name="image" className="w-12 h-12" />}
                {collection.type === 'videos' && <Icon name="video" className="w-12 h-12" />}
                {collection.type === 'mixed' && <Icon name="folder" className="w-12 h-12" />}
              </div>
              <span className="text-sm font-medium">
                {formatCollection.typeLabelPortuguese(collection.type)}
              </span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {!collection.is_active && (
          <div className="absolute top-2 left-2">
            <span className={CSS_CLASSES.STATUS_INACTIVE}>
              Inativo
            </span>
          </div>
        )}

        {/* Collection Type Badge */}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-black/60 text-white">
            {formatCollection.typeLabelPortuguese(collection.type)}
          </span>
        </div>

        {/* Actions Overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              onClick={handleEdit}
              className="bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-lg shadow-lg transition-colors"
              title="Editar coleção"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={handleToggleStatus}
              className={cn(
                "p-2 rounded-lg shadow-lg transition-colors",
                collection.is_active
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              )}
              title={collection.is_active ? "Desativar" : "Ativar"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {collection.is_active ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-colors"
              title="Excluir coleção"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={CSS_CLASSES.CARD_CONTENT}>
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {collection.name}
        </h3>

        {/* Description */}
        {collection.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {collection.description}
          </p>
        )}

        {/* Stats */}
        {showStats && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {formatCollection.itemCount(collection.item_count || 0)}
            </span>
            
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatCollection.dateRelative(collection.created_at)}
            </span>
          </div>
        )}

        {/* Color Theme Indicator */}
        {collection.color_theme && (
          <div className="absolute top-4 left-4">
            <div
              className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: collection.color_theme }}
              title={`Tema: ${collection.color_theme}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionCard;