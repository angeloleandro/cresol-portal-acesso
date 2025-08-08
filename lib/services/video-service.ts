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
    const { data: profile, error: profileError } = await this.adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    

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

  }

  /**
   * Find video by ID with comprehensive error handling
   */
  async findVideoById(videoId: string): Promise<VideoRecord> {
    const { data: video, error: fetchError } = await this.adminClient
      .from('dashboard_videos')
      .select('*')
      .eq('id', videoId)
      .single();
    

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

    return video;
  }

  /**
   * Clean up storage files associated with video
   */
  async cleanupVideoFiles(video: VideoRecord): Promise<string[]> {
    const deletedFiles: string[] = [];

    // Clean up direct upload files
    if (video.upload_type === 'direct' && video.file_path) {
      const { error: videoDeleteError } = await this.adminClient.storage
        .from('videos')
        .remove([video.file_path]);
      
      if (videoDeleteError) {
        // Don't throw error for storage cleanup failures - continue
      } else {
        deletedFiles.push(video.file_path);
      }
      
      // Clean up temporary files
      const { data: tempFiles } = await this.adminClient.storage
        .from('videos')
        .list('temp', {
          search: video.id
        });

      if (tempFiles && tempFiles.length > 0) {
        const tempPaths = tempFiles.map(file => `temp/${file.name}`);
        const { error: tempDeleteError } = await this.adminClient.storage
          .from('videos')
          .remove(tempPaths);
        
        if (tempDeleteError) {
          // Error removing temporary files - continue
        } else {
          deletedFiles.push(...tempPaths);
        }
      }
    } else {
    }

    // Clean up thumbnail if stored in Supabase
    if (video.thumbnail_url && video.thumbnail_url.includes('supabase')) {
      const thumbnailPath = video.thumbnail_url.split('/').pop();
      if (thumbnailPath) {
        const { error: thumbnailDeleteError } = await this.adminClient.storage
          .from('banners')
          .remove([thumbnailPath]);
        
        if (thumbnailDeleteError) {
          // Error removing thumbnail - continue
        } else {
          deletedFiles.push(thumbnailPath);
        }
      }
    } else {
    }

    return deletedFiles;
  }

  /**
   * Delete video record from database
   */
  async deleteVideoRecord(videoId: string): Promise<void> {
    const { error: deleteError } = await this.adminClient
      .from('dashboard_videos')
      .delete()
      .eq('id', videoId);
    

    if (deleteError) {
      throw new ApiError(
        'Erro ao excluir vídeo do banco de dados',
        createErrorContext('DELETE_VIDEO_RECORD', `video:${videoId}`, { videoId }),
        500,
        deleteError
      );
    }

  }

  /**
   * Complete video deletion workflow
   */
  async deleteVideo(request: DeleteVideoRequest): Promise<DeleteVideoResult> {
    const { videoId, userId } = request;

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

    return result;
  }
}

// Export singleton instance
export const videoService = new VideoService();