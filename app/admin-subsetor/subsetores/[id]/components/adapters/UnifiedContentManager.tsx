'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  StarIcon, 
  WifiIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { 
  GenericContentAdapter, 
  BaseContentData,
  NewsContentData,
  EventContentData
} from './GenericContentAdapter';
import { useRealtimeNews } from '@/app/hooks/useRealtimeNews';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Props do componente unificado
interface UnifiedContentManagerProps<T extends BaseContentData> {
  type: 'news' | 'events';
  entityType: 'sector' | 'subsector';
  entityId: string;
  entityName: string;
  adapter: GenericContentAdapter<T>;
  showDrafts?: boolean;
  useRealtime?: boolean;
  fields?: FieldConfig[];
}

// Configuração de campos do formulário
interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'datetime-local' | 'url' | 'checkbox';
  required?: boolean;
  rows?: number;
  placeholder?: string;
}

// Configurações padrão de campos por tipo
const DEFAULT_FIELDS: Record<string, FieldConfig[]> = {
  news: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'summary', label: 'Resumo', type: 'textarea', required: true, rows: 2 },
    { name: 'content', label: 'Conteúdo', type: 'textarea', required: true, rows: 6 },
    { name: 'image_url', label: 'URL da Imagem', type: 'url' }
  ],
  events: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea', required: true, rows: 4 },
    { name: 'start_date', label: 'Data/Hora Início', type: 'datetime-local', required: true },
    { name: 'end_date', label: 'Data/Hora Fim', type: 'datetime-local' },
    { name: 'location', label: 'Local', type: 'text' }
  ]
};

