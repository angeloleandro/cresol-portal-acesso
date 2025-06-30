'use client';

import { useEffect, useState } from 'react';
import { handleComponentError, devLog } from '@/lib/error-handler';
import LoadingSpinner from './ui/LoadingSpinner';
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

export default function SystemLinks() {
  const [links, setLinks] = useState<SystemLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/system-links?active_only=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar links de sistemas');
      }

      setLinks(data.links || []);
      devLog.info('Links de sistemas carregados', { count: data.links?.length });

    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'fetchLinks');
      setError(errorMessage);
      devLog.error('Erro ao buscar links de sistemas', { error });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="body-text-small text-muted">Carregando sistemas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2">
        <ErrorMessage
          title="Erro ao Carregar Sistemas"
          message={error}
          type="error"
          showRetry
          onRetry={fetchLinks}
        />
      </div>
    );
  }

  if (!links.length) {
    return (
      <div className="py-2">
        <p className="body-text-small text-muted">Nenhum sistema disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header compacto */}
      <div className="flex items-center mb-3">
        <h3 className="heading-4 text-title mr-2">Sistemas e Apps</h3>
        <div className="h-px bg-primary flex-1"></div>
      </div>

      {/* Lista de links em colunas organizadas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:text-primary-dark hover:underline transition-colors duration-200 font-medium truncate"
            title={link.description || `Acessar ${link.name}`}
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Link para ver todos - opcional */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <a 
          href="/sistemas" 
          className="inline-flex items-center text-xs text-muted hover:text-primary transition-colors"
        >
          <Icon name="external-link" className="w-3 h-3 mr-1" />
          Ver todos os sistemas
        </a>
      </div>
    </div>
  );
}