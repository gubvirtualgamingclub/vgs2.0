-- Add registration_fee column to tournament_games table
ALTER TABLE tournament_games ADD COLUMN IF NOT EXISTS registration_fee VARCHAR(100);
