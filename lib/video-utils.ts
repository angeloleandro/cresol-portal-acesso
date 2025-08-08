/**
 * Video utilities - Essential functions only
 */
import { supabase } from '@/lib/supabase';

export function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hqdefault' | 'maxresdefault' = 'hqdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function isValidVideoFile(file: File): boolean {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  return validTypes.includes(file.type);
}

export function isValidVideoMimeType(mimeType: string): boolean {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  return validTypes.includes(mimeType);
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
  console.log('🔐 [VIDEO_UTILS] Obtendo sessão autenticada...');
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('👤 [VIDEO_UTILS] Sessão encontrada:', !!session);
  console.log('❌ [VIDEO_UTILS] Erro de sessão:', error?.message || 'NENHUM');
  
  if (error || !session) {
    console.error('❌ [VIDEO_UTILS] Usuário não autenticado');
    throw new Error('Usuário não autenticado');
  }
  
  console.log('✅ [VIDEO_UTILS] Sessão obtida com sucesso');
  return session;
}

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  console.log('🌐 [VIDEO_UTILS] Fazendo requisição autenticada para:', url);
  console.log('📋 [VIDEO_UTILS] Método:', options.method || 'GET');
  console.log('📋 [VIDEO_UTILS] Body:', options.body || 'NENHUM');
  
  const session = await getAuthenticatedSession();
  
  const requestOptions = {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  console.log('📡 [VIDEO_UTILS] Enviando requisição...');
  const response = await fetch(url, requestOptions);
  console.log('📡 [VIDEO_UTILS] Status da resposta:', response.status);
  console.log('✅ [VIDEO_UTILS] Resposta OK:', response.ok);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [VIDEO_UTILS] Resposta de erro:', errorText);
  }
  
  return response;
}