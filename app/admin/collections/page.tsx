// Admin Collections Page
// Página administrativa para gerenciamento de coleções - Portal Cresol

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminHeader from '@/app/components/AdminHeader';
import Breadcrumb from '@/app/components/Breadcrumb';
import { supabase } from '@/lib/supabase';
import { AdminSpinner } from '@/app/components/ui/StandardizedSpinner';
import CollectionsManager from './components/CollectionsManager';
import { useCollections } from '@/app/components/Collections/Collection.hooks';
import Icon from '@/app/components/icons/Icon';
import clsx from 'clsx';

export default function AdminCollectionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  // Collections hook for statistics
  const { collections, stats } = useCollections();

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      setUser(userData.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();
      if (profile?.role === "admin") {
        setIsAdmin(true);
      } else {
        router.replace("/dashboard");
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  // Loading state
  if (loading) {
    return <AdminSpinner fullScreen message="Carregando painel administrativo..." size="lg" />;
  }

  // Access control
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-neutral-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Error Banner
  const ErrorBanner = () => error && (
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
          <p className="text-red-600 text-sm">{error}</p>
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  'inline-flex items-center gap-2 px-5 py-2.5',
                  'bg-primary text-white rounded-md font-medium',
                  'hover:bg-primary/90 transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'shadow-sm'
                )}
                onClick={() => setShowCreateCollection(true)}
              >
                <Icon name="folder-plus" className="h-5 w-5" />
                Nova Coleção
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  'inline-flex items-center gap-2 px-5 py-2.5',
                  'bg-gray-100 text-gray-700 rounded-md font-medium',
                  'hover:bg-gray-200 transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-gray-300/20',
                  'shadow-sm'
                )}
                onClick={() => router.push('/admin/gallery')}
              >
                <Icon name="image" className="h-5 w-5" />
                Galeria
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  'inline-flex items-center gap-2 px-5 py-2.5',
                  'bg-gray-100 text-gray-700 rounded-md font-medium',
                  'hover:bg-gray-200 transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-gray-300/20',
                  'shadow-sm'
                )}
                onClick={() => router.push('/admin/videos')}
              >
                <Icon name="video" className="h-5 w-5" />
                Vídeos
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            'bg-white rounded-md shadow-sm border border-gray-200/40 hover:border-gray-200/70 transition-colors duration-150',
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