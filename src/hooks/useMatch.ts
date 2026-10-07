/**
 * React hooks for match generation and scorecards
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { matchService } from '../services/matches.service';

const MATCH_QUERY_KEY = ['matches'];

export const useScorecardMatches = () => {
  return useQuery({
    queryKey: [...MATCH_QUERY_KEY, 'scorecard'],
    queryFn: () => matchService.getScorecardMatches(),
  });
};

export const useGenerateSessionMatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => matchService.generateMatchesForSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['court-assignments', sessionId] });
    },
  });
};

export const useRecordMatchResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, team1Score, team2Score }: { matchId: string; team1Score: number; team2Score: number }) =>
      matchService.recordResult(matchId, team1Score, team2Score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
    },
  });
};
