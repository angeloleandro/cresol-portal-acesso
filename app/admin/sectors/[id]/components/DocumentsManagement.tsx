// Wrapper para o componente genérico DocumentsManagement - Admin Sectors

import { SECTOR_DOCUMENTS_CONFIG } from '@/app/components/management/configs/news-config';
import { DocumentsManagement as GenericDocumentsManagement } from '@/app/components/management/DocumentsManagement';

import type { SectorDocument } from '../types/sector.types';

interface DocumentsManagementProps {
  sectorId: string;
  documents: SectorDocument[];
  showDrafts: boolean;
  totalDraftDocumentsCount: number;
  onToggleDrafts: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/**
 * DocumentsManagement function
 * @todo Add proper documentation
 */
export function DocumentsManagement(props: DocumentsManagementProps) {
  return (
    <GenericDocumentsManagement<SectorDocument>
      entityId={props.sectorId}
      documents={props.documents}
      showDrafts={props.showDrafts}
      totalDraftDocumentsCount={props.totalDraftDocumentsCount}
      onToggleDrafts={props.onToggleDrafts}
      onRefresh={props.onRefresh}
      onDelete={props.onDelete}
      config={SECTOR_DOCUMENTS_CONFIG}
    />
  );
}