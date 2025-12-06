-- ============================================
-- Migration: Add Game Registration Status
-- Description: Add per-game registration status control to tournament_games
-- Date: December 5, 2025
-- ============================================

-- Add registration_status column to tournament_games
ALTER TABLE tournament_games ADD COLUMN IF NOT EXISTS registration_status VARCHAR(20) DEFAULT 'open' CHECK (registration_status IN ('open', 'closed'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tournament_games_registration_status ON tournament_games(registration_status);

-- Add comment for documentation
COMMENT ON COLUMN tournament_games.registration_status IS 'Registration status for this game (open or closed)';

-- Success message
SELECT 'Migration complete: Added registration_status column to tournament_games table' AS status;
