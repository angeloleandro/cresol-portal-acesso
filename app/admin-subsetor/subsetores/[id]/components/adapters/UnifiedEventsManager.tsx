'use client';

import { useState, useEffect, useCallback } from 'react';
import { createEventsAdapter, type EventContentData as EventData } from './GenericContentAdapter';
import { useAlert } from '@/app/components/alerts';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface UnifiedEventsManagerProps {
  type: 'sector' | 'subsector';
  entityId: string;
  entityName: string;
}

export function UnifiedEventsManager({ type, entityId, entityName }: UnifiedEventsManagerProps) {
  const { showError, content } = useAlert();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventData | null>(null);
  const [formData, setFormData] = useState<Partial<EventData>>({
  });

  const adapter = createEventsAdapter(type, entityId);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adapter.fetchAll();
      setEvents(data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await adapter.update(selectedEvent.id!, formData);
      } else {
        await adapter.create(formData as Omit<EventData, 'id'>);
      }
      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      showError('Erro ao salvar evento', 'Tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await adapter.delete(eventToDelete.id!);
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (error) {
      showError('Erro ao excluir evento', 'Tente novamente.');
    }
  };

  const togglePublished = async (event: EventData) => {
    try {
      await adapter.togglePublished(event.id!, !event.is_published);
      fetchEvents();
    } catch (error) {
      // Error handled silently
    }
  };

  const toggleFeatured = async (event: EventData) => {
    try {
      await adapter.update(event.id!, { is_featured: !event.is_featured });
      fetchEvents();
    } catch (error) {
      // Error handled silently
    }
  };

  const openModal = (event?: EventData) => {
    if (event) {
      setSelectedEvent(event);
      setFormData({
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setSelectedEvent(null);
    setFormData({
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Eventos do {type === 'sector' ? 'Setor' : 'Subsetor'}: {entityName}
        </h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Evento
        </button>
      </div>

      {/* Lista de Eventos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum evento cadastrado
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {events.map((item) => (
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
                    <p className="mt-1 text-sm text-gray-600">
                      {item.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Data: {formatDate(item.start_date)}
                      </span>
                      {item.location && (
                        <span>Local: {item.location}</span>
                      )}
                      <span className={`px-2 py-1 rounded ${
                        item.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
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
                        setEventToDelete(item);
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
                  {selectedEvent ? 'Editar Evento' : 'Novo Evento'}
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
                    Descrição *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data/Hora Início *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data/Hora Fim
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                      Evento em destaque
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
                    {selectedEvent ? 'Salvar' : 'Criar'}
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
                Tem certeza que deseja excluir o evento &quot;{eventToDelete?.title}&quot;?
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