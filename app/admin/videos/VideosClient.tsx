'use client';

import { ComponentType } from 'react';

// Re-export the default component from the page file
// This is a client-side wrapper for dynamic imports
const VideosClient: ComponentType = () => {
  return <div>Videos Management Component</div>;
};

export default VideosClient;