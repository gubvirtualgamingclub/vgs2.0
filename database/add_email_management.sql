-- Migration: Add Email Management Tables
-- Date: 2025-01-18
-- Description: Adds support for email templates and sending history

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

COMMENT ON TABLE email_templates IS 'Reusable HTML email templates with variable support';

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
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

COMMENT ON TABLE email_logs IS 'Log of all sent emails for tracking and audit';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_email_templates_updated_at 
BEFORE UPDATE ON email_templates 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can manage email templates" 
ON email_templates FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view email logs" 
ON email_logs FOR SELECT 
USING (auth.role() = 'authenticated');
