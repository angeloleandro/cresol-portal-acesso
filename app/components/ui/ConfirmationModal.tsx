'use client';

import React, { useState, useEffect } from 'react';
import { StandardModal } from './StandardModal';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  // Support both legacy and new props
  description?: string;
  message?: React.ReactNode | string;
  // Button text customization
  confirmText?: string;
  cancelText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  // Loading states
  isLoading?: boolean;
  // Confirmation input functionality
  requiresConfirmationInput?: boolean;
  confirmationText?: string;
  confirmationLabel?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonText,
  cancelButtonText,
  isLoading = false,
  requiresConfirmationInput = false,
  confirmationText = '',
  confirmationLabel = 'Digite para confirmar',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);

  // Reset input when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  // Validate confirmation input
  useEffect(() => {
    if (requiresConfirmationInput) {
      setIsConfirmDisabled(inputValue.trim() !== confirmationText);
    } else {
      setIsConfirmDisabled(false);
    }
  }, [inputValue, confirmationText, requiresConfirmationInput]);

  const finalConfirmText = confirmButtonText || confirmText;
  const finalCancelText = cancelButtonText || cancelText;
  const content = message || description;

  const handleConfirm = () => {
    if (!requiresConfirmationInput || inputValue.trim() === confirmationText) {
      onConfirm();
    }
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={requiresConfirmationInput ? "md" : "sm"}
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {finalCancelText}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isConfirmDisabled}
          >
            {finalConfirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Main message content */}
        {typeof content === 'string' ? (
          <p className="text-gray-700 text-sm whitespace-pre-line">
            {content}
          </p>
        ) : content ? (
          <div className="text-gray-700 text-sm">
            {content}
          </div>
        ) : null}

        {/* Confirmation input field if required */}
        {requiresConfirmationInput && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {confirmationLabel}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder={confirmationText}
              disabled={isLoading}
              autoFocus
            />
            {inputValue && inputValue.trim() !== confirmationText && (
              <p className="text-red-600 text-xs">
                O texto deve corresponder exatamente
              </p>
            )}
          </div>
        )}
      </div>
    </StandardModal>
  );
};

export default ConfirmationModal;
export { ConfirmationModal };