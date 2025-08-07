// Simple Video Upload API for smaller files (< 500MB)
// Fallback option alongside TUS for better compatibility
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import path from 'path';

// Initialize Supabase with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Allowed video file types and extensions
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo', // AVI
  'video/mov'
];

const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB for simple upload

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const title = formData.get('title') as string || 'Novo Vídeo';
    const isActive = formData.get('isActive') === 'true';
    const orderIndex = parseInt(formData.get('orderIndex') as string) || 0;

    if (!file) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_VIDEO_TYPES.includes(file.type) || !ALLOWED_VIDEO_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type', 
          message: 'Only MP4, WebM, MOV, and AVI files are allowed',
          allowedTypes: ALLOWED_VIDEO_EXTENSIONS
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          maxSize: MAX_FILE_SIZE
        },
        { status: 413 }
      );
    }

    // Generate unique file path
    const videoId = randomUUID();
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${videoId}_${safeFileName}`;
    const filePath = `uploads/${timestamp}/${fileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('videos')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { 
          error: 'Upload failed', 
          message: uploadError.message 
        },
        { status: 500 }
      );
    }

    // Generate signed URL for video access (1 year expiry)
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from('videos')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

    if (urlError) {
      console.error('Signed URL error:', urlError);
      // Cleanup uploaded file
      await supabaseAdmin.storage.from('videos').remove([filePath]);
      
      return NextResponse.json(
        { 
          error: 'Failed to generate video URL', 
          message: urlError.message 
        },
        { status: 500 }
      );
    }

    // Save video record to database
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from('dashboard_videos')
      .insert({
        id: videoId,
        title,
        video_url: signedUrlData.signedUrl,
        upload_type: 'direct',
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        original_filename: file.name,
        processing_status: 'ready',
        upload_progress: 100,
        is_active: isActive,
        order_index: orderIndex
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Cleanup uploaded file
      await supabaseAdmin.storage.from('videos').remove([filePath]);
      
      return NextResponse.json(
        { 
          error: 'Failed to save video record', 
          message: dbError.message 
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        id: videoRecord.id,
        title: videoRecord.title,
        url: videoRecord.video_url,
        uploadType: videoRecord.upload_type,
        fileName: videoRecord.original_filename,
        fileSize: videoRecord.file_size,
        mimeType: videoRecord.mime_type,
        status: videoRecord.processing_status,
        isActive: videoRecord.is_active,
        orderIndex: videoRecord.order_index,
        createdAt: videoRecord.created_at
      }
    });

  } catch (error: any) {
    console.error('Simple upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Get upload limits and allowed types
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: Math.round(MAX_FILE_SIZE / (1024 * 1024)),
    allowedTypes: ALLOWED_VIDEO_TYPES,
    allowedExtensions: ALLOWED_VIDEO_EXTENSIONS,
    uploadMethods: {
      simple: {
        maxSize: MAX_FILE_SIZE,
        description: 'Direct upload for files under 500MB'
      },
      tus: {
        maxSize: 5 * 1024 * 1024 * 1024,
        description: 'Resumable upload for large files up to 5GB'
      }
    }
  });
}