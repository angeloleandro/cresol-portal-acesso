// Wrapper para o componente genérico EventsManagement - Admin Subsectors

import { SUBSECTOR_EVENTS_CONFIG } from '@/app/components/management/configs/news-config';
import { EventsManagement as GenericEventsManagement } from '@/app/components/management/EventsManagement';

import type { SubsectorEvent } from '../types/subsector.types';

interface EventsManagementProps {
  subsectorId: string;
  events: SubsectorEvent[];
  showDrafts: boolean;
  totalDraftEventsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/**
 * EventsManagement function
 * @todo Add proper documentation
 */
export function EventsManagement(props: EventsManagementProps) {
  return (
    <GenericEventsManagement<SubsectorEvent>
      entityId={props.subsectorId}
      events={props.events}
      showDrafts={props.showDrafts}
      totalDraftEventsCount={props.totalDraftEventsCount}
      onToggleDrafts={props.onToggleDrafts}
      onRefresh={props.onRefresh}
      onDelete={props.onDelete}
      config={SUBSECTOR_EVENTS_CONFIG}
    />
  );
}