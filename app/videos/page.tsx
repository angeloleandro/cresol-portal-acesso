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
  upload_type: 'youtube' | 'vimeo' | 'direct';
  file_path?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  original_filename?: string | null;
  processing_status?: string;
  upload_progress?: number;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<DashboardVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<DashboardVideo | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

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
        
        // Filter to only show ready videos
        const readyVideos = (data || []).filter(video => {
          if (video.upload_type === 'youtube') return true;
          if (video.upload_type === 'direct') {
            return video.processing_status === 'ready' && video.upload_progress === 100;
          }
          return false; // Filter out vimeo videos
        });
        setVideos(readyVideos);
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
    setVideoError(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
    setVideoError(null);
  };

  const handleVideoError = () => {
    setVideoError('Erro ao carregar o vídeo. Tente novamente mais tarde.');
  };

  // Helper function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    if (url.includes('embed/')) return url;
    
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    
    return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
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

        {/* Modal Unificado para YouTube e Upload Direto */}
        {modalOpen && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg border border-gray-300 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              {/* Cabeçalho do modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex-1 min-w-0">
                  <h3 className="heading-4 text-title truncate">{selectedVideo.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedVideo.upload_type === 'direct' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedVideo.upload_type === 'direct' ? '🎥 Upload Direto' : '📺 YouTube'}
                    </span>
                    {selectedVideo.upload_type === 'direct' && selectedVideo.file_size && (
                      <span className="text-xs text-gray-500">
                        {(selectedVideo.file_size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4 flex-shrink-0"
                  onClick={handleCloseModal}
                  aria-label="Fechar"
                >
                  <Icon name="close" className="h-6 w-6 text-muted" />
                </button>
              </div>
              
              {/* Conteúdo do modal */}
              <div className="aspect-video w-full bg-black">
                {videoError ? (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Icon name="AlertTriangle" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm">{videoError}</p>
                    </div>
                  </div>
                ) : selectedVideo.upload_type === 'youtube' ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideo.video_url)}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full min-h-[360px]"
                    onError={handleVideoError}
                  />
                ) : selectedVideo.upload_type === 'direct' ? (
                  <video
                    controls
                    className="w-full h-full min-h-[360px]"
                    poster={selectedVideo.thumbnail_url || undefined}
                    onError={handleVideoError}
                    preload="metadata"
                  >
                    <source src={selectedVideo.video_url} type={selectedVideo.mime_type || 'video/mp4'} />
                    <p className="text-white p-4">
                      Seu navegador não suporta reprodução de vídeo. 
                      <a href={selectedVideo.video_url} className="underline ml-1" download>
                        Baixar vídeo
                      </a>
                    </p>
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Icon name="video" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm">Formato de vídeo não suportado</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Informações adicionais para uploads diretos */}
              {selectedVideo.upload_type === 'direct' && selectedVideo.original_filename && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    📁 <strong>Arquivo:</strong> {selectedVideo.original_filename}
                  </p>
                  {selectedVideo.mime_type && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tipo: {selectedVideo.mime_type}
                    </p>
                  )}
                </div>
              )}
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
    <div className="card cursor-pointer transition-all duration-200 group" onClick={() => onClick(video)}>
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
        
        {/* Upload type indicator */}
        <div className="absolute top-2 right-2">
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium shadow-sm ${
            video.upload_type === 'direct' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {video.upload_type === 'direct' ? 'Direto' : 'YouTube'}
          </span>
        </div>
        
        {/* Ícone de play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Icon name="play" className="h-8 w-8 text-primary ml-1" />
          </div>
        </div>
      </div>
      
      <div className="p-1">
        <h3 className="heading-4 text-title line-clamp-2" title={video.title}>{shortTitle}</h3>
        {video.upload_type === 'direct' && video.file_size && (
          <p className="text-xs text-muted mt-1">
            {(video.file_size / (1024 * 1024)).toFixed(1)} MB
          </p>
        )}
      </div>
    </div>
  );
} 