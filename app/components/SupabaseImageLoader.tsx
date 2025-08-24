'use client';

import { ImageLoaderProps } from 'next/image';

import { logger } from '../../lib/production-logger';

export default function SupabaseImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Se já é uma URL completa válida, use como está
  if (src.startsWith('https://') && src.includes('supabase.co')) {
    return src;
  }

  // Construir URL base do Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    logger.warn('NEXT_PUBLIC_SUPABASE_URL não configurado');
    return src;
  }

  // Remover barra inicial se presente
  const cleanPath = src.startsWith('/') ? src.slice(1) : src;
  
  // Construir URL completa
  let fullUrl = `${supabaseUrl}/storage/v1/object/public/images/${cleanPath}`;
  
  // Adicionar parâmetros de otimização se suportado
  // Nota: Supabase Storage não suporta transformação de imagem nativa
  // mas podemos preparar para futuras implementações
  const params = new URLSearchParams();
  
  // Qualidade da imagem (para uso futuro)
  if (quality && quality !== 75) {
    params.set('quality', quality.toString());
  }
  
  // Largura da imagem (para uso futuro) 
  if (width) {
    params.set('width', width.toString());
  }
  
  // Adicionar cache busting baseado em timestamp se em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    params.set('v', Date.now().toString());
  }
  
  // Anexar parâmetros apenas se houver algum
  if (params.toString()) {
    fullUrl += `?${params.toString()}`;
  }
  
  return fullUrl;
}

/**
 * Hook para usar o loader do Supabase com Next.js Image
 */
export const useSupabaseLoader = () => {
  return SupabaseImageLoader;
};