// Componente genérico de gerenciamento de eventos
// Unifica sector/subsector events management com parâmetros configuráveis

import React, { useState } from 'react';

import { ToggleDraftsButton } from '@/app/components/admin/shared/ToggleDraftsButton';
import { useAlert } from '@/app/components/alerts';
import DeleteModal from '@/app/components/ui/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import { FormatEventPeriod, FormatForDateTimeInput } from '@/lib/utils/formatters';

// Generic event item interface
export interface BaseEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date?: string | null | undefined;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  [key: string]: unknown;
}

// Configuration interface for different contexts
export interface EventConfig {
  entityType: 'sector' | 'subsector';
  apiEndpoint: string;
  entityIdField: string;
  useAlerts: boolean;
  requestStructure: 'admin' | 'subsector';
}

interface EventsManagementProps<T extends BaseEvent> {
  entityId: string;
  events: T[];
  showDrafts: boolean;
  totalDraftEventsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  config: EventConfig;
}

/**
 * EventsManagement function
 * @todo Add proper documentation
 */
export function EventsManagement<T extends BaseEvent>({
  entityId,
  events,
  showDrafts,
  totalDraftEventsCount,
  onToggleDrafts,
  onRefresh,
  onDelete,
  config
}: EventsManagementProps<T>) {
  const alert = useAlert();
  const deleteModal = useDeleteModal<T>('evento');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<T>>({
    is_published: true
  } as Partial<T>);

  const handleOpenModal = (event?: T) => {
    if (event) {
      setCurrentEvent(event);
      setIsEditing(true);
    } else {
      setCurrentEvent({
        is_published: true
      } as Partial<T>);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEvent({
      is_published: true
    } as Partial<T>);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação detalhada dos campos obrigatórios
    const validationErrors: string[] = [];
    
    if (!currentEvent.title?.trim()) {
      validationErrors.push('Título é obrigatório');
    } else if (currentEvent.title.length < 3) {
      validationErrors.push('Título deve ter pelo menos 3 caracteres');
    } else if (currentEvent.title.length > 255) {
      validationErrors.push('Título deve ter no máximo 255 caracteres');
    }
    
    if (!currentEvent.description?.trim()) {
      validationErrors.push('Descrição é obrigatória');
    } else if (currentEvent.description.length < 10) {
      validationErrors.push('Descrição deve ter pelo menos 10 caracteres');
    } else if (currentEvent.description.length > 2000) {
      validationErrors.push('Descrição deve ter no máximo 2.000 caracteres');
    }
    
    if (!currentEvent.location?.trim()) {
      validationErrors.push('Local é obrigatório');
    } else if (currentEvent.location.length > 255) {
      validationErrors.push('Local deve ter no máximo 255 caracteres');
    }
    
    if (!currentEvent.start_date) {
      validationErrors.push('Data de início é obrigatória');
    }
    
    // Validar se data de fim é posterior à data de início
    if (currentEvent.start_date && currentEvent.end_date) {
      const startDate = new Date(currentEvent.start_date);
      const endDate = new Date(currentEvent.end_date);
      if (endDate < startDate) {
        validationErrors.push('Data de término deve ser posterior à data de início');
      }
    }
    
    if (validationErrors.length > 0) {
      alert.showError('Erros de validação', validationErrors.join('\n'));
      return;
    }

    setIsSaving(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      
      // Build request data based on structure type
      let requestData: any;
      
      if (config.requestStructure === 'admin') {
        requestData = {
          type: 'events',
          [config.entityIdField]: entityId,
          data: {
            ...currentEvent,
            [config.entityIdField]: entityId,
            title: currentEvent.title?.trim(),
            description: currentEvent.description?.trim(),
            location: currentEvent.location?.trim()
          }
        };
      } else {
        requestData = {
          [config.entityIdField]: entityId,
          data: {
            ...currentEvent,
            title: currentEvent.title?.trim(),
            description: currentEvent.description?.trim(),
            location: currentEvent.location?.trim()
          }
        };
      }
      
      const response = await fetch(config.apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        // Tratamento específico de erros
        let errorMessage = 'Erro ao salvar evento';
        
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
      
      // Show success message if using alerts
      if (config.useAlerts && alert) {
        if (isEditing) {
          alert.content.eventUpdated();
        } else {
          alert.content.eventCreated();
        }
      }
      
      // Then refresh data to show the new/updated item
      await onRefresh();
      
    } catch (error: any) {
      const userMessage = error.message.includes('fetch')
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : error.message || 'Erro desconhecido ao salvar evento. Tente novamente.';
        
      alert.showError('Erro ao salvar evento', userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (eventItem: T) => {
    deleteModal.openDeleteModal(eventItem, eventItem.title);
  };

  const handleDeleteEvent = async (eventItem: T) => {
    try {
      await onDelete(eventItem.id);
      alert.content.eventDeleted();
      // onDelete já chama refreshContent internamente
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      alert.showError('Erro ao deletar evento', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  return (
    <div className="p-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Eventos</h2>
          <ToggleDraftsButton
            showDrafts={showDrafts}
            onToggle={onToggleDrafts}
            draftCount={totalDraftEventsCount}
            type="events"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Novo Evento
        </button>
      </div>

      {/* Lista de eventos */}
      <div className="grid gap-4">
        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {showDrafts 
                ? 'Nenhum rascunho de evento encontrado'
                : 'Nenhum evento publicado ainda'
              }
            </p>
          </div>
        ) : (
          events.map((item) => (
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
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="flex flex-col text-sm text-gray-500 space-y-1">
                    <p>📍 {item.location}</p>
                    <p>📅 {FormatEventPeriod(item.start_date, item.end_date || null)}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
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
                {isEditing ? 'Editar Evento' : 'Novo Evento'}
              </h2>

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentEvent.title?.length || 0}/255)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={currentEvent.title || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      currentEvent.title && (currentEvent.title.length < 3 || currentEvent.title.length > 255)
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Digite o título do evento..."
                    maxLength={255}
                    required
                  />
                  {currentEvent.title && currentEvent.title.length < 3 && (
                    <p className="text-xs text-red-600 mt-1">Mínimo de 3 caracteres</p>
                  )}
                  {currentEvent.title && currentEvent.title.length > 255 && (
                    <p className="text-xs text-red-600 mt-1">Máximo de 255 caracteres</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentEvent.description?.length || 0}/2000)
                    </span>
                  </label>
                  <textarea
                    value={currentEvent.description || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      currentEvent.description && (currentEvent.description.length < 10 || currentEvent.description.length > 2000)
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Digite a descrição do evento..."
                    maxLength={2000}
                    required
                  />
                  {currentEvent.description && currentEvent.description.length < 10 && (
                    <p className="text-xs text-red-600 mt-1">Mínimo de 10 caracteres</p>
                  )}
                  {currentEvent.description && currentEvent.description.length > 2000 && (
                    <p className="text-xs text-red-600 mt-1">Máximo de 2.000 caracteres</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentEvent.location?.length || 0}/255)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={currentEvent.location || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                      currentEvent.location && currentEvent.location.length > 255
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Digite o local do evento..."
                    maxLength={255}
                    required
                  />
                  {currentEvent.location && currentEvent.location.length > 255 && (
                    <p className="text-xs text-red-600 mt-1">Máximo de 255 caracteres</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data e Hora de Início <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={currentEvent.start_date ? FormatForDateTimeInput(currentEvent.start_date) : ''}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data e Hora de Término (opcional)
                    </label>
                    <input
                      type="datetime-local"
                      value={currentEvent.end_date ? FormatForDateTimeInput(currentEvent.end_date) : ''}
                      onChange={(e) => setCurrentEvent({ 
                        ...currentEvent, 
                        end_date: e.target.value || null 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Opções de Publicação</h3>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentEvent.is_featured || false}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, is_featured: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Destacar evento</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentEvent.is_published !== false}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, is_published: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {currentEvent.is_published !== false ? 'Publicar imediatamente' : 'Salvar como rascunho'}
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
                    disabled={isSaving}
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
        onConfirm={() => deleteModal.confirmDelete(handleDeleteEvent)}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}