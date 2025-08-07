// TUS Upload API for Direct Video Upload
import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@tus/server';
import { SupabaseStore, validateVideoFile, getVideoMetadata } from '@/lib/tus-supabase-store';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize TUS server with custom Supabase store
const tusServer = new Server({
  path: '/api/videos/upload',
  datastore: new SupabaseStore('videos'),
  // Allow uploads up to 5GB
  maxSize: 5 * 1024 * 1024 * 1024,
  // Allow chunked uploads for better reliability
  extensions: ['creation', 'creation-with-upload', 'termination'],
  onUploadCreate: async (req, res, upload) => {
    // Verify user authentication and admin role
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new Error('Authentication required');
    }

    const token = authorization.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    // Validate file type
    const metadata = getVideoMetadata(upload);
    if (!validateVideoFile(metadata.filename, metadata.filetype)) {
      throw new Error('Invalid file type. Only MP4, WebM, MOV, and AVI files are allowed.');
    }

    // Check file size (max 5GB)
    if (upload.size > 5 * 1024 * 1024 * 1024) {
      throw new Error('File size exceeds 5GB limit');
    }

    // Add user ID to upload for tracking
    (upload as any).userId = user.id;
    (upload as any).originalFilename = metadata.filename;
    (upload as any).mimeType = metadata.filetype;

    console.log(`Starting upload: ${upload.id} - ${metadata.filename} (${metadata.size} bytes)`);
  },

  onUploadProgress: async (req, res, upload) => {
    const progress = Math.round((upload.offset / upload.size) * 100);
    console.log(`Upload progress: ${upload.id} - ${progress}% (${upload.offset}/${upload.size})`);
  },

  onUploadFinish: async (req, res, upload) => {
    console.log(`Upload completed: ${upload.id}`);
    
    // Complete the upload in our custom store
    const store = tusServer.datastore as SupabaseStore;
    await store.completeUpload(upload.id);
    
    console.log(`Upload finalized: ${upload.id}`);
  }
});

// Handle all TUS methods
export async function POST(request: NextRequest) {
  return handleTusRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleTusRequest(request);
}

export async function HEAD(request: NextRequest) {
  return handleTusRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleTusRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  // Handle CORS preflight
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PATCH, HEAD, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Upload-Length, Upload-Offset, Tus-Resumable, Upload-Metadata',
      'Access-Control-Expose-Headers': 'Upload-Offset, Location, Upload-Length, Tus-Version, Tus-Resumable, Tus-Max-Size, Tus-Extension, Upload-Metadata',
      'Access-Control-Max-Age': '86400'
    }
  });
}

async function handleTusRequest(request: NextRequest): Promise<NextResponse> {
  try {
    // Convert NextRequest to Node.js compatible request
    const req = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body,
      pipe: (stream: any) => {
        // For Node.js compatibility
        if (request.body) {
          const reader = request.body.getReader();
          const pump = async () => {
            const { done, value } = await reader.read();
            if (done) {
              stream.end();
            } else {
              stream.write(Buffer.from(value));
              pump();
            }
          };
          pump().catch(console.error);
        }
      },
      on: () => {}, // Mock event handler
      once: () => {}, // Mock event handler
    };

    // Create a mock response object
    let responseBody = Buffer.alloc(0);
    let statusCode = 200;
    let responseHeaders: Record<string, string> = {};

    const res = {
      statusCode,
      setHeader: (key: string, value: string) => {
        responseHeaders[key] = value;
      },
      getHeader: (key: string) => responseHeaders[key],
      writeHead: (code: number, headers?: Record<string, string>) => {
        statusCode = code;
        if (headers) {
          responseHeaders = { ...responseHeaders, ...headers };
        }
      },
      write: (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        responseBody = Buffer.concat([responseBody, buffer]);
      },
      end: (chunk?: Buffer | string) => {
        if (chunk) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          responseBody = Buffer.concat([responseBody, buffer]);
        }
      },
      on: () => {}, // Mock event handler
      once: () => {}, // Mock event handler
    };

    // Add CORS headers
    responseHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PATCH, HEAD, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Upload-Length, Upload-Offset, Tus-Resumable, Upload-Metadata',
      'Access-Control-Expose-Headers': 'Upload-Offset, Location, Upload-Length, Tus-Version, Tus-Resumable, Tus-Max-Size, Tus-Extension, Upload-Metadata',
      ...responseHeaders
    };

    // Handle the request through TUS server
    await new Promise<void>((resolve, reject) => {
      tusServer.handle(req as any, res as any, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Return the response
    return new NextResponse(responseBody, {
      status: statusCode,
      headers: responseHeaders
    });

  } catch (error: any) {
    console.error('TUS upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, PATCH, HEAD, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Upload-Length, Upload-Offset, Tus-Resumable, Upload-Metadata',
        }
      }
    );
  }
}

// Helper endpoint to get upload status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('id');
    
    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID required' }, { status: 400 });
    }

    // Get upload status from database
    const { data: videoRecord, error } = await supabaseAdmin
      .from('dashboard_videos')
      .select('id, title, processing_status, upload_progress, file_size, mime_type, created_at')
      .eq('id', uploadId)
      .single();

    if (error || !videoRecord) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: videoRecord.id,
      title: videoRecord.title,
      status: videoRecord.processing_status,
      progress: videoRecord.upload_progress,
      size: videoRecord.file_size,
      mimeType: videoRecord.mime_type,
      createdAt: videoRecord.created_at
    });

  } catch (error: any) {
    console.error('Get upload status error:', error);
    return NextResponse.json(
      { error: 'Failed to get upload status', message: error.message },
      { status: 500 }
    );
  }
}