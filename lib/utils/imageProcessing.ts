// Centralized image processing utilities
// Used across the application for image cropping and upload

import { SupabaseClient } from '@supabase/supabase-js';

import { CropArea } from '@/lib/types/common';

import { UPLOAD_LIMITS } from '@/lib/constants/limits';
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined, cannot create image'));
      return;
    }
    
    // Use global HTMLImageElement constructor
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error: Event) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * getCroppedImg function
 * @todo Add proper documentation
 */
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

  // Set canvas dimensions to crop area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Apply rotation if needed
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // Draw cropped image to canvas
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

  // Create blob from canvas
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

/**
 * uploadImageToSupabase function
 * @todo Add proper documentation
 */
export async function uploadImageToSupabase(
  file: File,
  supabase: SupabaseClient,
  bucket: string = 'images',
  folder: string = 'uploads'
): Promise<string> {
  // Allowed image extensions
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  
  // Extract and validate file extension
  const nameParts = file.name.split('.');
  let fileExt = nameParts.length > 1 ? nameParts.pop() : '';
  
  // Normalize extension
  if (fileExt) {
    fileExt = fileExt.toLowerCase().trim();
    // Remove leading dots
    fileExt = fileExt.replace(/^\.+/, '');
  }
  
  // Validate extension
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    // Try to detect extension from MIME type
    const mimeType = file.type.toLowerCase();
    if (mimeType.startsWith('image/')) {
      const mimeExt = mimeType.split('/')[1];
      if (allowedExtensions.includes(mimeExt)) {
        fileExt = mimeExt;
      } else if (mimeType === 'image/svg+xml') {
        fileExt = 'svg';
      } else {
        // Default to jpg for generic images
        fileExt = 'jpg';
      }
    } else {
      throw new Error('Tipo de arquivo não permitido. Use apenas imagens: ' + allowedExtensions.join(', '));
    }
  }
  
  // Create safe filename
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

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * validateImageFile function
 * @todo Add proper documentation
 */
export function ValidateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = UPLOAD_LIMITS.IMAGE.MAX_SIZE; // 5MB

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

/**
 * deleteImageFromSupabase function
 * @todo Add proper documentation
 */
export async function deleteImageFromSupabase(
  imageUrl: string,
  supabase: SupabaseClient,
  bucket: string = 'images'
): Promise<boolean> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/storage/v1/object/public/${bucket}/`);
    
    if (pathParts.length < 2) {

      return false;
    }
    
    const filePath = pathParts[1];
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {

      return false;
    }
    
    return true;
  } catch (error) {

    return false;
  }
}