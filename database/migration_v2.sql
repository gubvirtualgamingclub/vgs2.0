-- Add registration_status to tournament table
ALTER TABLE tournament
ADD COLUMN IF NOT EXISTS registration_status text DEFAULT 'closed' CHECK (registration_status IN ('open', 'closed'));

-- Add registration_status to tournament_games table
ALTER TABLE tournament_games
ADD COLUMN IF NOT EXISTS registration_status text DEFAULT 'open' CHECK (registration_status IN ('open', 'closed'));

-- Add flags to control tab visibility in tournament table
ALTER TABLE tournament
ADD COLUMN IF NOT EXISTS show_schedule boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_results boolean DEFAULT false;

-- Create tournament_schedules table
CREATE TABLE IF NOT EXISTS tournament_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id uuid REFERENCES tournament(id) ON DELETE CASCADE,
    game_id uuid REFERENCES tournament_games(id) ON DELETE CASCADE, -- Can be null for general schedule
    title text NOT NULL,
    match_time timestamp with time zone,
    stage text, -- e.g., 'Qualifier', 'Semi-Final'
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create tournament_results table
CREATE TABLE IF NOT EXISTS tournament_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id uuid REFERENCES tournament(id) ON DELETE CASCADE,
    game_id uuid REFERENCES tournament_games(id) ON DELETE CASCADE,
    stage_name text NOT NULL, -- e.g., 'Finals', 'Group A'
    result_data jsonb DEFAULT '[]'::jsonb, -- Array of { rank, team, score, status }
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS (Row Level Security) - Optional but recommended
ALTER TABLE tournament_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;

-- Create policies (Assuming public read, authenticated write)
CREATE POLICY "Public schedules are viewable by everyone" ON tournament_schedules FOR SELECT USING (true);
CREATE POLICY "Public results are viewable by everyone" ON tournament_results FOR SELECT USING (true);

-- Note: Admin write policies depend on your auth setup, usually:
-- CREATE POLICY "Admins can insert schedules" ON tournament_schedules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- ... similar for UPDATE/DELETE
