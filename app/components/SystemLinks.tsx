'use client';

import { useEffect, useState, memo } from 'react';

import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { handleComponentError, devLog } from '@/lib/error-handler';

import { Icon } from './icons';
import ErrorMessage from './ui/ErrorMessage';
import UnifiedLoadingSpinner from './ui/UnifiedLoadingSpinner';

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
    return <UnifiedLoadingSpinner size="small" message={LOADING_MESSAGES.systems} />;
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
      {/* Grid compacto - estrutura original densa */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-1 px-2 py-3 bg-white border border-gray-200/60 hover:border-gray-200 rounded-md transition-colors duration-150 text-center"
            title={link.description || `Acessar ${link.name}`}
          >
            {/* Nome do sistema - estilo Figma */}
            <span className="text-xs font-medium text-gray-700 group-hover:text-primary transition-colors duration-200 truncate flex-1">
              {link.name}
            </span>
            
            {/* Ícone de link externo - estilo Figma */}
            <Icon 
              name="external-link" 
              className="w-3 h-3 text-gray-400 group-hover:text-primary transition-colors duration-200 flex-shrink-0" 
            />
          </a>
        ))}
      </div>

      {/* Link para ver todos - compacto */}
      <div className="mt-4 text-center">
        <a 
          href="/sistemas" 
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-primary transition-colors duration-200"
        >
          <span>Ver todos os sistemas</span>
          <Icon name="external-link" className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}