-- Run this command in your Supabase SQL Editor to remove the max_registrations column
ALTER TABLE registration_forms 
DROP COLUMN IF EXISTS max_registrations;
