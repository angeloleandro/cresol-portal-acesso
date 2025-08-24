

"use client";

import HomeVideoGallery from './HomeVideoGallery';
import { VideoGalleryRoot } from './VideoGallery/';

interface VideoGalleryProps {
  limit?: number;
}

export default function VideoGallery({ limit = 3 }: VideoGalleryProps) {
  // Use HomeVideoGallery for home page (limit=3 or less)
  if (limit <= 3) {
    return (
      <HomeVideoGallery 
        className="card"
      />
    );
  }
  
  // Use full VideoGalleryRoot for other pages
  return (
    <VideoGalleryRoot 
      limit={limit}
      showHeader={true}
      showSeeAll={true}
      className="card"
    />
  );
}