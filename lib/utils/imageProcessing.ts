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
 * Crops an image using HTML5 Canvas with robust error handling
 * @param imageSrc - Source image URL or data URL
 * @param pixelCrop - Crop area in pixels
 * @param rotation - Rotation angle in degrees (default: 0)
 * @returns Promise with cropped image blob and object URL
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0
): Promise<{ file: Blob; url: string }> {
  // Validate inputs
  if (!imageSrc || typeof imageSrc !== 'string') {
    throw new Error('Invalid image source provided');
  }

  if (!pixelCrop || pixelCrop.width <= 0 || pixelCrop.height <= 0) {
    throw new Error('Invalid crop area: width and height must be positive');
  }

  // Validate rotation value
  if (typeof rotation !== 'number' || isNaN(rotation)) {
    console.warn('Invalid rotation value, using 0 degrees');
    rotation = 0;
  }

  console.log('Starting image crop process...', { pixelCrop, rotation });

  const image = await createImage(imageSrc);
  
  // Validate loaded image
  if (!image.width || !image.height) {
    throw new Error('Invalid image: no dimensions detected');
  }

  console.log('Image loaded successfully', { width: image.width, height: image.height });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Failed to get 2d rendering context from canvas');
  }

  // Set canvas dimensions to crop area (ensure they are valid)
  const cropWidth = Math.max(1, Math.floor(pixelCrop.width));
  const cropHeight = Math.max(1, Math.floor(pixelCrop.height));
  
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  console.log('Canvas configured', { width: cropWidth, height: cropHeight });

  try {
    // Clear canvas with white background for better JPEG compression
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cropWidth, cropHeight);

    // Save context state before transformations
    ctx.save();

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(cropWidth / 2, cropHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cropWidth / 2, -cropHeight / 2);
    }

    // Draw cropped image to canvas with bounds checking
    const sourceX = Math.max(0, Math.floor(pixelCrop.x));
    const sourceY = Math.max(0, Math.floor(pixelCrop.y));
    const sourceWidth = Math.min(pixelCrop.width, image.width - sourceX);
    const sourceHeight = Math.min(pixelCrop.height, image.height - sourceY);

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Restore context state
    ctx.restore();

    console.log('Image drawn to canvas successfully');
  } catch (drawError) {
    console.error('Error drawing image to canvas:', drawError);
    throw new Error(`Failed to draw image to canvas: ${drawError instanceof Error ? drawError.message : 'Unknown error'}`);
  }

  // Create blob from canvas with timeout
  return new Promise((resolve, reject) => {
    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      reject(new Error('Canvas to blob conversion timed out'));
    }, 15000);

    canvas.toBlob((blob) => {
      clearTimeout(timeoutId);
      
      if (!blob) {
        reject(new Error('Canvas is empty or failed to generate blob'));
        return;
      }

      // Validate blob size
      if (blob.size === 0) {
        reject(new Error('Generated blob is empty'));
        return;
      }

      console.log('Crop completed successfully', { blobSize: blob.size });
      
      try {
        const url = URL.createObjectURL(blob);
        resolve({ file: blob, url });
      } catch (urlError) {
        reject(new Error('Failed to create object URL from blob'));
      }
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