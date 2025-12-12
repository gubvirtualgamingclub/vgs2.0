-- ============================================
-- VGS 2.0 - INITIAL SEED DATA
-- ============================================
-- This file contains initial data for the database.
-- Run this AFTER running 01_schema.sql
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

-- End of Seeds
