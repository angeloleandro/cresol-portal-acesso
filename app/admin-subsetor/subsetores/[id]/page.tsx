'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

// Types
import { TabType } from './types/subsector.types';

// Hooks
import { useSubsectorData } from './hooks/useSubsectorData';
import { useGroupManagement } from './hooks/useGroupManagement';
import { useMessageManagement } from './hooks/useMessageManagement';

// Components
import { TabNavigation } from './components/TabNavigation';

// Tab Components
import { SystemsTab } from './components/tabs/SystemsTab';
import { GroupsTab } from './components/tabs/GroupsTab';
import { MessagesTab } from './components/tabs/MessagesTab';

// Modal Components - Using adapted sector standard modals for subsector
import { SubsectorEventsManagement } from './components/adapters/SubsectorEventsManagement';
import { SubsectorNewsManagement } from './components/adapters/SubsectorNewsManagement';
import { SubsectorMessagesManagement } from './components/adapters/SubsectorMessagesManagement';
import { GroupModal } from './components/modals/GroupModal';
import { MessageModal } from './components/modals/MessageModal';

// Import sector types for the adapted components
import { SectorEvent, SectorNews } from '@/app/admin/sectors/[id]/types/sector.types';
import { SubsectorEvent, SubsectorNews } from './types/subsector.types';

// Adapter functions to transform subsector data to sector format for display
const adaptSubsectorEventToSector = (event: SubsectorEvent): SectorEvent => ({
  id: event.id,
  sector_id: '', // Will be handled by the adapter component
  title: event.title,
  description: event.description,
  location: '', // Default empty, events don't have location in subsector
  start_date: event.start_date,
  end_date: null, // Default null, events don't have end_date in subsector
  is_featured: event.is_featured,
  is_published: event.is_published,
  created_at: new Date().toISOString(), // Default current time
  updated_at: new Date().toISOString() // Default current time
});

const adaptSubsectorNewsToSector = (news: SubsectorNews): SectorNews => ({
  id: news.id,
  sector_id: '', // Will be handled by the adapter component
  title: news.title,
  summary: news.summary,
  content: news.content || '', // Default empty if missing
  image_url: null, // Default null, news don't have images in subsector
  is_featured: news.is_featured,
  is_published: news.is_published,
  created_at: news.created_at,
  updated_at: new Date().toISOString() // Default current time
});

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
    messages,
    systems,
    users,
    workLocations,
    loading,
    error,
    showDrafts,
    totalDraftEventsCount,
    totalDraftNewsCount,
    totalDraftMessagesCount,
    setShowDrafts,
    refreshData
  } = useSubsectorData(subsectorId);

  // Feature Management Hooks - Only for components not using sector standard
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


  const handleGroupSave = async () => {
    await groupManagement.handleSaveGroup(subsectorId);
  };

  const handleMessageSend = async () => {
    await messageManagement.handleSendMessage(subsectorId);
  };

  const breadcrumbItems = [
    { label: 'Admin', href: '/admin' },
    { label: 'Subsetores', href: '/admin-subsetor' },
    { label: subsector?.sector_name || 'Setor', href: '#' },
    { label: subsector?.name || 'Carregando...', href: '#' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header padrão */}
      <AdminHeader user={profile as any} />
      
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
            Gerenciar Subsetor: {subsector?.name}
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
        counts={{
          events: events.length,
          news: news.length,
          systems: systems.length,
          messages: messages.length
        }}
      />

      {/* Conteúdo da aba ativa */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'events' && (
          <SubsectorEventsManagement
            subsectorId={subsectorId}
          />
        )}

        {activeTab === 'news' && (
          <SubsectorNewsManagement
            sectorId={subsectorId}
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
          <SubsectorMessagesManagement
            subsectorId={subsectorId}
          />
        )}
      </main>

      {/* Modals - Only for groups and messages since events/news now use management components */}
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