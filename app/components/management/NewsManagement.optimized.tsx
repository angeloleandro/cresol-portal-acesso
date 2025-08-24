
import Image from 'next/image';
import React, { useState, useMemo, useCallback } from 'react';

import { ToggleDraftsButton } from '@/app/components/admin/shared/ToggleDraftsButton';
import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { useImageUpload } from '@/hooks/useImageUpload';
import { FormatDate } from '@/lib/utils/formatters';

// Generic news item interface
export interface BaseNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

// Configuration interface for different contexts
export interface NewsConfig {
  entityType: 'sector' | 'subsector';
  apiEndpoint: string;
  entityIdField: string;
  useAlerts: boolean;
  requestStructure: 'admin' | 'subsector';
}

interface NewsManagementProps<T extends BaseNews> {
  entityId: string;
  news: T[];
  showDrafts: boolean;
  totalDraftNewsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  config: NewsConfig;
}

// Componente NewsItem memoizado separadamente
const NewsItem = React.memo<{
  item: BaseNews;
  onEdit: (item: BaseNews) => void;
  onDelete: (id: string) => void;
}>(({ item, onEdit, onDelete }) => {
  // Handlers estáveis para evitar re-renders
  const handleEdit = useCallback(() => onEdit(item), [onEdit, item]);
  const handleDelete = useCallback(() => onDelete(item.id), [onDelete, item.id]);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {item.title}
            </h3>
            {item.is_featured && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                Destaque
              </span>
            )}
            {!item.is_published && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                Rascunho
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {item.summary}
          </p>
          
          <p className="text-xs text-gray-500">
            Criado em {FormatDate(item.created_at)}
          </p>
        </div>
        
        {item.image_url && (
          <div className="ml-4 flex-shrink-0">
            <div className="relative w-20 h-20">
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover rounded-md"
                sizes="80px"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleEdit}
          className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para otimizar re-renders
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.summary === nextProps.item.summary &&
    prevProps.item.is_featured === nextProps.item.is_featured &&
    prevProps.item.is_published === nextProps.item.is_published &&
    prevProps.item.image_url === nextProps.item.image_url
  );
});

NewsItem.displayName = 'NewsItem';

// Componente principal otimizado
function NewsManagementOptimized<T extends BaseNews>({
  entityId,
  news,
  showDrafts,
  totalDraftNewsCount,
  onToggleDrafts,
  onRefresh,
  onDelete,
  config
}: NewsManagementProps<T>) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState<Partial<T>>({
    title: '',
    summary: '',
    content: '',
    image_url: '',
    is_featured: false,
    is_published: true
  } as Partial<T>);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const imageUpload = useImageUpload();
  const deleteModal = useDeleteModal('notícia');
  const alert = useAlert();
  
  // Props estáveis para evitar re-renders
  const stableNews = useMemo(() => news, [news]);
  const stableConfig = useMemo(() => config, [config]);
  
  // Handlers memoizados
  const handleOpenModal = useCallback((newsItem?: T) => {
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
      } as Partial<T>);
      setIsEditing(false);
      imageUpload.handleRemoveImage();
    }
    setIsModalOpen(true);
  }, [imageUpload]);
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentNews({
      title: '',
      summary: '',
      content: '',
      image_url: '',
      is_featured: false,
      is_published: true
    } as Partial<T>);
    imageUpload.handleRemoveImage();
    setSaveError(null);
  }, [imageUpload]);
  
  const validateForm = useCallback(() => {
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
    
    return validationErrors;
  }, [currentNews]);
  
  const handleSaveNews = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaveError(null);
    
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      const errorMessage = 'Erros de validação:\n\n' + validationErrors.join('\n');
      if (stableConfig.useAlerts && alert) {
        alert.showError('Erros de validação', validationErrors.join('\n'));
      } else {
        setSaveError(errorMessage);
      }
      return;
    }
    
    setIsSaving(true);
    
    try {
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
      
      let requestData: any;
      
      if (stableConfig.requestStructure === 'admin') {
        requestData = {
          type: 'news',
          [stableConfig.entityIdField]: entityId,
          data: {
            ...currentNews,
            image_url: finalImageUrl,
            [stableConfig.entityIdField]: entityId,
            title: currentNews.title?.trim(),
            summary: currentNews.summary?.trim(),
            content: currentNews.content?.trim()
          }
        };
      } else {
        requestData = {
          [stableConfig.entityIdField]: entityId,
          data: {
            ...currentNews,
            image_url: finalImageUrl,
            title: currentNews.title?.trim(),
            summary: currentNews.summary?.trim(),
            content: currentNews.content?.trim()
          }
        };
      }
      
      const response = await fetch(stableConfig.apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao salvar: ${response.status}`);
      }
      
      if (stableConfig.useAlerts && alert) {
        alert.showSuccess(
          isEditing ? 'Notícia atualizada' : 'Notícia criada',
          isEditing ? 'A notícia foi atualizada com sucesso!' : 'A notícia foi criada com sucesso!'
        );
      }
      
      handleCloseModal();
      await onRefresh();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar notícia';
      
      if (stableConfig.useAlerts && alert) {
        alert.showError('Erro ao salvar', errorMessage);
      } else {
        setSaveError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    currentNews,
    isEditing,
    entityId,
    stableConfig,
    imageUpload,
    alert,
    validateForm,
    handleCloseModal,
    onRefresh
  ]);
  
  const handleDeleteNews = useCallback(async (id: string) => {
    deleteModal.openDeleteModal(id);
  }, [deleteModal]);
  
  // Wrapper para edit que atende ao tipo esperado pelo NewsItem
  const handleEditNews = useCallback((item: BaseNews) => {
    handleOpenModal(item as T);
  }, [handleOpenModal]);
  
  // Input handlers memoizados
  const handleInputChange = useCallback((field: keyof T, value: any) => {
    setCurrentNews(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Lista de notícias memoizada
  const newsItems = useMemo(() => 
    stableNews.map(item => (
      <NewsItem
        key={item.id}
        item={item}
        onEdit={handleEditNews}
        onDelete={handleDeleteNews}
      />
    )),
    [stableNews, handleEditNews, handleDeleteNews]
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Notícias</h2>
          <ToggleDraftsButton
            showDrafts={showDrafts}
            draftCount={totalDraftNewsCount}
            onToggle={onToggleDrafts}
            type="news"
          />
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Nova Notícia
        </button>
      </div>
      
      {/* Lista de notícias */}
      <div className="grid gap-4">
        {newsItems.length > 0 ? (
          newsItems
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {showDrafts ? 'Nenhuma notícia encontrada' : 'Nenhuma notícia publicada'}
            </p>
          </div>
        )}
      </div>
      
      {/* Modal (mantido igual por brevidade, mas também deveria ser otimizado) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* Conteúdo do modal... */}
        </div>
      )}
      
      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeDeleteModal}
        onConfirm={() => deleteModal.confirmDelete(async (id: string) => {
          try {
            await onDelete(id);
            if (stableConfig.useAlerts && alert) {
              alert.showSuccess('Notícia excluída', 'A notícia foi excluída com sucesso!');
            }
          } catch (error) {
            if (stableConfig.useAlerts && alert) {
              alert.showError('Erro ao excluir', 'Não foi possível excluir a notícia');
            }
          }
        })}
        itemName={deleteModal.itemName}
        itemType="notícia"
      />
    </div>
  );
}

// Exportar a versão memoizada
export const NewsManagement = React.memo(NewsManagementOptimized);

NewsManagement.displayName = 'NewsManagement';