'use client';

import { forwardRef } from 'react';

interface AnnouncementRegionProps {
  className?: string;
}

const AnnouncementRegion = forwardRef<HTMLDivElement, AnnouncementRegionProps>(
  ({ className = 'sr-only' }, ref) => (
    <div
      ref={ref}
      className={className}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    />
  )
);

AnnouncementRegion.displayName = 'AnnouncementRegion';

export default AnnouncementRegion;