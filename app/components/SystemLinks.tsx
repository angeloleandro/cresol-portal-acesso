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
      <div className="py-4">
        <LoadingSpinner message="Carregando links..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <ErrorMessage
          title="Erro ao Carregar Links"
          message={error}
          type="error"
          showRetry
          onRetry={fetchLinks}
        />
      </div>
    );
  }

  if (!links.length) {
    return null;
  }

  return (
    <section 
      className="py-8 px-4 sm:px-6 lg:px-8 bg-white"
      aria-labelledby="system-links-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Profissional */}
        <div className="text-center mb-8">
          <h2 
            id="system-links-heading"
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Sistemas e Apps
          </h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Grid de Links - Design Profissional */}
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-4"
          role="list"
          aria-label="Lista de sistemas e aplicações"
        >
          {links.map((link, index) => (
            <article
              key={link.id}
              role="listitem"
              className="group"
            >
              <button
                onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                className="w-full bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 text-center transition-all duration-200 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg hover:border-orange-300 hover:bg-orange-50"
                aria-label={`Acessar ${link.name} em uma nova aba`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon name="monitor" className="w-6 h-6 text-gray-600 group-hover:text-orange-600 transition-colors" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-orange-700 transition-colors leading-tight">
                    {link.name}
                  </span>
                </div>
              </button>
            </article>
          ))}
        </div>

        {/* Nota informativa */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Clique nos sistemas acima para acessá-los em uma nova aba
          </p>
        </div>
      </div>
    </section>
  );
} 