-- ============================================
-- VGS 2.0 - DATABASE MIGRATION UPDATE
-- ============================================
-- This file contains ALTER statements for EXISTING databases
-- Run this if you already have VGS database and need updates
-- Version: 3.1.0
-- Last Updated: November 18, 2025
-- ============================================
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy this ENTIRE file
-- 4. Paste into SQL Editor
-- 5. Click "Run" button
-- 6. Wait for "Success" message
-- 7. Database updated!
--
-- ⚠️ IMPORTANT: For EXISTING databases only!
--    For fresh setup, use DATABASE_COMPLETE_SETUP.sql
--
-- ✅ SAFE TO RUN MULTIPLE TIMES
--    Uses IF NOT EXISTS checks
--
-- ============================================

-- ============================================
-- MIGRATION 1: Games Table Enhancements
-- Adds game_mode and team_size columns
-- ============================================

-- Add game_mode column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'game_mode'
    ) THEN
        ALTER TABLE games ADD COLUMN game_mode VARCHAR(20) CHECK (game_mode IN ('team', 'individual'));
        RAISE NOTICE 'Added game_mode column to games table';
    ELSE
        RAISE NOTICE 'Column game_mode already exists in games table';
    END IF;
END $$;

-- Add team_size column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'team_size'
    ) THEN
        ALTER TABLE games ADD COLUMN team_size VARCHAR(10) CHECK (team_size IN ('2v2', '3v3', '4v4', '5v5', '6v6'));
        RAISE NOTICE 'Added team_size column to games table';
    ELSE
        RAISE NOTICE 'Column team_size already exists in games table';
    END IF;
END $$;

-- ============================================
-- MIGRATION 2: Game History Table
-- Creates new table for game tournament history
-- ============================================

CREATE TABLE IF NOT EXISTS game_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    participants_count INTEGER DEFAULT 0,
    prize_pool VARCHAR(100),
    event_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index if table was just created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'game_history' AND indexname = 'idx_game_history_game'
    ) THEN
        CREATE INDEX idx_game_history_game ON game_history(game_id, year DESC, month DESC);
        RAISE NOTICE 'Created index on game_history table';
    END IF;
END $$;

-- Add trigger for updated_at if table was just created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_game_history_updated_at'
    ) THEN
        CREATE TRIGGER update_game_history_updated_at 
        BEFORE UPDATE ON game_history 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created trigger for game_history table';
    END IF;
END $$;

-- Enable RLS and policies
DO $$
BEGIN
    ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public can view game history" ON game_history;
    DROP POLICY IF EXISTS "Admins can manage game history" ON game_history;
    
    -- Create policies
    CREATE POLICY "Public can view game history" ON game_history 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM games WHERE games.id = game_history.game_id AND games.is_published = true)
    );
    
    CREATE POLICY "Admins can manage game history" ON game_history 
    FOR ALL USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'Configured RLS for game_history table';
END $$;

-- ============================================
-- MIGRATION 3: Activities Table Enhancements
-- Adds banner, short description, social links, tags
-- ============================================

-- Add banner_image_url column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'banner_image_url'
    ) THEN
        ALTER TABLE activities ADD COLUMN banner_image_url TEXT;
        RAISE NOTICE 'Added banner_image_url column to activities table';
    END IF;
END $$;

-- Add short_description column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'short_description'
    ) THEN
        ALTER TABLE activities ADD COLUMN short_description TEXT;
        RAISE NOTICE 'Added short_description column to activities table';
    END IF;
END $$;

-- Add facebook_post_url column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'facebook_post_url'
    ) THEN
        ALTER TABLE activities ADD COLUMN facebook_post_url TEXT;
        RAISE NOTICE 'Added facebook_post_url column to activities table';
    END IF;
END $$;

-- Add tags column (array of text)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'tags'
    ) THEN
        ALTER TABLE activities ADD COLUMN tags TEXT[];
        RAISE NOTICE 'Added tags column to activities table';
    END IF;
