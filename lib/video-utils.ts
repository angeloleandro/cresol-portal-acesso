/**
 * Video utilities - Essential functions only
 */
import {
  VIDEO_THUMBNAIL_CONFIG,
  VIDEO_FILE_CONFIG,
  YOUTUBE_CONFIG
} from '@/lib/constants/video-ui';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

/**
 * extractYouTubeVideoId function
 * @todo Add proper documentation
 */
export function ExtractYouTubeVideoId(url: string): string | null {
  const match = url.match(VIDEO_THUMBNAIL_CONFIG.youtube.urlPattern);
  return match ? match[1] : null;
}

/**
 * getYouTubeThumbnail function
 * @todo Add proper documentation
 */
export function GetYouTubeThumbnail(
  videoId: string, 
  quality: typeof VIDEO_THUMBNAIL_CONFIG.youtube.qualities[number] = VIDEO_THUMBNAIL_CONFIG.youtube.defaultQuality
): string {
  return `${YOUTUBE_CONFIG.thumbnail.baseUrl}/${videoId}/${quality}.jpg`;
}

/**
 * isValidVideoFile function
 * @todo Add proper documentation
 */
export function IsValidVideoFile(file: File): boolean {
  return VIDEO_FILE_CONFIG.supportedMimeTypes.includes(file.type as (typeof VIDEO_FILE_CONFIG.supportedMimeTypes)[number]);
}

/**
 * isValidVideoMimeType function
 * @todo Add proper documentation
 */
export function IsValidVideoMimeType(mimeType: string): boolean {
  return VIDEO_FILE_CONFIG.supportedMimeTypes.includes(mimeType as (typeof VIDEO_FILE_CONFIG.supportedMimeTypes)[number]);
}

/**
 * formatFileSize function
 * @todo Add proper documentation
 */
export function FormatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * resolveVideoUrl function
 * @todo Add proper documentation
 */
export function ResolveVideoUrl(video: { upload_type?: string; file_path?: string | null; video_url?: string }): string {
  if (video.upload_type === 'direct' && video.file_path) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/videos/${video.file_path}`;
  }
  return video.video_url || '';
}

/**
 * getVideoUrl function
 * @todo Add proper documentation
 */
export function GetVideoUrl(video: { upload_type?: string; file_path?: string | null; video_url?: string }): string {
  return ResolveVideoUrl(video);
}

/**
 * checkVideoUrlAccessibility function
 * @todo Add proper documentation
 */
export async function checkVideoUrlAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * getAuthenticatedSession function
 * @todo Add proper documentation
 */
export async function getAuthenticatedSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
      throw new Error('Usuário não autenticado');
  }
  
  return session;
}

/**
 * makeAuthenticatedRequest function
 * @todo Add proper documentation
 */
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