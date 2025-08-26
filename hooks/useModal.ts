// Hook reutilizável para gerenciamento de modais
// Centraliza estado e lógica de modais

import { useState, useCallback } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

// Hook estendido com dados
interface UseModalWithDataReturn<T> extends UseModalReturn {
  data: T | null;
  openWithData: (data: T) => void;
  clearData: () => void;
}

export function useModalWithData<T>(initialState = false): UseModalWithDataReturn<T> {
  const modal = useModal(initialState);
  const [data, setData] = useState<T | null>(null);

  const openWithData = useCallback((newData: T) => {
    setData(newData);
    modal.open();
  }, [modal]);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  const close = useCallback(() => {
    modal.close();
    // Clear data after a delay to avoid flicker during close animation
    setTimeout(() => {
      setData(null);
    }, 300);
  }, [modal]);

  return {
    ...modal,
    close,
    data,
    openWithData,
    clearData
  };
}