// Custom TUS Store for Supabase Storage integration
import { DataStore, Upload, Handler } from '@tus/server';
import { supabase } from './supabase';
import { randomUUID } from 'crypto';
import path from 'path';

export interface SupabaseUpload extends Upload {
  bucketPath?: string;
  originalFilename?: string;
  mimeType?: string;
  userId?: string;
}

export class SupabaseStore extends DataStore {
  private bucket: string;
  
  constructor(bucket = 'videos') {
    super();
    this.bucket = bucket;
  }

  async create(upload: SupabaseUpload): Promise<SupabaseUpload> {
    // Generate unique file path with timestamp
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const fileExt = path.extname(upload.originalFilename || '') || '.mp4';
    const fileName = `${randomUUID()}${fileExt}`;
    const bucketPath = `uploads/${timestamp}/${fileName}`;
    
    const uploadData: SupabaseUpload = {
      id: upload.id || randomUUID(),
      size: upload.size || 0,
      offset: 0,
      metadata: {
        ...upload.metadata,
        filename: upload.originalFilename || 'video.mp4',
        filetype: upload.mimeType || 'video/mp4'
      },
      bucketPath,
      originalFilename: upload.originalFilename,
      mimeType: upload.mimeType,
      userId: upload.userId,
      creation_date: new Date().toISOString()
    };

    // Store upload metadata in database
    const { error: dbError } = await supabase
      .from('dashboard_videos')
      .insert({
        id: uploadData.id,
        title: upload.metadata?.title || 'Novo Vídeo',
        video_url: '', // Will be updated when upload completes
        upload_type: 'direct',
        file_path: bucketPath,
        file_size: upload.size,
        mime_type: upload.mimeType,
        original_filename: upload.originalFilename,
        processing_status: 'uploading',
        upload_progress: 0,
        is_active: false // Inactive until upload completes
      });

    if (dbError) {
      throw new Error(`Failed to create upload record: ${dbError.message}`);
    }

    return uploadData;
  }

