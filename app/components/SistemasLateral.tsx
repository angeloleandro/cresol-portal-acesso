'use client';

import { useEffect, useState, useCallback } from 'react';
import { handleComponentError, devLog } from '@/lib/error-handler';
import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import ErrorMessage from './ui/ErrorMessage';
import { Icon } from './icons';

interface SystemLink {
  id: string;
  name: string;
  url: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

interface SistemasLateralProps {
  limit?: number;
}

export default function SistemasLateral({ limit = 6 }: SistemasLateralProps) {
  const [links, setLinks] = useState<SystemLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/system-links?active_only=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar links de sistemas');
      }

      // Limitar a quantidade de links mostrados na lateral
      const limitedLinks = (data.links || []).slice(0, limit);
      setLinks(limitedLinks);
      devLog.info('Links de sistemas carregados para lateral', { count: limitedLinks.length });

    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'fetchLinks');
      setError(errorMessage);
      devLog.error('Erro ao buscar links de sistemas para lateral', { error });
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded-sm w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-sm"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="heading-4 text-title">Sistemas e Apps</h2>
            <p className="body-text-small text-muted mt-1">Acesso rápido aos sistemas</p>
          </div>
        </div>
        <ErrorMessage
          title="Erro ao Carregar"
          message={error}
          type="error"
          showRetry
          onRetry={fetchLinks}
        />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="heading-4 text-title">Sistemas e Apps</h2>
          <p className="body-text-small text-muted mt-1">Acesso rápido aos sistemas</p>
        </div>
        <a 
          href="/sistemas" 
          className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary"
        >
          Ver todos
          <Icon name="external-link" className="w-4 h-4 ml-1" />
        </a>
      </div>
      
      {links.length === 0 ? (
        <div className="p-4 text-center">
          <p className="body-text-small text-muted">Nenhum sistema disponível</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3 bg-white border border-gray-200/60 hover:border-gray-200 rounded-md transition-colors duration-150"
              title={link.description || `Acessar ${link.name}`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="body-text-bold text-title group-hover:text-primary transition-colors duration-200 truncate">
                  {link.name}
                </h3>
                {link.description && (
                  <p className="body-text-small text-muted mt-1 line-clamp-2">
                    {link.description}
                  </p>
                )}
              </div>
              
              <Icon 
                name="external-link" 
                className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors duration-200 flex-shrink-0 ml-2" 
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}