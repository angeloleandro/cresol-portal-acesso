import React from 'react';

export const NotificationHistory: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-lg">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Notificações</h2>
          <p className="text-sm text-gray-500">Acompanhe todas as mensagens enviadas</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Em desenvolvimento</h3>
          <p className="text-gray-600 text-sm">
            Esta funcionalidade estará disponível em breve para visualizar o histórico completo de notificações enviadas.
          </p>
        </div>
      </div>
    </div>
  );
};