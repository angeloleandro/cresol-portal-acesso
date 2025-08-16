// Componente da aba de notícias

import { SubsectorNews } from '../../types/subsector.types';
import { ToggleDraftsButton } from '@/app/admin/sectors/[id]/components/ToggleDraftsButton';

interface NewsTabProps {
  news: SubsectorNews[];
  showDrafts: boolean;
  totalDraftNewsCount: number;
  onToggleDrafts: () => Promise<void>;
  onOpenModal: (news?: SubsectorNews) => void;
  onDeleteNews: (news: SubsectorNews) => void;
  onTogglePublished: (newsId: string, currentStatus: boolean) => void;
}

export function NewsTab({
  news,
  showDrafts,
  totalDraftNewsCount,
  onToggleDrafts,
  onOpenModal,
  onDeleteNews,
  onTogglePublished
}: NewsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Notícias do Subsetor</h2>
        <div className="flex items-center space-x-4">
          <ToggleDraftsButton
            showDrafts={showDrafts}
            draftCount={totalDraftNewsCount}
            onToggle={onToggleDrafts}
            type="news"
          />
          <button 
            onClick={() => onOpenModal()}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            + Nova Notícia
          </button>
        </div>
      </div>

      {news.length === 0 ? (
        <div className="bg-white rounded-md p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notícia cadastrada</h3>
          <p className="text-gray-500">Crie a primeira notícia para este subsetor.</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {news.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.summary}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className={`px-2 py-1 rounded-sm ${
                        item.is_published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                      {item.is_featured && (
                        <span className="px-2 py-1 rounded-sm bg-blue-100 text-blue-700">
                          Destaque
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => onTogglePublished(item.id, item.is_published)}
                      className={`p-2 transition-colors ${
                        item.is_published 
                          ? 'text-gray-400 hover:text-yellow-600' 
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                      title={item.is_published ? 'Despublicar' : 'Publicar'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.is_published ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                    <button 
                      onClick={() => onOpenModal(item)}
                      className="p-2 text-gray-400 hover:text-primary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDeleteNews(item)}
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