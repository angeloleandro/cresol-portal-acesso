/**
 * Videos Gallery Page - Modernized Version
 * Enterprise-grade video gallery with modern UI/UX patterns
 * WCAG 2.1 AA compliant with Cresol branding
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import { getSupabaseClient } from "@/lib/supabase";
import { VideoGalleryHeader, AdvancedVideoGalleryHeader } from "../components/VideoGallery/VideoGallery.Header";
import { VideoGalleryGrid } from "../components/VideoGallery/VideoGallery.Grid";
import { VideoCleanModal } from "../components/VideoGallery/VideoGallery.CleanModal";
import { VideoGalleryEmptyState } from "../components/VideoGallery/VideoGallery.EmptyState";
import { EnhancedVideoCard } from "../components/VideoGallery/VideoGallery.Card";
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { DashboardVideo, VideoFilters } from "../types/video";
import { CollectionSection } from "../components/Collections/CollectionSection";
import { useSearchParams } from 'next/navigation';
import clsx from "clsx";
import { Icon } from "../components/icons/Icon";

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

function VideosContent() {
  const [videos, setVideos] = useState<DashboardVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<DashboardVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<DashboardVideo | null>(null);
  const [filters, setFilters] = useState<VideoFilters>({ search: '', type: 'all' });
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collection');

  useEffect(() => {
    // Só executar no lado do cliente
    if (typeof window === 'undefined') return;
    
    const fetchData = async () => {
      try {
        setError(null);
        
        // If collection ID is provided, fetch collection details and its items
        if (collectionId) {
          // Fetch collection details
          const { data: collectionData } = await getSupabaseClient()
            .from("collections")
            .select("*")
            .eq("id", collectionId)
            .single();
          
          setCollection(collectionData);

          // Fetch collection items
          const { data: itemsData } = await getSupabaseClient()
            .from("collection_items")
            .select(`
              *,
              dashboard_videos!inner(*)
            `)
            .eq("collection_id", collectionId)
            .eq("item_type", "video")
            .order("order_index", { ascending: true });

          const collectionVideos = itemsData?.map(item => item.dashboard_videos) || [];
          
          // Filter to only show ready videos
          const readyVideos = collectionVideos.filter(video => {
            if (video.is_active === false) return false;
            if (video.upload_type === 'youtube') return true;
            if (video.upload_type === 'direct') {
              return video.processing_status === 'ready' && video.upload_progress === 100;
            }
            return false;
          });
          
          setVideos(readyVideos);
          setFilteredVideos(readyVideos);
        } else {
          // Fetch all videos if no collection specified
          const { data, error: fetchError } = await getSupabaseClient()
            .from("dashboard_videos")
            .select("*")
            .eq("is_active", true)
            .order("order_index", { ascending: true });
          
          if (fetchError) throw fetchError;
          
          // Filter to only show ready videos
          const readyVideos = (data || []).filter(video => {
            if (video.upload_type === 'youtube') return true;
            if (video.upload_type === 'direct') {
              return video.processing_status === 'ready' && video.upload_progress === 100;
            }
            return false;
          });
          
          setVideos(readyVideos);
          setFilteredVideos(readyVideos);
        }
      } catch (error: any) {
        setError(error.message || 'Erro ao carregar vídeos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [collectionId]);

  // Filter videos based on search and type
  useEffect(() => {
    let filtered = [...videos];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(video => video.upload_type === filters.type);
    }
    
    setFilteredVideos(filtered);
  }, [videos, filters]);

  const handleOpenModal = (video: DashboardVideo) => {
    setSelectedVideo(video);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleTypeFilter = (type: VideoFilters['type']) => {
    setFilters(prev => ({ ...prev, type }));
  };

  // Statistics for header
  const videoStats = {
    total: videos.length,
    youtube: videos.filter(v => v.upload_type === 'youtube').length,
    direct: videos.filter(v => v.upload_type === 'direct').length
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
<UnifiedLoadingSpinner 
              size="default" 
              message={LOADING_MESSAGES.videos}
            />
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter components
  const TypeFilterButton = ({ type, label, count }: { 
    type: VideoFilters['type']; 
    label: string; 
    count: number; 
  }) => (
    <button
      onClick={() => handleTypeFilter(type)}
      className={clsx(
        'px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
        'border border-transparent',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        filters.type === type
          ? 'bg-primary text-white shadow-sm'
          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
      )}
      aria-pressed={filters.type === type}
    >
      {label} ({count})
    </button>
  );

  const FilterSection = () => (
    <div className="flex flex-wrap gap-2">
      <TypeFilterButton type="all" label="Todos" count={videoStats.total} />
      <TypeFilterButton type="youtube" label="YouTube" count={videoStats.youtube} />
      <TypeFilterButton type="direct" label="Interno" count={videoStats.direct} />
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-4"
      role="alert"
    >
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar vídeos</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
        >
          Tentar novamente
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              ...(collection ? [{ label: 'Vídeos', href: '/videos' }] : []),
              { label: collection ? collection.name : 'Vídeos' }
            ]} 
          />
        </motion.div>

        {/* Header with Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AdvancedVideoGalleryHeader
            title={collection ? collection.name : "Galeria de Vídeos"}
            subtitle={collection ? collection.description || "Vídeos desta coleção" : "Assista aos vídeos institucionais e de treinamento da Cresol"}
            videoCount={filteredVideos.length}
            showSeeAll={false}
            showSearch={true}
            onSearch={handleSearch}
            searchQuery={filters.search}
            filters={<FilterSection />}
          />
          
          {/* Back to collections button if viewing a collection */}
          {collection && (
            <a
              href="/videos"
              className="inline-flex items-center mt-4 text-primary hover:text-primary-dark transition-colors"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2" />
              Voltar para todos os vídeos
            </a>
          )}
        </motion.div>

        {/* Collections Section - only show when not viewing a specific collection */}
        {!collection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <CollectionSection 
              type="videos" 
              title="Coleções de Vídeos"
              showEmptyState={false}
            />
          </motion.div>
        )}

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            'bg-white rounded-md shadow-sm border border-neutral-200',
            'overflow-hidden min-h-[400px]'
          )}
        >
          {error ? (
            <ErrorState />
          ) : filteredVideos.length === 0 ? (
            <VideoGalleryEmptyState 
              title={filters.search || filters.type !== 'all' 
                ? "Nenhum vídeo encontrado" 
                : "Galeria vazia"
              }
              message={filters.search || filters.type !== 'all'
                ? "Tente ajustar os filtros para encontrar vídeos."
                : "A galeria de vídeos ainda não possui conteúdo disponível."
              }
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
                    <EnhancedVideoCard 
                      video={video} 
                      onClick={handleOpenModal}
                      index={index}
                    />
                  </motion.div>
                ))}
              </VideoGalleryGrid>
            </div>
          )}
        </motion.div>

        {/* Video Modal */}
        <AnimatePresence mode="wait">
          {modalOpen && selectedVideo && (
            <VideoCleanModal
              video={selectedVideo}
              isOpen={modalOpen}
              onClose={handleCloseModal}
            />
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
}

export default function VideosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <UnifiedLoadingSpinner size="default" message={LOADING_MESSAGES.videos} />
          </div>
        </main>
        <Footer />
      </div>
    }>
      <VideosContent />
    </Suspense>
  );
}