'use client';

// Collection Modal Component
// Modal de criação e edição de coleções - Portal Cresol

import { useState } from 'react';

import Button from '@/app/components/ui/Button';
import { Collection, CollectionFormData } from '@/lib/types/collections';

import CollectionForm from './CollectionForm';

import type React from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header - Fixed */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'create' ? 'Nova Coleção' : 'Editar Coleção'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {mode === 'create' ? 'Crie uma nova coleção para organizar conteúdos' : 'Atualize as informações da coleção'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="xs"
            onClick={onClose}
            className="ml-4 !p-1"
            aria-label="Fechar modal"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
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
  );
};

export default CollectionModal;