"use client";

import { useEffect, useState, useRef } from "react";

import { processSupabaseImageUrl, debugImageUrl } from "@/lib/imageUtils";
import { logger } from "@/lib/logger";
import { cachedQueries } from "@/lib/supabase/cached-client";

import { HeroImage } from "./OptimizedImageWithBlur";

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
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const preloadedImages = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const fetchBanners = async () => {
      const componentTimer = logger.componentStart('BannerCarousel.fetchBanners');
      logger.info('Iniciando carregamento de banners');
      
      try {
        const queryTimer = logger.dbStart('banners.cached.select');
        const data = await cachedQueries.getBanners();
        logger.dbEnd(queryTimer);
        
        const processTimer = logger.componentStart('BannerCarousel.processImages');
        const processedBanners = (data || []).map((banner: any) => ({
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
        logger.info(`Banners carregados com sucesso (com cache)`, { bannerCount });
        logger.componentEnd(componentTimer);
        
        // Inicia preload das imagens após carregar os banners
        preloadBannerImages(processedBanners);
      } catch (error) {
        logger.error('Erro ao buscar banners', error instanceof Error ? error : new Error(String(error)));
        logger.componentEnd(componentTimer);
      }
    };
    
    // Função para preload inteligente das imagens
    const preloadBannerImages = async (bannerList: Banner[]) => {
      if (bannerList.length === 0) return;
      
      const preloadTimer = logger.componentStart('BannerCarousel.preloadImages');
      
      // Preload da imagem atual primeiro (prioridade máxima)
      const currentBanner = bannerList[current];
      if (currentBanner && !preloadedImages.current[currentBanner.image_url]) {
        await preloadSingleImage(currentBanner.image_url, 'high');
      }
      
      // Preload das próximas 2 imagens (média prioridade)
      const nextIndexes = [
        (current + 1) % bannerList.length,
        (current + 2) % bannerList.length
      ];
      
      for (const index of nextIndexes) {
        const banner = bannerList[index];
        if (banner && !preloadedImages.current[banner.image_url]) {
          preloadSingleImage(banner.image_url, 'medium').catch(() => {
            // Ignora erros de preload silenciosamente
          });
        }
      }
      
      // Preload das demais imagens (baixa prioridade)
      setTimeout(() => {
        bannerList.forEach((banner, index) => {
          if (!nextIndexes.includes(index) && index !== current && 
              !preloadedImages.current[banner.image_url]) {
            preloadSingleImage(banner.image_url, 'low').catch(() => {
              // Ignora erros de preload silenciosamente
            });
          }
        });
      }, 2000); // Delay de 2s para não interferir com o carregamento principal
      
      logger.componentEnd(preloadTimer);
    };
    
    // Função auxiliar para preload individual
    const preloadSingleImage = async (url: string, priority: 'high' | 'medium' | 'low'): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        // Define importância do fetch baseado na prioridade
        if ('fetchPriority' in img) {
          (img as any).fetchPriority = priority;
        }
        
        img.onload = () => {
          preloadedImages.current[url] = img;
          setImageLoadStatus(prev => ({ ...prev, [url]: true }));
          resolve();
        };
        
        img.onerror = () => {
          setImageLoadStatus(prev => ({ ...prev, [url]: false }));
          reject(new Error(`Failed to preload: ${url}`));
        };
        
        img.src = url;
      });
    };
    
    fetchBanners();
  }, [current]);

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
              <HeroImage 
                src={banner.image_url} 
                alt={banner.title || "Banner"} 
                fill 
                className="object-cover w-full h-full rounded-md" 
                placeholder="blur"
              />
              {/* Indicador de carregamento para imagens não preloaded */}
              {!imageLoadStatus[banner.image_url] && idx === current && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
            </a>
          ) : (
            <>
              <HeroImage 
                src={banner.image_url} 
                alt={banner.title || "Banner"} 
                fill 
                className="object-cover w-full h-full rounded-md" 
                placeholder="blur"
              />
              {/* Indicador de carregamento para imagens não preloaded */}
              {!imageLoadStatus[banner.image_url] && idx === current && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
            </>
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