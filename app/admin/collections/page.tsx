// Admin Collections Page
// Página administrativa para gerenciamento de coleções - Portal Cresol

'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AdminHeader from '@/app/components/AdminHeader';
import AuthGuard from '@/app/components/AuthGuard';
import Breadcrumb from '@/app/components/Breadcrumb';
import Icon from '@/app/components/icons/Icon';
import Button from '@/app/components/ui/Button';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { useCollectionsStats } from '@/app/contexts/CollectionsContext';
import { useAuth } from '@/app/providers/AuthProvider';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';

import CollectionsManager from './components/CollectionsManager';

function AdminCollectionsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [_error, _setError] = useState<string | null>(null);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  // Collections stats para dashboard
  const { stats: _stats } = useCollectionsStats();

  // Error Banner
  const ErrorBanner = () => _error && (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
      role="alert"
    >
      <div className="flex items-center gap-2">
        <Icon name="triangle-alert" className="w-5 h-5 text-red-600" />
        <div>
          <h3 className="font-medium text-red-800">Erro</h3>
          <p className="text-red-600 text-sm">{_error}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminHeader user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Coleções' }
            ]} 
          />
        </motion.div>

        <ErrorBanner />
        
        {/* Header + Ações (botões à direita) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">Gerenciar Coleções</h1>
              <p className="text-sm text-gray-600">Organize e gerencie coleções de imagens e vídeos</p>
            </div>
            <div className="flex gap-3 flex-wrap sm:justify-end">
              <Button
                variant="primary"
                size="sm"
                icon="folder-plus"
                onClick={() => setShowCreateCollection(true)}
              >
                Nova Coleção
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon="image"
                onClick={() => router.push('/admin/gallery')}
              >
                Galeria
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon="video"
                onClick={() => router.push('/admin/videos')}
              >
                Vídeos
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            'bg-white rounded-md border border-gray-200/60 hover:border-gray-200 transition-colors duration-150',
            'overflow-hidden'
          )}
        >
          <div className="p-6">
            <CollectionsManager 
              showCreateCollection={showCreateCollection}
              onCreateCollectionClose={() => setShowCreateCollection(false)}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminCollectionsPage() {
  return (
    <AuthGuard requireRole="admin">
      <AdminCollectionsPageContent />
    </AuthGuard>
  );
}