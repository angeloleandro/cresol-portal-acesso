'use client';

// Delete Confirmation Modal Component
// Modal de confirmação de exclusão de coleções - Portal Cresol

import React, { useState } from 'react';
import { Collection } from '@/lib/types/collections';
import { formatCollection } from '@/lib/utils/collections';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection | null;
  onConfirm: () => Promise<void>;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  collection,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
      setConfirmText('');
    }
  }, [isOpen]);

  // Handle confirmation
  const handleConfirm = async () => {
    if (!collection || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done by parent component
      setIsDeleting(false);
    }
  };

  // Don't render if not open or no collection
  if (!isOpen || !collection) return null;

  // Check if user typed collection name correctly
  const canDelete = confirmText.toLowerCase() === collection.name.toLowerCase();
  const hasItems = 'items' in collection ? (collection as any).items?.length > 0 : false;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          
          {/* Header */}
          <div className="bg-white px-6 py-4">
            <div className="flex items-center">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Excluir Coleção
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Esta ação não pode ser desfeita. A coleção será permanentemente removida.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4 space-y-4">
            {/* Collection Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{collection.name}</h4>
                  {collection.description && (
                    <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>
                      {formatCollection.typeLabelPortuguese(collection.type)}
                    </span>
                    <span>
                      Criado em {formatCollection.dateRelative(collection.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  collection.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {collection.is_active ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>

            {/* Warning about items */}
            {hasItems && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Atenção: Esta coleção contém itens
                    </h3>
                    <div className="mt-1 text-sm text-amber-700">
                      <p>
                        Todos os itens da coleção também serão removidos permanentemente.
                        As imagens e vídeos originais permanecerão nas galerias individuais.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Input */}
            <div>
              <label htmlFor="confirm-name" className="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, digite o nome da coleção:
              </label>
              <input
                type="text"
                id="confirm-name"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={collection.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isDeleting}
              />
              
              {confirmText && !canDelete && (
                <p className="text-red-600 text-sm mt-1">
                  O nome não confere. Digite exatamente: &quot;{collection.name}&quot;
                </p>
              )}
            </div>

            {/* Consequences List */}
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">O que será removido:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>A coleção &quot;{collection.name}&quot;</li>
                <li>Todas as associações de itens desta coleção</li>
                <li>Configurações e metadados da coleção</li>
                {hasItems && (
                  <li>Todos os itens organizados nesta coleção</li>
                )}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canDelete || isDeleting}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? (
                <div className="flex items-center justify-center">
                  <UnifiedLoadingSpinner size="small" className="inline-flex items-center mr-2" />
                  Excluindo...
                </div>
              ) : (
                'Excluir Permanentemente'
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;