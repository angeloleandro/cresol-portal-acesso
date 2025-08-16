/**
 * Tab de Notícias usando o novo sistema unificado
 * Elimina duplicação usando UnifiedContentManager
 */

'use client';

import { UnifiedContentManager } from '../adapters/UnifiedContentManager';
import { createNewsAdapter, NewsContentData } from '../adapters/GenericContentAdapter';

interface UnifiedNewsTabProps {
  subsectorId: string;
  subsectorName: string;
  showDrafts?: boolean;
  useRealtime?: boolean;
}

export function UnifiedNewsTab({ 
  subsectorId, 
  subsectorName, 
  showDrafts = false,
  useRealtime = false 
}: UnifiedNewsTabProps) {
  // Criar adapter específico para news do subsector
  const adapter = createNewsAdapter('subsector', subsectorId);

  return (
    <UnifiedContentManager<NewsContentData>
      type="news"
      entityType="subsector"
      entityId={subsectorId}
      entityName={subsectorName}
      adapter={adapter}
      showDrafts={showDrafts}
      useRealtime={useRealtime}
    />
  );
}