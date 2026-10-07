/**
 * Match Service
 * Generates matches from court assignments and syncs standings on result entry
 */

import { supabase } from '../lib/supabase';
import { standingService } from './standings.service';

export interface MatchScorecardRow {
  id: string;
  sessionId: string;
  seasonId: string;
  weekNumber: number;
  sessionDate: string;
  courtNumber: number;
  setNumber: 1 | 2;
  team1Players: string[];
  team2Players: string[];
  team1Names: string[];
  team2Names: string[];
  team1Score: number;
  team2Score: number;
  winner: 1 | 2;
  status: 'scheduled' | 'in_progress' | 'completed';
}

interface AssignmentRow {
  id: string;
  session_id: string;
  set_number: 1 | 2;
  court_number: 1 | 2 | 3 | 4;
  players: string[];
}

function buildTeams(players: string[], setNumber: 1 | 2) {
  if (players.length < 4) {
    return {
      team1: players.slice(0, 2),
      team2: players.slice(2, 4),
    };
  }

  if (setNumber === 1) {
    return {
      team1: [players[0], players[3]],
      team2: [players[1], players[2]],
    };
  }

  return {
    team1: [players[0], players[2]],
    team2: [players[1], players[3]],
  };
}

export const matchService = {
  async generateMatchesForSession(sessionId: string) {
    const { data: completedMatches, error: completedError } = await supabase
      .from('matches')
      .select('id')
      .eq('session_id', sessionId)
      .eq('status', 'completed')
      .limit(1);

    if (completedError) throw completedError;

    if ((completedMatches ?? []).length > 0) {
      throw new Error('Completed matches already exist for this week. Generation is locked.');
    }

    const { data: assignments, error: assignmentError } = await supabase
      .from('court_assignments')
      .select('*')
      .eq('session_id', sessionId)
      .order('set_number', { ascending: true })
      .order('court_number', { ascending: true });

    if (assignmentError) throw assignmentError;

    const typedAssignments = (assignments ?? []) as AssignmentRow[];

    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) throw deleteError;

    const payload = typedAssignments
      .filter((assignment) => assignment.players.length === 4)
      .map((assignment) => {
        const { team1, team2 } = buildTeams(assignment.players, assignment.set_number);
        return {
          session_id: sessionId,
          court_assignment_id: assignment.id,
          set_number: assignment.set_number,
          team1_players: team1,
          team2_players: team2,
          team1_score: 0,
          team2_score: 0,
          winner: 1,
          point_differential: 0,
          status: 'scheduled' as const,
        };
      });

    if (payload.length === 0) {
      return [];
    }

    const { data, error } = await supabase.from('matches').insert(payload).select('*');
    if (error) throw error;
    return data;
  },

  async getScorecardMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        sessions!inner(season_id, week_number, session_date),
        court_assignments!inner(court_number, set_number)
      `)
      .in('status', ['scheduled', 'in_progress', 'completed'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const matches = data ?? [];
    const playerIds = [...new Set(matches.flatMap((match) => [
      ...(match.team1_players ?? []),
      ...(match.team2_players ?? []),
    ]))];

    let playerMap = new Map<string, string>();
    if (playerIds.length > 0) {
      const { data: players, error: playerError } = await supabase
        .from('players')
        .select('id, first_name, last_name')
        .in('id', playerIds);

      if (playerError) throw playerError;

      playerMap = new Map(
        (players ?? []).map((player) => [player.id, `${player.first_name} ${player.last_name}`]),
      );
    }

    return matches.map((match) => ({
      id: match.id,
      sessionId: match.session_id,
      seasonId: match.sessions.season_id,
      weekNumber: match.sessions.week_number,
      sessionDate: match.sessions.session_date,
      courtNumber: match.court_assignments.court_number,
      setNumber: match.set_number,
      team1Players: match.team1_players,
      team2Players: match.team2_players,
      team1Names: (match.team1_players ?? []).map((playerId: string) => playerMap.get(playerId) ?? 'Unknown Player'),
      team2Names: (match.team2_players ?? []).map((playerId: string) => playerMap.get(playerId) ?? 'Unknown Player'),
      team1Score: match.team1_score,
      team2Score: match.team2_score,
      winner: match.winner,
      status: match.status,
    })) as MatchScorecardRow[];
  },

  async recordResult(matchId: string, team1Score: number, team2Score: number) {
    const winner = team1Score >= team2Score ? 1 : 2;
    const pointDifferential = Math.abs(team1Score - team2Score);

    const { data, error } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        team1_score: team1Score,
        team2_score: team2Score,
        winner,
        point_differential: pointDifferential,
        completed_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select('session_id, sessions!inner(season_id)')
      .single();

    if (error) throw error;

    const sessionData = Array.isArray(data.sessions) ? data.sessions[0] : data.sessions;
    const seasonId = sessionData.season_id;
    await standingService.rebuildSeasonStandings(seasonId);

    return data;
  },
};
