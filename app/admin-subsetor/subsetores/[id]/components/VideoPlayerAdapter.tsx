// Adapter para usar VideoPlayer com SubsectorVideo

import React from 'react';
import { VideoModal } from '@/app/components/VideoGallery/VideoGallery.Modal';
import { DashboardVideo } from '@/app/components/VideoGallery/VideoGallery.types';
import { SubsectorVideo } from '../types/subsector.types';

interface VideoPlayerAdapterProps {
  video: SubsectorVideo | null;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerAdapterProps) {
  if (!video) return null;

  // Converter SubsectorVideo para DashboardVideo
  const dashboardVideo: DashboardVideo = {
    id: video.id,
    title: video.title,
    video_url: video.video_url,
    thumbnail_url: video.thumbnail_url || null,
    is_active: video.is_published,
    order_index: video.order_index,
    upload_type: video.upload_type === 'youtube' ? 'youtube' : 'direct',
    file_path: video.file_path || null,
    file_size: video.file_size || null,
    mime_type: video.mime_type || null,
    original_filename: null,
    processing_status: 'ready',
    upload_progress: 100,
    created_at: video.created_at,
    updated_at: video.updated_at
  };

  return (
    <VideoModal
      isOpen={true}
      onClose={onClose}
      video={dashboardVideo}
    />
  );
}