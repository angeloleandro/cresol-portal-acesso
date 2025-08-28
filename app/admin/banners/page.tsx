"use client";

import { useState, useEffect } from "react";

import AuthGuard from '@/app/components/AuthGuard';
import { 
  StandardizedAdminLayout, 
  StandardizedCard,
  StandardizedEmptyState,
  StandardizedPageHeader, 
  type BreadcrumbItem
} from '@/app/components/admin';
import { Button } from '@/app/components/ui/Button';
import BannerModal from '@/app/components/BannerModal';
import { Icon } from '@/app/components/icons';
import OptimizedImage from "@/app/components/OptimizedImage";
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import UnifiedLoadingSpinner from '@/app/components/ui/UnifiedLoadingSpinner';
import { LOADING_MESSAGES } from '@/lib/constants/loading-messages';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

const supabase = createClient();

interface BannerData {
  id: string;
  title: string | null;
  image_url: string;
  link: string | null;
  is_active: boolean;
  order_index: number;
}

function AdminBannersContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<BannerData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

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

  const handleDeleteClick = (banner: BannerData) => {
    setBannerToDelete(banner);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // API foi corrigida para usar sessão
      const response = await fetch(`/api/admin/banners?id=${bannerToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
            <Button
              onClick={() => {
                setEditingBanner(null);
                setShowModal(true);
              }}
              variant="primary"
              icon="plus"
            >
              Novo Banner
            </Button>
          }
        />
        {error && <div className="text-red-500 mb-4">Erro: {error}</div>}
        
        {banners.length === 0 ? (
          <StandardizedEmptyState
            title="Nenhum banner cadastrado"
            description="Comece criando o primeiro banner para exibir na página inicial."
            icon="image"
            action={{
              label: "Criar Banner",
              onClick: () => {
                setEditingBanner(null);
                setShowModal(true);
              }
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
                    <Button
                      onClick={() => {
                        setEditingBanner(banner);
                        setShowModal(true);
                      }}
                      variant="secondary"
                      size="sm"
                      icon="pencil"
                      className="text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(banner)}
                      variant="secondary"
                      size="sm"
                      icon="trash"
                      className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </StandardizedCard>
            ))}
          </div>
        )}
      </StandardizedAdminLayout>
      
      {/* Banner Modal */}
      <BannerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBanner(null);
        }}
        onSave={() => {
          setShowModal(false);
          setEditingBanner(null);
          fetchBanners();
        }}
        banner={editingBanner}
      />
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={
          <div>
            <p>Tem certeza que deseja excluir o banner <strong>&quot;{bannerToDelete?.title || '(Sem título)'}&quot;</strong>?</p>
            <br />
            <p>Esta ação não pode ser desfeita e removerá o banner permanentemente da página inicial.</p>
          </div>
        }
        isLoading={isDeleting}
        confirmButtonText="Excluir Banner"
        cancelButtonText="Cancelar"
      />
    </>
  );
}

export default function AdminBanners() {
  return (
    <AuthGuard requireRole="admin">
      <AdminBannersContent />
    </AuthGuard>
  );
} 