// Sistema genérico unificado para todos os componentes Management
// Elimina duplicações massivas com configuração paramétrica avançada

import React, { useState, useRef } from 'react';

import { ImageUploadCropper } from '@/app/components/admin/shared/ImageUploadCropper';
import { ToggleDraftsButton } from '@/app/components/admin/shared/ToggleDraftsButton';
import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { useImageUpload } from '@/hooks/useImageUpload';

// Base interface that all managed items must implement
export interface BaseManagementItem {
  id: string;
  title: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  [key: string]: unknown;
}

// Field definition for dynamic form generation
export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'file' | 'url' | 'select' | 'checkbox' | 'date' | 'datetime';
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string; // for file inputs
}

// Configuration for the generic management system
export interface ManagementConfig<T> {
  entityType: 'sector' | 'subsector';
  contentType: 'news' | 'events' | 'documents' | 'messages' | 'groups' | 'images' | 'videos';
  apiEndpoint: string;
  entityIdField: string;
  useAlerts: boolean;
  requestStructure: 'admin' | 'subsector';
  
  // Form configuration
  formFields: FormField[];
  
  // Display configuration
  itemDisplayTemplate: (item: T) => React.ReactNode;
  modalTitle: {
    create: string;
    edit: string;
  };
  emptyStateMessages: {
    published: string;
    drafts: string;
  };
  
  // Validation
  customValidation?: (item: Partial<T>) => string[];
  
  // File handling
  supportsImageUpload?: boolean;
  supportsFileUpload?: boolean;
}

interface GenericManagementProps<T extends BaseManagementItem> {
  entityId: string;
  items: T[];
  showDrafts: boolean;
  totalDraftCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  config: ManagementConfig<T>;
}

/**
 * GenericManagement function
 * @todo Add proper documentation
 */
