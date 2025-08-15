'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';

// Types
import { TabType } from './types/sector.types';

// Hooks
import { useSectorAuth } from './hooks/useSectorAuth';
import { useSectorData } from './hooks/useSectorData';
import { useGroupsManagement } from './hooks/useGroupsManagement';
import { useSectorContent } from './SectorContentManager';

// Components
import { TabNavigation } from './components/TabNavigation';
import { NewsManagement } from './components/NewsManagement';
import { EventsManagement } from './components/EventsManagement';
import { SubsectorsManagement } from './components/SubsectorsManagement';
import { GroupsManagement } from './components/GroupsManagement';
import { MessagesManagement } from './components/MessagesManagement';

export default function SectorDashboard() {
  const params = useParams();
  const sectorId = params.id as string;
  
  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState<TabType>('news');
  
  // Hooks customizados para gerenciar diferentes aspectos
  const { user, isAuthorized, loading: authLoading } = useSectorAuth(sectorId);
  const { sector, subsectors, refreshData: refreshSectorData } = useSectorData(sectorId);
  const {
    news,
    events,
    showDrafts,
    isLoading: contentLoading,
    totalDraftNewsCount,
    totalDraftEventsCount,
    toggleDrafts,
    refreshContent,
    deleteNews,
    deleteEvent
  } = useSectorContent(sectorId);
  
  const {
    groups,
    automaticGroups,
    workLocations,
    userSearchTerm,
    userLocationFilter,
    setUserSearchTerm,
    setUserLocationFilter,
    refreshAll: refreshGroups,
    filteredUsers
  } = useGroupsManagement(sectorId);

  // Loading state
  if (authLoading || contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <UnifiedLoadingSpinner message="Carregando informações do setor..." />
      </div>
    );
  }

  // Authorization check
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Admin', href: '/admin' },
    { label: 'Setores', href: '/admin/sectors' },
    { label: sector?.name || 'Carregando...', href: '#' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header padrão */}
      <AdminHeader user={user} />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Cabeçalho do setor */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciar Setor: {sector?.name}
          </h1>
          {sector?.description && (
            <p className="mt-2 text-gray-600">{sector.description}</p>
          )}
        </div>
      </div>

      {/* Navegação por abas */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalDraftNewsCount={totalDraftNewsCount}
        totalDraftEventsCount={totalDraftEventsCount}
      />

      {/* Conteúdo da aba ativa */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'news' && (
          <NewsManagement
            sectorId={sectorId}
            news={news}
            showDrafts={showDrafts}
            totalDraftNewsCount={totalDraftNewsCount}
            onToggleDrafts={toggleDrafts}
            onRefresh={refreshContent}
            onDelete={deleteNews}
          />
        )}

        {activeTab === 'events' && (
          <EventsManagement
            sectorId={sectorId}
            events={events}
            showDrafts={showDrafts}
            totalDraftEventsCount={totalDraftEventsCount}
            onToggleDrafts={toggleDrafts}
            onRefresh={refreshContent}
            onDelete={deleteEvent}
          />
        )}

        {activeTab === 'subsectors' && (
          <SubsectorsManagement
            sectorId={sectorId}
            subsectors={subsectors}
            onRefresh={refreshSectorData}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsManagement
            sectorId={sectorId}
            groups={groups}
            automaticGroups={automaticGroups}
            workLocations={workLocations}
            userSearchTerm={userSearchTerm}
            userLocationFilter={userLocationFilter}
            filteredUsers={filteredUsers}
            onSearchTermChange={setUserSearchTerm}
            onLocationFilterChange={setUserLocationFilter}
            onRefresh={refreshGroups}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesManagement
            groups={groups}
            automaticGroups={automaticGroups}
            onRefresh={refreshGroups}
          />
        )}
      </main>
    </div>
  );
}