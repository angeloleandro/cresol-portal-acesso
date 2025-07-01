"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OptimizedImage from "@/app/components/OptimizedImage";
import AdminHeader from "@/app/components/AdminHeader";
import Breadcrumb from '@/app/components/Breadcrumb';
import { supabase } from "@/lib/supabase";
import VideoUploadForm from '@/app/components/VideoUploadForm';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';

interface DashboardVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number;
}

export default function AdminVideos() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState<DashboardVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editVideo, setEditVideo] = useState<DashboardVideo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<DashboardVideo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dashboard_videos")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) setError(error.message);
    else setVideos(data || []);
    setLoading(false);
  };

  const handleDeleteClick = (video: DashboardVideo) => {
    setVideoToDelete(video);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/videos?id=${videoToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir vídeo');
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-cresol-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      <AdminHeader user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home', icon: 'house' },
              { label: 'Administração', href: '/admin' },
              { label: 'Vídeos' }
            ]} 
          />
        </div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Gerenciar Vídeos</h2>
            <p className="text-cresol-gray">Adicione, edite ou remova vídeos exibidos no dashboard do portal.</p>
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary-dark transition" onClick={() => setShowForm(true)}>+ Novo Vídeo</button>
        </div>
        {error && <div className="text-red-500 mb-4">Erro: {error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow border border-cresol-gray-light overflow-hidden flex flex-col">
              {video.thumbnail_url ? (
                <OptimizedImage
                  src={video.thumbnail_url}
                  alt={video.title}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={80}
                  fallbackText="Thumbnail"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-cresol-gray-light text-cresol-gray">Sem thumbnail</div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-cresol-gray mb-1">{video.title}</h3>
                <a href={video.video_url} className="text-primary text-sm underline break-all" target="_blank" rel="noopener noreferrer">{video.video_url}</a>
                <div className="mt-auto flex gap-2 pt-4">
                  <button className="text-primary hover:underline" onClick={() => setEditVideo(video)}>Editar</button>
                  <button className="text-red-500 hover:underline" onClick={() => handleDeleteClick(video)}>Remover</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {videos.length === 0 && (
          <div className="text-cresol-gray text-center mt-12">Nenhum vídeo cadastrado ainda.</div>
        )}
        {showForm && !editVideo && (
          <VideoUploadForm onSave={() => { setShowForm(false); fetchVideos(); }} onCancel={() => setShowForm(false)} />
        )}
        {editVideo && (
          <VideoUploadForm
            initialData={{
              id: editVideo.id,
              title: editVideo.title,
              video_url: editVideo.video_url,
              thumbnail_url: editVideo.thumbnail_url ?? undefined,
              is_active: editVideo.is_active,
              order_index: editVideo.order_index,
            }}
            onSave={() => { setEditVideo(null); fetchVideos(); }}
            onCancel={() => setEditVideo(null)}
          />
        )}
      </main>
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o vídeo <strong>"${videoToDelete?.title}"</strong>?<br><br>Esta ação não pode ser desfeita e removerá o vídeo permanentemente do dashboard.`}
        isLoading={isDeleting}
        confirmButtonText="Excluir Vídeo"
        cancelButtonText="Cancelar"
      />
    </div>
  );
} 