export function UnifiedContentManager<T extends BaseContentData>({
  type,
  entityType,
  entityId,
  entityName,
  adapter,
  showDrafts = true,
  useRealtime = false,
  fields = DEFAULT_FIELDS[type]
}: UnifiedContentManagerProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({} as Partial<T>);
  const [error, setError] = useState<string | null>(null);

  // Hook de realtime (sempre chamado, mas só usado se habilitado)
  const realtimeData = useRealtimeNews({
    tableName: adapter.getTableName() as 'sector_news' | 'sector_events' | 'subsector_news' | 'subsector_events',
    entityId,
    entityType,
    includeUnpublished: showDrafts,
    onInsert: () => {
      // Real-time insert handled automatically
    },
    onUpdate: () => {
      // Real-time update handled automatically
    },
    onDelete: () => {
      // Real-time delete handled automatically
    }
  });

  // Usar dados do realtime se disponível, caso contrário usar state local
  const displayItems = useRealtime && realtimeData ? realtimeData.data as T[] : items;
  const isConnected = useRealtime && realtimeData?.isConnected;

  // Buscar dados
  const fetchItems = useCallback(async () => {
    if (useRealtime && realtimeData) return; // Não buscar se usando realtime

    try {
      setLoading(true);
      setError(null);
      const data = await adapter.fetchAll(showDrafts);
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error, { type, entityId, operation: 'fetchItems' });
      setError(`Erro ao carregar ${type}: ${(error as Error)?.message || String(error)}`);
    } finally {
      setLoading(false);
    }
  }, [adapter, showDrafts, useRealtime, realtimeData, type, entityId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Inicializar formulário baseado no tipo
  const initializeFormData = useCallback(() => {
    const initialData: any = {
      title: '',
      is_published: false,
      is_featured: false
    };

    if (type === 'news') {
      initialData.summary = '';
      initialData.content = '';
      initialData.image_url = '';
    } else if (type === 'events') {
      initialData.description = '';
      initialData.start_date = '';
      initialData.end_date = '';
      initialData.location = '';
    }

    return initialData;
  }, [type]);

  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await adapter.update(selectedItem.id!, formData);
      } else {
        await adapter.create(formData as Omit<T, 'id'>);
      }
      setIsModalOpen(false);
      resetForm();
      if (!useRealtime) fetchItems();
    } catch (error) {
      console.error('Error saving content:', error, { type, entityId, operation: 'save' });
      alert(`Erro ao salvar ${type}: ${(error as Error)?.message || String(error)}`);
    }
  };

  // Deletar item
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await adapter.delete(itemToDelete.id!);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      if (!useRealtime) fetchItems();
    } catch (error) {
      console.error('Error deleting content:', error, { type, entityId, operation: 'delete', id: itemToDelete?.id });
      alert(`Erro ao excluir ${type}: ${(error as Error)?.message || String(error)}`);
    }
  };

  // Toggle published
  const togglePublished = async (item: T) => {
    try {
      if (useRealtime && realtimeData?.togglePublished) {
        await realtimeData.togglePublished(item.id!, item.is_published || false);
      } else {
        await adapter.togglePublished(item.id!, !item.is_published);
        fetchItems();
      }
    } catch (error) {
      console.error('Error toggling published status:', error, { type, entityId, operation: 'togglePublished', id: item.id });
      alert(`Erro ao alterar status de publicação: ${(error as Error)?.message || String(error)}`);
    }
  };

  // Toggle featured
  const toggleFeatured = async (item: T) => {
    try {
      if (useRealtime && realtimeData?.toggleFeatured) {
        await realtimeData.toggleFeatured(item.id!, item.is_featured || false);
      } else {
        await adapter.toggleFeatured(item.id!, !item.is_featured);
        fetchItems();
      }
    } catch (error) {
      console.error('Error toggling featured status:', error, { type, entityId, operation: 'toggleFeatured', id: item.id });
      alert(`Erro ao alterar destaque: ${(error as Error)?.message || String(error)}`);
    }
  };

  // Abrir modal
  const openModal = (item?: T) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ ...item });
    } else {
      setSelectedItem(null);
      setFormData(initializeFormData());
    }
    setIsModalOpen(true);
  };

  // Resetar formulário
  const resetForm = () => {
    setSelectedItem(null);
    setFormData(initializeFormData());
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Renderizar campo do formulário
  const renderFormField = (field: FieldConfig) => {
    const value = (formData as any)[field.name] || '';
    const onChange = (newValue: any) => {
      setFormData({ ...formData, [field.name]: newValue });
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            rows={field.rows || 3}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case 'datetime-local':
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required={field.required}
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
        );
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required={field.required}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Loading state
  if (loading && !useRealtime) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">
            {type === 'news' ? 'Notícias' : 'Eventos'} do {entityType === 'sector' ? 'Setor' : 'Subsetor'}: {entityName}
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
          {type === 'news' ? 'Nova Notícia' : 'Novo Evento'}
        </button>
      </div>

      {/* Lista de items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {displayItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {showDrafts 
              ? `Nenhum ${type === 'news' ? 'notícia' : 'evento'} cadastrado`
              : `Nenhum ${type === 'news' ? 'notícia' : 'evento'} publicado`}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {displayItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.title}
                      </h3>
                      {item.is_featured && (
                        <StarIconSolid className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    {/* Conteúdo específico por tipo */}
                    {type === 'news' && (
                      <p className="mt-1 text-sm text-gray-600">
                        {(item as unknown as NewsContentData).summary}
                      </p>
                    )}
                    
                    {type === 'events' && (
                      <>
                        <p className="mt-1 text-sm text-gray-600">
                          {(item as unknown as EventContentData).description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate((item as unknown as EventContentData).start_date)}
                          </span>
                          {(item as unknown as EventContentData).location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="h-4 w-4" />
                              {(item as unknown as EventContentData).location}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Criado em: {formatDate(item.created_at!)}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        item.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFeatured(item)}
                      className="p-2 text-gray-600 hover:text-yellow-500 transition"
                      title={item.is_featured ? 'Remover destaque' : 'Destacar'}
                    >
                      {item.is_featured ? (
                        <StarIconSolid className="h-5 w-5" />
                      ) : (
                        <StarIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => togglePublished(item)}
                      className="p-2 text-gray-600 hover:text-primary transition"
                      title={item.is_published ? 'Despublicar' : 'Publicar'}
                    >
                      {item.is_published ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 text-gray-600 hover:text-primary transition"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(item);
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
            ))}
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
                  {selectedItem 
                    ? `Editar ${type === 'news' ? 'Notícia' : 'Evento'}`
                    : `${type === 'news' ? 'Nova Notícia' : 'Novo Evento'}`}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Renderizar campos dinamicamente */}
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && '*'}
                    </label>
                    {renderFormField(field)}
                  </div>
                ))}

                {/* Checkboxes de publicação */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.is_published || false}
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
                      checked={formData.is_featured || false}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      {type === 'news' ? 'Destacar notícia' : 'Evento em destaque'}
                    </label>
                  </div>
                </div>

                {/* Botões de ação */}
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
                    {selectedItem ? 'Salvar' : 'Criar'}
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
                Tem certeza que deseja excluir {type === 'news' ? 'a notícia' : 'o evento'} &quot;{itemToDelete?.title}&quot;?
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