  async write(
    id: string,
    buffer: Buffer,
    offset: number
  ): Promise<number> {
    // Get upload info from database
    const { data: videoRecord, error: fetchError } = await supabase
      .from('dashboard_videos')
      .select('file_path, file_size, upload_progress')
      .eq('id', id)
      .single();

    if (fetchError || !videoRecord) {
      throw new Error(`Upload ${id} not found`);
    }

    // Calculate new progress
    const newOffset = offset + buffer.length;
    const progress = Math.min(Math.round((newOffset / videoRecord.file_size) * 100), 100);

    // For TUS implementation with Supabase, we need to handle chunks differently
    // Since Supabase Storage doesn't support chunked uploads natively,
    // we'll accumulate chunks in a temporary area and upload when complete
    
    try {
      // Create/update the file in storage
      // Note: This is a simplified approach - in production you might want to:
      // 1. Store chunks in temporary storage
      // 2. Reassemble when complete
      // 3. Or use Supabase's multipart upload when available

      const tempPath = `temp/${id}_${offset}`;
      const { error: uploadError } = await supabase.storage
        .from(this.bucket)
        .upload(tempPath, buffer, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Failed to write chunk: ${uploadError.message}`);
      }

      // Update progress in database
      const { error: updateError } = await supabase
        .from('dashboard_videos')
        .update({
          upload_progress: progress,
          processing_status: progress === 100 ? 'processing' : 'uploading'
        })
        .eq('id', id);

      if (updateError) {
        console.error('Failed to update progress:', updateError);
      }

      return buffer.length;

    } catch (error: any) {
      // Update status to error
      await supabase
        .from('dashboard_videos')
        .update({
          processing_status: 'error'
        })
        .eq('id', id);
      
      throw error;
    }
  }

  async getUpload(id: string): Promise<SupabaseUpload | null> {
    const { data: videoRecord, error } = await supabase
      .from('dashboard_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !videoRecord) {
      return null;
    }

    return {
      id: videoRecord.id,
      size: videoRecord.file_size || 0,
      offset: Math.round((videoRecord.upload_progress / 100) * (videoRecord.file_size || 0)),
      metadata: {
        filename: videoRecord.original_filename || 'video.mp4',
        filetype: videoRecord.mime_type || 'video/mp4',
        title: videoRecord.title
      },
      bucketPath: videoRecord.file_path,
      originalFilename: videoRecord.original_filename,
      mimeType: videoRecord.mime_type,
      creation_date: videoRecord.created_at
    };
  }

  async remove(id: string): Promise<void> {
    // Get file path first
    const { data: videoRecord } = await supabase
      .from('dashboard_videos')
      .select('file_path')
      .eq('id', id)
      .single();

    // Remove from storage if file exists
    if (videoRecord?.file_path) {
      await supabase.storage
        .from(this.bucket)
        .remove([videoRecord.file_path]);
      
      // Also clean up any temp chunks
      const { data: tempFiles } = await supabase.storage
        .from(this.bucket)
        .list(`temp`, {
          search: id
        });

      if (tempFiles && tempFiles.length > 0) {
        const tempPaths = tempFiles.map(file => `temp/${file.name}`);
        await supabase.storage
          .from(this.bucket)
          .remove(tempPaths);
      }
    }

    // Remove from database
    await supabase
      .from('dashboard_videos')
      .delete()
      .eq('id', id);
  }

  async completeUpload(id: string): Promise<void> {
    // Get upload info
    const { data: videoRecord, error: fetchError } = await supabase
      .from('dashboard_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !videoRecord) {
      throw new Error(`Upload ${id} not found`);
    }

    try {
      // Reassemble chunks from temp storage to final file
      // This is a simplified approach - you might want to optimize this
      const { data: tempFiles } = await supabase.storage
        .from(this.bucket)
        .list('temp', {
          search: id
        });

      if (tempFiles && tempFiles.length > 0) {
        // Sort chunks by offset (extracted from filename)
        const sortedChunks = tempFiles.sort((a, b) => {
          const offsetA = parseInt(a.name.split('_')[1]) || 0;
          const offsetB = parseInt(b.name.split('_')[1]) || 0;
          return offsetA - offsetB;
        });

        // Download and combine chunks
        const chunks: Buffer[] = [];
        for (const chunk of sortedChunks) {
          const { data: chunkData } = await supabase.storage
            .from(this.bucket)
            .download(`temp/${chunk.name}`);
          
          if (chunkData) {
            chunks.push(Buffer.from(await chunkData.arrayBuffer()));
          }
        }

        // Combine all chunks
        const finalBuffer = Buffer.concat(chunks);

        // Upload final file
        const { error: finalUploadError } = await supabase.storage
          .from(this.bucket)
          .upload(videoRecord.file_path, finalBuffer, {
            cacheControl: '3600',
            contentType: videoRecord.mime_type || 'video/mp4'
          });

        if (finalUploadError) {
          throw new Error(`Failed to create final file: ${finalUploadError.message}`);
        }

        // Clean up temp files
        const tempPaths = sortedChunks.map(file => `temp/${file.name}`);
        await supabase.storage
          .from(this.bucket)
          .remove(tempPaths);
      }

      // Generate signed URL for the video
      const { data: signedUrl } = await supabase.storage
        .from(this.bucket)
        .createSignedUrl(videoRecord.file_path, 60 * 60 * 24 * 365); // 1 year

      // Update record as completed
      const { error: updateError } = await supabase
        .from('dashboard_videos')
        .update({
          video_url: signedUrl?.signedUrl || '',
          processing_status: 'ready',
          upload_progress: 100,
          is_active: true
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Failed to complete upload: ${updateError.message}`);
      }

    } catch (error: any) {
      // Mark as error
      await supabase
        .from('dashboard_videos')
        .update({
          processing_status: 'error'
        })
        .eq('id', id);
      
      throw error;
    }
  }
}

// Helper function to validate file types
export function validateVideoFile(filename: string, mimeType: string): boolean {
  const allowedTypes = [
    'video/mp4',
    'video/webm', 
    'video/quicktime',
    'video/x-msvideo', // AVI
    'video/mov'
  ];
  
  const allowedExtensions = ['.mp4', '.webm', '.mov', '.avi'];
  const fileExt = path.extname(filename).toLowerCase();
  
  return allowedTypes.includes(mimeType) && allowedExtensions.includes(fileExt);
}

// Helper function to get video metadata
export function getVideoMetadata(upload: any) {
  return {
    filename: upload.metadata?.filename || 'video.mp4',
    filetype: upload.metadata?.filetype || 'video/mp4',
    title: upload.metadata?.title || 'Novo Vídeo',
    size: upload.size || 0
  };
}