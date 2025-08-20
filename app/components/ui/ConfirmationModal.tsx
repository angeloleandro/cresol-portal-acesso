
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@/app/components/icons/Icon';

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
  type?: 'delete' | 'warning' | 'info';
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
  type = 'delete',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(!requiresConfirmationInput);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requiresConfirmationInput) {
      setIsConfirmed(inputValue.toLowerCase() === confirmationText.toLowerCase());
    }
  }, [inputValue, confirmationText, requiresConfirmationInput]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      setInputValue('');
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!isLoading && (!requiresConfirmationInput || isConfirmed)) {
      await onConfirm();
    }
  };

  const getIconConfig = () => {
    switch (type) {
      case 'delete':
        return { icon: 'trash' as const, bgColor: 'bg-red-100', iconColor: 'text-red-600' };
      case 'warning':
        return { icon: 'triangle-alert' as const, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' };
      case 'info':
        return { icon: 'info' as const, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
      default:
        return { icon: 'trash' as const, bgColor: 'bg-red-100', iconColor: 'text-red-600' };
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      default:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    }
  };

  const iconConfig = getIconConfig();
  const buttonColor = getButtonColor();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200"
      >
        {/* Icon */}
        <div className="flex justify-center pt-6 pb-2">
          <div className={`w-12 h-12 rounded-full ${iconConfig.bgColor} flex items-center justify-center`}>
            <Icon name={iconConfig.icon} className={`h-6 w-6 ${iconConfig.iconColor}`} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <div 
            className="text-sm text-gray-600"
            dangerouslySetInnerHTML={{ __html: message }}
          />
          {requiresConfirmationInput && (
            <div className="mt-4">
              <label htmlFor="confirmation-input" className="block text-sm font-medium text-gray-700 mb-2">
                {confirmationLabel}
              </label>
              <input
                id="confirmation-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                placeholder={confirmationText}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (requiresConfirmationInput && !isConfirmed)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${buttonColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processando...</span>
              </>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
