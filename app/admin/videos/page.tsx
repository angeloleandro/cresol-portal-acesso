/**
 * Admin Videos Management Page - Modernized Version
 * Enterprise-grade video management with modern UI/UX patterns
 * WCAG 2.1 AA compliant with Cresol branding
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdminHeader from "@/app/components/AdminHeader";
import Breadcrumb from '@/app/components/Breadcrumb';
import { supabase } from "@/lib/supabase";
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { VideoUploadFormRoot } from '@/app/components/VideoUploadForm/VideoUploadForm.Root';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import { AdvancedVideoGalleryHeader } from '@/app/components/VideoGallery/VideoGallery.Header';
import { VideoGalleryGrid } from '@/app/components/VideoGallery/VideoGallery.Grid';
import { VideoGalleryEmptyState } from '@/app/components/VideoGallery/VideoGallery.EmptyState';
import { AdminVideoCard } from '@/app/components/VideoGallery/VideoGallery.Card';
import { VideoModal } from '@/app/components/VideoGallery/VideoGallery.Modal';
import { DashboardVideo, VideoFilters } from '@/app/types/video';
import { Icon } from '@/app/components/icons/Icon';
import clsx from 'clsx';
import CollectionsManager from '@/app/admin/collections/components/CollectionsManager';
import { useCollections } from '@/app/components/Collections/Collection.hooks';
import { Collection } from '@/lib/types/collections';

interface AdminVideoFilters extends VideoFilters {
  status: 'all' | 'active' | 'inactive' | 'processing';
}

export default function AdminVideos() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState<DashboardVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<DashboardVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editVideo, setEditVideo] = useState<DashboardVideo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<DashboardVideo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoForPlay, setSelectedVideoForPlay] = useState<DashboardVideo | null>(null);
  const [filters, setFilters] = useState<AdminVideoFilters>({ 
    search: '', 
    type: 'all', 
    status: 'all' 
  });
  const [showCollectionsManager, setShowCollectionsManager] = useState(false);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [selectedVideoForCollection, setSelectedVideoForCollection] = useState<DashboardVideo | null>(null);

  // Collections hook
  const { collections } = useCollections();

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

  useEffect(() => {
    if (isAdmin) fetchVideos();
    // eslint-disable-next-line
  }, [isAdmin]);

  // Lock body scroll when create/edit modal is open
  useEffect(() => {
    const formModalOpen = showForm || Boolean(editVideo);
    if (formModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [showForm, editVideo]);

  // Filter videos based on search, type, and status
  useEffect(() => {
    let filtered = [...videos];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm) ||
        video.original_filename?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(video => video.upload_type === filters.type);
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'active':
          filtered = filtered.filter(video => video.is_active);
          break;
        case 'inactive':
          filtered = filtered.filter(video => !video.is_active);
          break;
        case 'processing':
          filtered = filtered.filter(video => 
            video.processing_status && 
            video.processing_status !== 'ready'
          );
          break;
      }
    }
    
    setFilteredVideos(filtered);
  }, [videos, filters]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dashboard_videos")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      setVideos(data || []);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Video Action Handlers
  const handlePlayVideo = (video: DashboardVideo) => {
    setSelectedVideoForPlay(video);
    setShowVideoModal(true);
  };

  const handleEditVideo = (video: DashboardVideo) => {
    setEditVideo(video);
  };

  const handleDeleteClick = (video: DashboardVideo) => {
    setVideoToDelete(video);
    setShowDeleteModal(true);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideoForPlay(null);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/videos?id=${videoToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erro ao excluir vídeo');
      }
      
      await fetchVideos();
      setShowDeleteModal(false);
      setVideoToDelete(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleTypeFilter = (type: AdminVideoFilters['type']) => {
    setFilters(prev => ({ ...prev, type }));
  };

  const handleStatusFilter = (status: AdminVideoFilters['status']) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleAddToCollection = (video: DashboardVideo) => {
    setSelectedVideoForCollection(video);
    setShowAddToCollectionModal(true);
  };

  const handleAddToCollectionSubmit = async (collectionId: string) => {
    if (!selectedVideoForCollection) return;
    
    try {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: selectedVideoForCollection.id,
          item_type: 'video',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar à coleção');
      }
      
      setShowAddToCollectionModal(false);
      setSelectedVideoForCollection(null);
      // You could show a success message here
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Statistics for header
  const videoStats = {
    total: videos.length,
    youtube: videos.filter(v => v.upload_type === 'youtube').length,
    direct: videos.filter(v => v.upload_type === 'direct').length
  };

  const statusStats = {
    active: videos.filter(v => v.is_active).length,
    inactive: videos.filter(v => !v.is_active).length,
    processing: videos.filter(v => v.processing_status && v.processing_status !== 'ready').length
  };

  // Loading state
  if (loading) {
    return <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.videos} />;
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

  // Filter components
  const FilterButton = ({ 
    isActive, 
    onClick, 
    children, 
    count 
  }: { 
    isActive: boolean; 
    onClick: () => void; 
    children: React.ReactNode; 
    count?: number; 
  }) => (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150',
        'border',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        isActive
          ? 'bg-primary text-white border-primary shadow-sm'
          : 'bg-white text-neutral-700 border-neutral-300/40 hover:border-neutral-300/70'
      )}
      aria-pressed={isActive}
    >
      {children}
      {count !== undefined && (
        <span className={clsx(
          'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
          isActive ? 'bg-white/20' : 'bg-neutral-100 text-neutral-600'
        )}>
          {count}
        </span>
      )}
    </button>
  );

  const FilterSection = () => (
    <div className="space-y-4">
      {/* Tipo - manter apenas este grupo conforme padronização */}
      <div>
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Tipo</h4>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            isActive={filters.type === 'all'}
            onClick={() => handleTypeFilter('all')}
            count={videoStats.total}
          >
            Todos
          </FilterButton>
          <FilterButton
            isActive={filters.type === 'youtube'}
            onClick={() => handleTypeFilter('youtube')}
            count={videoStats.youtube}
          >
            YouTube
          </FilterButton>
          <FilterButton
            isActive={filters.type === 'direct'}
            onClick={() => handleTypeFilter('direct')}
            count={videoStats.direct}
          >
            Interno
          </FilterButton>
        </div>
      </div>
    </div>
  );

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
              { label: 'Vídeos' }
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
              <h1 className="text-3xl font-bold text-primary mb-1">Gerenciar Vídeos</h1>
              <p className="text-sm text-gray-600">Gerencie todos os vídeos do sistema com filtros avançados</p>
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
                onClick={() => setShowForm(true)}
              >
                <Icon name="plus" className="h-5 w-5" />
                Novo Vídeo
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
                onClick={() => setShowCollectionsManager(true)}
              >
                <Icon name="folder" className="h-5 w-5" />
                Gerenciar Coleções
              </motion.button>
            </div>
          </div>

          {/* Busca e filtros (sem cartões de estatística e sem filtros de status) */}
          <div className="mt-6">
            <AdvancedVideoGalleryHeader
              title=""
              subtitle=""
              videoCount={filteredVideos.length}
              showSeeAll={false}
              showSearch={true}
              onSearch={handleSearch}
              searchQuery={filters.search}
              filters={<FilterSection />}
            />
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            'bg-white rounded-md shadow-sm border border-gray-200/40 hover:border-gray-200/70 transition-colors duration-150',
            'overflow-hidden min-h-[500px]'
          )}
        >
          {filteredVideos.length === 0 ? (
            <VideoGalleryEmptyState 
              title={filters.search || filters.type !== 'all' || filters.status !== 'all'
                ? "Nenhum vídeo encontrado" 
                : "Nenhum vídeo cadastrado"
              }
              message={filters.search || filters.type !== 'all' || filters.status !== 'all'
                ? "Tente ajustar os filtros para encontrar vídeos."
                : "Comece adicionando o primeiro vídeo ao sistema."
              }
              actionLabel="Adicionar Vídeo"
              onAction={() => setShowForm(true)}
            />
          ) : (
            <div className="p-6">
              <VideoGalleryGrid
                videoCount={filteredVideos.length}
                enableAnimations={true}
              >
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AdminVideoCard 
                      video={video} 
                      onPlay={handlePlayVideo}
                      onEdit={handleEditVideo}
                      onDelete={handleDeleteClick}
                      onAddToCollection={handleAddToCollection}
                      index={index}
                      showEditButton={true}
                      showDeleteButton={true}
                      showAddToCollectionButton={true}
                    />
                  </motion.div>
                ))}
              </VideoGalleryGrid>
            </div>
          )}
        </motion.div>

        {/* Form Modals */}
        <AnimatePresence mode="wait">
          {(showForm || editVideo) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowForm(false);
                  setEditVideo(null);
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="max-w-4xl w-full max-h-[85vh] overflow-y-auto scrollbar-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <VideoUploadFormRoot
                  initialData={editVideo ? {
                    id: editVideo.id,
                    title: editVideo.title,
                    video_url: editVideo.video_url,
                    thumbnail_url: editVideo.thumbnail_url ?? undefined,
                    is_active: editVideo.is_active,
                    order_index: editVideo.order_index,
                    upload_type: editVideo.upload_type === 'vimeo' ? 'youtube' : editVideo.upload_type,
                    file_size: editVideo.file_size ?? undefined,
                    original_filename: editVideo.original_filename ?? undefined
                  } : undefined}
                  onSave={() => { 
                    setShowForm(false); 
                    setEditVideo(null); 
                    fetchVideos(); 
                  }}
                  onCancel={() => { 
                    setShowForm(false); 
                    setEditVideo(null); 
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Player Modal */}
        <AnimatePresence mode="wait">
          {showVideoModal && selectedVideoForPlay && (
            <VideoModal
              isOpen={showVideoModal}
              video={selectedVideoForPlay}
              onClose={handleCloseVideoModal}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence mode="wait">
          {showDeleteModal && (
            <ConfirmationModal
              isOpen={showDeleteModal}
              onClose={handleDeleteCancel}
              onConfirm={handleDeleteConfirm}
              title="Confirmar Exclusão"
              message={`Tem certeza que deseja excluir o vídeo <strong>"${videoToDelete?.title}"</strong>?<br><br>Esta ação não pode ser desfeita e removerá o vídeo permanentemente do sistema.`}
              isLoading={isDeleting}
              confirmButtonText="Excluir Vídeo"
              cancelButtonText="Cancelar"
            />
          )}
        </AnimatePresence>

        {/* Collections Manager Modal */}
        {showCollectionsManager && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCollectionsManager(false)} />
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Gerenciar Coleções
                    </h3>
                    <button
                      onClick={() => setShowCollectionsManager(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Icon name="close" className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  <CollectionsManager />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add to Collection Modal */}
        {showAddToCollectionModal && selectedVideoForCollection && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddToCollectionModal(false)} />
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div className="bg-white px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Adicionar à Coleção
                    </h3>
                    <button
                      onClick={() => setShowAddToCollectionModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Icon name="close" className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Selecione uma coleção para adicionar o vídeo &quot;{selectedVideoForCollection.title}&quot;
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {collections?.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => handleAddToCollectionSubmit(collection.id)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{collection.name}</div>
                        {collection.description && (
                          <div className="text-sm text-gray-600 mt-1">{collection.description}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Tipo: {collection.type === 'images' ? 'Imagens' : collection.type === 'videos' ? 'Vídeos' : 'Misto'}
                          {collection.type === 'images' && (
                            <span className="text-red-500 ml-2">(Não compatível com vídeos)</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {(!collections || collections.length === 0) && (
                    <div className="text-center py-6 text-gray-500">
                      <p>Nenhuma coleção encontrada.</p>
                      <button
                        onClick={() => {
                          setShowAddToCollectionModal(false);
                          setShowCollectionsManager(true);
                        }}
                        className="mt-2 text-primary hover:underline text-sm"
                      >
                        Criar nova coleção
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}