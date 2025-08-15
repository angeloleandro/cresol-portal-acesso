// Componente de gerenciamento de eventos do setor

import React, { useState } from 'react';
import { SectorEvent } from '../types/sector.types';
import { formatEventPeriod, formatForDateTimeInput } from '../utils/dateFormatters';
import { ToggleDraftsButton } from './ToggleDraftsButton';

interface EventsManagementProps {
  sectorId: string;
  events: SectorEvent[];
  showDrafts: boolean;
  totalDraftEventsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EventsManagement({
  sectorId,
  events,
  showDrafts,
  totalDraftEventsCount,
  onToggleDrafts,
  onRefresh,
  onDelete
}: EventsManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<SectorEvent>>({
    title: '',
    description: '',
    location: '',
    start_date: new Date().toISOString(),
    end_date: null,
    is_featured: false,
    is_published: true
  });

  const handleOpenModal = (event?: SectorEvent) => {
    if (event) {
      setCurrentEvent(event);
      setIsEditing(true);
    } else {
      setCurrentEvent({
        title: '',
        description: '',
        location: '',
        start_date: new Date().toISOString(),
        end_date: null,
        is_featured: false,
        is_published: true
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEvent({
      title: '',
      description: '',
      location: '',
      start_date: new Date().toISOString(),
      end_date: null,
      is_featured: false,
      is_published: true
    });
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = '/api/admin/sector-content';
      
      const body = {
        type: 'event',
        sectorId,
        data: {
          ...currentEvent,
          sector_id: sectorId
        }
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar evento');
      }

      await onRefresh();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento. Tente novamente.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    await onDelete(id);
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
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.location}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatEventPeriod(item.start_date, item.end_date)}
                    </span>
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
                    onClick={() => handleDeleteEvent(item.id)}
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
                    Título
                  </label>
                  <input
                    type="text"
                    value={currentEvent.title || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={currentEvent.description || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local
                  </label>
                  <input
                    type="text"
                    value={currentEvent.location || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Ex: Sala de reuniões, Auditório, Online"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data/Hora de Início
                    </label>
                    <input
                      type="datetime-local"
                      value={currentEvent.start_date ? formatForDateTimeInput(currentEvent.start_date) : ''}
                      onChange={(e) => setCurrentEvent({ 
                        ...currentEvent, 
                        start_date: new Date(e.target.value).toISOString() 
                      })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data/Hora de Término (opcional)
                    </label>
                    <input
                      type="datetime-local"
                      value={currentEvent.end_date ? formatForDateTimeInput(currentEvent.end_date) : ''}
                      onChange={(e) => setCurrentEvent({ 
                        ...currentEvent, 
                        end_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                      })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
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
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Salvar
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