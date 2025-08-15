// Componente da aba de mensagens


interface MessagesTabProps {
  onOpenMessageModal: () => void;
}

export function MessagesTab({ onOpenMessageModal }: MessagesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Enviar Mensagem</h2>
        <button 
          onClick={onOpenMessageModal}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          + Nova Mensagem
        </button>
      </div>

      <div className="bg-white rounded-md p-12 text-center border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Envio de Notificações</h3>
        <p className="text-gray-500 mb-4">Envie mensagens para grupos ou usuários específicos.</p>
        <button 
          onClick={onOpenMessageModal}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Enviar Nova Mensagem
        </button>
      </div>
    </div>
  );
}