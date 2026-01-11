-- ============================================
-- VGS 2.0 - COMPLETE RECONSTRUCTED SCHEMA
-- ============================================
-- This file contains the complete database structure reverse-engineered from the application code.
-- Run this in the Supabase SQL Editor to set up the database from scratch.
-- ============================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- TABLE: UPDATES
-- ============================================
CREATE TABLE IF NOT EXISTS updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    image_url TEXT,
    buttons JSONB DEFAULT '[]'::jsonb, -- Array of {name, link}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_updates_published ON updates(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_updates_date ON updates(date DESC);

COMMENT ON TABLE updates IS 'News updates and announcements';

-- ============================================
-- TABLE: ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(100) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    participants VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    banner_image_url TEXT,
    short_description TEXT,
    facebook_post_url TEXT,
    tags TEXT[],
    guests JSONB DEFAULT '[]'::jsonb -- Array of Guest objects
);

CREATE INDEX IF NOT EXISTS idx_activities_published ON activities(is_published, date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_slug ON activities(slug);
CREATE INDEX IF NOT EXISTS idx_activities_featured ON activities(is_featured, is_published);

COMMENT ON TABLE activities IS 'Club activities and events';

-- ============================================
-- TABLE: GAMES
-- ============================================
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT NOT NULL,
    logo_source VARCHAR(20) DEFAULT 'url', -- 'url' | 'path'
    description TEXT,
    game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('casual', 'mobile', 'pc')),
    game_mode VARCHAR(20) CHECK (game_mode IN ('team', 'individual')),
    team_size VARCHAR(10), -- e.g., '2v2', '5v5'
    times_hosted INTEGER DEFAULT 0,
    participants_count INTEGER DEFAULT 0,
    max_participants INTEGER,
    rules TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_games_published ON games(is_published, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_games_type ON games(game_type, is_published);
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);

COMMENT ON TABLE games IS 'Gaming titles with categorization';

-- ============================================
-- TABLE: GAME_HISTORY
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

CREATE INDEX IF NOT EXISTS idx_game_history_game ON game_history(game_id, year DESC, month DESC);

COMMENT ON TABLE game_history IS 'Historical records of game tournaments and events';

-- ============================================
-- TABLE: GAME_EVENTS (Link between Games and Activities)
-- ============================================
CREATE TABLE IF NOT EXISTS game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    participants_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_events_game ON game_events(game_id);
CREATE INDEX IF NOT EXISTS idx_game_events_event ON game_events(event_id);

COMMENT ON TABLE game_events IS 'Links games to specific activities/events where they were played';

