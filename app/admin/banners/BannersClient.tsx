'use client';

import { ComponentType } from 'react';

// Re-export the default component from the page file
// This is a client-side wrapper for dynamic imports
const BannersClient: ComponentType = () => {
  return <div>Banners Management Component</div>;
};

export default BannersClient;