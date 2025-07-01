"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import OptimizedImage from "../components/OptimizedImage";

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
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Galeria de Vídeos</h1>
          <p className="body-text text-muted">Assista aos vídeos institucionais e de treinamento da Cresol.</p>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-4 text-muted">Carregando vídeos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="heading-3 mt-4 mb-2">Nenhum vídeo encontrado</h3>
              <p className="body-text text-muted">A galeria de vídeos ainda não possui conteúdo disponível.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                <h3 className="heading-4">{selectedVideo.title}</h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleCloseModal}
                  aria-label="Fechar"
                >
                  <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
    <div className="card cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1" onClick={() => onClick(video)}>
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
            <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Ícone de play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-1">
        <h3 className="heading-4 line-clamp-2" title={video.title}>{shortTitle}</h3>
      </div>
    </div>
  );
} 