"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import OptimizedImage from "../components/OptimizedImage";
import { Icon } from "../components/icons/Icon";

interface DashboardVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<DashboardVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<DashboardVideo | null>(null);

  useEffect(() => {
    // Só executar no lado do cliente
    if (typeof window === 'undefined') return;
    
    const fetchVideos = async () => {
      try {
        const { data } = await getSupabaseClient()
          .from("dashboard_videos")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });
        setVideos(data || []);
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleOpenModal = (video: DashboardVideo) => {
    setSelectedVideo(video);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Vídeos' }
            ]} 
          />
        </div>

        <div className="mb-8">
          <h1 className="heading-1 text-title mb-2">Galeria de Vídeos</h1>
          <p className="body-text text-muted">Assista aos vídeos institucionais e de treinamento da Cresol.</p>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-4 body-text text-muted">Carregando vídeos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="video" className="mx-auto h-16 w-16 text-muted mb-4" />
              <h3 className="heading-3 text-title mb-2">Nenhum vídeo encontrado</h3>
              <p className="body-text text-muted">A galeria de vídeos ainda não possui conteúdo disponível.</p>
            </div>
          ) : (
            <div className="grid-responsive">
              {videos.map((video) => (
                <div key={video.id} className="w-full">
                  <VideoCard video={video} onClick={handleOpenModal} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal padronizado */}
        {modalOpen && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              {/* Cabeçalho do modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="heading-4 text-title">{selectedVideo.title}</h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleCloseModal}
                  aria-label="Fechar"
                >
                  <Icon name="close" className="h-6 w-6 text-muted" />
                </button>
              </div>
              
              {/* Conteúdo do modal */}
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={selectedVideo.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full min-h-[360px]"
                />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

// Card de vídeo padronizado
function VideoCard({ video, onClick }: { video: DashboardVideo, onClick: (v: DashboardVideo) => void }) {
  const maxLen = 50;
  const shortTitle = video.title.length > maxLen ? video.title.slice(0, maxLen) + '...' : video.title;
  
  return (
    <div className="card cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 group" onClick={() => onClick(video)}>
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
        {video.thumbnail_url ? (
          <OptimizedImage 
            src={video.thumbnail_url} 
            alt={video.title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px" 
            className="object-cover"
            quality={80}
            fallbackText="Thumbnail indisponível"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icon name="video" className="h-16 w-16 text-muted" />
          </div>
        )}
        
        {/* Ícone de play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Icon name="play" className="h-8 w-8 text-primary ml-1" />
          </div>
        </div>
      </div>
      
      <div className="p-1">
        <h3 className="heading-4 text-title line-clamp-2" title={video.title}>{shortTitle}</h3>
      </div>
    </div>
  );
} 