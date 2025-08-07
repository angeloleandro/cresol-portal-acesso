"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OptimizedImage from "@/app/components/OptimizedImage";
import AdminHeader from "@/app/components/AdminHeader";
import Breadcrumb from '@/app/components/Breadcrumb';
import { supabase } from "@/lib/supabase";
import VideoUploadFormEnhanced from '@/app/components/VideoUploadFormEnhanced';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import { getAuthenticatedSession } from '@/lib/video-utils';
import Icon from '@/app/components/icons/Icon';

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

  const handleDeleteClick = (video: DashboardVideo) => {
    setVideoToDelete(video);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete || isDeleting) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const authResult = await getAuthenticatedSession();
      if (authResult.error) {
        throw new Error(authResult.error);
      }

      
      const response = await fetch(`/api/admin/videos?id=${videoToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authResult.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir vídeo');
      }
      
      await response.json();
      
      // Optimistic UI update - remove from local state immediately
      setVideos(prevVideos => prevVideos.filter(video => video.id !== videoToDelete.id));
      setShowDeleteModal(false);
      setVideoToDelete(null);
      
      // Refresh data in background to ensure consistency
      await fetchVideos();
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
          <button 
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors" 
            onClick={() => setShowForm(true)}
          >
            <Icon name="plus" className="h-4 w-4" />
            Novo Vídeo
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">Erro: {error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg border border-cresol-gray-light overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
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
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-cresol-gray">{video.title}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    video.upload_type === 'direct' 
                      ? 'bg-green-100 text-green-800' 
                      : video.upload_type === 'youtube'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    <Icon 
                      name={video.upload_type === 'direct' ? 'video' : 'monitor-play'} 
                      className="h-3 w-3" 
                    />
                    {video.upload_type === 'direct' ? 'Direto' : 
                     video.upload_type === 'youtube' ? 'YouTube' : 'Vimeo'}
                  </span>
                </div>
                
                {video.upload_type === 'direct' && video.original_filename ? (
                  <div className="mb-2">
                    <p className="text-sm text-cresol-gray truncate flex items-center gap-1">
                      <Icon name="folder" className="h-4 w-4 text-cresol-gray/70" />
                      {video.original_filename}
                    </p>
                    {video.file_size && (
                      <p className="text-xs text-cresol-gray/70 ml-5">
                        {(video.file_size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                  </div>
                ) : (
                  <a 
                    href={video.video_url} 
                    className="text-primary text-sm underline break-all hover:text-primary-dark transition-colors mb-2" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {video.video_url}
                  </a>
                )}
                
                {video.processing_status && video.processing_status !== 'ready' && (
                  <div className="mb-2">
                    <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                      video.processing_status === 'error' 
                        ? 'bg-red-100 text-red-700'
                        : video.processing_status === 'uploading'
                        ? 'bg-yellow-100 text-yellow-700'  
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Icon 
                        name={video.processing_status === 'error' ? 'triangle-alert' : 'clock'} 
                        className="h-3 w-3" 
                      />
                      {video.processing_status === 'uploading' ? 'Enviando...' : 
                       video.processing_status === 'processing' ? 'Processando...' : 
                       video.processing_status}
                      {video.upload_progress !== undefined && video.upload_progress < 100 && (
                        <span>({video.upload_progress}%)</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 text-xs ${video.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                    <Icon 
                      name={video.is_active ? 'CheckCircle' : 'x'} 
                      className="h-3 w-3" 
                    />
                    {video.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="text-xs text-cresol-gray/70">
                    Ordem: {video.order_index}
                  </span>
                </div>
                
                <div className="mt-auto flex gap-2 pt-3 border-t border-gray-100">
                  <button 
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium transition-colors" 
                    onClick={() => setEditVideo(video)}
                  >
                    <Icon name="pencil" className="h-4 w-4" />
                    Editar
                  </button>
                  <button 
                    className="inline-flex items-center gap-1 text-red-500 hover:underline text-sm font-medium transition-colors" 
                    onClick={() => handleDeleteClick(video)}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {videos.length === 0 && (
          <div className="text-cresol-gray text-center mt-12">Nenhum vídeo cadastrado ainda.</div>
        )}
        {showForm && !editVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <VideoUploadFormEnhanced onSave={() => { setShowForm(false); fetchVideos(); }} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        )}
        {editVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <VideoUploadFormEnhanced
                initialData={{
                  id: editVideo.id,
                  title: editVideo.title,
                  video_url: editVideo.video_url,
                  thumbnail_url: editVideo.thumbnail_url ?? undefined,
                  is_active: editVideo.is_active,
                  order_index: editVideo.order_index,
                  upload_type: editVideo.upload_type === 'vimeo' ? 'youtube' : editVideo.upload_type, // Convert vimeo to youtube for editing
                  file_size: editVideo.file_size ?? undefined,
                  original_filename: editVideo.original_filename ?? undefined
                }}
                onSave={() => { setEditVideo(null); fetchVideos(); }}
                onCancel={() => setEditVideo(null)}
              />
            </div>
          </div>
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