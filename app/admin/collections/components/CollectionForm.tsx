'use client';

// Collection Form Component
// Formulário reutilizável para CRUD de coleções - Portal Cresol

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Collection } from '@/lib/types/collections';
import { COLLECTION_CONFIG, COLLECTION_TYPE_LABELS } from '@/lib/constants/collections';
import { validateCollection } from '@/lib/utils/collections';
import { cn } from '@/lib/utils/cn';
import { useCollectionUpload } from '@/app/components/Collections/Collection.hooks';
import { InlineSpinner } from '@/app/components/ui/StandardizedSpinner';

export interface CollectionFormData {
  name: string;
  description: string;
  type: 'mixed' | 'images' | 'videos';
  color_theme: string;
  is_active: boolean;
  cover_image_url: string;
}

interface CollectionFormProps {
  // Data props
  collection?: Collection | null;
  initialData?: Partial<CollectionFormData>;
  mode: 'create' | 'edit';
  
  // Behavior props
  onSubmit: (data: CollectionFormData) => Promise<void>;
  onCancel?: () => void;
  
  // UI props
  className?: string;
  showCancelButton?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  
  // Loading and validation
  isSubmitting?: boolean;
  errors?: Record<string, string>;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({
  collection,
  initialData,
  mode,
  onSubmit,
  onCancel,
  className,
  showCancelButton = true,
  submitButtonText,
  cancelButtonText = 'Cancelar',
  isSubmitting = false,
  errors: externalErrors = {},
  onValidationChange,
}) => {
  // Form state
  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    description: '',
    type: 'mixed',
    color_theme: '#F58220',
    is_active: true,
    cover_image_url: '',
  });

  // Internal state
  const [internalErrors, setInternalErrors] = useState<Record<string, string>>({});
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Upload hook
  const { isUploading: isUploadingCover, uploadCoverImage } = useCollectionUpload();

  // Combine external and internal errors
  const allErrors = { ...internalErrors, ...externalErrors };

  // Initialize form data
  useEffect(() => {
    const defaultData: CollectionFormData = {
      name: '',
      description: '',
      type: 'mixed',
      color_theme: '#F58220',
      is_active: true,
      cover_image_url: '',
    };

    let newData = { ...defaultData };

    // Apply collection data if editing
    if (mode === 'edit' && collection) {
      newData = {
        name: collection.name || '',
        description: collection.description || '',
        type: collection.type || 'mixed',
        color_theme: collection.color_theme || '#F58220',
        is_active: collection.is_active ?? true,
        cover_image_url: collection.cover_image_url || '',
      };
    }

    // Apply initial data overrides
    if (initialData) {
      newData = { ...newData, ...initialData };
    }

    setFormData(newData);
    setCoverPreview(newData.cover_image_url);
    setInternalErrors({});
    setHasUserInteracted(false);
  }, [mode, collection, initialData]);

  // Validate form and notify parent
  useEffect(() => {
    if (hasUserInteracted) {
      const validation = {
        errors: {
          name: validateCollection.name(formData.name),
          description: validateCollection.description(formData.description || ''),
          colorTheme: validateCollection.colorTheme(formData.color_theme || ''),
        } as Record<string, string | null>,
        isValid: false,
      };
      
      // Check if validation is valid
      validation.isValid = !Object.values(validation.errors).some(error => error !== null);
      
      // Filter out null values before setting internal errors
      const cleanErrors = Object.fromEntries(
        Object.entries(validation.errors).filter(([_, value]) => value !== null)
      ) as Record<string, string>;
      setInternalErrors(cleanErrors);
      onValidationChange?.(validation.isValid, { ...cleanErrors, ...externalErrors });
    }
  }, [formData, hasUserInteracted, externalErrors, onValidationChange]);

  // Handle form field changes
  const handleChange = (field: keyof CollectionFormData, value: any) => {
    setHasUserInteracted(true);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (allErrors[field]) {
      setInternalErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle cover image upload using centralized hook
  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    
    try {
      const result = await uploadCoverImage(file);
      
      // Update form data and preview
      handleChange('cover_image_url', result.url || '');
      setCoverPreview(result.url || '');
      
    } catch (error: any) {
      setInternalErrors(prev => ({ ...prev, cover: error.message }));
    }
  };

  // Handle cover image removal
  const handleCoverRemove = () => {
    handleChange('cover_image_url', '');
    setCoverPreview('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasUserInteracted(true);
    
    // Validate form
    const validation = {
      errors: {
        name: validateCollection.name(formData.name),
        description: validateCollection.description(formData.description || ''),
        colorTheme: validateCollection.colorTheme(formData.color_theme || ''),
      } as Record<string, string | null>,
      isValid: false,
    };
    
    // Check if validation is valid
    validation.isValid = !Object.values(validation.errors).some(error => error !== null);
    
    if (!validation.isValid) {
      // Filter out null values before setting internal errors
      const cleanErrors = Object.fromEntries(
        Object.entries(validation.errors).filter(([_, value]) => value !== null)
      ) as Record<string, string>;
      setInternalErrors(cleanErrors);
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error: any) {
      // Error handling is delegated to parent component
      console.error('Form submission error:', error);
    }
  };

  // Generate default submit button text
  const defaultSubmitText = mode === 'create' ? 'Criar Coleção' : 'Salvar Alterações';
  const finalSubmitText = submitButtonText || defaultSubmitText;

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      
      {/* Cover Image Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Imagem de Capa
        </label>
        
        <div className="flex items-start gap-6">
          {/* Preview Area */}
          <div className="relative">
            <div className="w-40 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="Preview da capa"
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Sem imagem</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Remove button */}
            {coverPreview && (
              <button
                type="button"
                onClick={handleCoverRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
          
          {/* Upload Controls */}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
              className="hidden"
              id="cover-upload"
              disabled={isUploadingCover}
            />
            
            <label
              htmlFor="cover-upload"
              className={cn(
                "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 cursor-pointer transition-colors",
                isUploadingCover && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploadingCover ? (
                <>
                  <InlineSpinner size="sm" variant="admin" className="mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {coverPreview ? 'Trocar Imagem' : 'Escolher Imagem'}
                </>
              )}
            </label>
            
            <p className="text-xs text-gray-500 mt-2">
              Recomendado: formato 16:9 (1280x720px)
              <br />
              Formatos: JPG, PNG, WebP (máx. 5MB)
            </p>
            
            {allErrors.cover && (
              <p className="text-red-600 text-sm mt-1">{allErrors.cover}</p>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Coleção <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Eventos Corporativos 2024"
            maxLength={COLLECTION_CONFIG.MAX_NAME_LENGTH}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent",
              allErrors.name ? "border-red-300" : "border-gray-300"
            )}
          />
          <div className="flex justify-between items-start mt-1">
            <div className="text-xs text-gray-500">
              {allErrors.name && <span className="text-red-600">{allErrors.name}</span>}
              {!allErrors.name && "Nome que aparecerá para os usuários"}
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formData.name.length}/{COLLECTION_CONFIG.MAX_NAME_LENGTH}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descrição opcional da coleção..."
            maxLength={COLLECTION_CONFIG.MAX_DESCRIPTION_LENGTH}
            rows={4}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none",
              allErrors.description ? "border-red-300" : "border-gray-300"
            )}
          />
          <div className="flex justify-between items-start mt-1">
            <div className="text-xs text-gray-500">
              {allErrors.description && <span className="text-red-600">{allErrors.description}</span>}
              {!allErrors.description && "Descrição opcional para contexto adicional"}
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formData.description.length}/{COLLECTION_CONFIG.MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Coleção <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent",
              allErrors.type ? "border-red-300" : "border-gray-300"
            )}
          >
            <option value="mixed">{COLLECTION_TYPE_LABELS.mixed}</option>
            <option value="images">{COLLECTION_TYPE_LABELS.images}</option>
            <option value="videos">{COLLECTION_TYPE_LABELS.videos}</option>
          </select>
          {allErrors.type && (
            <p className="text-red-600 text-xs mt-1">{allErrors.type}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="is_active"
            value={formData.is_active ? 'active' : 'inactive'}
            onChange={(e) => handleChange('is_active', e.target.value === 'active')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      {/* Color Theme */}
      <div>
        <label htmlFor="color_theme" className="block text-sm font-medium text-gray-700 mb-1">
          Cor Tema
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            id="color_theme"
            value={formData.color_theme}
            onChange={(e) => handleChange('color_theme', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={formData.color_theme}
            onChange={(e) => handleChange('color_theme', e.target.value)}
            placeholder="#F58220"
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Cor para personalizar a exibição da coleção (opcional)
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        {showCancelButton && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelButtonText}
          </button>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || isUploadingCover}
          className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <InlineSpinner size="sm" variant="light" className="mr-2" />
              {mode === 'create' ? 'Criando...' : 'Salvando...'}
            </div>
          ) : (
            finalSubmitText
          )}
        </button>
      </div>

      {/* Global Error */}
      {allErrors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{allErrors.submit}</p>
        </div>
      )}
    </form>
  );
};

export default CollectionForm;