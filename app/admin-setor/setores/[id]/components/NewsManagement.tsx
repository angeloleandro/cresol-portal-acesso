// Wrapper para o componente genérico NewsManagement - Admin Setores (admin-setor)

import { SECTOR_NEWS_CONFIG } from '@/app/components/management/configs/news-config';
import { NewsManagement as GenericNewsManagement } from '@/app/components/management/NewsManagement';

import type { SectorNews, SectorNewsDTO } from '../types/sector.types';

interface NewsManagementProps {
  sectorId: string;
  news: SectorNews[];
  showDrafts: boolean;
  totalDraftNewsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NewsManagement(props: NewsManagementProps) {
  return (
    <GenericNewsManagement<SectorNewsDTO>
      entityId={props.sectorId}
      news={props.news as SectorNewsDTO[]}
      showDrafts={props.showDrafts}
      totalDraftNewsCount={props.totalDraftNewsCount}
      onToggleDrafts={props.onToggleDrafts}
      onRefresh={props.onRefresh}
      onDelete={props.onDelete}
      config={SECTOR_NEWS_CONFIG}
    />
  );
}