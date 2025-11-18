-- Migration: Add logo columns to registration_forms table
-- Date: 2025-01-14
-- Description: Adds support for club, tournament, and game logos in registration forms

-- Add logo URL columns if they don't exist
ALTER TABLE registration_forms 
ADD COLUMN IF NOT EXISTS club_logo_url TEXT,
ADD COLUMN IF NOT EXISTS tournament_logo_url TEXT,
ADD COLUMN IF NOT EXISTS game_logo_url TEXT;

-- Add missing columns if upgrading from old schema
ALTER TABLE registration_forms 
ADD COLUMN IF NOT EXISTS game_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS game_slug VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_sheet_url TEXT,
ADD COLUMN IF NOT EXISTS form_fields JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS max_registrations INTEGER,
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;

-- Update existing form_name and form_title columns if they exist
DO $$
BEGIN
    -- Rename form_name to game_slug if form_name exists and game_slug doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'registration_forms' AND column_name = 'form_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'registration_forms' AND column_name = 'game_slug')
    THEN
        ALTER TABLE registration_forms RENAME COLUMN form_name TO game_slug;
    END IF;

    -- Rename form_title to title if form_title exists and title doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'registration_forms' AND column_name = 'form_title')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'registration_forms' AND column_name = 'title')
    THEN
        ALTER TABLE registration_forms RENAME COLUMN form_title TO title;
    END IF;
END $$;

-- Update comment
COMMENT ON TABLE registration_forms IS 'Available registration forms with logo support for club, tournament, and game';

-- Add comments for new columns
COMMENT ON COLUMN registration_forms.club_logo_url IS 'URL or public path to club logo (e.g., https://example.com/logo.png or /logos/club.png)';
COMMENT ON COLUMN registration_forms.tournament_logo_url IS 'URL or public path to tournament logo';
COMMENT ON COLUMN registration_forms.game_logo_url IS 'URL or public path to game logo';
