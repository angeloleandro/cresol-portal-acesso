// Componente da aba de eventos

import { SubsectorEvent } from '../../types/subsector.types';
import { ToggleDraftsButton } from '@/app/admin/sectors/[id]/components/ToggleDraftsButton';

interface EventsTabProps {
  events: SubsectorEvent[];
  showDrafts: boolean;
  totalDraftEventsCount: number;
  onToggleDrafts: () => Promise<void>;
  onOpenModal: (event?: SubsectorEvent) => void;
  onDeleteEvent: (event: SubsectorEvent) => void;
}

export function EventsTab({
  events,
  showDrafts,
  totalDraftEventsCount,
  onToggleDrafts,
  onOpenModal,
  onDeleteEvent
}: EventsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Eventos do Subsetor</h2>
        <div className="flex items-center space-x-4">
          <ToggleDraftsButton
            showDrafts={showDrafts}
            draftCount={totalDraftEventsCount}
            onToggle={onToggleDrafts}
            type="events"
          />
          <button 
            onClick={() => onOpenModal()}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            + Novo Evento
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-md p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento cadastrado</h3>
          <p className="text-gray-500">Crie o primeiro evento para este subsetor.</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{new Date(event.start_date).toLocaleDateString('pt-BR')}</span>
                      <span className={`px-2 py-1 rounded-sm ${
                        event.is_published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                      {event.is_featured && (
                        <span className="px-2 py-1 rounded-sm bg-blue-100 text-blue-700">
                          Destaque
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => onOpenModal(event)}
                      className="p-2 text-gray-400 hover:text-primary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDeleteEvent(event)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}