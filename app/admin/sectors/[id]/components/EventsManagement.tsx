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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
    
    // Reset error state
    setSaveError(null);

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
    
    if (!currentEvent.start_date) {
      validationErrors.push('Data de início é obrigatória');
    } else {
      const startDate = new Date(currentEvent.start_date);
      if (isNaN(startDate.getTime())) {
        validationErrors.push('Data de início inválida');
      }
    }
    
    if (!currentEvent.location?.trim()) {
      validationErrors.push('Local é obrigatório');
    } else if (currentEvent.location.length > 255) {
      validationErrors.push('Local deve ter no máximo 255 caracteres');
    }
    
    // Validar data de término se fornecida
    if (currentEvent.end_date && currentEvent.start_date) {
      const endDate = new Date(currentEvent.end_date);
      const startDate = new Date(currentEvent.start_date);
      
      if (isNaN(endDate.getTime())) {
        validationErrors.push('Data de término inválida');
      } else if (endDate <= startDate) {
        validationErrors.push('Data de término deve ser posterior à data de início');
      }
    }
    
    if (validationErrors.length > 0) {
      setSaveError('Erros de validação:\n\n' + validationErrors.join('\n'));
      return;
    }

    setIsSaving(true);

    try {
      console.log('🔥 [FRONTEND] Iniciando salvamento de evento');
      console.log('🔥 [FRONTEND] Dados a serem enviados:', {
        type: 'event',
        sectorId,
        isEditing,
        hasEndDate: !!currentEvent.end_date
      });
      
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = '/api/admin/sector-content';
      
      const requestData = {
        type: 'event',
        sectorId,
        data: {
          ...currentEvent,
          sector_id: sectorId,
          title: currentEvent.title?.trim(),
          description: currentEvent.description?.trim(),
          location: currentEvent.location?.trim()
        }
      };
      
      // Log detalhado dos dados sendo enviados
      console.log('📤 [FRONTEND] Dados da requisição:');
      console.log('  Método:', method);
      console.log('  Endpoint:', endpoint);
      console.log('  Payload:', JSON.stringify(requestData, null, 2));

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      console.log('📥 [FRONTEND] Resposta da API:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  OK:', response.ok);

      const responseData = await response.json();
      console.log('📥 [FRONTEND] Dados da resposta:', responseData);

      if (!response.ok) {
        console.error('❌ [FRONTEND] Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          responseData
        });
        
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
      
      console.log('✅ [FRONTEND] Evento salvo com sucesso:', responseData);
      
      // Show success message briefly
      console.log('🎉 [FRONTEND] Operação realizada com sucesso - atualizando dados...');
      
      // Refresh data to ensure consistency
      await onRefresh();
      
      // Close modal only after success
      handleCloseModal();
      
    } catch (error: any) {
      console.error('💥 [FRONTEND] Erro crítico ao salvar evento:');
      console.error('  Tipo:', error.constructor?.name || 'Unknown');
      console.error('  Mensagem:', error.message);
      console.error('  Stack:', error.stack);
      
      // Show user-friendly error message
      const userMessage = error.message.includes('fetch')
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : error.message || 'Erro desconhecido ao salvar evento. Tente novamente.';
        
      setSaveError(userMessage);
    } finally {
      setIsSaving(false);
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
              
              {/* Error display */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 whitespace-pre-line">{saveError}</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        type="button"
                        onClick={() => setSaveError(null)}
                        className="inline-flex text-red-400 hover:text-red-600"
                      >
                        <span className="sr-only">Fechar</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
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
                    placeholder="Ex: Sala de reuniões, Auditório, Online"
                    maxLength={255}
                    required
                  />
                  {currentEvent.location && currentEvent.location.length > 255 && (
                    <p className="text-xs text-red-600 mt-1">Máximo de 255 caracteres</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data/Hora de Início <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={currentEvent.start_date ? formatForDateTimeInput(currentEvent.start_date) : ''}
                      onChange={(e) => setCurrentEvent({ 
                        ...currentEvent, 
                        start_date: new Date(e.target.value).toISOString() 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
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
    </div>
  );
}