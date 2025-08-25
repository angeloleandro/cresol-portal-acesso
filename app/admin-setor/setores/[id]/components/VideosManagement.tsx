// Componente para gerenciar vídeos do setor - versão simplificada

'use client';

import { useState } from 'react';

import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';

import type { SectorVideo } from '../types/sector.types';

interface VideosManagementProps {
  sectorId: string;
  videos: SectorVideo[];
  showDrafts: boolean;
  totalDraftVideosCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function VideosManagement({
  sectorId,
  videos,
  showDrafts,
  totalDraftVideosCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: VideosManagementProps) {
  const { showError, showSuccess } = useAlert();
  const deleteModal = useDeleteModal('vídeo');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SectorVideo>>({
    title: '',
    description: '',
    video_url: '',
    upload_type: 'youtube',
    is_published: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const videoData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        upload_type: formData.upload_type,
        is_published: formData.is_published
      };

      const url = editingId 
        ? `/api/admin/sectors/${sectorId}/videos/${editingId}`
        : `/api/admin/sectors/${sectorId}/videos`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar vídeo');
      }

      showSuccess(editingId ? 'Vídeo atualizado' : 'Vídeo criado', 'O vídeo foi salvo com sucesso.');
      setShowForm(false);
      setFormData({ title: '', description: '', video_url: '', upload_type: 'youtube', is_published: true });
      setEditingId(null);
      await onRefresh();
    } catch (error) {
      showError('Erro ao salvar vídeo', 'Tente novamente.');
    }
  };

  const handleEdit = (video: SectorVideo) => {
    setFormData({
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      upload_type: video.upload_type,
      is_published: video.is_published
    });
    setEditingId(video.id);
    setShowForm(true);
  };

  const handleDeleteClick = (video: SectorVideo) => {
    deleteModal.openDeleteModal(video, video.title);
  };

  const handleDelete = async (video: SectorVideo) => {
    try {
      await onDelete(video.id);
      showSuccess('Vídeo excluído', 'O vídeo foi removido com sucesso.');
    } catch (error) {
      showError('Erro ao excluir vídeo', 'Tente novamente.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Vídeos do Setor</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleDrafts}
            className="flex items-center space-x-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
          >
            <span>{showDrafts ? 'Ocultar Rascunhos' : 'Mostrar Rascunhos'}</span>
            <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded font-medium">
              {totalDraftVideosCount} {totalDraftVideosCount === 1 ? 'rascunho' : 'rascunhos'}
            </span>
          </button>
          <button
            onClick={() => {
              setFormData({ title: '', description: '', video_url: '', upload_type: 'youtube', is_published: true });
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark text-sm"
          >
            Adicionar Vídeo
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
          <h4 className="text-lg font-medium mb-3">
            {editingId ? 'Editar Vídeo' : 'Novo Vídeo'}
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
                placeholder="Breve descrição do vídeo"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="upload_type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Vídeo
              </label>
              <select
                id="upload_type"
                value={formData.upload_type}
                onChange={(e) => setFormData({ ...formData, upload_type: e.target.value as 'youtube' | 'file' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="youtube">YouTube</option>
                <option value="file">Upload de Arquivo</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.upload_type === 'youtube' ? 'URL do YouTube' : 'URL do Vídeo'}
              </label>
              <input
                type="url"
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={formData.upload_type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'URL do vídeo'}
                required
              />
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
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
          <p className="text-gray-500">Nenhum vídeo cadastrado para este setor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-md border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {video.thumbnail_url && (
                <div className="aspect-video bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-medium flex-1 truncate">{video.title}</h3>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(video)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {video.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {video.upload_type === 'youtube' ? 'YouTube' : 'Upload'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    video.is_published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {video.is_published ? 'Publicado' : 'Rascunho'}
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