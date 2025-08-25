// Componente para gerenciar imagens do setor

'use client';

import { useState } from 'react';

import { useAlert } from '@/app/components/alerts';
import OptimizedImage from '@/app/components/OptimizedImage';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';

import type { SectorImage } from '../types/sector.types';

interface ImagesManagementProps {
  sectorId: string;
  images: SectorImage[];
  showDrafts: boolean;
  totalDraftImagesCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ImagesManagement({
  sectorId,
  images,
  showDrafts,
  totalDraftImagesCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: ImagesManagementProps) {
  const { showError, showSuccess } = useAlert();
  const deleteModal = useDeleteModal('imagem');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SectorImage>>({
    title: '',
    description: '',
    is_published: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Verificar o tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showError('Tipo de arquivo inválido', 'Por favor, selecione apenas arquivos PNG, JPG ou WebP.');
        return;
      }
      
      // Verificar o tamanho do arquivo (limite de 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Arquivo muito grande', 'A imagem deve ter menos de 5MB.');
        return;
      }
      
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingId && !imageFile) {
      showError('Imagem obrigatória', 'Selecione uma imagem para enviar.');
      return;
    }
    
    setUploading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('is_published', formData.is_published ? 'true' : 'false');
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const url = editingId 
        ? `/api/admin/sectors/${sectorId}/images/${editingId}`
        : `/api/admin/sectors/${sectorId}/images/upload`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar imagem');
      }

      showSuccess(editingId ? 'Imagem atualizada' : 'Imagem enviada', 'A imagem foi salva com sucesso.');
      setShowForm(false);
      setFormData({ title: '', description: '', is_published: true });
      setImageFile(null);
      setEditingId(null);
      await onRefresh();
    } catch (error) {
      showError('Erro ao salvar imagem', 'Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image: SectorImage) => {
    setFormData({
      title: image.title,
      description: image.description,
      is_published: image.is_published
    });
    setEditingId(image.id);
    setShowForm(true);
  };

  const handleDeleteClick = (image: SectorImage) => {
    deleteModal.openDeleteModal(image, image.title);
  };

  const handleDelete = async (image: SectorImage) => {
    try {
      await onDelete(image.id);
      showSuccess('Imagem excluída', 'A imagem foi removida com sucesso.');
    } catch (error) {
      showError('Erro ao excluir imagem', 'Tente novamente.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Imagens do Setor</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleDrafts}
            className="flex items-center space-x-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
          >
            <span>{showDrafts ? 'Ocultar Rascunhos' : 'Mostrar Rascunhos'}</span>
            <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded font-medium">
              {totalDraftImagesCount} {totalDraftImagesCount === 1 ? 'rascunho' : 'rascunhos'}
            </span>
          </button>
          <button
            onClick={() => {
              setFormData({ title: '', description: '', is_published: true });
              setImageFile(null);
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm"
          >
            Adicionar Imagem
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
          <h4 className="text-lg font-medium mb-3">
            {editingId ? 'Editar Imagem' : 'Nova Imagem'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                placeholder="Breve descrição da imagem"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem {!editingId && '*'}
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP até 5MB</p>
                    {imageFile && (
                      <p className="mt-2 text-sm text-gray-700">
                        Arquivo selecionado: {imageFile.name}
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              {editingId && (
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para manter a imagem atual
                </p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">
                  Publicar imediatamente
                </label>
                {!formData.is_published && (
                  <span className="text-xs text-yellow-600 ml-2">
                    (Será salvo como rascunho)
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setImageFile(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? 'Enviando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {images.length === 0 ? (
        <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
          <p className="text-gray-500">Nenhuma imagem cadastrada para este setor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-md border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square relative bg-gray-100">
                <OptimizedImage
                  src={image.image_url}
                  alt={image.title}
                  fill
                  className="object-cover"
                  context="gallery"
                />
              </div>
              
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium flex-1 truncate">{image.title}</h4>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEdit(image)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(image)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {image.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{image.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(image.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    image.is_published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {image.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(handleDelete)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}