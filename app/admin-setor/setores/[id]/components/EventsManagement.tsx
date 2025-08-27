// Wrapper para o componente genérico EventsManagement - Admin Setores (admin-setor)

import { SECTOR_EVENTS_CONFIG } from '@/app/components/management/configs/news-config';
import { EventsManagement as GenericEventsManagement } from '@/app/components/management/EventsManagement';

import type { SectorEvent, SectorEventDTO, mapSectorEventFromDTO } from '../types/sector.types';

interface EventsManagementProps {
  sectorId: string;
  events: SectorEvent[];
  showDrafts: boolean;
  totalDraftEventsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EventsManagement(props: EventsManagementProps) {
  return (
    <GenericEventsManagement<SectorEventDTO>
      entityId={props.sectorId}
      events={props.events as SectorEventDTO[]}
      showDrafts={props.showDrafts}
      totalDraftEventsCount={props.totalDraftEventsCount}
      onToggleDrafts={props.onToggleDrafts}
      onRefresh={props.onRefresh}
      onDelete={props.onDelete}
      config={SECTOR_EVENTS_CONFIG}
    />
  );
}