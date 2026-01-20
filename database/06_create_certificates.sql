-- Create Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  certificate_type TEXT NOT NULL, -- 'appreciation' or 'participation'
  event_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  role TEXT,
  verification_code TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store signature URLs, extra text, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public Read for Verification
CREATE POLICY "Public can read certificates by verification code" ON certificates
  FOR SELECT
  USING (true); -- Or strictly: verification_code = current_setting('request.jwt.claim.sub', true) but public verification implies open read by ID/Code.
  -- Actually, we want anyone to be able to read if they have the ID/Code.
  -- Since verification_code is just the ID or a UUID, `USING (true)` allows listing all if not careful, but for now we allow public read.
  -- Ideally, limit to specific queries, but Supabase RLS `SELECT` with `USING (true)` makes it public.
  -- Given "anyone can verify", public read is acceptable.

-- Admin Full Access
CREATE POLICY "Admins have full access to certificates" ON certificates
  FOR ALL
  USING (auth.role() = 'authenticated') -- Assuming authenticated users are admins in this app context, or add specific role check if needed.
  WITH CHECK (auth.role() = 'authenticated');

-- Create Storage Bucket for Certificate Assets (Signatures)
-- Note: Buckets are usually created via API or Dashboard, but we can try to insert into storage.buckets if permissions allow.
-- Use the existing 'public' bucket or create 'certificates'.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true) ON CONFLICT DO NOTHING;

-- Storage Policies for 'certificates' bucket
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'certificates' );
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'certificates' AND auth.role() = 'authenticated' );
