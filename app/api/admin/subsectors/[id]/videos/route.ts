import { NextRequest, NextResponse } from 'next/server';

import { CreateClient } from '@/lib/supabase/server';


/**
 * GET function
 * @todo Add proper documentation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subsectorId = params.id;
    const { searchParams } = new URL(request.url);
    const showDrafts = searchParams.get('showDrafts') === 'true';

    const supabase = CreateClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check permissions
    if (profile.role !== 'admin' && profile.role !== 'subsector_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build query for videos
    let query = supabase
      .from('subsector_videos')
      .select('*')
      .eq('subsector_id', subsectorId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (!showDrafts) {
      query = query.eq('is_published', true);
    }

    const { data: videos, error: videosError } = await query;

    if (videosError) {
      console.error('Error fetching videos:', videosError);
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }

    // Get total count of draft videos
    const { count: draftCount, error: countError } = await supabase
      .from('subsector_videos')
      .select('*', { count: 'exact', head: true })
      .eq('subsector_id', subsectorId)
      .eq('is_published', false);

    if (countError) {
      console.error('Error counting draft videos:', countError);
    }

    return NextResponse.json({
      videos: videos || [],
      totalDraftVideosCount: draftCount || 0
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST function
 * @todo Add proper documentation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subsectorId = params.id;
    const body = await request.json();

    const supabase = CreateClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check permissions
    if (profile.role !== 'admin' && profile.role !== 'subsector_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Validate required fields
    if (!body.title || !body.video_url) {
      return NextResponse.json({ error: 'Title and video URL are required' }, { status: 400 });
    }

    // Extract YouTube thumbnail if it's a YouTube video
    let thumbnailUrl = body.thumbnail_url;
    if (body.upload_type === 'youtube' && body.video_url) {
      try {
        const url = new URL(body.video_url);
        let videoId = '';
        
        if (url.hostname === 'youtu.be') {
          videoId = url.pathname.slice(1);
        } else if (url.hostname.includes('youtube.com')) {
          videoId = url.searchParams.get('v') || '';
        }
        
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } catch (e) {
        console.error('Error parsing YouTube URL:', e);
      }
    }

    // Get the highest order_index
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('subsector_videos')
      .select('order_index')
      .eq('subsector_id', subsectorId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = maxOrderError ? 0 : (maxOrderData?.order_index || 0) + 1;

    // Insert video
    const { data: video, error: insertError } = await supabase
      .from('subsector_videos')
      .insert({
        subsector_id: subsectorId,
        title: body.title,
        description: body.description || null,
        video_url: body.video_url,
        thumbnail_url: thumbnailUrl,
        thumbnail_timestamp: body.thumbnail_timestamp || null,
        upload_type: body.upload_type || 'youtube',
        file_path: body.file_path || null,
        file_size: body.file_size || null,
        mime_type: body.mime_type || null,
        duration: body.duration || null,
        order_index: nextOrderIndex,
        is_published: body.is_published || false,
        is_featured: body.is_featured || false,
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting video:', insertError);
      return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/subsectors/[id]/videos - Update video
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subsectorId = params.id;
    const body = await request.json();
    
    const supabase = CreateClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    // Check permissions
    if (profile.role !== 'admin' && profile.role !== 'subsector_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Validate required fields
    if (!body.id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }
    
    // If featured, unfeatured others
    if (body.is_featured) {
      await supabase
        .from('subsector_videos')
        .update({ is_featured: false })
        .eq('subsector_id', subsectorId)
        .neq('id', body.id);
    }
    
    // Update video
    const { data: video, error: updateError } = await supabase
      .from('subsector_videos')
      .update({
        title: body.title,
        description: body.description,
        video_url: body.video_url,
        thumbnail_url: body.thumbnail_url,
        thumbnail_timestamp: body.thumbnail_timestamp,
        is_published: body.is_published,
        is_featured: body.is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .eq('subsector_id', subsectorId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating video:', updateError);
      return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
    }
    
    return NextResponse.json(video);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}