-- ============================================
-- TABLE: TOURNAMENT (Single Active Tournament)
-- ============================================
-- Note: Code expects singular 'tournament' table name
CREATE TABLE IF NOT EXISTS tournament (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slogan VARCHAR(500),
    logo TEXT,
    banner TEXT,
    banner_source VARCHAR(20) DEFAULT 'url',
    teaser_video_url TEXT,
    description TEXT,
    about_event TEXT,
    about_organizer TEXT,
    previous_glimpses JSONB DEFAULT '[]'::jsonb, -- Array of {id, title, images[]}
    date DATE NOT NULL,
    time VARCHAR(100) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    total_prize_pool VARCHAR(100) NOT NULL,
    registration_deadline TIMESTAMPTZ,
    organizers JSONB DEFAULT '[]'::jsonb, -- Array of Organization objects
    co_organizers JSONB DEFAULT '[]'::jsonb,
    associated_with JSONB DEFAULT '[]'::jsonb,
    sponsors JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tournament IS 'The single active tournament configuration';

-- ============================================
-- TABLE: TOURNAMENT_GAMES
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    game_name VARCHAR(255) NOT NULL,
    game_logo TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('casual', 'mobile', 'pc')),
    icon VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    prize_pool VARCHAR(100) NOT NULL,
    team_size VARCHAR(50) NOT NULL,
    format VARCHAR(100),
    schedule VARCHAR(255),
    max_participants VARCHAR(50),
    registration_link TEXT NOT NULL,
    rulebook_link TEXT NOT NULL,
    registration_status VARCHAR(50) CHECK (registration_status IN ('open', 'closed')),
    registration_fee VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournament_games_tournament ON tournament_games(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_games_category ON tournament_games(category);

COMMENT ON TABLE tournament_games IS 'Games featured in the active tournament';

-- ============================================
-- TABLE: SPONSORS
-- ============================================
CREATE TABLE IF NOT EXISTS sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sponsor', 'collaborator')),
    sponsor_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    collaborator_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    custom_type_name VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    website TEXT NOT NULL,
    description TEXT NOT NULL,
    events TEXT[] DEFAULT ARRAY[]::TEXT[], -- IDs or names
    social_media JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_sponsors_published ON sponsors(is_published, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_sponsors_type ON sponsors(type, is_published);

COMMENT ON TABLE sponsors IS 'Sponsors and collaborative partners';

-- ============================================
-- TABLE: ACTIVITY_SPONSORS
-- ============================================
CREATE TABLE IF NOT EXISTS activity_sponsors (
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (activity_id, sponsor_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_sponsors_activity ON activity_sponsors(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_sponsors_sponsor ON activity_sponsors(sponsor_id);

COMMENT ON TABLE activity_sponsors IS 'Links activities to their sponsors';

-- ============================================
-- TABLE: COMMITTEES
-- ============================================
CREATE TABLE IF NOT EXISTS committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    year_range VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_committees_published ON committees(is_published, year_range DESC);

COMMENT ON TABLE committees IS 'Committee groups by year';

-- ============================================
-- TABLE: COMMITTEE_MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS committee_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Faculty Advisors', 'Student Executives')),
    designation VARCHAR(255) NOT NULL,
    photo TEXT NOT NULL,
    email VARCHAR(255),
    student_id VARCHAR(50),
    facebook TEXT,
    linkedin TEXT,
    github TEXT,
    previous_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_committee_members_committee ON committee_members(committee_id, order_index);
CREATE INDEX IF NOT EXISTS idx_committee_members_published ON committee_members(is_published, committee_id);

COMMENT ON TABLE committee_members IS 'Individual committee member profiles';

-- ============================================
-- TABLE: SITE_SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

COMMENT ON TABLE site_settings IS 'Global site configuration and settings';

-- ============================================
-- TABLE: PAYMENT_METHODS
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT NOT NULL,
  logo_url TEXT,
  instructions TEXT,
  account_type TEXT DEFAULT 'personal',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);

COMMENT ON TABLE payment_methods IS 'Payment methods for registration fees';

-- ============================================
-- TABLE: REGISTRATION_FORMS
-- ============================================
CREATE TABLE IF NOT EXISTS registration_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_name VARCHAR(255) NOT NULL,
    game_slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    google_sheet_url TEXT,
    form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    registration_deadline TIMESTAMPTZ,
    registration_fee VARCHAR(50), -- BDT Amount

    -- Design assets
    club_logo_url TEXT,
    tournament_logo_url TEXT,
    game_logo_url TEXT,
    hero_image_url TEXT,
    hero_image_source VARCHAR(50) DEFAULT 'url',

    -- Theme
    primary_color VARCHAR(7) DEFAULT '#6B46C1',
    secondary_color VARCHAR(7) DEFAULT '#EC4899',
    accent_color VARCHAR(7) DEFAULT '#3B82F6',
    heading_font VARCHAR(50) DEFAULT 'default',
    body_font VARCHAR(50) DEFAULT 'default',

    -- Sections
    tournament_details JSONB DEFAULT '{"about": "", "key_features": [], "prize_pool_highlights": ""}'::jsonb,
    game_details JSONB DEFAULT '{"description": "", "game_image_url": "", "game_image_source": "url"}'::jsonb,
    schedule JSONB DEFAULT '{"registration_deadline_label": "Registration Deadline", "tournament_start": "", "tournament_end": "", "other_dates": []}'::jsonb,
    rules_and_regulations JSONB DEFAULT '{"summary": "", "rulebook_url": "", "full_rulebook_file": ""}'::jsonb,

    -- Visibility
    show_tournament_section BOOLEAN DEFAULT FALSE,
    show_game_details_section BOOLEAN DEFAULT FALSE,
    show_schedule_section BOOLEAN DEFAULT FALSE,
    show_rules_section BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE registration_forms IS 'Customizable registration forms';

-- ============================================
-- TABLE: REGISTRATION_SUBMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS registration_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES registration_forms(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL, -- Renamed from form_data to submission_data in Types, but kept generic here
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Payment info
    transaction_id TEXT,
    payment_method_id UUID REFERENCES payment_methods(id)
);

CREATE INDEX IF NOT EXISTS idx_registration_submissions_form ON registration_submissions(form_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_registration_submissions_status ON registration_submissions(status, submitted_at DESC);

COMMENT ON TABLE registration_submissions IS 'User registration form submissions';

-- ============================================
-- TABLE: EMAIL_TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE email_templates IS 'Reusable HTML email templates';

-- ============================================
-- TABLE: EMAIL_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    google_sheet_url TEXT NOT NULL,
    subject VARCHAR(500) NOT NULL,
    recipients_count INTEGER NOT NULL,
    recipients_data JSONB NOT NULL,
    sent_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

COMMENT ON TABLE email_logs IS 'Log of sent emails';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_history_updated_at BEFORE UPDATE ON game_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournament_updated_at BEFORE UPDATE ON tournament FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournament_games_updated_at BEFORE UPDATE ON tournament_games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_committees_updated_at BEFORE UPDATE ON committees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_committee_members_updated_at BEFORE UPDATE ON committee_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registration_forms_updated_at BEFORE UPDATE ON registration_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Public can view published updates" ON updates FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published activities" ON activities FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published games" ON games FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view game history" ON game_history FOR SELECT USING (EXISTS (SELECT 1 FROM games WHERE games.id = game_history.game_id AND games.is_published = true));
CREATE POLICY "Public can view game events" ON game_events FOR SELECT USING (EXISTS (SELECT 1 FROM games WHERE games.id = game_events.game_id AND games.is_published = true));
CREATE POLICY "Public can view active tournament" ON tournament FOR SELECT USING (true); -- Usually tournament page is public
CREATE POLICY "Public can view tournament games" ON tournament_games FOR SELECT USING (true);
CREATE POLICY "Public can view published sponsors" ON sponsors FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view activity sponsors" ON activity_sponsors FOR SELECT USING (true);
CREATE POLICY "Public can view published committees" ON committees FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published members" ON committee_members FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Public can view active forms" ON registration_forms FOR SELECT USING (is_active = true);
CREATE POLICY "Public can submit registrations" ON registration_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view active payment methods" ON payment_methods FOR SELECT USING (is_active = true);

-- Admin FULL ACCESS policies (Authenticated)
CREATE POLICY "Admins can manage updates" ON updates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage activities" ON activities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage games" ON games FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage game history" ON game_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage game events" ON game_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage tournament" ON tournament FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage tournament games" ON tournament_games FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage sponsors" ON sponsors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage activity sponsors" ON activity_sponsors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage committees" ON committees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage members" ON committee_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage forms" ON registration_forms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can view submissions" ON registration_submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update submissions" ON registration_submissions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage email templates" ON email_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can view email logs" ON email_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage payment methods" ON payment_methods FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- INITIAL SEED DATA
-- ============================================

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES
    ('partnership_brochure_url', '', 'url', 'Google Drive direct download link for partnership brochure PDF'),
    ('contact_email', 'partnerships@vgs.com', 'email', 'Partnership contact email address'),
    ('contact_phone', '+1 (234) 567-890', 'phone', 'Partnership contact phone number'),
    ('contact_whatsapp', '1234567890', 'phone', 'WhatsApp number (without + or spaces)')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default payment methods (Optional - Disabled by default)
INSERT INTO payment_methods (name, number, instructions, account_type, is_active)
VALUES
    ('Bkash (Personal)', '01XXXXXXXXX', 'Send Money/Cash In', 'personal', false),
    ('Nagad (Personal)', '01XXXXXXXXX', 'Send Money/Cash In', 'personal', false)
ON CONFLICT DO NOTHING;

-- End of Complete Schema
