import { useState, useCallback } from 'react';

interface DeleteModalState {
  isOpen: boolean;
  itemToDelete: any | null;
  itemName: string;
  itemType: string;
}

export function useDeleteModal(itemType: string = 'item') {
  const [modalState, setModalState] = useState<DeleteModalState>({
    isOpen: false,
    itemToDelete: null,
    itemName: '',
    itemType
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = useCallback((item: any, name?: string) => {
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

  const confirmDelete = useCallback(async (deleteFunction: (item: any) => Promise<void>) => {
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