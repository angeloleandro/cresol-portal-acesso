"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OptimizedImage from "@/app/components/OptimizedImage";
import { StandardizedButton } from "@/app/components/admin";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/app/components/AdminHeader";
import Breadcrumb from "@/app/components/Breadcrumb";
import ImageUploadForm from "@/app/components/ImageUploadForm";
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';
import { AdminSpinner } from '@/app/components/ui/StandardizedSpinner';
// (Você pode criar um ImageUploadForm.tsx depois, por enquanto use um placeholder)

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  is_active: boolean;
  order_index: number;
}

export default function AdminGallery() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editImage, setEditImage] = useState<GalleryImage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
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
    if (isAdmin) fetchImages();
  }, [isAdmin]);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) setError(error.message);
    else setImages(data || []);
    setLoading(false);
  };

  const handleDeleteClick = (image: GalleryImage) => {
    setImageToDelete(image);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/gallery?id=${imageToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir imagem');
      }
      
      await fetchImages();
      setShowDeleteModal(false);
      setImageToDelete(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
  };

  if (loading) {
    return <AdminSpinner fullScreen message="Carregando..." size="lg" />;
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
              { label: 'Galeria' }
            ]} 
          />
        </div>

        {/* Header Section */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h1 className="text-3xl font-bold text-primary mb-1">
              Gerenciar Galeria de Imagens
            </h1>
            <p className="text-sm text-gray-600">Adicione, edite ou remova imagens exibidas na galeria do portal</p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-6">
          <StandardizedButton variant="primary" onClick={() => setShowForm(true)}>+ Nova Imagem</StandardizedButton>
        </div>
        {showForm && !editImage && (
          <ImageUploadForm onSave={() => { setShowForm(false); fetchImages(); }} onCancel={() => setShowForm(false)} />
        )}
        {editImage && (
          <ImageUploadForm
            initialData={{
              id: editImage.id,
              title: editImage.title ?? undefined,
              image_url: editImage.image_url ?? undefined,
              is_active: editImage.is_active,
              order_index: editImage.order_index,
            }}
            onSave={() => { setEditImage(null); fetchImages(); }}
            onCancel={() => setEditImage(null)}
          />
        )}
        {error && <div className="text-red-500 mb-4">Erro: {error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-lg border border-gray-200/40 hover:border-gray-200/70 transition-colors duration-150 overflow-hidden flex flex-col">
              <div className="relative w-full h-48 bg-cresol-gray-light">
                {img.image_url ? (
                  <OptimizedImage 
                    src={img.image_url} 
                    alt={img.title || "Imagem da galeria"} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={80}
                    fallbackText="Imagem indisponível"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-cresol-gray">Sem imagem</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-cresol-gray mb-1">{img.title || "(Sem título)"}</h3>
                <div className="mt-auto flex gap-2 pt-4">
                  <button className="text-primary hover:underline rounded-md px-2 py-1" onClick={() => setEditImage(img)}>Editar</button>
                  <button className="text-red-500 hover:underline rounded-md px-2 py-1" onClick={() => handleDeleteClick(img)}>Remover</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {images.length === 0 && !showForm && (
          <div className="text-cresol-gray text-center mt-12">Nenhuma imagem cadastrada ainda.</div>
        )}
      </main>
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a imagem <strong>"${imageToDelete?.title || '(Sem título)'}"</strong>?<br><br>Esta ação não pode ser desfeita e removerá a imagem permanentemente da galeria.`}
        isLoading={isDeleting}
        confirmButtonText="Excluir Imagem"
        cancelButtonText="Cancelar"
      />
    </div>
  );
} 