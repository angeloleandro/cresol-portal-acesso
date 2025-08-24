'use client';

import { useEffect, useState } from 'react';

import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { handleComponentError, devLog } from '@/lib/error-handler';

import EconomicIndicatorCard from './EconomicIndicatorCard';
import ErrorMessage from '../ui/ErrorMessage';
import UnifiedLoadingSpinner from '../ui/UnifiedLoadingSpinner';

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

export default function EconomicIndicatorsPanel() {
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
      <div className="economic-indicators-panel">
        <UnifiedLoadingSpinner message={LOADING_MESSAGES.default} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="economic-indicators-panel">
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

  const issueDate = indicators.length > 0 && indicators[0].issue_date 
    ? indicators[0].issue_date 
    : new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

  return (
    <section 
      className="economic-indicators-panel"
      aria-labelledby="economic-indicators-heading"
    >
      {/* Header */}
      <div className="economic-indicators-header">
        <h2 
          id="economic-indicators-heading"
          className="economic-indicators-title"
        >
          Indicadores Econômicos Cresol Fronteiras
        </h2>
        
        <div className="economic-indicators-subtitle">
          <span className="body-text-small text-muted font-medium">
            Dados Referentes a
          </span>
          <span className="economic-indicators-badge">
            {issueDate}
          </span>
        </div>
        
        <div className="economic-indicators-divider"></div>
      </div>

      {/* Indicators Grid */}
      <div 
        className="economic-indicators-grid"
        role="list"
        aria-label="Lista de indicadores econômicos"
      >
        {indicators.map((indicator, index) => (
          <EconomicIndicatorCard
            key={indicator.id}
            title={indicator.title}
            value={indicator.value}
            icon={indicator.icon}
            description={indicator.description}
            index={index}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="economic-indicators-footer">
        <p className="economic-indicators-footer-text">
          Dados oficiais • Cresol Fronteiras • Atualização Mensal
        </p>
      </div>
    </section>
  );
}