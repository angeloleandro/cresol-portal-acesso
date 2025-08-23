// Componente de gerenciamento de notícias do subsetor - PADRONIZADO
// Baseado no padrão do setor para manter consistência

import React, { useState } from 'react';
import Image from 'next/image';
import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { SubsectorNews } from '../types/subsector.types';
import { formatDate } from '@/lib/utils/formatters';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImageUploadCropper } from '@/app/components/admin/shared/ImageUploadCropper';
import { ToggleDraftsButton } from '@/app/components/admin/shared/ToggleDraftsButton';

interface NewsManagementProps {
  subsectorId: string;
  news: SubsectorNews[];
  showDrafts: boolean;
  totalDraftNewsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NewsManagement({
  subsectorId,
  news,
  showDrafts,
  totalDraftNewsCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: NewsManagementProps) {
  const alert = useAlert();
  const deleteModal = useDeleteModal('notícia');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState<Partial<SubsectorNews>>({
    is_published: true
  });

  const imageUpload = useImageUpload();

  const handleOpenModal = (newsItem?: SubsectorNews) => {
    if (newsItem) {
      setCurrentNews(newsItem);
      setIsEditing(true);
      if (newsItem.image_url) {
        imageUpload.handleRemoveImage();
      }
    } else {
      setCurrentNews({
        is_published: true
      });
      setIsEditing(false);
      imageUpload.handleRemoveImage();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentNews({
      is_published: true
    });
    imageUpload.handleRemoveImage();
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state - não necessário mais com alertas

    // Validação detalhada dos campos obrigatórios
    const validationErrors: string[] = [];
    
    if (!currentNews.title?.trim()) {
      validationErrors.push('Título é obrigatório');
    } else if (currentNews.title.length < 3) {
      validationErrors.push('Título deve ter pelo menos 3 caracteres');
    } else if (currentNews.title.length > 255) {
      validationErrors.push('Título deve ter no máximo 255 caracteres');
    }
    
    if (!currentNews.summary?.trim()) {
      validationErrors.push('Resumo é obrigatório');
    } else if (currentNews.summary.length < 10) {
      validationErrors.push('Resumo deve ter pelo menos 10 caracteres');
    } else if (currentNews.summary.length > 500) {
      validationErrors.push('Resumo deve ter no máximo 500 caracteres');
    }
    
    if (!currentNews.content?.trim()) {
      validationErrors.push('Conteúdo é obrigatório');
    } else if (currentNews.content.length < 20) {
      validationErrors.push('Conteúdo deve ter pelo menos 20 caracteres');
    } else if (currentNews.content.length > 10000) {
      validationErrors.push('Conteúdo deve ter no máximo 10.000 caracteres');
    }
    
    if (validationErrors.length > 0) {
      alert.showError('Erros de validação', validationErrors.join('\n'));
      return;
    }

    setIsSaving(true);

    try {
      // Se há uma imagem para recortar
      let finalImageUrl = currentNews.image_url;
      if (imageUpload.originalImage) {
        const croppedUrl = await imageUpload.handleCropImage();
        if (croppedUrl) {
          finalImageUrl = croppedUrl;
        }
      } else if (imageUpload.imagePreview) {
        finalImageUrl = imageUpload.imagePreview;
      }

      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = '/api/admin/subsector-content';
      
      const requestData = {
        subsectorId,
        data: {
          ...currentNews,
          content: currentNews.content?.trim()
        }
      };
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        // Tratamento específico de erros
        let errorMessage = 'Erro ao salvar notícia';
        
        if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }
        
        if (responseData?.missing) {
          const missingFields = Object.entries(responseData.missing)
            .filter(([_, missing]) => missing)
            .map(([field, _]) => field);
          
          if (missingFields.length > 0) {
            errorMessage += '\n\nCampos obrigatórios faltando: ' + missingFields.join(', ');
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Close modal first for better UX
      handleCloseModal();
      
      // Show success message
      if (isEditing) {
        alert.content.newsUpdated();
      } else {
        alert.content.newsCreated();
      }
      
      // Then refresh data to show the new/updated item
      await onRefresh();
      
    } catch (error: any) {
      
      const userMessage = error.message.includes('fetch')
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : error.message || 'Erro desconhecido ao salvar notícia. Tente novamente.';
        
      alert.showError('Erro ao salvar notícia', userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNews = async (itemToDelete: SubsectorNews) => {
    try {
      await onDelete(itemToDelete.id);
      alert.content.newsDeleted();
      // onDelete já chama refreshContent internamente
    } catch (error) {
      console.error('Erro ao deletar notícia:', error);
      alert.showError('Erro ao deletar notícia', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Notícias</h2>
          <ToggleDraftsButton
            showDrafts={showDrafts}
            onToggle={onToggleDrafts}
            draftCount={totalDraftNewsCount}
            type="news"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Nova Notícia
        </button>
      </div>

      {/* Lista de notícias */}
      <div className="grid gap-4">
        {news.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {showDrafts 
                ? 'Nenhum rascunho de notícia encontrado'
                : 'Nenhuma notícia publicada ainda'
              }
            </p>
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    {item.is_featured && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Destaque
                      </span>
                    )}
                    {!item.is_published && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Rascunho
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{item.summary}</p>
                  <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                </div>
                {item.image_url && (
                  <div className="relative w-24 h-24 ml-4 flex-shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover rounded-md"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteModal.openDeleteModal(item, item.title)}
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
                {isEditing ? 'Editar Notícia' : 'Nova Notícia'}
              </h2>

              <form onSubmit={handleSaveNews} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentNews.title?.length || 0}/255)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={currentNews.title || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      currentNews.title && (currentNews.title.length < 3 || currentNews.title.length > 255)
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Digite o título da notícia..."
                    maxLength={255}
                    required
                  />
                  {currentNews.title && currentNews.title.length < 3 && (
                    <p className="text-xs text-red-600 mt-1">Mínimo de 3 caracteres</p>
                  )}
                  {currentNews.title && currentNews.title.length > 255 && (
                    <p className="text-xs text-red-600 mt-1">Máximo de 255 caracteres</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resumo <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentNews.summary?.length || 0}/500)
                    </span>
                  </label>
                  <textarea
                    value={currentNews.summary || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, summary: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      currentNews.summary && (currentNews.summary.length < 10 || currentNews.summary.length > 500)
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Digite um resumo breve da notícia..."
                    maxLength={500}
                    required
                  />
                  {currentNews.summary && currentNews.summary.length < 10 && (
                    <p className="text-xs text-red-600 mt-1">Mínimo de 10 caracteres</p>
                  )}
                  {currentNews.summary && currentNews.summary.length > 500 && (
                    <p className="text-xs text-red-600 mt-1">Máximo de 500 caracteres</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentNews.content?.length || 0}/10000)
                    </span>
                  </label>
                  <textarea
                    value={currentNews.content || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      currentNews.content && (currentNews.content.length < 20 || currentNews.content.length > 10000)
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Digite o conteúdo completo da notícia..."
                    maxLength={10000}
                    required
                  />
                  {currentNews.content && currentNews.content.length < 20 && (
                    <p className="text-xs text-red-600 mt-1">Mínimo de 20 caracteres</p>
                  )}
                  {currentNews.content && currentNews.content.length > 10000 && (
                    <p className="text-xs text-red-600 mt-1">Máximo de 10.000 caracteres</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem
                  </label>
                  <ImageUploadCropper
                    originalImage={imageUpload.originalImage}
                    imagePreview={imageUpload.imagePreview || currentNews.image_url || null}
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
                      setCurrentNews({ ...currentNews, image_url: '' });
                    }}
                  />
                </div>

                <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Opções de Publicação</h3>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentNews.is_featured || false}
                      onChange={(e) => setCurrentNews({ ...currentNews, is_featured: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Destacar notícia</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentNews.is_published !== false}
                      onChange={(e) => setCurrentNews({ ...currentNews, is_published: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {currentNews.is_published !== false ? 'Publicar imediatamente' : 'Salvar como rascunho'}
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
                    disabled={isSaving || imageUpload.uploadingImage}
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
                    ) : imageUpload.uploadingImage ? (
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
        onConfirm={() => deleteModal.confirmDelete(handleDeleteNews)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}