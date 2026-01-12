// Supabase CRUD operations for VGS 2.0
// All functions include error handling and type safety

import { supabase } from './supabase';
import type { Update, Activity, Tournament, Sponsor, Committee, CommitteeMember, SiteSetting, Game, GameEvent, GameHistory, TournamentSchedule, TournamentResult } from './types/database';
import { withCache, CACHE_TTL, cache } from './cache';

// ============================================
// UPDATES CRUD OPERATIONS
// ============================================

/**
 * Fetch all updates (admin view - includes drafts)
 */
export async function getAllUpdates() {
  const { data, error } = await supabase
    .from('updates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching updates:', error);
    throw error;
  }

  return data as Update[];
}

/**
 * Fetch all published updates (public view) - CACHED
 */
export async function getPublishedUpdates() {
  return withCache(
    'published_updates',
    async () => {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching published updates:', error);
        throw error;
      }

      return data as Update[];
    },
    CACHE_TTL.MEDIUM
  );
}

/**
 * Fetch a single update by ID
 */
export async function getUpdateById(id: string) {
  const { data, error } = await supabase
    .from('updates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching update:', error);
    throw error;
  }

  return data as Update;
}

/**
 * Create a new update
 */
export async function createUpdate(update: Omit<Update, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('updates')
    .insert([update])
    .select()
    .single();

  if (error) {
    console.error('Error creating update:', error);
    throw error;
  }

  // Invalidate cache
  cache.invalidate('published_updates');

  return data as Update;
}

/**
 * Update an existing update
 */
export async function updateUpdate(id: string, updates: Partial<Omit<Update, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('updates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating update:', error);
    throw error;
  }

  // Invalidate cache
  cache.invalidate('published_updates');

  return data as Update;
}

/**
 * Delete an update
 */
export async function deleteUpdate(id: string) {
  const { error } = await supabase
    .from('updates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting update:', error);
    throw error;
  }

  // Invalidate cache
  cache.invalidate('published_updates');

  return true;
}

/**
 * Toggle publish status of an update
 */
export async function toggleUpdatePublish(id: string, is_published: boolean) {
  return updateUpdate(id, { is_published });
}

// ============================================
// ACTIVITIES CRUD OPERATIONS
// ============================================

/**
 * Fetch all activities (admin view)
 */
export async function getAllActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  return data as Activity[];
}

/**
 * Fetch all published activities (public view) - CACHED
 */
export async function getPublishedActivities() {
  return withCache(
    'published_activities',
    async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching published activities:', error);
        throw error;
      }

      return data as Activity[];
    },
    CACHE_TTL.MEDIUM
  );
}

/**
 * Fetch all featured activities (for homepage carousel) - CACHED
 */
export async function getFeaturedActivities() {
  return withCache(
    'featured_activities',
    async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching featured activities:', error);
        throw error;
      }

      return data as Activity[];
    },
    CACHE_TTL.LONG
  );
}

/**
 * Fetch a single activity by ID
 */
export async function getActivityById(id: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching activity:', error);
    throw error;
  }

  return data as Activity;
}

/**
 * Fetch a single activity by slug (for dynamic routes)
 */
export async function getActivityBySlug(slug: string) {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      activity_sponsors (
        sponsors (
          id,
          name,
          logo,
          website
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching activity by slug:', error);
    // Return null if not found, otherwise throw
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  if (!data) return null;

  // Flatten the sponsors data
  const { activity_sponsors, ...rest } = data;
  const sponsors = activity_sponsors ? activity_sponsors.map((as: any) => as.sponsors).filter(Boolean) : [];

  return { ...rest, sponsors } as Activity;
}

/**
 * Fetch a single activity with its associated sponsor IDs (for admin form)
 */
export async function getActivityWithSponsors(id: string) {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      activity_sponsors (
        sponsor_id
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching activity with sponsors:', error);
    throw error;
  }
  if (!data) return null;

  const { activity_sponsors, ...rest } = data;
  const sponsorIds = activity_sponsors ? activity_sponsors.map((as: any) => as.sponsor_id) : [];

  return { ...rest, sponsorIds };
}

/**
 * Create a new activity
 */
export async function createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .select()
    .single();

  if (error) {
    console.error('Error creating activity:', error);
    throw error;
  }

  return data as Activity;
}

/**
 * Update an existing activity
 */
export async function updateActivity(id: string, updates: Partial<Omit<Activity, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('activities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating activity:', error);
    throw error;
  }

  // Invalidate cache
  cache.invalidate('published_activities');
  cache.invalidate('featured_activities');

  return data as Activity;
}

