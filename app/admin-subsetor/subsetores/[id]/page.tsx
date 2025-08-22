'use client';

import React, { useState, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';

// Context Provider
import { SubsectorDataProvider, useSubsectorDataContext } from './contexts/SubsectorDataContext';

// Types
import { TabType } from './types/subsector.types';

// Hooks
import { useSubsectorData } from './hooks/useSubsectorData';
import { useSubsectorContent } from './SubsectorContentManager';
import { useAuth } from '@/app/providers/AuthProvider';

// Components - Lazy loading para otimização
import { TabNavigation } from './components/TabNavigation';
const NewsManagement = lazy(() => import('./components/NewsManagement').then(m => ({ default: m.NewsManagement })));
const EventsManagement = lazy(() => import('./components/EventsManagement').then(m => ({ default: m.EventsManagement })));
const DocumentsManagement = lazy(() => import('./components/DocumentsManagement').then(m => ({ default: m.DocumentsManagement })));
const MessagesManagement = lazy(() => import('./components/MessagesManagement').then(m => ({ default: m.MessagesManagement })));
const GroupsManagement = lazy(() => import('./components/GroupsManagement').then(m => ({ default: m.GroupsManagement })));

// Loading component para lazy loading
const LazyLoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <UnifiedLoadingSpinner message="Carregando componente..." />
  </div>
);

// Componente interno que usa o contexto
function SubsectorDashboardContent() {
  const params = useParams();
  const subsectorId = params.id as string;
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('news');
  
  // Usar hook simples para buscar dados do subsetor
  const { subsector: subsectorFromHook } = useSubsectorData(subsectorId);
  
  // Usar contexto para dados compartilhados
  const {
    subsector: subsectorFromContext,
    groups,
    automaticGroups,
    workLocations,
    userSearchTerm,
    userLocationFilter,
    filteredUsers,
    setUserSearchTerm,
    setUserLocationFilter,
    refreshGroupsData,
    isLoading: contextLoading
  } = useSubsectorDataContext();
  
  // Usar o subsetor do hook se disponível, senão do contexto
  const subsector = subsectorFromHook || subsectorFromContext;

  const {
    news,
    events,
    messages,
    documents,
    showDrafts,
    totalDraftNewsCount,
    totalDraftEventsCount,
    totalDraftMessagesCount,
    totalDraftDocumentsCount,
    toggleDrafts,
    refreshContent,
    deleteNews,
    deleteEvent,
    deleteMessage,
    deleteDocument
  } = useSubsectorContent(subsectorId);

  // Verificação de autorização
  const isAuthorized = profile && profile.role && ['admin', 'sector_admin', 'subsector_admin'].includes(profile.role);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
            <p className="mt-2 text-gray-600">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </div>
    );
  }

  if (contextLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <UnifiedLoadingSpinner fullScreen message="Carregando subsetor..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
          {/* Cabeçalho do Subsetor */}
          <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {subsector?.name || 'Carregando...'}
            </h1>
            {subsector?.description && (
              <p className="mt-2 text-gray-600">{subsector.description}</p>
            )}
          </div>

          {/* Sistema de Abas */}
          <div className="bg-white shadow-sm rounded-lg">
            <TabNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              totalDraftNewsCount={totalDraftNewsCount}
              totalDraftEventsCount={totalDraftEventsCount}
              totalDraftMessagesCount={totalDraftMessagesCount}
              totalDraftDocumentsCount={totalDraftDocumentsCount}
            />

            {/* Conteúdo das Abas */}
            <div className="p-6">
              {activeTab === 'news' && (
                <Suspense fallback={<LazyLoadingSpinner />}>
                  <NewsManagement
                    subsectorId={subsectorId}
                    news={news}
                    showDrafts={showDrafts}
                    totalDraftNewsCount={totalDraftNewsCount}
                    onToggleDrafts={toggleDrafts}
                    onRefresh={refreshContent}
                    onDelete={deleteNews}
                  />
                </Suspense>
              )}

              {activeTab === 'events' && (
                <Suspense fallback={<LazyLoadingSpinner />}>
                  <EventsManagement
                    subsectorId={subsectorId}
                    events={events}
                    showDrafts={showDrafts}
                    totalDraftEventsCount={totalDraftEventsCount}
                    onToggleDrafts={toggleDrafts}
                    onRefresh={refreshContent}
                    onDelete={deleteEvent}
                  />
                </Suspense>
              )}

              {activeTab === 'documents' && (
                <Suspense fallback={<LazyLoadingSpinner />}>
                  <DocumentsManagement
                    subsectorId={subsectorId}
                    documents={documents}
                    showDrafts={showDrafts}
                    totalDraftDocumentsCount={totalDraftDocumentsCount}
                    onToggleDrafts={toggleDrafts}
                    onRefresh={refreshContent}
                    onDelete={deleteDocument}
                  />
                </Suspense>
              )}

              {activeTab === 'groups' && (
                <Suspense fallback={<LazyLoadingSpinner />}>
                  <GroupsManagement
                    subsectorId={subsectorId}
                    groups={groups}
                    automaticGroups={automaticGroups}
                    workLocations={workLocations}
                    filteredUsers={filteredUsers}
                    userSearchTerm={userSearchTerm}
                    userLocationFilter={userLocationFilter}
                    onSearchTermChange={setUserSearchTerm}
                    onLocationFilterChange={setUserLocationFilter}
                    onRefresh={refreshGroupsData}
                  />
                </Suspense>
              )}

              {activeTab === 'messages' && (
                <Suspense fallback={<LazyLoadingSpinner />}>
                  <MessagesManagement
                    subsectorId={subsectorId}
                    messages={messages}
                    showDrafts={showDrafts}
                    totalDraftMessagesCount={totalDraftMessagesCount}
                    onToggleDrafts={toggleDrafts}
                    onRefresh={refreshContent}
                    onDelete={deleteMessage}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

// Componente principal com provider
export default function SubsectorDashboard() {
  const params = useParams();
  const subsectorId = params.id as string;
  
  return (
    <SubsectorDataProvider subsectorId={subsectorId}>
      <SubsectorDashboardContent />
    </SubsectorDataProvider>
  );
}