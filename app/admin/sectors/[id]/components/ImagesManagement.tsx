// Componente de gerenciamento de imagens do setor

import Image from 'next/image';
import React, { useState } from 'react';

import { ToggleDraftsButton } from '@/app/components/admin/shared/ToggleDraftsButton';
import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { FormatDate } from '@/lib/utils/formatters';

import { SectorImage } from '../types/sector.types';
// Componente simples de upload inline

interface ImagesManagementProps {
  sectorId: string;
  images: SectorImage[];
  showDrafts: boolean;
  totalDraftImagesCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/**
 * ImagesManagement function
 * @todo Add proper documentation
 */
export function ImagesManagement({
  sectorId,
  images,
  showDrafts,
  totalDraftImagesCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: ImagesManagementProps) {
  const alert = useAlert();
  const deleteModal = useDeleteModal('imagem');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentImage, setCurrentImage] = useState<Partial<SectorImage>>({
    is_published: true
  });
  const [previewImageId, setPreviewImageId] = useState<string | null>(null);

  // Estado para upload de arquivo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleOpenModal = (image?: SectorImage) => {
    if (image) {
      setCurrentImage(image);
      setIsEditing(true);
    } else {
      setCurrentImage({
        is_published: true,
        is_featured: false
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentImage({
      is_published: true
    });
    // Reset upload state
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação detalhada dos campos obrigatórios
    const validationErrors: string[] = [];
    
    if (!currentImage.title?.trim()) {
      validationErrors.push('Título é obrigatório');
    } else if (currentImage.title.length < 3) {
      validationErrors.push('Título deve ter pelo menos 3 caracteres');
    } else if (currentImage.title.length > 255) {
      validationErrors.push('Título deve ter no máximo 255 caracteres');
    }
    
    // Para nova criação, validar arquivo ou URL
    if (!isEditing) {
      if (!selectedFile && !currentImage.image_url?.trim()) {
        validationErrors.push('Arquivo de imagem ou URL é obrigatório');
      }
    } else {
      // Para edição, pelo menos image_url deve existir
      if (!currentImage.image_url?.trim()) {
        validationErrors.push('URL da imagem é obrigatória');
      }
    }
    
    if (currentImage.description && currentImage.description.length > 2000) {
      validationErrors.push('Descrição deve ter no máximo 2.000 caracteres');
    }
    
    if (validationErrors.length > 0) {
      alert.showError('Erros de validação', validationErrors.join('\n'));
      return;
    }

    setIsSaving(true);

    try {
      // Se for nova criação e houver arquivo, fazer upload
      if (!isEditing && selectedFile) {
        await handleFileUpload();
      } else {
        // Caso contrário, usar o fluxo normal (URL ou edição)
        const method = isEditing ? 'PUT' : 'POST';
        const endpoint = isEditing 
          ? `/api/admin/sectors/${sectorId}/images/${currentImage.id}`
          : `/api/admin/sectors/${sectorId}/images`;
        
        const requestData = {
          ...currentImage,
          sector_id: sectorId
        };

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });

        const responseData = await response.json();

        if (!response.ok) {
          let errorMessage = 'Erro ao salvar imagem';
          
          if (responseData?.error) {
            errorMessage = responseData.error;
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          }
          
          throw new Error(errorMessage);
        }
        
        handleCloseModal();
        await onRefresh();
        
        if (isEditing) {
          alert.showSuccess('Imagem atualizada', 'A imagem foi atualizada com sucesso.');
        } else {
          alert.showSuccess('Imagem criada', 'A imagem foi adicionada com sucesso.');
        }
      }
      
    } catch (error: any) {

      const userMessage = error.message.includes('fetch')
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : error.message || 'Erro desconhecido ao salvar imagem. Tente novamente.';
        
      alert.showError('Erro ao salvar imagem', userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Nova função para fazer upload do arquivo
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', currentImage.title || '');
    formData.append('description', currentImage.description || '');
    formData.append('is_published', String(currentImage.is_published !== false));
    formData.append('is_featured', String(currentImage.is_featured || false));

    try {
      const xhr = new XMLHttpRequest();
      
      // Configurar progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentComplete);
        }
      });

      // Criar Promise para aguardar resposta
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error || 'Erro no upload'));
            }
          } else {
            reject(new Error(`Erro no upload: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Erro de conexão'));
        xhr.onabort = () => reject(new Error('Upload cancelado'));
      });

      // Iniciar upload
      xhr.open('POST', `/api/admin/sectors/${sectorId}/images/upload`);
      xhr.send(formData);

      await uploadPromise;

      handleCloseModal();
      await onRefresh();
      alert.showSuccess('Imagem enviada', 'A imagem foi enviada e processada com sucesso.');

    } catch (error: any) {

      setUploadError(error.message || 'Erro ao fazer upload da imagem');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageToDelete: SectorImage) => {
    try {
      await onDelete(imageToDelete.id);
      alert.showSuccess('Imagem excluída', 'A imagem foi removida com sucesso.');
    } catch (error) {

      alert.showError('Erro ao deletar imagem', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Imagens</h2>
          <ToggleDraftsButton
            showDrafts={showDrafts}
            onToggle={onToggleDrafts}
            draftCount={totalDraftImagesCount}
            type="images"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Nova Imagem
        </button>
      </div>

      {/* Grid de imagens */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {showDrafts 
                ? 'Nenhum rascunho de imagem encontrado'
                : 'Nenhuma imagem publicada ainda'
              }
            </p>
          </div>
        ) : (
          images.map((image) => (
            <div key={image.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Imagem */}
              <div 
                className="relative aspect-square cursor-pointer group"
                onClick={() => setPreviewImageId(image.id)}
              >
                <Image
                  src={image.image_url}
                  alt={image.title}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-image.png';
                  }}
                />
                
                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-2">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  {image.is_featured && (
                    <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">
                      Destaque
                    </span>
                  )}
                  {!image.is_published && (
                    <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded">
                      Rascunho
                    </span>
                  )}
                </div>
              </div>
              
              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {image.title}
                </h3>
                {image.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {image.description}
                  </p>
                )}
                <div className="text-xs text-gray-500 mb-3">
                  <p>{FormatDate(image.created_at)}</p>
                  {image.file_size && (
                    <p>{formatFileSize(image.file_size)}</p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(image);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteModal.openDeleteModal(image, image.title);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? 'Editar Imagem' : 'Nova Imagem'}
              </h2>

              <form onSubmit={handleSaveImage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentImage.title?.length || 0}/255)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={currentImage.title || ''}
                    onChange={(e) => setCurrentImage({ ...currentImage, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      currentImage.title && (currentImage.title.length < 3 || currentImage.title.length > 255)
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Digite o título da imagem..."
                    maxLength={255}
                    required
                  />
                  {currentImage.title && currentImage.title.length < 3 && (
                    <p className="text-xs text-red-600 mt-1">Mínimo de 3 caracteres</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentImage.description?.length || 0}/2000)
                    </span>
                  </label>
                  <textarea
                    value={currentImage.description || ''}
                    onChange={(e) => setCurrentImage({ ...currentImage, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Digite uma descrição para a imagem (opcional)..."
                    maxLength={2000}
                  />
                </div>

                {/* Upload de arquivo (apenas para nova criação) */}
                {!isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagem <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                      {!selectedFile ? (
                        <div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Validar tamanho (10MB)
                                if (file.size > 10 * 1024 * 1024) {
                                  setUploadError('Arquivo muito grande. Máximo 10MB.');
                                  return;
                                }
                                setSelectedFile(file);
                                setUploadError(null);
                              }
                            }}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Aceita JPEG, PNG, WebP, GIF (máx. 10MB)
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{selectedFile.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setUploadError(null);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                      
                      {/* Progress bar */}
                      {isUploading && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{uploadProgress}%</p>
                        </div>
                      )}
                      
                      {/* Error message */}
                      {uploadError && (
                        <p className="text-xs text-red-600 mt-2">{uploadError}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* URL da imagem (para edição ou criação manual) */}
                {(isEditing || !selectedFile) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL da Imagem {!isEditing && !selectedFile && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="url"
                      value={currentImage.image_url || ''}
                      onChange={(e) => setCurrentImage({ ...currentImage, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="https://exemplo.com/imagem.jpg"
                      required={!selectedFile}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cole a URL completa da imagem
                    </p>
                  </div>
                )}

                <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Opções de Publicação</h3>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentImage.is_featured || false}
                      onChange={(e) => setCurrentImage({ ...currentImage, is_featured: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Destacar imagem</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentImage.is_published !== false}
                      onChange={(e) => setCurrentImage({ ...currentImage, is_published: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {currentImage.is_published !== false ? 'Publicar imediatamente' : 'Salvar como rascunho'}
                    </span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSaving || isUploading}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {(isSaving || isUploading) ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>{isUploading ? 'Enviando...' : 'Salvando...'}</span>
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

      {/* Modal de preview */}
      {previewImageId && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl max-h-full">
            {(() => {
              const image = images.find(img => img.id === previewImageId);
              if (!image) return null;
              
              return (
                <div className="relative">
                  <button
                    onClick={() => setPreviewImageId(null)}
                    className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <Image
                    src={image.image_url}
                    alt={image.title}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white p-4 rounded-md">
                    <h3 className="font-semibold">{image.title}</h3>
                    {image.description && (
                      <p className="text-sm mt-1">{image.description}</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.itemToDelete && handleDeleteImage(deleteModal.itemToDelete)}
        itemName={deleteModal.itemName}
        itemType="imagem"
      />
    </div>
  );
}