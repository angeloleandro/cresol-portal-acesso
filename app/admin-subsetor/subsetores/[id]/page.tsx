// Página de gerenciamento de subsetor para admin de subsetor

'use client';

import { lazy, Suspense, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '@/app/components/AuthGuard';
import { useAuth } from '@/app/providers/AuthProvider';

import LoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { AlertProvider } from '@/app/components/alerts';
import { 
  StandardizedAdminLayout, 
  StandardizedPageHeader,
  type BreadcrumbItem
} from '@/app/components/admin';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import { useSubsectorData } from './hooks/useSubsectorData';
import { useSubsectorContentManager } from './SubsectorContentManager';
import { SubsectorDataProvider } from './contexts/SubsectorDataContext';
import { TabNavigation } from './components/TabNavigation';
import type { TabType } from './types/subsector.types';

// Lazy load components
const NewsManagement = lazy(() => import('./components/NewsManagement').then(m => ({ default: m.NewsManagement })));
const EventsManagement = lazy(() => import('./components/EventsManagement').then(m => ({ default: m.EventsManagement })));
const MessagesManagement = lazy(() => import('./components/MessagesManagement').then(m => ({ default: m.MessagesManagement })));
const DocumentsManagement = lazy(() => import('./components/DocumentsManagement').then(m => ({ default: m.DocumentsManagement })));
const VideosManagement = lazy(() => import('./components/VideosManagement').then(m => ({ default: m.VideosManagement })));
const ImagesManagement = lazy(() => import('./components/ImagesManagement').then(m => ({ default: m.ImagesManagement })));
const GroupsManagement = lazy(() => import('./components/GroupsManagementSimple').then(m => ({ default: m.GroupsManagement })));
const TeamManagement = lazy(() => import('./components/TeamManagement').then(m => ({ default: m.TeamManagement })));

function SubsectorManagementPageContent() {
  const params = useParams();
  const subsectorId = params.id as string;
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('news');
  
  // Subsector data
  const { subsector, loading: subsectorLoading, error: subsectorError } = useSubsectorData(subsectorId);
  
  // Content management
  const contentManager = useSubsectorContentManager(subsectorId);

  // Loading state
  if (subsectorLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (subsectorError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Erro ao carregar dados do subsetor: {subsectorError}</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!subsector) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">Subsetor não encontrado</p>
        </div>
      </div>
    );
  }

  const draftCounts = {
    news: contentManager.totalDraftNewsCount,
    events: contentManager.totalDraftEventsCount,
    messages: contentManager.totalDraftMessagesCount,
    documents: contentManager.totalDraftDocumentsCount,
    videos: contentManager.totalDraftVideosCount,
    images: contentManager.totalDraftImagesCount,
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/home', icon: 'house' },
    { label: 'Administração de Subsetores', href: '/admin-subsetor' },
    { label: subsector.name || 'Subsetor' }
  ];

  return (
    <AlertProvider>
      <SubsectorDataProvider subsectorId={subsectorId}>
        <StandardizedAdminLayout user={user} breadcrumbs={breadcrumbs}>
          <StandardizedPageHeader
            title={`Gerenciamento do Subsetor: ${subsector.name}`}
            subtitle={subsector.description || 'Gerencie conteúdos, equipes e configurações do Subsetor'}
          />

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Tab Navigation */}
              <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                draftCounts={draftCounts}
              />

              {/* Tab Content */}
              <Suspense fallback={<LoadingSpinner />}>
                {activeTab === 'news' && (
                  <NewsManagement
                    subsectorId={subsectorId}
                    news={contentManager.news}
                    showDrafts={contentManager.showDraftNews}
                    totalDraftNewsCount={contentManager.totalDraftNewsCount}
                    onToggleDrafts={contentManager.toggleDraftNews}
                    onRefresh={contentManager.refreshNews}
                    onDelete={contentManager.deleteNews}
                  />
                )}
                
                {activeTab === 'events' && (
                  <EventsManagement
                    subsectorId={subsectorId}
                    events={contentManager.events}
                    showDrafts={contentManager.showDraftEvents}
                    totalDraftEventsCount={contentManager.totalDraftEventsCount}
                    onToggleDrafts={contentManager.toggleDraftEvents}
                    onRefresh={contentManager.refreshEvents}
                    onDelete={contentManager.deleteEvent}
                  />
                )}
                
                {activeTab === 'messages' && (
                  <MessagesManagement
                    subsectorId={subsectorId}
                    messages={contentManager.messages}
                    showDrafts={contentManager.showDraftMessages}
                    totalDraftMessagesCount={contentManager.totalDraftMessagesCount}
                    onToggleDrafts={contentManager.toggleDraftMessages}
                    onRefresh={contentManager.refreshMessages}
                    onDelete={contentManager.deleteMessage}
                  />
                )}
                
                {activeTab === 'documents' && (
                  <DocumentsManagement
                    subsectorId={subsectorId}
                    documents={contentManager.documents}
                    showDrafts={contentManager.showDraftDocuments}
                    totalDraftDocumentsCount={contentManager.totalDraftDocumentsCount}
                    onToggleDrafts={contentManager.toggleDraftDocuments}
                    onRefresh={contentManager.refreshDocuments}
                    onDelete={contentManager.deleteDocument}
                  />
                )}
                
                {activeTab === 'videos' && (
                  <VideosManagement
                    subsectorId={subsectorId}
                    videos={contentManager.videos}
                    showDrafts={contentManager.showDraftVideos}
                    totalDraftVideosCount={contentManager.totalDraftVideosCount}
                    onToggleDrafts={contentManager.toggleDraftVideos}
                    onRefresh={contentManager.refreshVideos}
                    onDelete={contentManager.deleteVideo}
                  />
                )}
                
                {activeTab === 'images' && (
                  <ImagesManagement
                    subsectorId={subsectorId}
                    images={contentManager.images}
                    showDrafts={contentManager.showDraftImages}
                    totalDraftImagesCount={contentManager.totalDraftImagesCount}
                    onToggleDrafts={contentManager.toggleDraftImages}
                    onRefresh={contentManager.refreshImages}
                    onDelete={contentManager.deleteImage}
                  />
                )}
                
                {activeTab === 'groups' && (
                  <GroupsManagement subsectorId={subsectorId} />
                )}
                
                {activeTab === 'team' && (
                  <TeamManagement 
                    subsectorId={subsectorId} 
                  />
                )}
              </Suspense>
            </div>
          </div>
        </StandardizedAdminLayout>
      </SubsectorDataProvider>
    </AlertProvider>
  );
}

export default function SubsectorManagementPage() {
  return (
    <AuthGuard requireRole="subsector_admin">
      <SubsectorManagementPageContent />
    </AuthGuard>
  );
}