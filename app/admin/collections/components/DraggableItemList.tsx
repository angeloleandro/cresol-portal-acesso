'use client';

// Draggable Item List Component
// Lista de itens com funcionalidade de drag & drop para reordenação - Portal Cresol

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { CollectionItem } from '@/lib/types/collections';
import { cn } from '@/lib/utils/cn';
import Icon from '@/app/components/icons/Icon';
import { InlineSpinner } from '@/app/components/ui/StandardizedSpinner';

interface DraggableItemListProps {
  items: CollectionItem[];
  onReorder: (reorderedItems: CollectionItem[]) => Promise<void>;
  onRemove?: (item: CollectionItem) => void;
  className?: string;
  isLoading?: boolean;
}

const DraggableItemList: React.FC<DraggableItemListProps> = ({
  items,
  onReorder,
  onRemove,
  className,
  isLoading = false,
}) => {
  // State for drag operations
  const [draggedItem, setDraggedItem] = useState<CollectionItem | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Refs for touch support
  const dragCounterRef = useRef(0);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, item: CollectionItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.id);
    
    // Set drag image to be more transparent
    if (e.dataTransfer.setDragImage) {
      const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
      dragElement.style.opacity = '0.5';
      e.dataTransfer.setDragImage(dragElement, 0, 0);
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDraggedOver(null);
    dragCounterRef.current = 0;
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drag enter
  const handleDragEnter = (e: React.DragEvent, targetItem: CollectionItem) => {
    e.preventDefault();
    dragCounterRef.current++;
    
    if (draggedItem && draggedItem.id !== targetItem.id) {
      setDraggedOver(targetItem.id);
    }
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setDraggedOver(null);
    }
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, targetItem: CollectionItem) => {
    e.preventDefault();
    setDraggedOver(null);
    dragCounterRef.current = 0;

    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }

    // Calculate new order
    const reorderedItems = [...items];
    const draggedIndex = reorderedItems.findIndex(item => item.id === draggedItem.id);
    const targetIndex = reorderedItems.findIndex(item => item.id === targetItem.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Remove dragged item and insert at target position
    const [draggedElement] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, draggedElement);

    // Update order_index for all items
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order_index: index,
    }));

    setDraggedItem(null);
    setIsReordering(true);

    try {
      await onReorder(updatedItems);
    } catch (error) {
      console.error('Error reordering items:', error);
    } finally {
      setIsReordering(false);
    }
  };

  // Handle keyboard reordering (accessibility)
  const handleKeyDown = (e: React.KeyboardEvent, item: CollectionItem, index: number) => {
    if (e.key === 'ArrowUp' && e.altKey && index > 0) {
      e.preventDefault();
      moveItem(index, index - 1);
    } else if (e.key === 'ArrowDown' && e.altKey && index < items.length - 1) {
      e.preventDefault();
      moveItem(index, index + 1);
    }
  };

  // Move item by index
  const moveItem = async (fromIndex: number, toIndex: number) => {
    const reorderedItems = [...items];
    const [movedItem] = reorderedItems.splice(fromIndex, 1);
    reorderedItems.splice(toIndex, 0, movedItem);

    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order_index: index,
    }));

    setIsReordering(true);
    try {
      await onReorder(updatedItems);
    } catch (error) {
      console.error('Error reordering items:', error);
    } finally {
      setIsReordering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="mb-2">
          <Icon name="folder" className="w-12 h-12 mx-auto" />
        </div>
        <p>Nenhum item na coleção</p>
        <p className="text-sm mt-1">Adicione itens para começar a organizar</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Como reordenar itens:</p>
            <ul className="mt-1 text-xs space-y-1">
              <li>• <strong>Arrastar e soltar:</strong> Clique e arraste os itens para reordenar</li>
              <li>• <strong>Teclado:</strong> Alt + ↑/↓ para mover o item selecionado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reordering indicator */}
      {isReordering && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <InlineSpinner size="sm" variant="admin" color="#D97706" className="mr-2" />
            <span className="text-sm text-yellow-800">Salvando nova ordem...</span>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable={!isLoading && !isReordering}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, item)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item)}
            onKeyDown={(e) => handleKeyDown(e, item, index)}
            tabIndex={0}
            className={cn(
              "group relative bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200",
              "hover:shadow-md hover:border-gray-300",
              !isLoading && !isReordering && "cursor-move",
              draggedItem?.id === item.id && "opacity-50 scale-95",
              draggedOver === item.id && "border-primary border-2 bg-primary/5 scale-105",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
          >
            {/* Drag Handle */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex items-center space-x-4 ml-8">
              {/* Order Index */}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                {index + 1}
              </div>

              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                  {item.item_type === 'image' && item.item_data && 'image_url' in item.item_data && item.item_data.image_url && (
                    <Image
                      src={item.item_data.image_url}
                      alt={'title' in item.item_data ? item.item_data.title || 'Imagem' : 'Imagem'}
                      width={64}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {item.item_type === 'video' && (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      {item.item_data && 'thumbnail_url' in item.item_data && item.item_data.thumbnail_url ? (
                        <Image
                          src={item.item_data.thumbnail_url}
                          alt={'title' in item.item_data ? item.item_data.title || 'Vídeo' : 'Vídeo'}
                          width={64}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {(item.item_data && 'title' in item.item_data ? item.item_data.title : null) || `${item.item_type === 'image' ? 'Imagem' : 'Vídeo'} sem título`}
                </h4>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs text-gray-500 capitalize">
                    {item.item_type === 'image' ? 'Imagem' : 'Vídeo'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Posição {item.order_index + 1}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {/* Move Up */}
                {index > 0 && (
                  <button
                    onClick={() => moveItem(index, index - 1)}
                    disabled={isLoading || isReordering}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                )}

                {/* Move Down */}
                {index < items.length - 1 && (
                  <button
                    onClick={() => moveItem(index, index + 1)}
                    disabled={isLoading || isReordering}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}

                {/* Remove */}
                {onRemove && (
                  <button
                    onClick={() => onRemove(item)}
                    disabled={isLoading || isReordering}
                    className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remover item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Drop indicator */}
            {draggedOver === item.id && (
              <div className="absolute inset-0 border-2 border-primary rounded-lg bg-primary/10 pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraggableItemList;