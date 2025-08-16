'use client';

// Modal para criação e edição de notícias - Redesenhado com Chakra UI
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

import { SubsectorNews } from '../../types/subsector.types';
import { useModalFormState } from './shared/useModalFormState';

interface NewsModalProps {
  isOpen: boolean;
  isEditing: boolean;
  currentNews: Partial<SubsectorNews>;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onChange: (news: Partial<SubsectorNews>) => void;
}

export function NewsModal({
  isOpen,
  isEditing,
  currentNews,
  onClose,
  onSave,
  onChange
}: NewsModalProps) {
  const { isSubmitting, submitError, handleSubmit, clearError } = useModalFormState({
    onSubmit: onSave,
    onClose
  });

  // Validação básica
  const isFormValid = currentNews.title?.trim() && currentNews.summary?.trim();

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
                {isEditing ? 'Editar Notícia' : 'Nova Notícia'}
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
                id="news-form"
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
                      placeholder="Digite o título da notícia"
                      value={currentNews.title || ''}
                      onChange={(e) => onChange({...currentNews, title: e.target.value})}
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

                  {/* Resumo */}
                  <Field.Root required>
                    <Field.Label 
                      fontSize="sm" 
                      fontWeight="medium" 
                      color="gray.700"
                    >
                      Resumo
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <Textarea
                      placeholder="Digite um resumo da notícia"
                      value={currentNews.summary || ''}
                      onChange={(e) => onChange({...currentNews, summary: e.target.value})}
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
                      O resumo será exibido na listagem de notícias
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
                        checked={currentNews.is_featured || false}
                        onCheckedChange={(e) => onChange({...currentNews, is_featured: !!e.checked})}
                        size="sm"
                        colorPalette="orange"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label fontSize="sm" color="gray.700">
                          Destacar notícia
                        </Checkbox.Label>
                      </Checkbox.Root>

                      {/* Publicar */}
                      <Checkbox.Root
                        checked={currentNews.is_published || false}
                        onCheckedChange={(e) => onChange({...currentNews, is_published: !!e.checked})}
                        size="sm"
                        colorPalette="orange"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label fontSize="sm" color="gray.700">
                          Publicar imediatamente
                        </Checkbox.Label>
                      </Checkbox.Root>

                      {!currentNews.is_published && (
                        <Text fontSize="xs" color="orange.600" ml="6">
                          A notícia será salva como rascunho
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
                  form="news-form"
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
                    : (isEditing ? 'Salvar Alterações' : 'Criar Notícia')
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