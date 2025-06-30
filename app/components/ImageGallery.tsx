"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
      const { data } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      setImages(data || []);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading-3 text-title">Galeria de Imagens</h2>
        <a href="/galeria" className="text-sm font-medium transition-colors flex items-center hover:shadow-sm px-3 py-1.5 rounded-md text-primary">
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
            <div key={img.id} className="bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden group" onClick={() => handleOpenModal(img)}>
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                <Image src={img.image_url} alt={img.title || "Imagem da galeria"} fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
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
          <a href="/galeria" className="text-white px-5 py-2.5 rounded text-xs font-medium transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: '#F38332' }}>Ver galeria completa</a>
        </div>
      )}
      {modalOpen && selectedImage && (
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
            <div className="aspect-[4/3] w-full rounded-t-lg overflow-hidden bg-black flex items-center justify-center">
              <Image src={selectedImage.image_url} alt={selectedImage.title || "Imagem da galeria"} fill className="object-contain" />
            </div>
            {selectedImage.title && <div className="p-4 text-center text-lg font-semibold text-cresol-gray">{selectedImage.title}</div>}
          </div>
        </div>
      )}
    </section>
  );
} 