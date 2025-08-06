"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import OptimizedImage from "../components/OptimizedImage";
import { Icon } from "../components/icons/Icon";

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  is_active: boolean;
  order_index: number;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    // Só executar no lado do cliente
    if (typeof window === 'undefined') return;
    
    const fetchImages = async () => {
      try {
        const { data } = await getSupabaseClient()
          .from("gallery_images")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });
        setImages(data || []);
      } catch (error) {
        console.error('Erro ao buscar imagens:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const handleOpenModal = (img: GalleryImage) => {
    setSelectedImage(img);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
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
              { label: 'Galeria' }
            ]} 
          />
        </div>

        <div className="mb-8">
          <h1 className="heading-1 text-title mb-2">Galeria de Imagens</h1>
          <p className="body-text text-muted">Explore nossa coleção de fotos e momentos especiais da Cresol.</p>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-4 body-text text-muted">Carregando imagens...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="image" className="mx-auto h-16 w-16 text-muted mb-4" />
              <h3 className="heading-3 text-title mb-2">Nenhuma imagem encontrada</h3>
              <p className="body-text text-muted">A galeria ainda não possui imagens disponíveis.</p>
            </div>
          ) : (
            <div className="grid-responsive">
              {images.map((img) => (
                <div 
                  key={img.id} 
                  className="card cursor-pointer transition-all duration-200 group" 
                  onClick={() => handleOpenModal(img)}
                >
                  <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                    <OptimizedImage 
                      src={img.image_url} 
                      alt={img.title || "Imagem da galeria"} 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      quality={80}
                      fallbackText="Imagem indisponível"
                    />
                    
                    {/* Overlay de hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3">
                        <Icon name="search" className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  {img.title && (
                    <div className="p-3">
                      <p className="body-text-small text-center truncate text-title">{img.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal padronizado */}
        {modalOpen && selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg border border-gray-300 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              {/* Cabeçalho do modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="heading-4 text-title">
                  {selectedImage.title || 'Imagem da galeria'}
                </h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleCloseModal}
                  aria-label="Fechar"
                >
                  <Icon name="close" className="h-6 w-6 text-muted" />
                </button>
              </div>
              
              {/* Conteúdo do modal */}
              <div className="relative max-h-[70vh] bg-black flex items-center justify-center">
                <OptimizedImage 
                  src={selectedImage.image_url} 
                  alt={selectedImage.title || "Imagem da galeria"} 
                  fill
                  className="object-contain"
                  sizes="90vw"
                  quality={90}
                  priority
                  fallbackText="Imagem indisponível"
                />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 