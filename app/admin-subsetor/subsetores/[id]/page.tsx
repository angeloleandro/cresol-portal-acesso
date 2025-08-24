'use client';

import { useParams } from 'next/navigation';
import { useState, lazy, Suspense } from 'react';

import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';

// Context Provider

// Types

// Hooks
import { useAuth } from '@/app/providers/AuthProvider';

// Components - Lazy loading para otimização
import { TabNavigation } from './components/TabNavigation';
import { SubsectorDataProvider, useSubsectorDataContext } from './contexts/SubsectorDataContext';
import { useSubsectorData } from './hooks/useSubsectorData';
import { useSubsectorContent } from './SubsectorContentManager';
import { TabType } from './types/subsector.types';
const NewsManagement = lazy(() => import('./components/NewsManagement').then(m => ({ default: m.NewsManagement })));
const EventsManagement = lazy(() => import('./components/EventsManagement').then(m => ({ default: m.EventsManagement })));
const DocumentsManagement = lazy(() => import('./components/DocumentsManagement').then(m => ({ default: m.DocumentsManagement })));
const VideosManagement = lazy(() => import('./components/VideosManagement').then(m => ({ default: m.VideosManagement })));
const ImagesManagement = lazy(() => import('./components/ImagesManagement').then(m => ({ default: m.ImagesManagement })));
const MessagesManagement = lazy(() => import('./components/MessagesManagement').then(m => ({ default: m.MessagesManagement })));
const GroupsManagement = lazy(() => import('./components/GroupsManagement').then(m => ({ default: m.GroupsManagement })));

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
    videos,
    showDrafts,
    totalDraftNewsCount,
    totalDraftEventsCount,
    totalDraftMessagesCount,
    totalDraftDocumentsCount,
    totalDraftVideosCount,
    toggleDrafts,
    refreshContent,
    deleteNews,
    deleteEvent,
    deleteMessage,
    deleteDocument,
    deleteVideo
  } = useSubsectorContent(subsectorId);

  // Temporary images state until SubsectorContentManager is updated
  const [images, setImages] = useState([]);
  const [totalDraftImagesCount, setTotalDraftImagesCount] = useState(0);

  // Temporary images functions
  const deleteImage = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/subsectors/${subsectorId}/images/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar imagem');
      }
      
      // Refresh images list
      await refreshImages();
    } catch (error) {

      throw error;
    }
  };

  const refreshImages = async () => {
    if (!subsectorId) return;
    
    try {
      const response = await fetch(`/api/admin/subsectors/${subsectorId}/images`);
      const data = await response.json();
      
      if (data.success) {
        setImages(data.data || []);
        setTotalDraftImagesCount(data.draftCount || 0);
      }
    } catch (error) {

    }
  };

  // Verificação de autorização
  const isAuthorized = profile && profile.role && ['admin', 'sector_admin', 'subsector_admin'].includes(profile.role);

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

  if (contextLoading && !subsector) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <UnifiedLoadingSpinner message="Carregando subsetor..." />
      </div>
    );
  }

  // Breadcrumb com fallback seguro
  const breadcrumbItems = [
    { label: 'Admin Subsetor', href: '/admin-subsetor' },
    { label: 'Subsetores', href: '/admin-subsetor/subsetores' },
    { label: subsector?.name || 'Subsetor', href: '#' }
  ];

  // Componente de loading para lazy components
  const LazyLoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <UnifiedLoadingSpinner message="Carregando..." />
    </div>
  );

  return (
    <>
      {contextLoading && !subsector && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <UnifiedLoadingSpinner message="Carregando informações do subsetor..." />
        </div>
      )}
      <div className="min-h-screen bg-gray-50">
      
      {/* Admin Header padrão */}
      <AdminHeader user={profile} />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Cabeçalho do subsetor */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciar Subsetor: {subsector?.name || 'Carregando...'}
          </h1>
          {subsector?.description && (
            <p className="mt-2 text-gray-600">{subsector.description}</p>
          )}
        </div>
      </div>

      {/* Navegação por abas */}
      <TabNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              totalDraftNewsCount={totalDraftNewsCount}
              totalDraftEventsCount={totalDraftEventsCount}
              totalDraftMessagesCount={totalDraftMessagesCount}
              totalDraftDocumentsCount={totalDraftDocumentsCount}
              totalDraftVideosCount={totalDraftVideosCount}
              totalDraftImagesCount={totalDraftImagesCount}
      />

      {/* Conteúdo da aba ativa com lazy loading */}
      <main className="max-w-7xl mx-auto">
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

              {activeTab === 'videos' && (
                <Suspense fallback={<LazyLoadingSpinner />}>
                  <VideosManagement
                    subsectorId={subsectorId}
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
                    subsectorId={subsectorId}
                    images={images}
                    showDrafts={showDrafts}
                    totalDraftImagesCount={totalDraftImagesCount}
                    onToggleDrafts={toggleDrafts}
                    onRefresh={refreshContent}
                    onDelete={deleteImage}
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
      </main>
    </div>
    </>
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