import { useState, useCallback } from 'react';

/**
 * Interface para itens que podem ser deletados
 */
export interface DeletableItem {
  id: string;
  title?: string;
  name?: string;
}

interface DeleteModalState<T extends DeletableItem = DeletableItem> {
  isOpen: boolean;
  itemToDelete: T | null;
  itemName: string;
  itemType: string;
}

/**
 * Hook para gerenciar modal de confirmação de exclusão
 * @param itemType - Tipo do item para exibição no modal
 * @returns Objeto com estado e funções do modal de exclusão
 */
export function useDeleteModal<T extends DeletableItem = DeletableItem>(itemType: string = 'item') {
  const [modalState, setModalState] = useState<DeleteModalState<T>>({
    isOpen: false,
    itemToDelete: null,
    itemName: '',
    itemType
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = useCallback((item: T, name?: string) => {
    setModalState({
      isOpen: true,
      itemToDelete: item,
      itemName: name || item.title || item.name || '(Sem nome)',
      itemType
    });
  }, [itemType]);

  const closeDeleteModal = useCallback(() => {
    if (!isDeleting) {
      setModalState(prev => ({
        ...prev,
        isOpen: false,
        itemToDelete: null,
        itemName: ''
      }));
    }
  }, [isDeleting]);

  const confirmDelete = useCallback(async (deleteFunction: (item: T) => Promise<void>) => {
    if (!modalState.itemToDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteFunction(modalState.itemToDelete);
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  }, [modalState.itemToDelete, isDeleting, closeDeleteModal]);

  return {
    isOpen: modalState.isOpen,
    itemToDelete: modalState.itemToDelete,
    itemName: modalState.itemName,
    itemType: modalState.itemType,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete
  };
}