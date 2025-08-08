
import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  requiresConfirmationInput?: boolean;
  confirmationText?: string;
  confirmationLabel?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  requiresConfirmationInput = false,
  confirmationText = '',
  confirmationLabel = '',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(!requiresConfirmationInput);

  useEffect(() => {
    if (requiresConfirmationInput) {
      setIsConfirmed(inputValue.toLowerCase() === confirmationText.toLowerCase());
    }
  }, [inputValue, confirmationText, requiresConfirmationInput]);

  useEffect(() => {
    // Reset input value when modal is opened
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!requiresConfirmationInput || isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="card w-full max-w-md scrollbar-modal">
        <h2 className="heading-4 mb-4">{title}</h2>
        <p className="body-text mb-4" dangerouslySetInnerHTML={{ __html: message }}></p>
        {requiresConfirmationInput && (
          <div className="mb-4">
            <label htmlFor="confirmation-input" className="form-label">
              {confirmationLabel}
            </label>
            <input
              id="confirmation-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="input"
              placeholder={confirmationText}
            />
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-outline disabled:opacity-50"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (requiresConfirmationInput && !isConfirmed)}
            className="bg-red-600 text-white px-4 py-2 rounded-md border border-red-600 hover:border-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors duration-150 min-h-[44px] inline-flex items-center justify-center font-medium"
          >
            {isLoading ? 'Excluindo...' : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
