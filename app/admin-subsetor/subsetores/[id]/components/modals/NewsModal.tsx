// Modal para criação e edição de notícias

import { SubsectorNews } from '../../types/subsector.types';

interface NewsModalProps {
  isOpen: boolean;
  isEditing: boolean;
  currentNews: Partial<SubsectorNews>;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onChange: (news: Partial<SubsectorNews>) => void;
}

export function NewsModal({
  isOpen,
  isEditing,
  currentNews,
  onClose,
  onSave,
  onChange
}: NewsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Editar Notícia' : 'Nova Notícia'}
        </h3>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={currentNews.title || ''}
              onChange={(e) => onChange({...currentNews, title: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resumo *
            </label>
            <textarea
              value={currentNews.summary || ''}
              onChange={(e) => onChange({...currentNews, summary: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              rows={4}
              required
            />
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={currentNews.is_featured || false}
                onChange={(e) => onChange({...currentNews, is_featured: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Destacar</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={currentNews.is_published || false}
                onChange={(e) => onChange({...currentNews, is_published: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-2"
              />
              <span className="text-sm text-gray-700">Publicar imediatamente</span>
              {!currentNews.is_published && (
                <span className="text-xs text-yellow-600 ml-2">
                  (Será salvo como rascunho)
                </span>
              )}
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              {isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}