/**
 * Video utilities - Essential functions only
 */
import { supabase } from '@/lib/supabase';
import {
  VIDEO_THUMBNAIL_CONFIG,
  VIDEO_FILE_CONFIG,
  YOUTUBE_CONFIG
} from '@/lib/constants/video-ui';

export function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(VIDEO_THUMBNAIL_CONFIG.youtube.urlPattern);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(
  videoId: string, 
  quality: typeof VIDEO_THUMBNAIL_CONFIG.youtube.qualities[number] = VIDEO_THUMBNAIL_CONFIG.youtube.defaultQuality
): string {
  return `${YOUTUBE_CONFIG.thumbnail.baseUrl}/${videoId}/${quality}.jpg`;
}

export function isValidVideoFile(file: File): boolean {
  return VIDEO_FILE_CONFIG.supportedMimeTypes.includes(file.type as any);
}

export function isValidVideoMimeType(mimeType: string): boolean {
  return VIDEO_FILE_CONFIG.supportedMimeTypes.includes(mimeType as any);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function resolveVideoUrl(video: any): string {
  if (video.upload_type === 'direct' && video.file_path) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/videos/${video.file_path}`;
  }
  return video.video_url || '';
}

export function getVideoUrl(video: any): string {
  return resolveVideoUrl(video);
}

export async function checkVideoUrlAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getAuthenticatedSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
      throw new Error('Usuário não autenticado');
  }
  
  return session;
}

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const session = await getAuthenticatedSession();
  
  const requestOptions = {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  const response = await fetch(url, requestOptions);
  
  return response;
}