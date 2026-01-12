-- Fix RLS Policies for Tournament Schedules and Results

-- Enable write access for authenticated users (Admins) on tournament_schedules
CREATE POLICY "Authenticated users can insert schedules" ON tournament_schedules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update schedules" ON tournament_schedules FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete schedules" ON tournament_schedules FOR DELETE USING (auth.role() = 'authenticated');

-- Enable write access for authenticated users (Admins) on tournament_results
CREATE POLICY "Authenticated users can insert results" ON tournament_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update results" ON tournament_results FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete results" ON tournament_results FOR DELETE USING (auth.role() = 'authenticated');
