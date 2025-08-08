'use client';

import React, { useState } from 'react';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { StatsCards } from './components/StatsCards';
import { NotificationForm } from './components/NotificationForm';
import { GroupsManager } from './components/GroupsManager';
import { NotificationHistory } from './components/NotificationHistory';
import { useAuth, useFormData, useGroups } from './hooks';
import { TabType } from './types';

export default function NotificationsAdmin() {
  const { user, loading } = useAuth();
  const { availableUsers } = useFormData();
  const { groups } = useGroups();
  const [activeTab, setActiveTab] = useState<TabType>('send');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useAuth handles redirects
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Notificações' }
            ]} 
          />
        </div>

        {/* Header compacto */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Notificações</h1>
              <p className="text-sm text-gray-500">Envie mensagens e gerencie grupos de notificação</p>
            </div>
            
            {/* Quick actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('send')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'send' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Nova Notificação
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'groups' 
                    ? 'bg-secondary text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Grupos
              </button>
            </div>
          </div>
        </div>

        {/* Layout grid profissional */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar de estatísticas compacta */}
          <div className="col-span-12 lg:col-span-3">
            <StatsCards 
              groupsCount={groups.length}
              usersCount={availableUsers.length}
            />
          </div>

          {/* Área principal */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Tabs compactas */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('send')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'send'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Enviar Notificação
                  </button>
                  <button
                    onClick={() => setActiveTab('groups')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'groups'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Grupos
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Histórico
                  </button>
                </nav>
              </div>

              {/* Conteúdo das tabs */}
              <div>
                {activeTab === 'send' && (
                  <NotificationForm 
                    availableUsers={availableUsers}
                    availableGroups={groups}
                  />
                )}

                {activeTab === 'groups' && (
                  <GroupsManager />
                )}

                {activeTab === 'history' && (
                  <NotificationHistory />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}