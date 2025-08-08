/**
 * VideoGallery Component - Modernized
 * Enterprise-grade video gallery with modular architecture
 */

"use client";

import { VideoGalleryRoot } from './VideoGallery/';

/**
 * Main VideoGallery Component
 * 
 * This component now uses the new modular VideoGallery system
 * with enhanced features, accessibility, and performance optimizations.
 */
interface VideoGalleryProps {
  limit?: number;
}

export default function VideoGallery({ limit = 4 }: VideoGalleryProps) {
  return (
    <VideoGalleryRoot 
      limit={limit}
      showHeader={true}
      showSeeAll={true}
      className="card"
    />
  );
}