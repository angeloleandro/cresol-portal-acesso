'use client';

import { useState } from 'react';
import { createNewsAdapter, type NewsContentData as NewsData } from './GenericContentAdapter';
import { useRealtimeNews } from '@/app/hooks/useRealtimeNews';
import { useAlert } from '@/app/components/alerts';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, StarIcon, WifiIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface UnifiedNewsManagerProps {
  type: 'sector' | 'subsector';
  entityId: string;
  entityName: string;
  showDrafts?: boolean;
}

export function UnifiedNewsManagerWithRealtime({ type, entityId, entityName, showDrafts = true }: UnifiedNewsManagerProps) {
  const { showError, content } = useAlert();
  const [selectedNews, setSelectedNews] = useState<NewsData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsData | null>(null);
  const [formData, setFormData] = useState<Partial<NewsData>>({
    title: '',
    summary: '',
    content: '',
    image_url: '',
    is_published: false,
    is_featured: false,
  });

  const adapter = createNewsAdapter(type, entityId);
  
  // Use realtime hook for automatic updates
  const {
    data: news,
    loading,
    error,
    refresh,
    togglePublished: togglePublishedRealtime,
    toggleFeatured: toggleFeaturedRealtime,
    isConnected
  } = useRealtimeNews({
    tableName: type === 'sector' ? 'sector_news' : 'subsector_news',
    entityId,
    entityType: type,
    includeUnpublished: showDrafts,
    onInsert: () => {
      // Debug log removed
    },
    onUpdate: () => {
      // Debug log removed
    },
    onDelete: () => {
      // Debug log removed
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedNews) {
        await adapter.update(selectedNews.id!, formData);
      } else {
        await adapter.create(formData as Omit<NewsData, 'id'>);
      }
      setIsModalOpen(false);
      resetForm();
      // Não precisa chamar refresh() pois o realtime atualizará automaticamente
    } catch (error) {
      // Debug log removed
      showError('Erro ao salvar notícia', 'Por favor, tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;
    
    try {
      await adapter.delete(newsToDelete.id!);
      setIsDeleteModalOpen(false);
      setNewsToDelete(null);
      // Não precisa chamar refresh() pois o realtime atualizará automaticamente
    } catch (error) {
      // Debug log removed
      showError('Erro ao excluir notícia', 'Por favor, tente novamente.');
    }
  };

  const togglePublished = async (newsItem: NewsData) => {
    try {
      await togglePublishedRealtime(newsItem.id!, !newsItem.is_published);
    } catch (error) {
      // Debug log removed
      showError('Erro ao alterar status de publicação', 'Tente novamente.');
    }
  };

  const toggleFeatured = async (newsItem: NewsData) => {
    try {
      await toggleFeaturedRealtime(newsItem.id!, !newsItem.is_featured);
    } catch (error) {
      // Debug log removed
      showError('Erro ao alterar destaque', 'Tente novamente.');
    }
  };

  const openModal = (newsItem?: NewsData) => {
    if (newsItem) {
      setSelectedNews(newsItem);
      setFormData({
        title: newsItem.title,
        summary: newsItem.summary,
        content: newsItem.content,
        image_url: newsItem.image_url || '',
        is_published: newsItem.is_published || false,
        is_featured: newsItem.is_featured || false,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setSelectedNews(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      image_url: '',
      is_published: false,
      is_featured: false,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro ao carregar notícias: {error}</p>
        <button
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">
            Notícias do {type === 'sector' ? 'Setor' : 'Subsetor'}: {entityName}
          </h2>
          {isConnected && (
            <div className="flex items-center gap-1 text-green-600">
              <WifiIcon className="h-4 w-4" />
              <span className="text-xs">Ao vivo</span>
            </div>
          )}
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
        >
          <PlusIcon className="h-5 w-5" />
          Nova Notícia
        </button>
      </div>

      {/* Lista de Notícias */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {news.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {showDrafts ? 'Nenhuma notícia cadastrada' : 'Nenhuma notícia publicada'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {news.map((item) => {
              const newsItem = item as NewsData;
              return (
                <div key={newsItem.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {newsItem.title}
                        </h3>
                        {newsItem.is_featured && (
                          <StarIconSolid className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {newsItem.summary}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Criado em: {new Date(newsItem.created_at!).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          newsItem.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {newsItem.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFeatured(newsItem)}
                        className="p-2 text-gray-600 hover:text-yellow-500 transition"
                        title={newsItem.is_featured ? 'Remover destaque' : 'Destacar'}
                      >
                        {newsItem.is_featured ? (
                          <StarIconSolid className="h-5 w-5" />
                        ) : (
                          <StarIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => togglePublished(newsItem)}
                        className="p-2 text-gray-600 hover:text-primary transition"
                        title={newsItem.is_published ? 'Despublicar' : 'Publicar'}
                      >
                        {newsItem.is_published ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => openModal(newsItem)}
                        className="p-2 text-gray-600 hover:text-primary transition"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setNewsToDelete(newsItem);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 transition"
                        title="Excluir"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">
                  {selectedNews ? 'Editar Notícia' : 'Nova Notícia'}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resumo *
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                      Publicar imediatamente
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      Destacar notícia
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
                  >
                    {selectedNews ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir a notícia &quot;{newsToDelete?.title}&quot;?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}