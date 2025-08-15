// Componente de gerenciamento de notícias do setor

import React, { useState } from 'react';
import Image from 'next/image';
import { SectorNews } from '../types/sector.types';
import { formatDate } from '../utils/dateFormatters';
import { useImageUpload } from '../hooks/useImageUpload';
import { ImageUploadCropper } from './ImageUploadCropper';
import { ToggleDraftsButton } from './ToggleDraftsButton';

interface NewsManagementProps {
  sectorId: string;
  news: SectorNews[];
  showDrafts: boolean;
  totalDraftNewsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NewsManagement({
  sectorId,
  news,
  showDrafts,
  totalDraftNewsCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: NewsManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState<Partial<SectorNews>>({
    title: '',
    summary: '',
    content: '',
    image_url: '',
    is_featured: false,
    is_published: true
  });

  const imageUpload = useImageUpload();

  const handleOpenModal = (newsItem?: SectorNews) => {
    if (newsItem) {
      setCurrentNews(newsItem);
      setIsEditing(true);
      if (newsItem.image_url) {
        imageUpload.handleRemoveImage();
      }
    } else {
      setCurrentNews({
        title: '',
        summary: '',
        content: '',
        image_url: '',
        is_featured: false,
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
      title: '',
      summary: '',
      content: '',
      image_url: '',
      is_featured: false,
      is_published: true
    });
    imageUpload.handleRemoveImage();
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const endpoint = '/api/admin/sector-content';
      
      const body = {
        type: 'news',
        sectorId,
        data: {
          ...currentNews,
          image_url: finalImageUrl,
          sector_id: sectorId
        }
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar notícia');
      }

      await onRefresh();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
      alert('Erro ao salvar notícia. Tente novamente.');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;
    await onDelete(id);
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
                    onClick={() => handleDeleteNews(item.id)}
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
                    Título
                  </label>
                  <input
                    type="text"
                    value={currentNews.title || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resumo
                  </label>
                  <textarea
                    value={currentNews.summary || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, summary: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    value={currentNews.content || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
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
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={imageUpload.uploadingImage}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {imageUpload.uploadingImage ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}