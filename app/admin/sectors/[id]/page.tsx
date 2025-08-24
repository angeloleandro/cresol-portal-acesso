'use client';

import { useParams } from 'next/navigation';
import { lazy, Suspense, useState } from 'react';

import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';

// Context Provider
import { TabNavigation } from './components/TabNavigation';
import { SectorDataProvider, useSectorDataContext } from './contexts/SectorDataContext';

// Types

// Hooks
import { useSectorAuth } from './hooks/useSectorAuth';
import { useSectorData } from './hooks/useSectorData';
import { useSectorContent } from './SectorContentManager';
import { TabType } from './types/sector.types';

// Components - Lazy loading para otimização
const NewsManagement = lazy(() => import('./components/NewsManagement').then(m => ({ default: m.NewsManagement })));
const EventsManagement = lazy(() => import('./components/EventsManagement').then(m => ({ default: m.EventsManagement })));
const DocumentsManagement = lazy(() => import('./components/DocumentsManagement').then(m => ({ default: m.DocumentsManagement })));
const SubsectorsManagement = lazy(() => import('./components/SubsectorsManagement').then(m => ({ default: m.SubsectorsManagement })));
const GroupsManagement = lazy(() => import('./components/GroupsManagement').then(m => ({ default: m.GroupsManagement })));
const MessagesManagement = lazy(() => import('./components/MessagesManagement').then(m => ({ default: m.MessagesManagement })));
const VideosManagement = lazy(() => import('./components/VideosManagement').then(m => ({ default: m.VideosManagement })));
const ImagesManagement = lazy(() => import('./components/ImagesManagement').then(m => ({ default: m.ImagesManagement })));

// Componente interno que usa o contexto
function SectorDashboardContent() {
  const params = useParams();
  const sectorId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<TabType>('news');
  
  // Usar hook simples para buscar dados do setor (similar ao subsetor)
  const { sector: sectorFromHook } = useSectorData(sectorId);
  
  // Usar contexto para dados compartilhados
  const {
    sector: sectorFromContext,
    subsectors,
    groups,
    automaticGroups,
    workLocations,
    userSearchTerm,
    userLocationFilter,
    filteredUsers,
    setUserSearchTerm,
    setUserLocationFilter,
    refreshSectorData,
    refreshGroupsData,
    isLoading: contextLoading,
    error: contextError
  } = useSectorDataContext();
  
  // Usar o setor do hook se disponível, senão do contexto
  const sector = sectorFromHook || sectorFromContext;

  const { user, isAuthorized, loading: authLoading } = useSectorAuth(sectorId);
  
  const {
    news,
    events,
    messages,
    documents,
    videos,
    images,
    showDrafts,
    totalDraftNewsCount,
    totalDraftEventsCount,
    totalDraftMessagesCount,
    totalDraftDocumentsCount,
    totalDraftVideosCount,
    totalDraftImagesCount,
    toggleDrafts,
    refreshContent,
    deleteNews,
    deleteEvent,
    deleteMessage,
    deleteDocument,
    deleteVideo,
    deleteImage
  } = useSectorContent(sectorId);

  // Loading state - mais permissivo para evitar travamento
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <UnifiedLoadingSpinner message="Verificando autenticação..." />
      </div>
    );
  }
  
  // Se está carregando contexto mas já tem pelo menos o ID do setor, renderiza a página
  // Isto evita travamento na tela de loading
  const showLoadingOverlay = contextLoading && !sector;

  // Error state
  if (contextError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">{contextError}</p>
        </div>
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

  // Breadcrumb com fallback seguro
  const breadcrumbItems = [
    { label: 'Admin', href: '/admin' },
    { label: 'Setores', href: '/admin/sectors' },
    { label: sector?.name || 'Setor', href: '#' }
  ];

  // Componente de loading para lazy components
  const LazyLoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <UnifiedLoadingSpinner message="Carregando..." />
    </div>
  );

  return (
    <>
      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <UnifiedLoadingSpinner message="Carregando informações do setor..." />
        </div>
      )}
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
            Gerenciar Setor: {sector?.name || 'Carregando...'}
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
        totalDraftDocumentsCount={totalDraftDocumentsCount}
        totalDraftMessagesCount={totalDraftMessagesCount}
        totalDraftVideosCount={totalDraftVideosCount}
        totalDraftImagesCount={totalDraftImagesCount}
      />

      {/* Conteúdo da aba ativa com lazy loading */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'news' && (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <NewsManagement
              sectorId={sectorId}
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
              sectorId={sectorId}
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
              sectorId={sectorId}
              documents={documents}
              showDrafts={showDrafts}
              totalDraftDocumentsCount={totalDraftDocumentsCount}
              onToggleDrafts={toggleDrafts}
              onRefresh={refreshContent}
              onDelete={deleteDocument}
            />
          </Suspense>
        )}

        {activeTab === 'subsectors' && (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <SubsectorsManagement
              sectorId={sectorId}
              subsectors={subsectors}
              onRefresh={refreshSectorData}
            />
          </Suspense>
        )}

        {activeTab === 'groups' && (
          <Suspense fallback={<LazyLoadingSpinner />}>
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
              onRefresh={refreshGroupsData}
            />
          </Suspense>
        )}

        {activeTab === 'messages' && (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <MessagesManagement
              sectorId={sectorId}
              messages={messages}
              showDrafts={showDrafts}
              totalDraftMessagesCount={totalDraftMessagesCount}
              onToggleDrafts={toggleDrafts}
              onRefresh={refreshContent}
              onDelete={deleteMessage}
            />
          </Suspense>
        )}

        {activeTab === 'videos' && (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <VideosManagement
              sectorId={sectorId}
              videos={videos}
              showDrafts={showDrafts}
              totalDraftVideosCount={totalDraftVideosCount}
              onToggleDrafts={toggleDrafts}
              onRefresh={refreshContent}
              onDelete={deleteVideo}
            />
          </Suspense>
        )}

        {activeTab === 'images' && (
          <Suspense fallback={<LazyLoadingSpinner />}>
            <ImagesManagement
              sectorId={sectorId}
              images={images}
              showDrafts={showDrafts}
              totalDraftImagesCount={totalDraftImagesCount}
              onToggleDrafts={toggleDrafts}
              onRefresh={refreshContent}
              onDelete={deleteImage}
            />
          </Suspense>
        )}
      </main>
    </div>
    </>
  );
}

// Componente principal com Provider
export default function SectorDashboard() {
  const params = useParams();
  const sectorId = params.id as string;

  return (
    <SectorDataProvider sectorId={sectorId}>
      <SectorDashboardContent />
    </SectorDataProvider>
  );
}