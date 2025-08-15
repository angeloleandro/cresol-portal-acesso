// Utilitários para processamento e recorte de imagens

import { SupabaseClient } from '@supabase/supabase-js';
import { CropArea } from '../types/sector.types';

// Função para criar uma imagem a partir de uma URL
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    // Verificar se estamos no ambiente do navegador
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined, cannot create image'));
      return;
    }
    
    // Usar o construtor global HTMLImageElement
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error: Event) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Função para obter o recorte final da imagem
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0
): Promise<{ file: Blob; url: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Definir as dimensões do canvas para a área de recorte
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Translação para permitir rotação da imagem
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // Desenhar a imagem recortada no canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Criar um blob do canvas
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const url = URL.createObjectURL(blob);
      resolve({ file: blob, url });
    }, 'image/jpeg', 0.95);
  });
}

// Função para fazer upload de imagem para o Supabase
export async function uploadImageToSupabase(
  file: File,
  supabase: SupabaseClient,
  bucket: string = 'images',
  folder: string = 'sector-news'
): Promise<string> {
  // Lista de extensões permitidas para imagens
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  
  // Extrair extensão de forma segura
  const nameParts = file.name.split('.');
  let fileExt = nameParts.length > 1 ? nameParts.pop() : '';
  
  // Normalizar e validar a extensão
  if (fileExt) {
    fileExt = fileExt.toLowerCase().trim();
    // Remover qualquer ponto inicial
    fileExt = fileExt.replace(/^\.+/, '');
  }
  
  // Validar contra a lista de extensões permitidas
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    // Tentar detectar a extensão pelo tipo MIME
    const mimeType = file.type.toLowerCase();
    if (mimeType.startsWith('image/')) {
      const mimeExt = mimeType.split('/')[1];
      if (allowedExtensions.includes(mimeExt)) {
        fileExt = mimeExt;
      } else if (mimeType === 'image/svg+xml') {
        fileExt = 'svg';
      } else {
        // Usar jpg como padrão para imagens genéricas
        fileExt = 'jpg';
      }
    } else {
      throw new Error('Tipo de arquivo não permitido. Use apenas imagens: ' + allowedExtensions.join(', '));
    }
  }
  
  // Criar nome de arquivo seguro com apenas caracteres permitidos
  const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${folder}/${safeFileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }

  // Obter a URL pública da imagem
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

// Função para validar tipo e tamanho de arquivo
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Tipo de arquivo inválido. Use JPG, PNG ou WebP.' 
    };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'Arquivo muito grande. O tamanho máximo é 5MB.' 
    };
  }

  return { valid: true };
}