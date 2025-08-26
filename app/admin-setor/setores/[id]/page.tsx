// Página de gerenciamento de setor para admin de setor

'use client';

import { lazy, Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import { AlertProvider } from '@/app/components/alerts';
import { 
  StandardizedAdminLayout, 
  StandardizedPageHeader,
  type BreadcrumbItem
} from '@/app/components/admin';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import { useSectorAuth } from './hooks/useSectorAuth';
import { useSectorData } from './hooks/useSectorData';
import { useSectorContentManager } from './SectorContentManager';
import { SectorDataProvider } from './contexts/SectorDataContext';
import { TabNavigation } from './components/TabNavigation';

// Lazy load components
const NewsManagement = lazy(() => import('./components/NewsManagement').then(m => ({ default: m.NewsManagement })));
const EventsManagement = lazy(() => import('./components/EventsManagement').then(m => ({ default: m.EventsManagement })));
const MessagesManagement = lazy(() => import('./components/MessagesManagement').then(m => ({ default: m.MessagesManagement })));
const DocumentsManagement = lazy(() => import('./components/DocumentsManagement').then(m => ({ default: m.DocumentsManagement })));
const VideosManagement = lazy(() => import('./components/VideosManagement').then(m => ({ default: m.VideosManagement })));
const ImagesManagement = lazy(() => import('./components/ImagesManagement').then(m => ({ default: m.ImagesManagement })));
const GroupsManagement = lazy(() => import('./components/GroupsManagement').then(m => ({ default: m.GroupsManagement })));
const SubsectorsManagement = lazy(() => import('./components/SubsectorsManagement').then(m => ({ default: m.SubsectorsManagement })));
const TeamManagement = lazy(() => import('./components/TeamManagement').then(m => ({ default: m.TeamManagement })));

export default function SectorManagementPage() {
  const params = useParams();
  const router = useRouter();
  const sectorId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('news');
  const [user, setUser] = useState<any>(null);
  
  // Authentication
  const { isAuthorized, loading: authLoading } = useSectorAuth(sectorId);
  
  // Sector data
  const { sector, loading: sectorLoading, error: sectorError } = useSectorData(sectorId);
  
  // Content management
  const contentManager = useSectorContentManager(sectorId);

  // Get user data
  useEffect(() => {
    const getUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUser(userData.user);
      }
    };
    getUser();
  }, []);

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.push('/home');
    }
  }, [authLoading, isAuthorized, router]);

  // Loading state
  if (authLoading || sectorLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (sectorError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Erro ao carregar dados do setor: {sectorError}</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return null;
  }

  // Not found
  if (!sector) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">Setor não encontrado</p>
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
    { label: 'Administração Setorial', href: '/admin-setor' },
    { label: sector.name || 'Setor' }
  ];

  return (
    <AlertProvider>
      <SectorDataProvider sectorId={sectorId}>
        <StandardizedAdminLayout user={user} breadcrumbs={breadcrumbs}>
          <StandardizedPageHeader
            title={`Gerenciamento do Setor: ${sector.name}`}
            subtitle={sector.description || 'Gerencie conteúdos, equipes e configurações do setor'}
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
                    sectorId={sectorId}
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
                    sectorId={sectorId}
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
                    sectorId={sectorId}
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
                    sectorId={sectorId}
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
                    sectorId={sectorId}
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
                    sectorId={sectorId}
                    images={contentManager.images}
                    showDrafts={contentManager.showDraftImages}
                    totalDraftImagesCount={contentManager.totalDraftImagesCount}
                    onToggleDrafts={contentManager.toggleDraftImages}
                    onRefresh={contentManager.refreshImages}
                    onDelete={contentManager.deleteImage}
                  />
                )}
                
                {activeTab === 'groups' && (
                  <GroupsManagement sectorId={sectorId} />
                )}
                
                {activeTab === 'subsectors' && (
                  <SubsectorsManagement sectorId={sectorId} />
                )}
                
                {activeTab === 'team' && (
                  <TeamManagement 
                    sectorId={sectorId} 
                    sectorName={sector?.name || 'Setor'} 
                  />
                )}
              </Suspense>
            </div>
          </div>
        </StandardizedAdminLayout>
      </SectorDataProvider>
    </AlertProvider>
  );
}