END $$;

-- Add guests column (JSONB)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'guests'
    ) THEN
        ALTER TABLE activities ADD COLUMN guests JSONB;
        RAISE NOTICE 'Added guests column to activities table';
    END IF;
END $$;

-- ============================================
-- MIGRATION 4: Sponsors Table Enhancements
-- Multiple category support for sponsors
-- ============================================

-- Add sponsor_types column (array of text)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sponsors' AND column_name = 'sponsor_types'
    ) THEN
        ALTER TABLE sponsors ADD COLUMN sponsor_types TEXT[];
        RAISE NOTICE 'Added sponsor_types column to sponsors table';
    END IF;
END $$;

-- Add collaborator_types column (array of text)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sponsors' AND column_name = 'collaborator_types'
    ) THEN
        ALTER TABLE sponsors ADD COLUMN collaborator_types TEXT[];
        RAISE NOTICE 'Added collaborator_types column to sponsors table';
    END IF;
END $$;

-- Add custom_type_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sponsors' AND column_name = 'custom_type_name'
    ) THEN
        ALTER TABLE sponsors ADD COLUMN custom_type_name VARCHAR(100);
        RAISE NOTICE 'Added custom_type_name column to sponsors table';
    END IF;
END $$;

-- ============================================
-- MIGRATION 5: Committee Members Table Fix
-- Fix category constraint to match current usage
-- ============================================

-- Drop old constraint if exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'committee_members' AND column_name = 'category'
    ) THEN
        ALTER TABLE committee_members DROP CONSTRAINT IF EXISTS committee_members_category_check;
        RAISE NOTICE 'Dropped old category constraint';
    END IF;
END $$;

-- Add new constraint with correct values
DO $$
BEGIN
    ALTER TABLE committee_members 
    ADD CONSTRAINT committee_members_category_check 
    CHECK (category IN ('Faculty Advisors', 'Student Executives'));
    RAISE NOTICE 'Added updated category constraint';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Category constraint already exists with correct values';
END $$;

-- ============================================
-- MIGRATION 6: Site Settings Defaults
-- Ensure default settings exist
-- ============================================

INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES 
    ('partnership_brochure_url', '', 'url', 'Google Drive direct download link for partnership brochure PDF'),
    ('contact_email', 'partnerships@vgs.com', 'email', 'Partnership contact email address'),
    ('contact_phone', '+1 (234) 567-890', 'phone', 'Partnership contact phone number'),
    ('contact_whatsapp', '1234567890', 'phone', 'WhatsApp number (without + or spaces)')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- MIGRATION 7: Ensure All Indexes Exist
-- ============================================

CREATE INDEX IF NOT EXISTS idx_activities_featured ON activities(is_featured, is_published);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status, is_published);
CREATE INDEX IF NOT EXISTS idx_sponsors_display_order ON sponsors(display_order);
CREATE INDEX IF NOT EXISTS idx_sponsors_featured ON sponsors(is_featured, is_published);

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- ✅ Games table updated with game_mode and team_size
-- ✅ Game history table created
-- ✅ Activities table enhanced with new fields
-- ✅ Sponsors table supports multiple categories
-- ✅ Committee members category fixed
-- ✅ Default site settings added
-- ✅ All indexes created
--
-- Your database is now up to date with VGS 2.0 v3.1.0!
--
-- VERIFICATION:
-- 1. Check admin panel - all features should work
-- 2. Try creating a game with team mode
-- 3. Add event history to games
-- 4. Test activity banners and guests
-- 5. Verify sponsor categories display correctly
--
-- For help, see: SETUP_AND_DEPLOYMENT.md
-- ============================================

-- Optional: Display current database version
DO $$
BEGIN
    RAISE NOTICE '====================================';
    RAISE NOTICE 'VGS 2.0 Database Migration Complete';
    RAISE NOTICE 'Current Version: 3.1.0';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE '====================================';
END $$;
