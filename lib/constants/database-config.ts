/**
 * Database Configuration Constants
 * Centralizes all database table and column names
 */

// Table Names
export const TABLES = {
  // Sector tables
  SECTORS: 'sectors',
  SECTOR_NEWS: 'sector_news',
  SECTOR_EVENTS: 'sector_events',
  SECTOR_ADMINS: 'sector_admins',
  
  // Subsector tables
  SUBSECTORS: 'subsectors',
  SUBSECTOR_NEWS: 'subsector_news',
  SUBSECTOR_EVENTS: 'subsector_events',
  SUBSECTOR_SYSTEMS: 'subsector_systems',
  SUBSECTOR_MEMBERS: 'subsector_members',
  
  // User tables
  PROFILES: 'profiles',
  ACCESS_REQUESTS: 'access_requests',
  
  // System tables
  SYSTEMS: 'systems',
  NOTIFICATIONS: 'notifications',
  GALLERY_IMAGES: 'gallery_images',
  VIDEOS: 'videos',
  BANNERS: 'banners',
  ECONOMIC_INDICATORS: 'economic_indicators',
  DASHBOARD_VIDEOS: 'dashboard_videos',
  COLLECTIONS: 'collections',
  COLLECTION_VIDEOS: 'collection_videos',
  
  // Message system tables
  MESSAGE_GROUPS: 'message_groups',
  SECTOR_MESSAGES: 'sector_messages',
  SUBSECTOR_MESSAGES: 'subsector_messages',
} as const;

// Column Names
export const COLUMNS = {
  // Common columns
  ID: 'id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  CREATED_BY: 'created_by',
  
  // Relationship columns
  SECTOR_ID: 'sector_id',
  SUBSECTOR_ID: 'subsector_id',
  USER_ID: 'user_id',
  
  // Content columns
  TITLE: 'title',
  DESCRIPTION: 'description',
  CONTENT: 'content',
  SUMMARY: 'summary',
  IMAGE_URL: 'image_url',
  
  // Status columns
  IS_PUBLISHED: 'is_published',
  IS_FEATURED: 'is_featured',
  IS_ACTIVE: 'is_active',
  ORDER_INDEX: 'order_index',
  
  // Event specific
  START_DATE: 'start_date',
  END_DATE: 'end_date',
  LOCATION: 'location',
  EVENT_DATE: 'event_date',
  
  // User specific
  ROLE: 'role',
  EMAIL: 'email',
  AVATAR_URL: 'avatar_url',
  
  // Message groups specific
  GROUP_ID: 'group_id',
  COLOR_THEME: 'color_theme',
  NAME: 'name',
} as const;

// Query Constants
export const QUERY_LIMITS = {
  DEFAULT: 20,
  MAX: 100,
  BATCH_SIZE: 10,
} as const;

// Order Constants
export const ORDER_BY = {
  CREATED_AT_DESC: { column: 'created_at', ascending: false },
  CREATED_AT_ASC: { column: 'created_at', ascending: true },
  ORDER_INDEX_ASC: { column: 'order_index', ascending: true },
  START_DATE_ASC: { column: 'start_date', ascending: true },
  START_DATE_DESC: { column: 'start_date', ascending: false },
} as const;