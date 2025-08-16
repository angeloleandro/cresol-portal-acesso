/**
 * Tab de Eventos usando o novo sistema unificado
 * Elimina duplicação usando UnifiedContentManager
 */

'use client';

import { UnifiedContentManager } from '../adapters/UnifiedContentManager';
import { createEventsAdapter, EventContentData } from '../adapters/GenericContentAdapter';

interface UnifiedEventsTabProps {
  subsectorId: string;
  subsectorName: string;
  showDrafts?: boolean;
  useRealtime?: boolean;
}

export function UnifiedEventsTab({ 
  subsectorId, 
  subsectorName, 
  showDrafts = false,
  useRealtime = false 
}: UnifiedEventsTabProps) {
  // Criar adapter específico para events do subsector
  const adapter = createEventsAdapter('subsector', subsectorId);

  return (
    <UnifiedContentManager<EventContentData>
      type="events"
      entityType="subsector"
      entityId={subsectorId}
      entityName={subsectorName}
      adapter={adapter}
      showDrafts={showDrafts}
      useRealtime={useRealtime}
    />
  );
}