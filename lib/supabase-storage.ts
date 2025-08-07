/**
 * Supabase Storage utilities for video thumbnails
 */

import { supabase } from "./supabase";

export const STORAGE_BUCKETS = {
  videos: 'videos',
  banners: 'banners'
} as const;

/**
 * Ensures the videos bucket exists for thumbnail storage
 */
export async function ensureVideosBucket(): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const videosBucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKETS.videos);
    
    if (!videosBucketExists) {
      // Create videos bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKETS.videos, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });
      
      if (error) {
        console.error('Failed to create videos bucket:', error);
        return false;
      }
      
      console.log('Videos bucket created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking/creating videos bucket:', error);
    return false;
  }
}

/**
 * Upload thumbnail to storage with proper error handling
 */
export async function uploadThumbnailWithFallback(
  thumbnailBlob: Blob,
  videoFileName: string,
  preferredBucket: string = STORAGE_BUCKETS.videos
): Promise<string> {
  // Generate unique filename
  const timestamp = Date.now();
  const thumbnailName = `${videoFileName.replace(/\.[^/.]+$/, '')}_thumbnail_${timestamp}.jpg`;
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const thumbnailPath = `thumbnails/${year}/${month}/${thumbnailName}`;
  
  try {
    // First try to upload to preferred bucket (videos)
    let { error: uploadError } = await supabase.storage
      .from(preferredBucket)
      .upload(thumbnailPath, thumbnailBlob, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    let usedBucket = preferredBucket;
    
    // If videos bucket doesn't exist or fails, try banners bucket as fallback
    if (uploadError && preferredBucket === STORAGE_BUCKETS.videos) {
      console.warn('Failed to upload to videos bucket, trying banners bucket:', uploadError);
      
      const { error: fallbackError } = await supabase.storage
        .from(STORAGE_BUCKETS.banners)
        .upload(thumbnailPath, thumbnailBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });
        
      if (fallbackError) {
        throw new Error(`Upload failed to both buckets: ${fallbackError.message}`);
      }
      
      usedBucket = STORAGE_BUCKETS.banners;
    } else if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(usedBucket)
      .getPublicUrl(thumbnailPath);
      
    return publicUrl;
    
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    throw error;
  }
}

/**
 * List storage buckets for debugging
 */
export async function listStorageBuckets(): Promise<string[]> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    return buckets?.map(bucket => bucket.name) || [];
  } catch (error) {
    console.error('Error listing buckets:', error);
    return [];
  }
}

/**
 * Check if bucket has proper permissions for public access
 */
export async function checkBucketPermissions(bucketName: string): Promise<boolean> {
  try {
    // Try to list files - if it fails, bucket might not be public
    const { error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
      
    return !error;
  } catch (error) {
    console.error(`Error checking ${bucketName} permissions:`, error);
    return false;
  }
}