'use client';

// Collection Modal Component
// Modal de criação e edição de coleções - Portal Cresol

import type React from 'react';
import { useState } from 'react';
import { Collection } from '@/lib/types/collections';
import CollectionForm, { CollectionFormData } from './CollectionForm';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection | null;
  mode: 'create' | 'edit';
  onSubmit: (data: any) => Promise<void>;
}

const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
  mode,
  onSubmit,
}) => {
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form submission
  const handleSubmit = async (formData: CollectionFormData) => {
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao salvar coleção' });
      throw error; // Re-throw to keep form open
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? 'Nova Coleção' : 'Editar Coleção'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-4">
            <CollectionForm
              collection={collection}
              mode={mode}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
              errors={errors}
              className="space-y-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;