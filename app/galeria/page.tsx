"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import OptimizedImage from "../components/OptimizedImage";

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
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Galeria de Imagens</h1>
          <p className="body-text text-muted">Explore nossa coleção de fotos e momentos especiais da Cresol.</p>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-4 text-muted">Carregando imagens...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="heading-3 mt-4 mb-2">Nenhuma imagem encontrada</h3>
              <p className="body-text text-muted">A galeria ainda não possui imagens disponíveis.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div 
                  key={img.id} 
                  className="bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden border border-gray-200" 
                  onClick={() => handleOpenModal(img)}
                >
                  <div className="relative w-full aspect-[4/3] bg-gray-100">
                    <OptimizedImage 
                      src={img.image_url} 
                      alt={img.title || "Imagem da galeria"} 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      quality={80}
                      fallbackText="Imagem indisponível"
                    />
                  </div>
                  {img.title && (
                    <div className="p-3">
                      <p className="body-text-small text-center truncate">{img.title}</p>
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
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              {/* Cabeçalho do modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="heading-4">
                  {selectedImage.title || 'Imagem da galeria'}
                </h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleCloseModal}
                  aria-label="Fechar"
                >
                  <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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