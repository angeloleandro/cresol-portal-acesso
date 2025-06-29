
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
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-4" dangerouslySetInnerHTML={{ __html: message }}></p>
        {requiresConfirmationInput && (
          <div className="mb-4">
            <label htmlFor="confirmation-input" className="block text-sm font-medium text-gray-700 mb-2">
              {confirmationLabel}
            </label>
            <input
              id="confirmation-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={confirmationText}
            />
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (requiresConfirmationInput && !isConfirmed)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Excluindo...' : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