/**
 * Delete an activity
 */
export async function deleteActivity(id: string) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }

  return true;
}

/**
 * Toggle publish status of an activity
 */
export async function toggleActivityPublish(id: string, is_published: boolean) {
  return updateActivity(id, { is_published });
}

/**
 * Get upcoming activities (future dates only)
 */
export async function getUpcomingActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_published', true)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming activities:', error);
    throw error;
  }

  return data as Activity[];
}

/**
 * Update the sponsors for a specific activity (many-to-many relationship)
 */
export async function updateActivitySponsors(activityId: string, sponsorIds: string[]) {
  // Step 1: Delete existing relationships for this activity
  const { error: deleteError } = await supabase
    .from('activity_sponsors')
    .delete()
    .eq('activity_id', activityId);

  if (deleteError) {
    console.error('Error deleting old activity sponsors:', deleteError);
    throw deleteError;
  }

  // Step 2: Insert new relationships if there are any
  if (sponsorIds && sponsorIds.length > 0) {
    const newLinks = sponsorIds.map(sponsorId => ({
      activity_id: activityId,
      sponsor_id: sponsorId,
    }));

    const { error: insertError } = await supabase
      .from('activity_sponsors')
      .insert(newLinks);

    if (insertError) {
      console.error('Error inserting new activity sponsors:', insertError);
      throw insertError;
    }
  }

  // Invalidate cache for the specific activity slug if needed (more advanced)
  // For now, we can clear the whole activity cache as a simpler approach.
  cache.invalidate('published_activities');
  cache.invalidate('featured_activities');

  return true;
}


// ============================================
// TOURNAMENT CRUD OPERATIONS (Single Active Tournament)
// ============================================

/**
 * Fetch the active tournament
 */
export async function getActiveTournament() {
  const { data, error } = await supabase
    .from('tournament')
    .select('*')
    .single();

  if (error) {
    // If no tournament exists yet, return null instead of throwing
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching tournament:', error);
    throw error;
  }

  return data as Tournament;
}

/**
 * Create a new tournament
 */
export async function createTournament(tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tournament')
    .insert([tournament])
    .select()
    .single();

  if (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }

  return data as Tournament;
}

/**
 * Update the tournament
 */
export async function updateTournament(id: string, updates: Partial<Omit<Tournament, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('tournament')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tournament:', error);
    throw error;
  }

  return data as Tournament;
}

/**
 * Toggle tournament status (open/closed)
 */
export async function toggleTournamentStatus(id: string, status: 'open' | 'closed') {
  return updateTournament(id, { status });
}

// ============================================
// TOURNAMENT GAMES CRUD OPERATIONS
// ============================================

/**
 * Fetch all games for the tournament (admin view)
 */
export async function getTournamentGames(tournamentId: string) {
  const { data, error } = await supabase
    .from('tournament_games')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching tournament games:', error);
    throw error;
  }

  return data as import('./types/database').TournamentGame[];
}

/**
 * Fetch games by category
 */
export async function getTournamentGamesByCategory(tournamentId: string, category: 'casual' | 'mobile' | 'pc') {
  const { data, error } = await supabase
    .from('tournament_games')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('category', category)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching tournament games by category:', error);
    throw error;
  }

  return data as import('./types/database').TournamentGame[];
}

