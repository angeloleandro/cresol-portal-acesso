/**
 * Video Service - Business Logic Layer
 * 
 * @deprecated This service layer is not used by the standardized video deletion system.
 * The project follows a simpler pattern where API routes handle operations directly.
 * This file is kept for reference and potential future advanced features.
 * 
 * Current standard pattern:
 * - Direct API route operations (see /api/admin/gallery, /api/admin/banners)
 * - Simple session-based authentication
 * - Direct Supabase client usage
 * - Simple error handling with try-catch
 */

import { createAdminSupabaseClient } from '@/lib/auth';
import { ApiError, createErrorContext } from '@/lib/error-handling';

export interface VideoRecord {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number;
  upload_type: 'youtube' | 'vimeo' | 'direct';
  file_path?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  original_filename?: string | null;
  processing_status?: string;
  upload_progress?: number;
}

export interface DeleteVideoRequest {
  videoId: string;
  userId: string;
}

export interface DeleteVideoResult {
  success: boolean;
  message: string;
  deletedFiles: string[];
}

/**
 * Video Service Class - Encapsulates all video operations
 */
export class VideoService {
  private adminClient = createAdminSupabaseClient();

  /**
   * Validate that user has admin privileges
   */
  async validateAdminAccess(userId: string): Promise<void> {
    console.log('🔍 [VIDEO_SERVICE] Validando acesso admin para usuário:', userId);
    
    const { data: profile, error: profileError } = await this.adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    console.log('👤 [VIDEO_SERVICE] Perfil encontrado:', !!profile);
    console.log('🎭 [VIDEO_SERVICE] Role do usuário:', profile?.role);
    console.log('❌ [VIDEO_SERVICE] Erro de perfil:', profileError?.message || 'NENHUM');

    if (profileError) {
      throw new ApiError(
        'Erro ao validar permissões do usuário',
        createErrorContext('VALIDATE_ADMIN_ACCESS', `user:${userId}`, { userId }),
        403,
        profileError
      );
    }

    if (profile?.role !== 'admin') {
      throw new ApiError(
        'Acesso negado - privilégios administrativos necessários',
        createErrorContext('VALIDATE_ADMIN_ACCESS', `user:${userId}`, { userId, role: profile?.role }),
        403
      );
    }

    console.log('✅ [VIDEO_SERVICE] Acesso admin validado');
  }

  /**
   * Find video by ID with comprehensive error handling
   */
  async findVideoById(videoId: string): Promise<VideoRecord> {
    console.log('🔍 [VIDEO_SERVICE] Buscando vídeo:', videoId);
    
    const { data: video, error: fetchError } = await this.adminClient
      .from('dashboard_videos')
      .select('*')
      .eq('id', videoId)
      .single();
    
    console.log('🎬 [VIDEO_SERVICE] Vídeo encontrado:', !!video);
    console.log('🎬 [VIDEO_SERVICE] Dados do vídeo:', video ? { 
      title: video.title, 
      upload_type: video.upload_type, 
      file_path: video.file_path 
    } : 'NENHUM');
    console.log('❌ [VIDEO_SERVICE] Erro de busca:', fetchError?.message || 'NENHUM');
    console.log('📊 [VIDEO_SERVICE] Código do erro:', fetchError?.code || 'NENHUM');

    if (fetchError) {
      if (fetchError.code === 'PGRST116' || fetchError.message?.includes('No rows returned')) {
        throw new ApiError(
          'Vídeo não encontrado',
          createErrorContext('FIND_VIDEO', `video:${videoId}`, { videoId }),
          404,
          fetchError
        );
      }
      
      throw new ApiError(
        'Erro ao buscar vídeo',
        createErrorContext('FIND_VIDEO', `video:${videoId}`, { videoId }),
        500,
        fetchError
      );
    }

    if (!video) {
      throw new ApiError(
        'Vídeo não encontrado',
        createErrorContext('FIND_VIDEO', `video:${videoId}`, { videoId }),
        404
      );
    }

    console.log('✅ [VIDEO_SERVICE] Vídeo encontrado com sucesso');
    return video;
  }

