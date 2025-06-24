"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

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
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-cresol-gray-light/30">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white rounded-lg shadow-sm p-5 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Galeria de Imagens</h2>
          </div>
          {loading ? (
            <div className="text-center text-cresol-gray py-12">Carregando imagens...</div>
          ) : images.length === 0 ? (
            <div className="text-center text-cresol-gray py-12">Nenhuma imagem encontrada.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition overflow-hidden" onClick={() => handleOpenModal(img)}>
                  <div className="relative w-full aspect-[4/3] bg-cresol-gray-light">
                    <Image src={img.image_url} alt={img.title || "Imagem da galeria"} fill className="object-cover" />
                  </div>
                  {img.title && <div className="p-2 text-sm text-cresol-gray text-center truncate">{img.title}</div>}
                </div>
              ))}
            </div>
          )}
        </section>
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
      </main>
      
      <Footer />
    </div>
  );
} 