/**
 * Fetch a single game by ID
 */
export async function getTournamentGameById(id: string) {
  const { data, error } = await supabase
    .from('tournament_games')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tournament game:', error);
    throw error;
  }

  return data as import('./types/database').TournamentGame;
}

/**
 * Create a new tournament game
 */
export async function createTournamentGame(game: Omit<import('./types/database').TournamentGame, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tournament_games')
    .insert([game])
    .select()
    .single();

  if (error) {
    console.error('Error creating tournament game:', error);
    throw error;
  }

  return data as import('./types/database').TournamentGame;
}

/**
 * Update an existing tournament game
 */
export async function updateTournamentGame(id: string, updates: Partial<Omit<import('./types/database').TournamentGame, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('tournament_games')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tournament game:', error);
    throw error;
  }

  return data as import('./types/database').TournamentGame;
}

/**
 * Delete a tournament game
 */
export async function deleteTournamentGame(id: string) {
  const { error } = await supabase
    .from('tournament_games')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tournament game:', error);
    throw error;
  }

  return true;
}

/**
 * Get tournament with all its games
 */
export async function getTournamentWithGames() {
  const tournament = await getActiveTournament();
  
  if (!tournament) {
    return null;
  }

  const [games, schedules, results] = await Promise.all([
    getTournamentGames(tournament.id),
    tournament.show_schedule ? getTournamentSchedules(tournament.id) : Promise.resolve([]),
    tournament.show_results ? getTournamentResults(tournament.id) : Promise.resolve([])
  ]);
  
  return {
    ...tournament,
    games,
    schedules,
    results
  };
}

// ============================================
// TOURNAMENT SCHEDULES CRUD OPERATIONS
// ============================================

export async function getTournamentSchedules(tournamentId: string) {
  const { data, error } = await supabase
    .from('tournament_schedules')
    .select('*, game:game_id(game_name)')
    .eq('tournament_id', tournamentId)
    .eq('is_active', true)
    .order('match_time', { ascending: true });

  if (error) {
    console.error('Error fetching tournament schedules:', error);
    return [];
  }

  return data as (TournamentSchedule & { game?: { game_name: string } })[];
}

export async function createTournamentSchedule(schedule: Omit<TournamentSchedule, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tournament_schedules')
    .insert([schedule])
    .select()
    .single();

  if (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
  return data as TournamentSchedule;
}

export async function updateTournamentSchedule(id: string, updates: Partial<TournamentSchedule>) {
  const { data, error } = await supabase
    .from('tournament_schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
  return data as TournamentSchedule;
}

export async function deleteTournamentSchedule(id: string) {
  const { error } = await supabase.from('tournament_schedules').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ============================================
// TOURNAMENT RESULTS CRUD OPERATIONS
// ============================================

export async function getTournamentResults(tournamentId: string) {
  const { data, error } = await supabase
    .from('tournament_results')
    .select('*, game:game_id(game_name)')
    .eq('tournament_id', tournamentId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tournament results:', error);
    return [];
  }

  return data as (TournamentResult & { game?: { game_name: string } })[];
}

export async function createTournamentResult(result: Omit<TournamentResult, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tournament_results')
    .insert([result])
    .select()
    .single();

  if (error) {
    console.error('Error creating result:', error);
    throw error;
  }
  return data as TournamentResult;
}

export async function updateTournamentResult(id: string, updates: Partial<TournamentResult>) {
  const { data, error } = await supabase
    .from('tournament_results')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating result:', error);
    throw error;
  }
  return data as TournamentResult;
}

export async function deleteTournamentResult(id: string) {
  const { error } = await supabase.from('tournament_results').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ============================================
// SPONSORS CRUD OPERATIONS
// ============================================

/**
 * Fetch all sponsors (admin view)
 */
export async function getAllSponsors() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching sponsors:', error);
    throw error;
  }

  return data as Sponsor[];
}

/**
 * Fetch all published sponsors (public view)
 */
export async function getPublishedSponsors() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching published sponsors:', error);
    throw error;
  }

  return data as Sponsor[];
}

