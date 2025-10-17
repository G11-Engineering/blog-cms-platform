-- Migration: Add cloud storage support to media service
-- Date: 2025-10-17

-- Add new columns to media_files table
ALTER TABLE media_files 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS storage_key VARCHAR(500);

-- Add new columns to media_thumbnails table
ALTER TABLE media_thumbnails 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS storage_key VARCHAR(500);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_media_files_storage_key ON media_files(storage_key);
CREATE INDEX IF NOT EXISTS idx_media_thumbnails_storage_key ON media_thumbnails(storage_key);

-- Add comment
COMMENT ON COLUMN media_files.file_url IS 'Public URL for the file (CDN or S3)';
COMMENT ON COLUMN media_files.storage_key IS 'Key used in cloud storage (S3/R2)';
COMMENT ON COLUMN media_thumbnails.thumbnail_url IS 'Public URL for the thumbnail (CDN or S3)';
COMMENT ON COLUMN media_thumbnails.storage_key IS 'Key used in cloud storage (S3/R2)';
