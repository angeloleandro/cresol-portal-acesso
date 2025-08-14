"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OptimizedImage from "@/app/components/OptimizedImage";
import { supabase } from "@/lib/supabase";
import { 
  StandardizedAdminLayout, 
  StandardizedPageHeader, 
  StandardizedButton,
  StandardizedCard,
  StandardizedEmptyState,
  type BreadcrumbItem
} from '@/app/components/admin';
import BannerUploadForm from '@/app/components/BannerUploadForm';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { Icon } from '@/app/components/icons';

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
    return <UnifiedLoadingSpinner size="large" message={LOADING_MESSAGES.banners} />;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/home', icon: 'house' },
    { label: 'Administração', href: '/admin' },
    { label: 'Banners' }
  ];

  return (
    <>
      <StandardizedAdminLayout user={user} breadcrumbs={breadcrumbs}>
        <StandardizedPageHeader
          title="Gerenciar Banners"
          subtitle="Adicione, edite ou remova banners exibidos na página inicial do portal"
          action={
            <StandardizedButton
              onClick={() => setShowForm(true)}
              variant="primary"
            >
              <Icon name="plus" className="h-4 w-4" />
              Novo Banner
            </StandardizedButton>
          }
        />
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
        
        {banners.length === 0 && !showForm ? (
          <StandardizedEmptyState
            title="Nenhum banner cadastrado"
            description="Comece criando o primeiro banner para exibir na página inicial."
            icon="image"
            action={{
              label: 'Criar primeiro banner',
              onClick: () => setShowForm(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <StandardizedCard key={banner.id} hover className="overflow-hidden flex flex-col">
                <div className="relative w-full h-48 bg-gray-100">
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
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Icon name="image" className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{banner.title || "(Sem título)"}</h3>
                  {banner.link && (
                    <a href={banner.link} className="text-primary text-sm underline break-all hover:text-primary-dark" target="_blank" rel="noopener noreferrer">
                      {banner.link}
                    </a>
                  )}
                  <div className="mt-auto flex gap-2 pt-4">
                    <StandardizedButton
                      onClick={() => setEditBanner(banner)}
                      variant="secondary"
                      size="sm"
                      className="text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      <Icon name="pencil" className="h-4 w-4" />
                      Editar
                    </StandardizedButton>
                    <StandardizedButton
                      onClick={() => handleDeleteClick(banner)}
                      variant="danger"
                      size="sm"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                      Remover
                    </StandardizedButton>
                  </div>
                </div>
              </StandardizedCard>
            ))}
          </div>
        )}
      </StandardizedAdminLayout>
      
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
    </>
  );
} 