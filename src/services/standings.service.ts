/**
 * Standing Service
 * Database operations for season standings
 */

import { supabase } from '../lib/supabase';
import type { Standing } from '../types';

export const standingService = {
  /**
   * Create or update a standing record
   */
  async upsertStanding(standing: Omit<Standing, 'id'>) {
    const { data, error } = await supabase
      .from('standings')
      .upsert(
        [
          {
            season_id: standing.seasonId,
            player_id: standing.playerId,
            rank: standing.rank,
            wins: standing.wins,
            losses: standing.losses,
            win_percentage: standing.winPercentage,
            points_for: standing.pointsFor,
            points_against: standing.pointsAgainst,
            point_differential: standing.pointDifferential,
            current_court: standing.currentCourt,
            court_1_appearances: standing.court1Appearances,
            perfect_6_games: standing.perfect6Games,
            season_points: standing.seasonPoints,
            last_updated: new Date().toISOString(),
          },
        ],
        {
          onConflict: 'season_id,player_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get standings for a season
   */
  async getSeasonStandings(seasonId: string) {
    const { data, error } = await supabase
      .from('standings')
      .select('*, players(first_name, last_name, dupr_rating)')
      .eq('season_id', seasonId)
      .order('rank', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get a player's standing in a season
   */
  async getPlayerStanding(seasonId: string, playerId: string) {
    const { data, error } = await supabase
      .from('standings')
      .select('*')
      .eq('season_id', seasonId)
      .eq('player_id', playerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get top players by wins
   */
  async getTopPlayersByWins(seasonId: string, limit = 10) {
    const { data, error } = await supabase
      .from('standings')
      .select('*, players(first_name, last_name)')
      .eq('season_id', seasonId)
      .order('wins', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Get standings by court (for display)
   */
  async getStandingsByCourt(seasonId: string, court: 1 | 2 | 3 | 4) {
    const { data, error } = await supabase
      .from('standings')
      .select('*, players(first_name, last_name, dupr_rating)')
      .eq('season_id', seasonId)
      .eq('current_court', court)
      .order('rank', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Delete standing
   */
  async deleteStanding(id: string) {
    const { error } = await supabase.from('standings').delete().eq('id', id);
    if (error) throw error;
  },
};
