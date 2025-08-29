'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

import { Icon } from '../icons/Icon';
import { VideoThumbnail } from '../VideoThumbnail/VideoThumbnail';
import UnifiedLoadingSpinner from '../ui/UnifiedLoadingSpinner';
import { FormatDate } from '@/lib/utils/formatters';

interface SectorVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  thumbnail_timestamp?: number;
  upload_type: 'youtube' | 'direct';
  created_at: string;
}

interface SectorVideosProps {
  sectorId: string;
  limit?: number;
}

export default function SectorVideos({ sectorId, limit = 4 }: SectorVideosProps) {
  const [videos, setVideos] = useState<SectorVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('sector_videos')
          .select('id, title, description, video_url, thumbnail_url, thumbnail_timestamp, upload_type, created_at')
          .eq('sector_id', sectorId)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) {
          setVideos([]);
          return;
        }
        
        setVideos(data || []);
      } catch (error) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [sectorId, limit]);

  const getVideoTypeIcon = (uploadType: string) => {
    if (uploadType === 'youtube') {
      return <Icon name="video" className="h-4 w-4 text-red-600" />;
    }
    return <Icon name="video" className="h-4 w-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <section className="bg-white rounded-md border border-cresol-gray-light">
        <div className="p-6">
          <UnifiedLoadingSpinner message="Carregando vídeos..." />
        </div>
      </section>
    );
  }

  return (
    <section 
      className="bg-white rounded-md border border-cresol-gray-light"
      aria-labelledby="sector-videos-heading"
    >
      <div className="p-6 border-b border-cresol-gray-light">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Icon name="play" className="h-5 w-5 text-primary mr-2" aria-hidden="true" />
            <h2 id="sector-videos-heading" className="text-xl font-semibold text-cresol-gray-dark">
              Vídeos
            </h2>
          </div>
          {videos.length > 0 && (
            <Link 
              href={`/setores/${sectorId}/videos`}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Ver todos
            </Link>
          )}
        </div>
      </div>
      <div className="p-6">
        {videos.length === 0 ? (
          <div className="text-center py-8" role="status">
            <p className="text-cresol-gray">
              Nenhum vídeo publicado ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label="Lista de vídeos">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="border border-cresol-gray-light rounded-lg overflow-hidden hover:border-card-hover transition-colors cursor-pointer"
                role="listitem"
                aria-labelledby={`video-title-${index}`}
              >
                <div className="aspect-video relative">
                  <VideoThumbnail
                    video={{
                      id: video.id,
                      title: video.title,
                      video_url: video.video_url,
                      thumbnail_url: video.thumbnail_url || null,
                      thumbnail_timestamp: video.thumbnail_timestamp || null,
                      upload_type: video.upload_type,
                      is_active: true,
                      order_index: 0,
                      created_at: video.created_at
                    }}
                    variant="card"
                    aspectRatio="16/9"
                    priority={index < 2}
                    showOverlay={true}
                    showBadge={true}
                    showDuration={video.upload_type === 'direct'}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    quality={85}
                    placeholder={{
                      variant: 'gradient',
                      gradient: {
                        from: '#F58220',
                        to: '#005C46',
                        direction: 'diagonal-tl'
                      },
                      icon: {
                        name: 'video',
                        size: 'md',
                        animated: true
                      },
                      text: video.upload_type === 'youtube' ? 'YouTube' : 'Vídeo',
                      animated: true
                    }}
                    overlay={{
                      variant: 'hover',
                      opacity: 0.2,
                      gradient: true
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-white bg-opacity-90 rounded-full p-3">
                      <Icon name="play" className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      id={`video-title-${index}`}
                      className="font-semibold text-cresol-gray-dark text-sm line-clamp-2 flex-1"
                    >
                      {video.title}
                    </h3>
                    <div className="flex-shrink-0 ml-2">
                      {getVideoTypeIcon(video.upload_type)}
                    </div>
                  </div>
                  {video.description && (
                    <p className="text-cresol-gray text-xs mb-2 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-cresol-gray">
                    <Icon name="clock" className="h-3 w-3 mr-1" aria-hidden="true" />
                    <time dateTime={video.created_at}>
                      {FormatDate(video.created_at)}
                    </time>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}