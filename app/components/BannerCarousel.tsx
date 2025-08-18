"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import OptimizedImage from "./OptimizedImage";
import { processSupabaseImageUrl, debugImageUrl } from "@/lib/imageUtils";
import { logger } from "@/lib/logger";

interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  link: string | null;
  is_active: boolean;
  order_index: number;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      const componentTimer = logger.componentStart('BannerCarousel.fetchBanners');
      logger.info('Iniciando carregamento de banners');
      
      const queryTimer = logger.dbStart('banners.select(active)');
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      logger.dbEnd(queryTimer);
      
      if (error) {
        logger.error('Erro ao buscar banners', error);
        logger.componentEnd(componentTimer);
        return;
      }
      
      const processTimer = logger.componentStart('BannerCarousel.processImages');
      const processedBanners = (data || []).map(banner => ({
        ...banner,
        image_url: processSupabaseImageUrl(banner.image_url) || banner.image_url
      }));
      
      // Debug das URLs em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        processedBanners.forEach(banner => 
          debugImageUrl(banner.image_url, `Banner: ${banner.title}`)
        );
      }
      logger.componentEnd(processTimer);
      
      setBanners(processedBanners);
      
      const bannerCount = processedBanners.length;
      logger.success(`Banners carregados com sucesso`, { bannerCount });
      logger.componentEnd(componentTimer);
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners]);

  if (banners.length === 0) return null;

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const next = () => setCurrent((prev) => (prev + 1) % banners.length);

  return (
    <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-md overflow-hidden mb-8">
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {banner.link ? (
            <a href={banner.link} target="_blank" rel="noopener noreferrer">
              <OptimizedImage 
                src={banner.image_url} 
                alt={banner.title || "Banner"} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px" 
                className="object-cover w-full h-full rounded-md" 
                priority={idx === current}
                quality={85}
                fallbackText="Banner indisponível"
              />
            </a>
          ) : (
            <OptimizedImage 
              src={banner.image_url} 
              alt={banner.title || "Banner"} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px" 
              className="object-cover w-full h-full rounded-md" 
              priority={idx === current}
              quality={85}
              fallbackText="Banner indisponível"
            />
          )}
          {banner.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-6 py-3 text-lg font-semibold">
              {banner.title}
            </div>
          )}
        </div>
      ))}
      {/* Navegação manual */}
      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition-colors duration-150 z-20">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition-colors duration-150 z-20">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full ${idx === current ? 'bg-primary' : 'bg-white/70 border border-primary'}`}
                onClick={() => goTo(idx)}
                aria-label={`Ir para banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 