/**
 * Fetch all featured sponsors/collaborators (for homepage)
 */
export async function getFeaturedSponsors() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching featured sponsors:', error);
    throw error;
  }

  return data as Sponsor[];
}

/**
 * Fetch sponsors by type (sponsor or collaborator)
 */
export async function getSponsorsByType(type: 'sponsor' | 'collaborator') {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('type', type)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching sponsors by type:', error);
    throw error;
  }

  return data as Sponsor[];
}

/**
 * [DEPRECATED] Fetch sponsors by tier - No longer used after tier removal
 * Use getSponsorsByType or filter by sponsor_type/collaborator_type instead
 */
// export async function getSponsorsByTier(tier: 'platinum' | 'gold' | 'silver' | 'bronze') {
//   const { data, error } = await supabase
//     .from('sponsors')
//     .select('*')
//     .eq('tier', tier)
//     .eq('is_published', true)
//     .order('name', { ascending: true });

//   if (error) {
//     console.error('Error fetching sponsors by tier:', error);
//     throw error;
//   }

//   return data as Sponsor[];
// }

/**
 * Fetch a single sponsor by ID
 */
export async function getSponsorById(id: string) {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching sponsor:', error);
    throw error;
  }

  return data as Sponsor;
}

/**
 * Create a new sponsor
 */
export async function createSponsor(sponsor: Omit<Sponsor, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('sponsors')
    .insert([sponsor])
    .select()
    .single();

  if (error) {
    console.error('Error creating sponsor:', error);
    throw error;
  }

  return data as Sponsor;
}

/**
 * Update an existing sponsor
 */
export async function updateSponsor(id: string, updates: Partial<Omit<Sponsor, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('sponsors')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating sponsor:', error);
    throw error;
  }

  return data as Sponsor;
}

/**
 * Delete a sponsor
 */
export async function deleteSponsor(id: string) {
  const { error } = await supabase
    .from('sponsors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting sponsor:', error);
    throw error;
  }

  return true;
}

/**
 * Toggle publish status of a sponsor
 */
export async function toggleSponsorPublish(id: string, is_published: boolean) {
  return updateSponsor(id, { is_published });
}

// ============================================
// COMMITTEE CRUD OPERATIONS (Hierarchical Structure)
// ============================================

// ---------- COMMITTEES (Parent) ----------

/**
 * Fetch all committees (admin view)
 */
export async function getAllCommittees() {
  const { data, error } = await supabase
    .from('committees')
    .select('*')
    .order('year_range', { ascending: false });

  if (error) {
    console.error('Error fetching committees:', error);
    throw error;
  }

  return data as Committee[];
}

/**
 * Fetch all published committees (public view)
 */
export async function getPublishedCommittees() {
  const { data, error } = await supabase
    .from('committees')
    .select('*')
    .eq('is_published', true)
    .order('year_range', { ascending: false });

  if (error) {
    console.error('Error fetching published committees:', error);
    throw error;
  }

  return data as Committee[];
}

/**
 * Fetch a single committee by ID
 */
export async function getCommitteeById(id: string) {
  const { data, error } = await supabase
    .from('committees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching committee:', error);
    throw error;
  }

  return data as Committee;
}

/**
 * Create a new committee
 */
export async function createCommittee(committee: Omit<Committee, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('committees')
    .insert([committee])
    .select()
    .single();

  if (error) {
    console.error('Error creating committee:', error);
    throw error;
  }

  return data as Committee;
}

/**
 * Update an existing committee
 */
export async function updateCommittee(id: string, updates: Partial<Omit<Committee, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('committees')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating committee:', error);
    throw error;
  }

  return data as Committee;
}

