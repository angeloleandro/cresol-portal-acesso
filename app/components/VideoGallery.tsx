"use client";

import { useEffect, useState, Fragment, useRef, useCallback } from "react";
import OptimizedImage from "./OptimizedImage";
import { supabase } from "@/lib/supabase";
import { 
  resolveVideoUrl, 
  formatFileSize, 
  checkVideoUrlAccessibility 
} from "@/lib/video-utils";

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

interface VideoGalleryProps {
  limit?: number;
}

export default function VideoGallery({ limit = 4 }: VideoGalleryProps) {
  const [videos, setVideos] = useState<DashboardVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<DashboardVideo | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("dashboard_videos")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      
      // Filter videos using same pattern as gallery (simplified validation)
      const validVideos = [];
      
      for (const video of data || []) {
        if (video.upload_type === 'youtube') {
          validVideos.push(video);
        } else if (video.upload_type === 'direct') {
          // Use same simple validation as gallery - no blocking file validation
          if (video.processing_status === 'ready' && video.upload_progress === 100) {
            try {
              // Resolve URL but don't block on validation failures
              const resolvedUrl = await resolveVideoUrl(video.file_path, video.video_url);
              video.video_url = resolvedUrl;
              validVideos.push(video);
            } catch (error) {
              console.warn(`URL resolution failed for ${video.title}:`, error);
              // Still add video - URL will be handled in modal
              validVideos.push(video);
            }
          }
        }
        // Filter out vimeo videos
      }
      
      setVideos(validVideos);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const handleOpenModal = async (video: DashboardVideo) => {
    setSelectedVideo(video);
    setModalOpen(true);
    setVideoError(null);
    setVideoUrl(null);
    setUrlLoading(true);
    
    // For direct upload videos, resolve the URL when opening modal
    if (video.upload_type === 'direct' && video.file_path) {
      try {
        const resolvedUrl = await resolveVideoUrl(video.file_path, video.video_url);
        
        // Verify URL is accessible
        const isAccessible = await checkVideoUrlAccessibility(resolvedUrl);
        
        if (isAccessible) {
          setVideoUrl(resolvedUrl);
        } else {
          setVideoError('Vídeo temporariamente indisponível. Tente novamente mais tarde.');
        }
      } catch (error) {
        console.error('Error resolving video URL:', error);
        setVideoError('Erro ao carregar o vídeo. Tente novamente mais tarde.');
      }
    } else if (video.upload_type === 'youtube') {
      setVideoUrl(video.video_url);
    }
    
    setUrlLoading(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
    setVideoError(null);
    setVideoUrl(null);
    setUrlLoading(false);
    
    // Stop video playback if it's a direct upload
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoError = () => {
    setVideoError('Erro ao carregar o vídeo. Tente novamente mais tarde.');
  };

  // Fechar modal com ESC
  const escListener = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") handleCloseModal();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      window.addEventListener("keydown", escListener);
      return () => window.removeEventListener("keydown", escListener);
    }
  }, [modalOpen, escListener]);

  if (loading || videos.length === 0) return null;

  const showVideos = videos.slice(0, limit);

  // Lógica de layout
  let content = null;
  if (showVideos.length === 1) {
    content = (
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <VideoCard video={showVideos[0]} onClick={handleOpenModal} />
        </div>
      </div>
    );
  } else if (showVideos.length === 2) {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
        {showVideos.map((video) => (
          <div key={video.id} className="flex">
            <VideoCard video={video} onClick={handleOpenModal} />
          </div>
        ))}
      </div>
    );
  } else if (showVideos.length >= 3) {
    const videosToShow = Math.min(showVideos.length, 4); // Máximo 4 vídeos
    content = (
      <>
        <div className={`grid gap-6 items-stretch ${videosToShow <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {showVideos.slice(0, videosToShow).map((video) => (
            <div key={video.id} className="flex">
              <VideoCard video={video} onClick={handleOpenModal} />
            </div>
          ))}
        </div>
        {videos.length > limit && (
          <div className="flex justify-center mt-6">
            <a href="/videos" className="text-white px-5 py-2.5 rounded text-xs font-medium transition-all duration-200 bg-primary hover:bg-primary-dark">Ver galeria de vídeos</a>
          </div>
        )}
      </>
    );
  }

  return (
    <section className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading-3 text-title">Vídeos em destaque</h2>
        <a href="/videos" className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary">
          Ver todos
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      {content}
      {modalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card max-w-2xl w-full mx-4 relative">
            <button
              className="absolute top-6 right-6 bg-white border border-cresol-gray-light rounded-full w-14 h-14 flex items-center justify-center z-20 transition hover:bg-primary/10 group"
              onClick={handleCloseModal}
              aria-label="Fechar"
              tabIndex={0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-cresol-gray group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
            <div className="aspect-video w-full rounded-t-lg overflow-hidden bg-black">
              {videoError ? (
                <div className="flex items-center justify-center h-full text-white bg-gray-800">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{videoError}</p>
                  </div>
                </div>
              ) : urlLoading ? (
                <div className="flex items-center justify-center h-full text-white bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm">Carregando vídeo...</p>
                  </div>
                </div>
              ) : selectedVideo.upload_type === 'youtube' && videoUrl ? (
                <iframe
                  ref={iframeRef}
                  src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full min-h-[360px]"
                  onError={handleVideoError}
                />
              ) : selectedVideo.upload_type === 'direct' && videoUrl ? (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full min-h-[360px]"
                  poster={selectedVideo.thumbnail_url || undefined}
                  onError={handleVideoError}
                  preload="metadata"
                >
                  <source src={videoUrl} type={selectedVideo.mime_type || 'video/mp4'} />
                  <p className="text-white p-4">
                    Seu navegador não suporta reprodução de vídeo. 
                    <a href={videoUrl} className="underline ml-1" download>
                      Baixar vídeo
                    </a>
                  </p>
                </video>
              ) : (
                <div className="flex items-center justify-center h-full text-white bg-gray-800">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Vídeo indisponível</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="heading-4 text-title mb-2">{selectedVideo.title}</h3>
                  {selectedVideo.upload_type === 'direct' && selectedVideo.original_filename && (
                    <p className="text-sm text-gray-600 mb-1">
                      📁 {selectedVideo.original_filename}
                    </p>
                  )}
                  {selectedVideo.file_size && (
                    <p className="text-xs text-gray-500">
                      Tamanho: {formatFileSize(selectedVideo.file_size)}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ml-4 ${
                  selectedVideo.upload_type === 'direct' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedVideo.upload_type === 'direct' ? '🎥 Upload Direto' : '📺 YouTube'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Componente de Card de Vídeo extraído para reutilização
function VideoCard({ video, onClick }: { video: DashboardVideo, onClick: (v: DashboardVideo) => Promise<void> }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200 flex flex-col group h-full">
      <div className="relative w-full aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
        {video.thumbnail_url ? (
          <OptimizedImage 
            src={video.thumbnail_url} 
            alt={video.title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px" 
            className="object-cover transition-transform duration-200"
            quality={80}
            fallbackText="Thumbnail"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Upload type indicator */}
        <div className="absolute top-2 right-2">
          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium shadow-sm ${
            video.upload_type === 'direct' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {video.upload_type === 'direct' ? '🎥' : '📺'}
          </span>
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
          <div className="rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ backgroundColor: 'rgba(243, 131, 50, 0.9)' }}>
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-[120px]">
        <h3 className="text-sm font-medium text-gray-700 mb-2 line-clamp-2 group-hover:text-gray-900 flex-1">{video.title}</h3>
        
        {video.upload_type === 'direct' && video.file_size && (
          <p className="text-xs text-gray-500 mb-3">
            {formatFileSize(video.file_size)}
          </p>
        )}
        
        <button
          onClick={() => onClick(video)}
          className="mt-auto text-white px-4 py-2.5 rounded text-xs font-medium transition-all duration-200"
          style={{ backgroundColor: '#F38332' }}
        >
          Assistir
        </button>
      </div>
    </div>
  );
} 