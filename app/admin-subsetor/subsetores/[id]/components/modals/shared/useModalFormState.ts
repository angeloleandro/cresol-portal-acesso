// Hook customizado para gerenciar estado de formulários em modais
import { useState, useCallback } from 'react';

interface UseModalFormStateProps {
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  onClose: () => void;
}

export function useModalFormState({ onSubmit, onClose }: UseModalFormStateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await onSubmit(e);
      // Se chegou até aqui, o submit foi bem-sucedido
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSubmitError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, onClose, isSubmitting]);

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return {
    isSubmitting,
    submitError,
    handleSubmit,
    clearError
  };
}