/**
 * Delete a committee (and all its members via CASCADE)
 */
export async function deleteCommittee(id: string) {
  const { error } = await supabase
    .from('committees')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting committee:', error);
    throw error;
  }

  return true;
}

/**
 * Toggle publish status of a committee
 */
export async function toggleCommitteePublish(id: string, is_published: boolean) {
  return updateCommittee(id, { is_published });
}

// ---------- COMMITTEE MEMBERS (Child) ----------

/**
 * Fetch all committee members (admin view)
 */
export async function getAllCommitteeMembers() {
  const { data, error } = await supabase
    .from('committee_members')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching committee members:', error);
    throw error;
  }

  return data as CommitteeMember[];
}

/**
 * Fetch members of a specific committee
 */
export async function getMembersByCommitteeId(committeeId: string) {
  const { data, error } = await supabase
    .from('committee_members')
    .select('*')
    .eq('committee_id', committeeId)
    .order('category', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching members by committee:', error);
    throw error;
  }

  return data as CommitteeMember[];
}

/**
 * Fetch published members of a specific committee
 */
export async function getPublishedMembersByCommitteeId(committeeId: string) {
  const { data, error } = await supabase
    .from('committee_members')
    .select('*')
    .eq('committee_id', committeeId)
    .eq('is_published', true)
    .order('category', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching published members:', error);
    throw error;
  }

  return data as CommitteeMember[];
}

/**
 * Fetch members by category
 */
export async function getMembersByCategory(committeeId: string, category: 'Faculty Advisors' | 'Executive Committee' | 'Student Members') {
  const { data, error } = await supabase
    .from('committee_members')
    .select('*')
    .eq('committee_id', committeeId)
    .eq('category', category)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching members by category:', error);
    throw error;
  }

  return data as CommitteeMember[];
}

/**
 * Fetch a single committee member by ID
 */
export async function getCommitteeMemberById(id: string) {
  const { data, error } = await supabase
    .from('committee_members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching committee member:', error);
    throw error;
  }

  return data as CommitteeMember;
}

/**
 * Create a new committee member
 */
export async function createCommitteeMember(member: Omit<CommitteeMember, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('committee_members')
    .insert([member])
    .select()
    .single();

  if (error) {
    console.error('Error creating committee member:', error);
    throw error;
  }

  return data as CommitteeMember;
}

/**
 * Update an existing committee member
 */
export async function updateCommitteeMember(id: string, updates: Partial<Omit<CommitteeMember, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('committee_members')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating committee member:', error);
    throw error;
  }

  return data as CommitteeMember;
}

/**
 * Delete a committee member
 */
export async function deleteCommitteeMember(id: string) {
  const { error } = await supabase
    .from('committee_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting committee member:', error);
    throw error;
  }

  return true;
}

/**
 * Toggle publish status of a committee member
 */
export async function toggleCommitteeMemberPublish(id: string, is_published: boolean) {
  return updateCommitteeMember(id, { is_published });
}

/**
 * Reorder committee members
 */
export async function reorderCommitteeMembers(updates: { id: string; order_index: number }[]) {
  const promises = updates.map(({ id, order_index }) =>
    updateCommitteeMember(id, { order_index })
  );

  try {
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error reordering members:', error);
    throw error;
  }
}

/**
 * Search for existing committee members by name, email, or student ID
 */
