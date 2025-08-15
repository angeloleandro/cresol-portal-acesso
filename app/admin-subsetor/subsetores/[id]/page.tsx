'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

// Types
import { TabType } from './types/subsector.types';

// Hooks
import { useSubsectorData } from './hooks/useSubsectorData';
import { useEventManagement } from './hooks/useEventManagement';
import { useNewsManagement } from './hooks/useNewsManagement';
import { useGroupManagement } from './hooks/useGroupManagement';
import { useMessageManagement } from './hooks/useMessageManagement';

// Components
import { SubsectorHeader } from './components/SubsectorHeader';
import { TabNavigation } from './components/TabNavigation';

// Tab Components
import { EventsTab } from './components/tabs/EventsTab';
import { NewsTab } from './components/tabs/NewsTab';
import { SystemsTab } from './components/tabs/SystemsTab';
import { GroupsTab } from './components/tabs/GroupsTab';
import { MessagesTab } from './components/tabs/MessagesTab';

// Modal Components
import { EventModal } from './components/modals/EventModal';
import { NewsModal } from './components/modals/NewsModal';
import { GroupModal } from './components/modals/GroupModal';
import { MessageModal } from './components/modals/MessageModal';

export default function SubsectorManagement() {
  const router = useRouter();
  const params = useParams();
  const { profile } = useAuth();
  const subsectorId = params?.id as string;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('events');

  // Data Management
  const {
    subsector,
    events,
    news,
    systems,
    users,
    workLocations,
    loading,
    error,
    showDrafts,
    totalDraftEventsCount,
    totalDraftNewsCount,
    setShowDrafts,
    refreshData
  } = useSubsectorData(subsectorId);

  // Feature Management Hooks
  const eventManagement = useEventManagement(refreshData);
  const newsManagement = useNewsManagement(refreshData);
  const groupManagement = useGroupManagement(subsectorId);
  const messageManagement = useMessageManagement();

  // Loading state
  if (loading) {
    return (
      <UnifiedLoadingSpinner 
        message={LOADING_MESSAGES.loading} 
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-sm max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Permission check
  if (!profile || (profile.role !== 'admin' && profile.role !== 'sector_admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-sm max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Acesso negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (!subsector) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-sm max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Subsetor não encontrado</h2>
          <p className="text-gray-600">O subsetor solicitado não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  const handleToggleDrafts = async () => {
    setShowDrafts(!showDrafts);
  };

  const handleNewSystem = () => {
    // System creation modal implementation pending
    alert('Criação de sistemas será implementada em versão futura');
  };

  const handleEventSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await eventManagement.handleSaveEvent(eventManagement.eventModal.currentItem, subsectorId);
  };

  const handleNewsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await newsManagement.handleSaveNews(newsManagement.newsModal.currentItem, subsectorId);
  };

  const handleGroupSave = async () => {
    await groupManagement.handleSaveGroup(subsectorId);
  };

  const handleMessageSend = async () => {
    await messageManagement.handleSendMessage(subsectorId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SubsectorHeader 
        subsector={subsector}
        profile={profile as any}
        onLogout={() => router.push('/login')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-6 py-4">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                events: events.length,
                news: news.length,
                systems: systems.length
              }}
            />
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'events' && (
              <EventsTab
                events={events}
                showDrafts={showDrafts}
                totalDraftEventsCount={totalDraftEventsCount}
                onToggleDrafts={handleToggleDrafts}
                onOpenModal={eventManagement.handleOpenEventModal}
                onDeleteEvent={(event) => eventManagement.handleDeleteEvent(event.id)}
              />
            )}

            {activeTab === 'news' && (
              <NewsTab
                news={news}
                showDrafts={showDrafts}
                totalDraftNewsCount={totalDraftNewsCount}
                onToggleDrafts={handleToggleDrafts}
                onOpenModal={newsManagement.handleOpenNewsModal}
                onDeleteNews={(news) => newsManagement.handleDeleteNews(news.id)}
                onTogglePublished={newsManagement.toggleNewsPublished}
              />
            )}

            {activeTab === 'systems' && (
              <SystemsTab
                systems={systems}
                onNewSystem={handleNewSystem}
              />
            )}

            {activeTab === 'groups' && (
              <GroupsTab
                groups={groupManagement.groups}
                onOpenGroupModal={groupManagement.handleOpenGroupModal}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesTab
                onOpenMessageModal={messageManagement.handleOpenMessageModal}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventModal
        isOpen={eventManagement.eventModal.isOpen}
        isEditing={eventManagement.eventModal.isEditing}
        currentEvent={eventManagement.eventModal.currentItem}
        onClose={() => eventManagement.setEventModal(prev => ({...prev, isOpen: false}))}
        onSave={handleEventSave}
        onChange={(event) => eventManagement.setEventModal(prev => ({...prev, currentItem: event}))}
      />

      <NewsModal
        isOpen={newsManagement.newsModal.isOpen}
        isEditing={newsManagement.newsModal.isEditing}
        currentNews={newsManagement.newsModal.currentItem}
        onClose={() => newsManagement.setNewsModal(prev => ({...prev, isOpen: false}))}
        onSave={handleNewsSave}
        onChange={(news) => newsManagement.setNewsModal(prev => ({...prev, currentItem: news}))}
      />

      <GroupModal
        isOpen={groupManagement.isGroupModalOpen}
        currentGroup={groupManagement.currentGroup}
        onClose={() => groupManagement.setIsGroupModalOpen(false)}
        onSave={handleGroupSave}
        onChange={groupManagement.setCurrentGroup}
        users={users}
      />

      <MessageModal
        isOpen={messageManagement.isMessageModalOpen}
        currentMessage={messageManagement.currentMessage}
        onClose={() => messageManagement.setIsMessageModalOpen(false)}
        onSend={handleMessageSend}
        onChange={messageManagement.setCurrentMessage}
        groups={groupManagement.groups}
        users={users}
      />
    </div>
  );
}