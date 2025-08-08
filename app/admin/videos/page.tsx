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
import VideoUploadFormClean from '@/app/components/VideoUploadFormClean';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import { VideoGalleryStatsHeader, AdvancedVideoGalleryHeader } from '@/app/components/VideoGallery/VideoGallery.Header';
import { VideoGalleryGrid } from '@/app/components/VideoGallery/VideoGallery.Grid';
import { VideoGalleryEmptyState } from '@/app/components/VideoGallery/VideoGallery.EmptyState';
import { AdminVideoCard } from '@/app/components/VideoGallery/VideoGallery.Card';
import { VideoCleanModal } from '@/app/components/VideoGallery/VideoGallery.CleanModal';
import { DashboardVideo, VideoFilters } from '@/app/types/video';
import { Icon } from '@/app/components/icons/Icon';
import clsx from 'clsx';

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-neutral-600">Carregando painel administrativo...</p>
        </motion.div>
      </div>
    );
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
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
        'border',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        isActive
          ? 'bg-primary text-white border-primary shadow-sm'
          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
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
      {/* Type Filters */}
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
            Diretos
          </FilterButton>
        </div>
      </div>
      
      {/* Status Filters */}
      <div>
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Status</h4>
        <div className="flex flex-wrap gap-2">
          <FilterButton 
            isActive={filters.status === 'all'} 
            onClick={() => handleStatusFilter('all')}
            count={videos.length}
          >
            Todos
          </FilterButton>
          <FilterButton 
            isActive={filters.status === 'active'} 
            onClick={() => handleStatusFilter('active')}
            count={statusStats.active}
          >
            Ativos
          </FilterButton>
          <FilterButton 
            isActive={filters.status === 'inactive'} 
            onClick={() => handleStatusFilter('inactive')}
            count={statusStats.inactive}
          >
            Inativos
          </FilterButton>
          <FilterButton 
            isActive={filters.status === 'processing'} 
            onClick={() => handleStatusFilter('processing')}
            count={statusStats.processing}
          >
            Processando
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
        
        {/* Header with Stats and Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <VideoGalleryStatsHeader
              title="Gerenciar Vídeos"
              stats={videoStats}
            />
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                'inline-flex items-center gap-2 px-6 py-3',
                'bg-primary text-white rounded-lg font-medium',
                'hover:bg-primary/90 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary/20',
                'shadow-sm lg:self-start'
              )}
              onClick={() => setShowForm(true)}
            >
              <Icon name="plus" className="h-5 w-5" />
              Novo Vídeo
            </motion.button>
          </div>
          
          {/* Advanced Header with Search and Filters */}
          <AdvancedVideoGalleryHeader
            title=""
            subtitle="Gerencie todos os vídeos do sistema com filtros avançados"
            videoCount={filteredVideos.length}
            showSeeAll={false}
            showSearch={true}
            onSearch={handleSearch}
            searchQuery={filters.search}
            filters={<FilterSection />}
          />
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            'bg-white rounded-xl shadow-sm border border-neutral-200',
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
                      index={index}
                      showEditButton={true}
                      showDeleteButton={true}
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
                className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <VideoUploadFormClean
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
            <VideoCleanModal
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
      </main>
    </div>
  );
}