export async function searchCommitteeMembers(searchTerm: string) {
  const { data, error } = await supabase
    .from('committee_members')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,student_id.ilike.%${searchTerm}%`)
    .order('name', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error searching committee members:', error);
    throw error;
  }

  return data as CommitteeMember[];
}

// ---------- JOIN QUERIES ----------

/**
 * Fetch all committees with their members (admin view)
 */
export async function getCommitteesWithMembers() {
  const { data: committees, error: committeesError } = await supabase
    .from('committees')
    .select('*')
    .order('year_range', { ascending: false });

  if (committeesError) {
    console.error('Error fetching committees:', committeesError);
    throw committeesError;
  }

  const committeesWithMembers = await Promise.all(
    (committees || []).map(async (committee) => {
      const members = await getMembersByCommitteeId(committee.id);
      return {
        ...committee,
        members
      };
    })
  );

  return committeesWithMembers;
}

/**
 * Fetch published committees with their published members (public view) - CACHED
 */
export async function getPublishedCommitteesWithMembers() {
  return withCache(
    'published_committees_with_members',
    async () => {
      const { data: committees, error: committeesError } = await supabase
        .from('committees')
        .select('*')
        .eq('is_published', true)
        .order('year_range', { ascending: false });

      if (committeesError) {
        console.error('Error fetching published committees:', committeesError);
        throw committeesError;
      }

      const committeesWithMembers = await Promise.all(
        (committees || []).map(async (committee) => {
          const members = await getPublishedMembersByCommitteeId(committee.id);
          return {
            ...committee,
            members
          };
        })
      );

      return committeesWithMembers;
    },
    CACHE_TTL.LONG // Committee data doesn't change often
  );
}

/**
 * Fetch a single committee with its members
 */
export async function getCommitteeWithMembers(id: string) {
  const committee = await getCommitteeById(id);
  const members = await getMembersByCommitteeId(id);
  
  return {
    ...committee,
    members
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Search across updates by title, summary, or content
 */
export async function searchUpdates(query: string) {
  const { data, error } = await supabase
    .from('updates')
    .select('*')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching updates:', error);
    throw error;
  }

  return data as Update[];
}

/**
 * Search across activities by title or description
 */
export async function searchActivities(query: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error searching activities:', error);
    throw error;
  }

  return data as Activity[];
}

/**
 * Get counts for dashboard stats
 */
export async function getDashboardStats() {
  const [updates, activities, tournamentGames, sponsors, committees, committeeMembers] = await Promise.all([
    supabase.from('updates').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true }),
    supabase.from('tournament_games').select('*', { count: 'exact', head: true }),
    supabase.from('sponsors').select('*', { count: 'exact', head: true }),
    supabase.from('committees').select('*', { count: 'exact', head: true }),
    supabase.from('committee_members').select('*', { count: 'exact', head: true }),
  ]);

  return {
    updates: updates.count || 0,
    activities: activities.count || 0,
    tournamentGames: tournamentGames.count || 0,
    sponsors: sponsors.count || 0,
    committees: committees.count || 0,
    committeeMembers: committeeMembers.count || 0,
  };
}

// ============================================
// SITE SETTINGS OPERATIONS
// ============================================

/**
 * Get a specific site setting by key - CACHED
 */
export async function getSiteSetting(key: string) {
  return withCache(`site_setting_${key}`, async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error(`Error fetching site setting ${key}:`, error);
      throw error;
    }

    return data as SiteSetting | null;
  }, CACHE_TTL.MEDIUM);
}

/**
 * Get all site settings - CACHED
 */
export async function getAllSiteSettings() {
  return withCache('all_site_settings', async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) {
      console.error('Error fetching site settings:', error);
      throw error;
    }

    return data as SiteSetting[];
  }, CACHE_TTL.MEDIUM);
}

/**
 * Update or create a site setting
 */
export async function upsertSiteSetting(key: string, value: string, description?: string) {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      setting_key: key,
      setting_value: value,
      description: description || null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'setting_key'
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting site setting:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return data as SiteSetting;
}

/**
 * Delete a site setting
 */
export async function deleteSiteSetting(key: string) {
  const { error } = await supabase
    .from('site_settings')
    .delete()
    .eq('setting_key', key);

  if (error) {
    console.error('Error deleting site setting:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return true;
}

// ============================================
// GAMES CRUD OPERATIONS
// ============================================

/**
 * Fetch all games (admin view - includes unpublished)
 */
export async function getAllGames() {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      game_events (
        id,
        game_id,
        event_id,
        participants_count,
        created_at,
        activities:event_id (*)
      )
    `)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all games:', error);
    throw error;
  }

  return data as Game[];
}

