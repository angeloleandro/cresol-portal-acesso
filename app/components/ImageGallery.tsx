"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import OptimizedImage from "./OptimizedImage";
import { processSupabaseImageUrl, debugImageUrl } from "@/lib/imageUtils";

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  is_active: boolean;
  order_index: number;
}

interface ImageGalleryProps {
  limit?: number;
}

export default function ImageGallery({ limit = 6 }: ImageGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar imagens da galeria:', error);
      }
      
      const processedImages = (data || []).map(img => ({
        ...img,
        image_url: processSupabaseImageUrl(img.image_url) || img.image_url
      }));
      
      // Debug das URLs em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        processedImages.forEach(img => 
          debugImageUrl(img.image_url, `Gallery Image: ${img.title}`)
        );
      }
      
      setImages(processedImages);
      setLoading(false);
    };
    fetchImages();
  }, []);

  const handleOpenModal = (img: GalleryImage) => {
    setSelectedImage(img);
    setModalOpen(true);
  };
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedImage(null);
  }, []);
  useEffect(() => {
    if (modalOpen) {
      const escListener = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleCloseModal();
      };
      window.addEventListener("keydown", escListener);
      return () => window.removeEventListener("keydown", escListener);
    }
  }, [modalOpen, handleCloseModal]);

  if (loading || images.length === 0) return null;

  const showImages = images.slice(0, limit);
  return (
    <section className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="heading-3 text-title">Galeria de Imagens</h2>
          <p className="body-text-small text-muted mt-1">Explore nosso acervo visual</p>
        </div>
        <a href="/galeria" className="text-sm font-medium transition-colors flex items-center hover:bg-primary/10 px-3 py-1.5 rounded-md text-primary">
          Ver todas
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {showImages.map((img) => {
          const maxLen = 35;
          const shortTitle = img.title && img.title.length > maxLen ? img.title.slice(0, maxLen) + '...' : img.title;
          return (
            <div key={img.id} className="bg-white rounded-lg border border-gray-200/40 cursor-pointer hover:border-gray-200/70 transition-colors duration-150 overflow-hidden group" onClick={() => handleOpenModal(img)}>
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                <OptimizedImage 
                  src={img.image_url} 
                  alt={img.title || "Imagem da galeria"} 
                  fill 
                  className="object-cover transition-transform duration-200"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  quality={80}
                  fallbackText="Imagem indisponível"
                />
                {img.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate" title={img.title}>
                      {shortTitle}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {images.length > limit && (
        <div className="flex justify-center mt-6">
          <a href="/galeria" className="text-white px-5 py-2.5 rounded-md text-xs font-medium transition-all duration-200" style={{ backgroundColor: '#F38332' }}>Ver galeria completa</a>
        </div>
      )}
      {modalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg border border-gray-300 max-w-2xl w-full mx-4 relative">
            <button
              className="absolute top-6 right-6 bg-white border border-cresol-gray-light rounded-full w-14 h-14 flex items-center justify-center z-20 transition hover:bg-primary/10 group"
              onClick={handleCloseModal}
              aria-label="Fechar"
              tabIndex={0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-cresol-gray group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
            <div className="aspect-[4/3] w-full rounded-t-lg overflow-hidden bg-black flex items-center justify-center">
              <OptimizedImage 
                src={selectedImage.image_url} 
                alt={selectedImage.title || "Imagem da galeria"} 
                fill 
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 90vw"
                quality={90}
                priority
                fallbackText="Imagem indisponível"
              />
            </div>
            {selectedImage.title && <div className="p-4 text-center text-lg font-semibold text-cresol-gray">{selectedImage.title}</div>}
          </div>
        </div>
      )}
    </section>
  );
} 