const GenericManagementComponent = function GenericManagement<T extends BaseManagementItem>({
  entityId,
  items,
  showDrafts,
  totalDraftCount,
  onToggleDrafts,
  onRefresh,
  onDelete,
  config
}: GenericManagementProps<T>) {
  const alert = useAlert();
  const deleteModal = useDeleteModal<T>(config.contentType === 'news' ? 'notícia' : 
    config.contentType === 'events' ? 'evento' :
    config.contentType === 'documents' ? 'documento' :
    config.contentType === 'messages' ? 'mensagem' :
    config.contentType === 'groups' ? 'grupo' :
    config.contentType === 'images' ? 'imagem' :
    'vídeo'
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<T>>({
    is_featured: false,
    is_published: true
  } as Partial<T>);

  const imageUpload = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = (item?: T) => {
    if (item) {
      setCurrentItem(item);
      setIsEditing(true);
      // Reset image upload state
      if (config.supportsImageUpload) {
        imageUpload.handleRemoveImage();
      }
    } else {
      setCurrentItem({
        is_featured: false,
        is_published: true
      } as Partial<T>);
      setIsEditing(false);
      if (config.supportsImageUpload) {
        imageUpload.handleRemoveImage();
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem({
      is_featured: false,
      is_published: true
    } as Partial<T>);
    if (config.supportsImageUpload) {
      imageUpload.handleRemoveImage();
    }
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];
    
    // Run field validations
    config.formFields.forEach(field => {
      const value = (currentItem as any)[field.key];
      
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        validationErrors.push(`${field.label} é obrigatório`);
        return;
      }
      
      if (value && typeof value === 'string') {
        if (field.minLength && value.length < field.minLength) {
          validationErrors.push(`${field.label} deve ter pelo menos ${field.minLength} caracteres`);
        }
        if (field.maxLength && value.length > field.maxLength) {
          validationErrors.push(`${field.label} deve ter no máximo ${field.maxLength} caracteres`);
        }
      }
    });
    
    // Run custom validation if provided
    if (config.customValidation) {
      const customErrors = config.customValidation(currentItem);
      validationErrors.push(...customErrors);
    }
    
    return validationErrors;
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      if (config.useAlerts && alert) {
        alert.showError('Erros de validação', validationErrors.join('\n'));
      }
      return;
    }

    setIsSaving(true);

    try {
      // Handle image upload if supported
      let finalImageUrl = (currentItem as any).image_url;
      if (config.supportsImageUpload && imageUpload.originalImage) {
        const croppedUrl = await imageUpload.handleCropImage();
        if (croppedUrl) {
          finalImageUrl = croppedUrl;
        }
      } else if (config.supportsImageUpload && imageUpload.imagePreview) {
        finalImageUrl = imageUpload.imagePreview;
      }

      const method = isEditing ? 'PUT' : 'POST';
      
      // Build request data based on structure type
      let requestData: any;
      
      const itemData = {
        ...currentItem,
        ...(config.supportsImageUpload && { image_url: finalImageUrl })
      };
      
      // Trim string fields
      config.formFields.forEach(field => {
        if (field.type === 'text' || field.type === 'textarea') {
          const value = (itemData as any)[field.key];
          if (value && typeof value === 'string') {
            (itemData as any)[field.key] = value.trim();
          }
        }
      });
      
      if (config.requestStructure === 'admin') {
        requestData = {
          type: config.contentType,
          [config.entityIdField]: entityId,
          data: {
            ...itemData,
            [config.entityIdField]: entityId
          }
        };
      } else {
        requestData = {
          [config.entityIdField]: entityId,
          data: itemData
        };
      }
      
      const response = await fetch(config.apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = `Erro ao salvar ${config.contentType === 'news' ? 'notícia' : 
          config.contentType === 'events' ? 'evento' :
          config.contentType === 'documents' ? 'documento' :
          config.contentType === 'messages' ? 'mensagem' :
          config.contentType === 'groups' ? 'grupo' :
          config.contentType === 'images' ? 'imagem' :
          'vídeo'}`;
        
        if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }
        
        throw new Error(errorMessage);
      }
      
      // Close modal first for better UX
      handleCloseModal();
      
      // Show success message if using alerts
      if (config.useAlerts && alert) {
        const itemType = config.contentType === 'news' ? 'notícia' : 
          config.contentType === 'events' ? 'evento' :
          config.contentType === 'documents' ? 'documento' :
          config.contentType === 'messages' ? 'mensagem' :
          config.contentType === 'groups' ? 'grupo' :
          config.contentType === 'images' ? 'imagem' :
          'vídeo';
          
        if (isEditing) {
          alert.showSuccess('Sucesso', `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} atualizada com sucesso`);
        } else {
          alert.showSuccess('Sucesso', `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} criada com sucesso`);
        }
      }
      
      // Then refresh data to show the new/updated item
      await onRefresh();
      
    } catch (error: any) {
      const userMessage = error.message.includes('fetch')
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : error.message || 'Erro desconhecido. Tente novamente.';
        
      if (config.useAlerts && alert) {
        alert.showError('Erro', userMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (item: T) => {
    deleteModal.openDeleteModal(item, item.title);
  };

  const handleDeleteItem = async (item: T) => {
    try {
      await onDelete(item.id);
      
      if (config.useAlerts && alert) {
        const itemType = config.contentType === 'news' ? 'notícia' : 
          config.contentType === 'events' ? 'evento' :
          config.contentType === 'documents' ? 'documento' :
          config.contentType === 'messages' ? 'mensagem' :
          config.contentType === 'groups' ? 'grupo' :
          config.contentType === 'images' ? 'imagem' :
          'vídeo';
        alert.showSuccess('Sucesso', `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} excluída com sucesso`);
      }
      // onDelete já chama refreshContent internamente
    } catch (error) {

      if (config.useAlerts && alert) {
        alert.showError('Erro ao deletar', error instanceof Error ? error.message : 'Erro desconhecido');
      }
    }
  };

  const renderFormField = (field: FormField) => {
    const value = (currentItem as any)[field.key] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              {field.maxLength && (
                <span className="text-xs text-gray-500 ml-1">
                  ({value.length || 0}/{field.maxLength})
                </span>
              )}
            </label>
            <textarea
              value={value}
              onChange={(e) => setCurrentItem({ ...currentItem, [field.key]: e.target.value })}
              rows={field.rows || 3}
              className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                field.minLength && value && (value.length < field.minLength || (field.maxLength && value.length > field.maxLength))
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              required={field.required}
            />
            {field.minLength && value && value.length < field.minLength && (
              <p className="text-xs text-red-600 mt-1">Mínimo de {field.minLength} caracteres</p>
            )}
            {field.maxLength && value && value.length > field.maxLength && (
              <p className="text-xs text-red-600 mt-1">Máximo de {field.maxLength} caracteres</p>
            )}
          </div>
        );
        
      case 'file':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={field.accept}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Handle file upload logic here
                  setCurrentItem({ ...currentItem, [field.key]: file });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              required={field.required && !isEditing}
            />
          </div>
        );
        
      case 'select':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => setCurrentItem({ ...currentItem, [field.key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              required={field.required}
            >
              <option value="">Selecione...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'checkbox':
        return (
          <div key={field.key}>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => setCurrentItem({ ...currentItem, [field.key]: e.target.checked })}
                className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">{field.label}</span>
            </label>
          </div>
        );
        
      case 'datetime':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="datetime-local"
              value={value}
              onChange={(e) => setCurrentItem({ ...currentItem, [field.key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              required={field.required}
            />
          </div>
        );
        
      default: // text, url, date
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              {field.maxLength && (
                <span className="text-xs text-gray-500 ml-1">
                  ({value.length || 0}/{field.maxLength})
                </span>
              )}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => setCurrentItem({ ...currentItem, [field.key]: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                field.minLength && value && (value.length < field.minLength || (field.maxLength && value.length > field.maxLength))
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              required={field.required}
            />
            {field.minLength && value && value.length < field.minLength && (
              <p className="text-xs text-red-600 mt-1">Mínimo de {field.minLength} caracteres</p>
            )}
            {field.maxLength && value && value.length > field.maxLength && (
              <p className="text-xs text-red-600 mt-1">Máximo de {field.maxLength} caracteres</p>
            )}
          </div>
        );
    }
  };

  const contentTypeLabel = config.contentType === 'news' ? 'Notícias' :
    config.contentType === 'events' ? 'Eventos' :
    config.contentType === 'documents' ? 'Documentos' :
    config.contentType === 'messages' ? 'Mensagens' :
    config.contentType === 'groups' ? 'Grupos' :
    config.contentType === 'images' ? 'Imagens' :
    'Vídeos';

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">{contentTypeLabel}</h2>
          {config.contentType !== 'groups' && (
            <ToggleDraftsButton
              showDrafts={showDrafts}
              onToggle={onToggleDrafts}
              draftCount={totalDraftCount}
              type={config.contentType}
            />
          )}
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {config.modalTitle.create}
        </button>
      </div>

      {/* Lista de itens */}
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {showDrafts 
                ? config.emptyStateMessages.drafts
                : config.emptyStateMessages.published
              }
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {config.itemDisplayTemplate(item)}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de criação/edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? config.modalTitle.edit : config.modalTitle.create}
              </h2>

              <form onSubmit={handleSaveItem} className="space-y-4">
                {config.formFields.map(field => renderFormField(field))}
                
                {config.supportsImageUpload && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagem
                    </label>
                    <ImageUploadCropper
                      originalImage={imageUpload.originalImage}
                      imagePreview={imageUpload.imagePreview || (currentItem as any).image_url || null}
                      crop={imageUpload.crop}
                      zoom={imageUpload.zoom}
                      rotation={imageUpload.rotation}
                      uploadingImage={imageUpload.uploadingImage}
                      fileInputRef={imageUpload.fileInputRef}
                      onCropChange={imageUpload.setCrop}
                      onZoomChange={imageUpload.setZoom}
                      onRotationChange={imageUpload.setRotation}
                      onCropComplete={imageUpload.onCropComplete}
                      onFileChange={imageUpload.handleFileChange}
                      onCropImage={async () => {
                        await imageUpload.handleCropImage();
                      }}
                      onCancelCrop={imageUpload.handleCancelCrop}
                      onRemoveImage={() => {
                        imageUpload.handleRemoveImage();
                        setCurrentItem({ ...currentItem, image_url: '' });
                      }}
                    />
                  </div>
                )}

                <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Opções de Publicação</h3>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentItem.is_featured || false}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_featured: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Destacar item</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentItem.is_published !== false}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_published: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {currentItem.is_published !== false ? 'Publicar imediatamente' : 'Salvar como rascunho'}
                    </span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || (config.supportsImageUpload && imageUpload.uploadingImage)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Salvando...</span>
                      </>
                    ) : config.supportsImageUpload && imageUpload.uploadingImage ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Processando imagem...</span>
                      </>
                    ) : (
                      <span>Salvar</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de exclusão */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDeleteItem)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

// Export otimizado com React.memo para evitar re-renders desnecessários
export const GenericManagement = React.memo(GenericManagementComponent) as typeof GenericManagementComponent;