  /**
   * Clean up storage files associated with video
   */
  async cleanupVideoFiles(video: VideoRecord): Promise<string[]> {
    const deletedFiles: string[] = [];
    console.log('🗂️ [VIDEO_SERVICE] Iniciando limpeza de arquivos...');

    // Clean up direct upload files
    if (video.upload_type === 'direct' && video.file_path) {
      console.log('📁 [VIDEO_SERVICE] Removendo arquivo principal:', video.file_path);
      
      const { error: videoDeleteError } = await this.adminClient.storage
        .from('videos')
        .remove([video.file_path]);
      
      if (videoDeleteError) {
        console.log('⚠️ [VIDEO_SERVICE] Erro ao remover arquivo principal:', videoDeleteError.message);
        // Don't throw error for storage cleanup failures - log and continue
      } else {
        deletedFiles.push(video.file_path);
        console.log('✅ [VIDEO_SERVICE] Arquivo principal removido');
      }
      
      // Clean up temporary files
      console.log('🔍 [VIDEO_SERVICE] Buscando arquivos temporários...');
      const { data: tempFiles } = await this.adminClient.storage
        .from('videos')
        .list('temp', {
          search: video.id
        });
      
      console.log('📁 [VIDEO_SERVICE] Arquivos temporários encontrados:', tempFiles?.length || 0);

      if (tempFiles && tempFiles.length > 0) {
        const tempPaths = tempFiles.map(file => `temp/${file.name}`);
        console.log('🗑️ [VIDEO_SERVICE] Removendo arquivos temporários:', tempPaths);
        
        const { error: tempDeleteError } = await this.adminClient.storage
          .from('videos')
          .remove(tempPaths);
        
        if (tempDeleteError) {
          console.log('⚠️ [VIDEO_SERVICE] Erro ao remover temporários:', tempDeleteError.message);
        } else {
          deletedFiles.push(...tempPaths);
          console.log('✅ [VIDEO_SERVICE] Arquivos temporários removidos');
        }
      }
    } else {
      console.log('ℹ️ [VIDEO_SERVICE] Não há arquivos para remover (upload_type: ' + video.upload_type + ')');
    }

    // Clean up thumbnail if stored in Supabase
    if (video.thumbnail_url && video.thumbnail_url.includes('supabase')) {
      const thumbnailPath = video.thumbnail_url.split('/').pop();
      console.log('🖼️ [VIDEO_SERVICE] Removendo thumbnail:', thumbnailPath);
      
      if (thumbnailPath) {
        const { error: thumbnailDeleteError } = await this.adminClient.storage
          .from('banners')
          .remove([thumbnailPath]);
        
        if (thumbnailDeleteError) {
          console.log('⚠️ [VIDEO_SERVICE] Erro ao remover thumbnail:', thumbnailDeleteError.message);
        } else {
          deletedFiles.push(thumbnailPath);
          console.log('✅ [VIDEO_SERVICE] Thumbnail removido');
        }
      }
    } else {
      console.log('ℹ️ [VIDEO_SERVICE] Não há thumbnail do Supabase para remover');
    }

    console.log('✅ [VIDEO_SERVICE] Limpeza de arquivos concluída:', deletedFiles);
    return deletedFiles;
  }

  /**
   * Delete video record from database
   */
  async deleteVideoRecord(videoId: string): Promise<void> {
    console.log('🗑️ [VIDEO_SERVICE] Removendo registro do banco de dados:', videoId);
    
    const { error: deleteError } = await this.adminClient
      .from('dashboard_videos')
      .delete()
      .eq('id', videoId);
    
    console.log('❌ [VIDEO_SERVICE] Erro ao excluir do banco:', deleteError?.message || 'NENHUM');
    console.log('📊 [VIDEO_SERVICE] Código do erro de exclusão:', deleteError?.code || 'NENHUM');

    if (deleteError) {
      throw new ApiError(
        'Erro ao excluir vídeo do banco de dados',
        createErrorContext('DELETE_VIDEO_RECORD', `video:${videoId}`, { videoId }),
        500,
        deleteError
      );
    }

    console.log('✅ [VIDEO_SERVICE] Registro removido do banco de dados');
  }

  /**
   * Complete video deletion workflow
   */
  async deleteVideo(request: DeleteVideoRequest): Promise<DeleteVideoResult> {
    const { videoId, userId } = request;
    console.log('🔍 [VIDEO_SERVICE] Iniciando exclusão de vídeo:', { videoId, userId });

    // Step 1: Validate admin access
    await this.validateAdminAccess(userId);

    // Step 2: Find and validate video exists
    const video = await this.findVideoById(videoId);

    // Step 3: Clean up associated files
    const deletedFiles = await this.cleanupVideoFiles(video);

    // Step 4: Delete video record from database
    await this.deleteVideoRecord(videoId);

    const result: DeleteVideoResult = {
      success: true,
      message: 'Vídeo excluído com sucesso',
      deletedFiles
    };

    console.log('✅ [VIDEO_SERVICE] Exclusão concluída com sucesso:', result);
    return result;
  }
}

// Export singleton instance
export const videoService = new VideoService();