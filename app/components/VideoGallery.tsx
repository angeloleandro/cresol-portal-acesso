"use client";

import { useEffect, useState, Fragment, useRef, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface DashboardVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number;
}

interface VideoGalleryProps {
  limit?: number;
}

export default function VideoGallery({ limit = 4 }: VideoGalleryProps) {
  const [videos, setVideos] = useState<DashboardVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<DashboardVideo | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("dashboard_videos")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      setVideos(data || []);
      setLoading(false);
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
            <a href="/videos" className="text-white px-5 py-2.5 rounded text-xs font-medium transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: '#F38332' }}>Ver galeria de vídeos</a>
          </div>
        )}
      </>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium component-title">Vídeos em destaque</h2>
        <a href="/videos" className="text-sm font-medium transition-colors flex items-center hover:shadow-sm px-3 py-1.5 rounded-md" style={{ color: '#F38332' }}>
          Ver todos
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      {content}
      {modalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 relative">
            <button
              className="absolute top-6 right-6 bg-white border border-cresol-gray-light shadow-lg rounded-full w-14 h-14 flex items-center justify-center z-20 transition hover:bg-primary/10 group"
              onClick={handleCloseModal}
              aria-label="Fechar"
              tabIndex={0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-cresol-gray group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
            <div className="aspect-video w-full rounded-t-lg overflow-hidden bg-black">
              <iframe
                ref={iframeRef}
                src={selectedVideo.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full min-h-[360px]"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-cresol-gray mb-2">{selectedVideo.title}</h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Componente de Card de Vídeo extraído para reutilização
function VideoCard({ video, onClick }: { video: DashboardVideo, onClick: (v: DashboardVideo) => void }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col group h-full">
      <div className="relative w-full aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
        {video.thumbnail_url ? (
          <Image src={video.thumbnail_url} alt={video.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px" className="object-cover group-hover:scale-105 transition-transform duration-200" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
          <div className="rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ backgroundColor: 'rgba(243, 131, 50, 0.9)' }}>
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-[120px]">
        <h3 className="text-sm font-medium text-gray-700 mb-4 line-clamp-2 group-hover:text-gray-900 flex-1">{video.title}</h3>
        <button
          onClick={() => onClick(video)}
          className="mt-auto text-white px-4 py-2.5 rounded text-xs font-medium transition-all duration-200 hover:shadow-sm"
          style={{ backgroundColor: '#F38332' }}
        >
          Assistir
        </button>
      </div>
    </div>
  );
} 