// Componente Modal unificado com Chakra UI v3
// Substitui todas as implementações de modais do projeto

'use client';

import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogBody,
  DialogCloseTrigger,
  DialogTitle,
  DialogBackdrop,
  Portal,
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  closeOnOverlayClick = true,
  size = 'md',
}: ModalProps) {
  return (
    <Portal>
      <DialogRoot
        open={isOpen}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose();
          }
        }}
        size={size}
        placement="center"
        motionPreset="slide-in-bottom"
        unmountOnExit={false}
        closeOnInteractOutside={closeOnOverlayClick}
      >
        <DialogBackdrop 
          bg="blackAlpha.600" 
          position="fixed"
          inset={0}
          style={{ zIndex: 10000 }}
          backdropFilter="blur(4px)"
        />
        <DialogContent
          bg="white"
          borderRadius="md"
          boxShadow="lg"
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          style={{ zIndex: 10001 }}
          maxH="90vh"
          overflow="auto"
          m={4}
          w={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          maxW="95vw"
        >
          {title && (
            <DialogHeader borderBottom="1px solid" borderColor="gray.200" pb={3}>
              <DialogTitle fontSize="lg" fontWeight="semibold">
                {title}
              </DialogTitle>
            </DialogHeader>
          )}
          
          {showCloseButton && <DialogCloseTrigger />}
          
          <DialogBody py={4}>{children}</DialogBody>
          
          {footer && (
            <DialogFooter borderTop="1px solid" borderColor="gray.200" pt={3} gap={3}>
              {footer}
            </DialogFooter>
          )}
        </DialogContent>
      </DialogRoot>
    </Portal>
  );
}

// Confirmation Modal - Substitui ConfirmationModal
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonText?: string; // Alias para confirmText
  cancelButtonText?: string; // Alias para cancelText
  isDangerous?: boolean;
  isLoading?: boolean;
  requiresConfirmationInput?: boolean; // Para inputs de confirmação
  confirmationText?: string; // Texto de confirmação necessário
  confirmationLabel?: string; // Label do campo de confirmação
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonText, // Alias
  cancelButtonText, // Alias
  isDangerous = false,
  isLoading = false,
  requiresConfirmationInput = false,
  confirmationText = '',
  confirmationLabel = '',
}: ConfirmationModalProps) {
  // Use alias se fornecido, senão use o valor original
  const finalConfirmText = confirmButtonText || confirmText;
  const finalCancelText = cancelButtonText || cancelText;
  const handleConfirm = async () => {
    await onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {finalCancelText}
          </Button>
          <Button
            variant='solid'
            colorPalette={isDangerous ? 'red' : 'orange'}
            onClick={handleConfirm}
            loading={isLoading}
            loadingText="Processando..."
          >
            {finalConfirmText}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}

// Delete Modal - Substitui DeleteModal
export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isLoading = false,
}: DeleteModalProps) {
  const message = itemName
    ? `Tem certeza que deseja excluir ${itemType} "${itemName}"? Esta ação não pode ser desfeita.`
    : `Tem certeza que deseja excluir este ${itemType}? Esta ação não pode ser desfeita.`;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Excluir ${itemType}`}
      message={message}
      confirmText="Excluir"
      cancelText="Cancelar"
      isDangerous={true}
      isLoading={isLoading}
    />
  );
}

// Hook para facilitar uso de modais
export function useModal(initialState = false) {
  return useDisclosure({ defaultOpen: initialState });
}