-- ============================================
-- Migration: Add Design Fields to registration_forms
-- Description: Add hero image, colors, fonts, and content sections for registration form customization
-- Date: December 5, 2025
-- ============================================

-- Add hero image and design columns
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS hero_image_source VARCHAR(50) DEFAULT 'url'; -- 'url' or 'path'

-- Add color customization columns
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#6B46C1';
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#EC4899';
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#3B82F6';

-- Add typography columns
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS heading_font VARCHAR(50) DEFAULT 'default'; -- 'default', 'modern', 'gaming', 'elegant'
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS body_font VARCHAR(50) DEFAULT 'default';

-- Add content section columns
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS tournament_details JSONB DEFAULT '{"about": "", "key_features": [], "prize_pool_highlights": ""}'::jsonb;
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS game_details JSONB DEFAULT '{"description": "", "game_image_url": "", "game_image_source": "url"}'::jsonb;
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{"registration_deadline_label": "Registration Deadline", "tournament_start": "", "tournament_end": "", "other_dates": []}'::jsonb;
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS rules_and_regulations JSONB DEFAULT '{"summary": "", "rulebook_url": "", "full_rulebook_file": ""}'::jsonb;

-- Add section visibility toggles
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS show_tournament_section BOOLEAN DEFAULT FALSE;
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS show_game_details_section BOOLEAN DEFAULT FALSE;
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS show_schedule_section BOOLEAN DEFAULT FALSE;
ALTER TABLE registration_forms ADD COLUMN IF NOT EXISTS show_rules_section BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN registration_forms.hero_image_url IS 'Hero section background image (URL or /public path)';
COMMENT ON COLUMN registration_forms.hero_image_source IS 'Source type for hero image (url or path)';
COMMENT ON COLUMN registration_forms.primary_color IS 'Primary brand color in hex format';
COMMENT ON COLUMN registration_forms.secondary_color IS 'Secondary brand color in hex format';
COMMENT ON COLUMN registration_forms.accent_color IS 'Accent color for highlights in hex format';
COMMENT ON COLUMN registration_forms.heading_font IS 'Heading typography style (default, modern, gaming, elegant)';
COMMENT ON COLUMN registration_forms.body_font IS 'Body text typography style (default, modern, gaming, elegant)';
COMMENT ON COLUMN registration_forms.tournament_details IS 'Tournament information: {about, key_features[], prize_pool_highlights}';
COMMENT ON COLUMN registration_forms.game_details IS 'Game information: {description, game_image_url, game_image_source}';
COMMENT ON COLUMN registration_forms.schedule IS 'Tournament schedule: {registration_deadline_label, tournament_start, tournament_end, other_dates[]}';
COMMENT ON COLUMN registration_forms.rules_and_regulations IS 'Rules information: {summary, rulebook_url, full_rulebook_file}';
COMMENT ON COLUMN registration_forms.show_tournament_section IS 'Display tournament details section on form';
COMMENT ON COLUMN registration_forms.show_game_details_section IS 'Display game details section on form';
COMMENT ON COLUMN registration_forms.show_schedule_section IS 'Display schedule/timeline section on form';
COMMENT ON COLUMN registration_forms.show_rules_section IS 'Display rules and regulations section on form';

-- Success message
SELECT 'Migration complete: Added design customization fields to registration_forms table' AS status;