/**
 * Fetch all published games (public view) - CACHED
 */
export async function getPublishedGames() {
  return withCache(
    'published_games',
    async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          game_events (
            id,
            game_id,
            event_id,
            participants_count,
            created_at
          ),
          game_history (
            id,
            event_name,
            year,
            month,
            participants_count,
            prize_pool,
            event_link
          )
        `)
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching published games:', error);
        throw error;
      }

      return data as Game[];
    },
    CACHE_TTL.MEDIUM
  );
}

/**
 * Get a single game by slug
 */
export async function getGameBySlug(slug: string) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      game_events (
        id,
        game_id,
        event_id,
        participants_count,
        created_at,
        activities:event_id (id, title, date, venue)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching game by slug:', error);
    throw error;
  }

  return data as Game;
}

/**
 * Get games by type (casual, mobile, pc)
 */
export async function getGamesByType(gameType: 'casual' | 'mobile' | 'pc') {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      game_events (
        id,
        game_id,
        event_id,
        participants_count
      )
    `)
    .eq('game_type', gameType)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching games by type:', error);
    throw error;
  }

  return data as Game[];
}

/**
 * Create a new game
 */
export async function createGame(game: Omit<Game, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('games')
    .insert([game])
    .select()
    .single();

  if (error) {
    console.error('Error creating game:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return data as Game;
}

/**
 * Update a game
 */
export async function updateGame(id: string, updates: Partial<Game>) {
  const { data, error } = await supabase
    .from('games')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating game:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return data as Game;
}

/**
 * Delete a game
 */
export async function deleteGame(id: string) {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting game:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return true;
}

/**
 * Add a game to an event (create game_event relationship)
 */
export async function addGameToEvent(gameId: string, eventId: string, participantsCount: number = 0) {
  const { data, error } = await supabase
    .from('game_events')
    .insert([{
      game_id: gameId,
      event_id: eventId,
      participants_count: participantsCount
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding game to event:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return data as GameEvent;
}

/**
 * Remove a game from an event
 */
export async function removeGameFromEvent(gameId: string, eventId: string) {
  const { error } = await supabase
    .from('game_events')
    .delete()
    .eq('game_id', gameId)
    .eq('event_id', eventId);

  if (error) {
    console.error('Error removing game from event:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return true;
}

/**
 * Update game event participants count
 */
export async function updateGameEventParticipants(gameId: string, eventId: string, participantsCount: number) {
  const { data, error } = await supabase
    .from('game_events')
    .update({
      participants_count: participantsCount
    })
    .eq('game_id', gameId)
    .eq('event_id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error updating game event participants:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return data as GameEvent;
}

// ============================================
// Game History Functions
// ============================================

/**
 * Get all history entries for a specific game
 */
export async function getGameHistory(gameId: string) {
  const { data, error } = await supabase
    .from('game_history')
    .select('*')
    .eq('game_id', gameId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching game history:', error);
    throw error;
  }

  return data as GameHistory[];
}

/**
 * Create a new game history entry
 */
export async function createGameHistory(history: Omit<GameHistory, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('game_history')
    .insert([history])
    .select()
    .single();

  if (error) {
    console.error('Error creating game history:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return data as GameHistory;
}

/**
 * Update a game history entry
 */
export async function updateGameHistory(id: string, updates: Partial<GameHistory>) {
  const { data, error } = await supabase
    .from('game_history')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating game history:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return data as GameHistory;
}

/**
 * Delete a game history entry
 */
export async function deleteGameHistory(id: string) {
  const { error } = await supabase
    .from('game_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting game history:', error);
    throw error;
  }

  // Invalidate cache
  cache.clear();

  return true;
}

