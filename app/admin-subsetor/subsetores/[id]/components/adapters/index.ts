// Export Generic Content Adapter
export { 
  GenericContentAdapter,
  createContentAdapter,
  createNewsAdapter,
  createEventsAdapter,
  type BaseContentData,
  type NewsContentData,
  type EventContentData,
  type GenericAdapterConfig
} from './GenericContentAdapter';

// Export unified components
export { UnifiedNewsManager } from './UnifiedNewsManager';
export { UnifiedEventsManager } from './UnifiedEventsManager';

// Re-export types for compatibility
export type { NewsContentData as NewsData, EventContentData as EventData } from './GenericContentAdapter';