// Wrapper para o componente genérico NewsManagement - Admin Subsectors

import { SUBSECTOR_NEWS_CONFIG } from '@/app/components/management/configs/news-config';
import { NewsManagement as GenericNewsManagement } from '@/app/components/management/NewsManagement';

import type { SubsectorNews } from '../types/subsector.types';

interface NewsManagementProps {
  subsectorId: string;
  news: SubsectorNews[];
  showDrafts: boolean;
  totalDraftNewsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/**
 * NewsManagement function
 * @todo Add proper documentation
 */
export function NewsManagement(props: NewsManagementProps) {
  return (
    <GenericNewsManagement<SubsectorNews>
      entityId={props.subsectorId}
      news={props.news}
      showDrafts={props.showDrafts}
      totalDraftNewsCount={props.totalDraftNewsCount}
      onToggleDrafts={props.onToggleDrafts}
      onRefresh={props.onRefresh}
      onDelete={props.onDelete}
      config={SUBSECTOR_NEWS_CONFIG}
    />
  );
}