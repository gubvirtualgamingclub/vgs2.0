-- ============================================
-- Migration: Add Tournament Banner, Description, and Sponsors
-- Description: Add banner image, tournament description, and sponsors support
-- Date: December 6, 2025
-- ============================================

-- Add banner and description columns
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS banner TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS banner_source VARCHAR(20) DEFAULT 'url' CHECK (banner_source IN ('url', 'path'));
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS description TEXT;

-- Add sponsors as JSONB for storing organization data
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS sponsors JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN tournaments.banner IS 'Tournament banner image (URL or /public path)';
COMMENT ON COLUMN tournaments.banner_source IS 'Source type for banner (url or path)';
COMMENT ON COLUMN tournaments.description IS 'Creative tournament description shown on tournament page';
COMMENT ON COLUMN tournaments.sponsors IS 'Array of sponsor organizations with name and logo fields';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tournaments_banner_source ON tournaments(banner_source);

-- Success message
SELECT 'Migration complete: Added banner, description, and sponsors to tournaments table' AS status;
