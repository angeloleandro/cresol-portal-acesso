-- Migration: Add view_count to collections table
-- Date: 2025-01-28
-- Purpose: Track collection view statistics

-- Add view_count column if it doesn't exist
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add index for performance when querying popular collections
CREATE INDEX IF NOT EXISTS idx_collections_view_count 
ON collections(view_count DESC);

-- Add comment for documentation
COMMENT ON COLUMN collections.view_count IS 'Number of times this collection has been viewed';