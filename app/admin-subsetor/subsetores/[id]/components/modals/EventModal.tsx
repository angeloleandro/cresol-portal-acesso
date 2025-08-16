'use client';

// Modal para criação e edição de eventos - Redesenhado com Chakra UI
import { 
  Dialog, 
  Portal, 
  Button, 
  Field, 
  Input, 
  Textarea, 
  Checkbox, 
  Stack, 
  HStack, 
  Text,
  CloseButton,
  Alert
} from "@chakra-ui/react";

import { SubsectorEvent } from '../../types/subsector.types';
import { useModalFormState } from './shared/useModalFormState';

interface EventModalProps {
  isOpen: boolean;
  isEditing: boolean;
  currentEvent: Partial<SubsectorEvent>;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onChange: (event: Partial<SubsectorEvent>) => void;
}

export function EventModal({
  isOpen,
  isEditing,
  currentEvent,
  onClose,
  onSave,
  onChange
}: EventModalProps) {
  const { isSubmitting, submitError, handleSubmit, clearError } = useModalFormState({
    onSubmit: onSave,
    onClose
  });

  // Função para formatar data para input datetime-local
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  // Validação básica
  const isFormValid = currentEvent.title?.trim() && currentEvent.description?.trim() && currentEvent.start_date;

  return (
    <Dialog.Root 
      open={isOpen} 
      onOpenChange={(e) => !e.open && onClose()}
      size="lg"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            overflow="hidden"
            display="flex"
            flexDirection="column"
            maxH={{ base: "95vh", md: "90vh" }}
            w={{ base: "95vw", sm: "90vw", md: "auto" }}
            maxW={{ base: "none", md: "2xl" }}
            bg="white"
            borderRadius="md"
            shadow="xl"
            mx={{ base: "2", md: "0" }}
          >
            {/* Fixed Header */}
            <Dialog.Header 
              px={{ base: "4", md: "6" }}
              py="4" 
              borderBottomWidth="1px"
              borderBottomColor="gray.200"
              flexShrink="0"
            >
              <Dialog.Title 
                fontSize="lg" 
                fontWeight="semibold" 
                color="gray.900"
              >
                {isEditing ? 'Editar Evento' : 'Novo Evento'}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            {/* Scrollable Body */}
            <Dialog.Body 
              px={{ base: "4", md: "6" }}
              py="0"
              flex="1"
              overflowY="auto"
              overflowX="hidden"
            >
              <form 
                id="event-form"
                onSubmit={handleSubmit}
              >
                <Stack gap="4" py="4">
                  {/* Error Alert */}
                  {submitError && (
                    <Alert.Root status="error" borderRadius="md">
                      <Alert.Indicator />
                      <Alert.Title>Erro!</Alert.Title>
                      <Alert.Description>{submitError}</Alert.Description>
                    </Alert.Root>
                  )}
                  {/* Título */}
                  <Field.Root required>
                    <Field.Label 
                      fontSize="sm" 
                      fontWeight="medium" 
                      color="gray.700"
                    >
                      Título
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      placeholder="Digite o título do evento"
                      value={currentEvent.title || ''}
                      onChange={(e) => onChange({...currentEvent, title: e.target.value})}
                      size="md"
                      variant="outline"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focusVisible={{ 
                        borderColor: "cresolOrange",
                        boxShadow: "0 0 0 1px var(--chakra-colors-cresol-orange)"
                      }}
                    />
                  </Field.Root>

                  {/* Descrição */}
                  <Field.Root required>
                    <Field.Label 
                      fontSize="sm" 
                      fontWeight="medium" 
                      color="gray.700"
                    >
                      Descrição
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <Textarea
                      placeholder="Digite a descrição do evento"
                      value={currentEvent.description || ''}
                      onChange={(e) => onChange({...currentEvent, description: e.target.value})}
                      rows={4}
                      resize="vertical"
                      size="md"
                      variant="outline"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focusVisible={{ 
                        borderColor: "cresolOrange",
                        boxShadow: "0 0 0 1px var(--chakra-colors-cresol-orange)"
                      }}
                    />
                    <Field.HelperText fontSize="xs" color="gray.500">
                      Descreva detalhes importantes sobre o evento
                    </Field.HelperText>
                  </Field.Root>

                  {/* Data e Hora */}
                  <Field.Root required>
                    <Field.Label 
                      fontSize="sm" 
                      fontWeight="medium" 
                      color="gray.700"
                    >
                      Data e Hora
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="datetime-local"
                      value={formatDateForInput(currentEvent.start_date || '')}
                      onChange={(e) => onChange({...currentEvent, start_date: e.target.value})}
                      size="md"
                      variant="outline"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focusVisible={{ 
                        borderColor: "cresolOrange",
                        boxShadow: "0 0 0 1px var(--chakra-colors-cresol-orange)"
                      }}
                    />
                    <Field.HelperText fontSize="xs" color="gray.500">
                      Selecione a data e hora de início do evento
                    </Field.HelperText>
                  </Field.Root>

                  {/* Opções de Publicação */}
                  <Stack gap="3">
                    <Text 
                      fontSize="sm" 
                      fontWeight="medium" 
                      color="gray.700"
                    >
                      Opções de Publicação
                    </Text>
                    
                    <Stack gap="2">
                      {/* Destacar */}
                      <Checkbox.Root
                        checked={currentEvent.is_featured || false}
                        onCheckedChange={(e) => onChange({...currentEvent, is_featured: !!e.checked})}
                        size="sm"
                        colorPalette="orange"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label fontSize="sm" color="gray.700">
                          Destacar evento
                        </Checkbox.Label>
                      </Checkbox.Root>

                      {/* Publicar */}
                      <Checkbox.Root
                        checked={currentEvent.is_published || false}
                        onCheckedChange={(e) => onChange({...currentEvent, is_published: !!e.checked})}
                        size="sm"
                        colorPalette="orange"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label fontSize="sm" color="gray.700">
                          Publicar imediatamente
                        </Checkbox.Label>
                      </Checkbox.Root>

                      {!currentEvent.is_published && (
                        <Text fontSize="xs" color="orange.600" ml="6">
                          O evento será salvo como rascunho
                        </Text>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </form>
            </Dialog.Body>

            {/* Fixed Footer */}
            <Dialog.Footer 
              px={{ base: "4", md: "6" }}
              py="4" 
              borderTopWidth="1px"
              borderTopColor="gray.200"
              flexShrink="0"
            >
              <HStack 
                gap="3" 
                justify="flex-end" 
                width="full"
                flexDirection={{ base: "column-reverse", sm: "row" }}
              >
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    size="md"
                    colorPalette="gray"
                    onClick={onClose}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Cancelar
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  type="submit"
                  form="event-form"
                  variant="solid"
                  colorPalette="orange"
                  size="md"
                  bg="cresolOrange"
                  color="white"
                  _hover={{ bg: "orange.600" }}
                  width={{ base: "full", sm: "auto" }}
                  loading={isSubmitting}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting 
                    ? (isEditing ? 'Salvando...' : 'Criando...')
                    : (isEditing ? 'Salvar Alterações' : 'Criar Evento')
                  }
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}