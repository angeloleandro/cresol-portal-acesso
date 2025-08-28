'use client';

import React from 'react';
import { StandardModal } from './StandardModal';
import { Button } from './Button';
import { Icon } from '@/app/components/icons/Icon';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar exclusão',
  description,
  itemName,
  itemType,
  isLoading = false,
}) => {
  const getDefaultDescription = () => {
    if (description) return description;
    
    if (itemName && itemType) {
      return `Tem certeza que deseja excluir a ${itemType} "${itemName}"? Esta ação não pode ser desfeita.`;
    } else if (itemName) {
      return `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`;
    } else if (itemType) {
      return `Tem certeza que deseja excluir esta ${itemType}? Esta ação não pode ser desfeita.`;
    }
    
    return 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.';
  };

  const defaultDescription = getDefaultDescription();

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Icon name="trash" className="w-4 h-4" />
            Excluir
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
            <Icon name="AlertTriangle" className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div>
          <p className="text-gray-700 text-sm">
            {description || defaultDescription}
          </p>
        </div>
      </div>
    </StandardModal>
  );
};

export default DeleteModal;
export { DeleteModal };