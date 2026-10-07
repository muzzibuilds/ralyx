/**
 * Standing Service
 * Database operations for season standings
 */

import { supabase } from '../lib/supabase';
import type { Standing } from '../types';

type CompletedMatchRow = {
  team1_players: string[];
  team2_players: string[];
  team1_score: number;
  team2_score: number;
  winner: 1 | 2;
  court_assignments?: {
    court_number: 1 | 2 | 3 | 4;
  } | null;
};

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

  /**
   * Rebuild standings for an entire season from completed matches.
   */
  async rebuildSeasonStandings(seasonId: string) {
    const { data: registrations, error: registrationError } = await supabase
      .from('registrations')
      .select('player_id')
      .eq('season_id', seasonId)
      .in('status', ['confirmed', 'paid']);

    if (registrationError) throw registrationError;

    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('team1_players, team2_players, team1_score, team2_score, winner, court_assignments!inner(court_number), sessions!inner(season_id)')
      .eq('status', 'completed')
      .eq('sessions.season_id', seasonId);

    if (matchError) throw matchError;

    const registeredIds = (registrations ?? []).map((registration) => registration.player_id);
    const matchRows = (matches ?? []) as unknown as CompletedMatchRow[];
    const matchPlayerIds = matchRows.flatMap((match) => [...(match.team1_players ?? []), ...(match.team2_players ?? [])]);
    const playerIds = [...new Set([...registeredIds, ...matchPlayerIds])];

    const { error: clearError } = await supabase.from('standings').delete().eq('season_id', seasonId);
    if (clearError) throw clearError;

    if (playerIds.length === 0) {
      return [];
    }

    const stats = new Map(
      playerIds.map((playerId) => [
        playerId,
        {
          playerId,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDifferential: 0,
          currentCourt: 4 as 1 | 2 | 3 | 4,
          court1Appearances: 0,
          perfect6Games: 0,
          seasonPoints: 0,
        },
      ]),
    );

    matchRows.forEach((match) => {
      const courtNumber = match.court_assignments?.court_number ?? 4;
      const team1Won = match.winner === 1 || match.team1_score > match.team2_score;

      match.team1_players.forEach((playerId) => {
        const entry = stats.get(playerId);
        if (!entry) return;

        entry.pointsFor += match.team1_score;
        entry.pointsAgainst += match.team2_score;
        entry.currentCourt = courtNumber;
        if (courtNumber === 1) entry.court1Appearances += 1;
        if (team1Won) {
          entry.wins += 1;
          entry.seasonPoints += 3;
          if (match.team1_score === 6 && match.team2_score === 0) {
            entry.perfect6Games += 1;
          }
        } else {
          entry.losses += 1;
        }
      });

      match.team2_players.forEach((playerId) => {
        const entry = stats.get(playerId);
        if (!entry) return;

        entry.pointsFor += match.team2_score;
        entry.pointsAgainst += match.team1_score;
        entry.currentCourt = courtNumber;
        if (courtNumber === 1) entry.court1Appearances += 1;
        if (!team1Won) {
          entry.wins += 1;
          entry.seasonPoints += 3;
          if (match.team2_score === 6 && match.team1_score === 0) {
            entry.perfect6Games += 1;
          }
        } else {
          entry.losses += 1;
        }
      });
    });

    const standings = [...stats.values()]
      .map((entry) => ({
        ...entry,
        pointDifferential: entry.pointsFor - entry.pointsAgainst,
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.pointDifferential !== a.pointDifferential) return b.pointDifferential - a.pointDifferential;
        return b.pointsFor - a.pointsFor;
      });

    const payload = standings.map((entry, index) => {
      const totalMatches = entry.wins + entry.losses;
      return {
        season_id: seasonId,
        player_id: entry.playerId,
        rank: index + 1,
        wins: entry.wins,
        losses: entry.losses,
        win_percentage: totalMatches > 0 ? entry.wins / totalMatches : 0,
        points_for: entry.pointsFor,
        points_against: entry.pointsAgainst,
        point_differential: entry.pointDifferential,
        current_court: entry.currentCourt,
        court_1_appearances: entry.court1Appearances,
        perfect_6_games: entry.perfect6Games,
        season_points: entry.seasonPoints,
        last_updated: new Date().toISOString(),
      };
    });

    const { data, error } = await supabase.from('standings').insert(payload).select('*');
    if (error) throw error;
    return data;
  },
};
