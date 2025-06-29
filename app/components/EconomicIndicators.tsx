'use client';

import { useEffect, useState } from 'react';
import { handleComponentError, devLog } from '@/lib/error-handler';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorMessage from './ui/ErrorMessage';
import { Icon } from './icons';

interface EconomicIndicator {
  id: string;
  title: string;
  value: string;
  icon: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  issue_date?: string; // Formato MM/YYYY
}

const iconMap: Record<string, JSX.Element> = {
  users: <Icon name="user-group" className="h-4 w-4" />,
  building: <Icon name="building-1" className="h-4 w-4" />,
  bank: <Icon name="building-2" className="h-4 w-4" />,
  money: <Icon name="suitcase" className="h-4 w-4" />,
  treasure: <Icon name="chart-bar-vertical" className="h-4 w-4" />,
  'piggy-bank': <Icon name="suitcase" className="h-4 w-4" />,
  handshake: <Icon name="user-check" className="h-4 w-4" />,
  tractor: <Icon name="building-1" className="h-4 w-4" />,
  briefcase: <Icon name="suitcase" className="h-4 w-4" />,
};

export default function EconomicIndicators() {
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/economic-indicators?active_only=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar indicadores');
      }

      setIndicators(data.indicators || []);
      devLog.info('Indicadores econômicos carregados', { count: data.indicators?.length });

    } catch (error: any) {
      const errorMessage = handleComponentError(error, 'fetchIndicators');
      setError(errorMessage);
      devLog.error('Erro ao buscar indicadores econômicos', { error });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4">
        <LoadingSpinner message="Carregando indicadores..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <ErrorMessage
          title="Erro ao Carregar Indicadores"
          message={error}
          type="error"
          showRetry
          onRetry={fetchIndicators}
        />
      </div>
    );
  }

  if (!indicators.length) {
    return null;
  }

  return (
    <section 
      className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 to-orange-100"
      aria-labelledby="economic-indicators-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Melhorado */}
        <div className="text-center mb-8">
          <h2 
            id="economic-indicators-heading"
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Indicadores Econômicos
          </h2>
          <div className="flex items-center justify-center gap-2 mb-3">
            <p className="text-sm text-gray-600 font-medium">
              Cresol Fronteiras
            </p>
            {indicators.length > 0 && indicators[0].issue_date && (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                Dados {indicators[0].issue_date}
              </span>
            )}
          </div>
          <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Grid Melhorado de Indicadores */}
        <div 
          className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4"
          role="list"
          aria-label="Lista de indicadores econômicos"
        >
          {indicators.map((indicator, index) => (
            <article
              key={indicator.id}
              role="listitem"
              className="group bg-white border border-orange-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-lg hover:scale-105 transition-all duration-300"
              aria-labelledby={`indicator-${index}-title`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                {/* Ícone Melhorado */}
                <div className="p-3 bg-orange-50 rounded-full border-2 border-orange-100 group-hover:border-orange-300 group-hover:bg-orange-100 transition-colors">
                  <div className="text-orange-600">
                    {iconMap[indicator.icon] || iconMap.money}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {/* Valor Principal Melhorado */}
                  <div 
                    className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors"
                    aria-label={`Valor: ${indicator.value}`}
                  >
                    {indicator.value}
                  </div>
                  
                  {/* Título Melhorado */}
                  <h3 
                    id={`indicator-${index}-title`}
                    className="text-xs font-semibold text-gray-700 leading-tight"
                  >
                    {indicator.title}
                  </h3>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Rodapé com Informações */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Dados atualizados mensalmente • Fonte: Cresol Fronteiras
          </p>
        </div>
      </div>
    </section>
  );
} 