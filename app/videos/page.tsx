"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

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

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white rounded-lg shadow-sm p-5 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Galeria de Vídeos</h2>
          </div>
          {loading ? (
            <div className="text-center text-cresol-gray py-12">Carregando vídeos...</div>
          ) : videos.length === 0 ? (
            <div className="text-center text-cresol-gray py-12">Nenhum vídeo encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="w-full">
                  <VideoCard video={video} onClick={handleOpenModal} />
                </div>
              ))}
            </div>
          )}
        </section>
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
      </main>
      
      <Footer />
    </div>
  );
}

// Card de vídeo reutilizável
function VideoCard({ video, onClick }: { video: DashboardVideo, onClick: (v: DashboardVideo) => void }) {
  const maxLen = 50;
  const shortTitle = video.title.length > maxLen ? video.title.slice(0, maxLen) + '...' : video.title;
  return (
    <div className="bg-white rounded-lg shadow flex flex-col cursor-pointer hover:shadow-lg transition" onClick={() => onClick(video)}>
      <div className="relative w-full aspect-video bg-cresol-gray-light rounded-t-lg overflow-hidden">
        {video.thumbnail_url ? (
          <Image src={video.thumbnail_url} alt={video.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px" className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-cresol-gray">Sem thumbnail</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-cresol-gray mb-2 line-clamp-2" title={video.title}>{shortTitle}</h3>
      </div>
    </div>
  );
} 