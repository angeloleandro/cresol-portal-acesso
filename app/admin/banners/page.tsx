"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OptimizedImage from "@/app/components/OptimizedImage";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/app/components/AdminHeader";
import Breadcrumb from "@/app/components/Breadcrumb";
import BannerUploadForm from '@/app/components/BannerUploadForm';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';

interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  link: string | null;
  is_active: boolean;
  order_index: number;
}

export default function AdminBanners() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
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
    if (isAdmin) fetchBanners();
    // eslint-disable-next-line
  }, [isAdmin]);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) setError(error.message);
    else setBanners(data || []);
    setLoading(false);
  };

  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete(banner);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/banners?id=${bannerToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir banner');
      }
      
      await fetchBanners();
      setShowDeleteModal(false);
      setBannerToDelete(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBannerToDelete(null);
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
              { label: 'Banners' }
            ]} 
          />
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Gerenciar Banners</h2>
            <p className="text-cresol-gray">Adicione, edite ou remova banners exibidos na página inicial do portal.</p>
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition" onClick={() => setShowForm(true)}>+ Novo Banner</button>
        </div>
        {showForm && !editBanner && (
          <BannerUploadForm onSave={() => { setShowForm(false); fetchBanners(); }} onCancel={() => setShowForm(false)} />
        )}
        {editBanner && (
          <BannerUploadForm
            initialData={{
              id: editBanner.id,
              title: editBanner.title ?? undefined,
              image_url: editBanner.image_url ?? undefined,
              link: editBanner.link ?? undefined,
              is_active: editBanner.is_active,
              order_index: editBanner.order_index,
            }}
            onSave={() => { setEditBanner(null); fetchBanners(); }}
            onCancel={() => setEditBanner(null)}
          />
        )}
        {error && <div className="text-red-500 mb-4">Erro: {error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg border border-cresol-gray-light overflow-hidden flex flex-col">
              <div className="relative w-full h-48 bg-cresol-gray-light">
                {banner.image_url ? (
                  <OptimizedImage 
                    src={banner.image_url} 
                    alt={banner.title || "Banner"} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={80}
                    fallbackText="Banner indisponível"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-cresol-gray">Sem imagem</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-cresol-gray mb-1">{banner.title || "(Sem título)"}</h3>
                {banner.link && <a href={banner.link} className="text-primary text-sm underline break-all" target="_blank" rel="noopener noreferrer">{banner.link}</a>}
                <div className="mt-auto flex gap-2 pt-4">
                  <button className="text-primary hover:underline" onClick={() => setEditBanner(banner)}>Editar</button>
                  <button className="text-red-500 hover:underline" onClick={() => handleDeleteClick(banner)}>Remover</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {banners.length === 0 && !showForm && (
          <div className="text-cresol-gray text-center mt-12">Nenhum banner cadastrado ainda.</div>
        )}
      </main>
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o banner <strong>"${bannerToDelete?.title || '(Sem título)'}"</strong>?<br><br>Esta ação não pode ser desfeita e removerá o banner permanentemente da página inicial.`}
        isLoading={isDeleting}
        confirmButtonText="Excluir Banner"
        cancelButtonText="Cancelar"
      />
    </div>
  );
} 