INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES ('email_service_provider', 'google_smtp', 'text', 'Selected email service provider: google_smtp or emailjs')
ON CONFLICT (setting_key) DO NOTHING;
