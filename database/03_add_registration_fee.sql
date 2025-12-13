-- Run this command in your Supabase SQL Editor to add the missing column
ALTER TABLE registration_forms 
ADD COLUMN IF NOT EXISTS registration_fee VARCHAR(50);

COMMENT ON COLUMN registration_forms.registration_fee IS 'Registration Fee in BDT';
