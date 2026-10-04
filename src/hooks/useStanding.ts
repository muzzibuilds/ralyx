/**
 * React Hooks for Standing data fetching
 * Wraps React Query and standingService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { standingService } from '../services/standings.service';
import type { Standing } from '../types';

const STANDING_QUERY_KEY = ['standings'];

export const useSeasonStandings = (seasonId: string) => {
  return useQuery({
    queryKey: [...STANDING_QUERY_KEY, 'season', seasonId],
    queryFn: () => standingService.getSeasonStandings(seasonId),
  });
};

export const usePlayerStanding = (seasonId: string, playerId: string) => {
  return useQuery({
    queryKey: [...STANDING_QUERY_KEY, seasonId, playerId],
    queryFn: () => standingService.getPlayerStanding(seasonId, playerId),
  });
};

export const useTopPlayersByWins = (seasonId: string, limit = 10) => {
  return useQuery({
    queryKey: [...STANDING_QUERY_KEY, 'top', seasonId, limit],
    queryFn: () => standingService.getTopPlayersByWins(seasonId, limit),
  });
};

export const useStandingsByCourt = (seasonId: string, court: 1 | 2 | 3 | 4) => {
  return useQuery({
    queryKey: [...STANDING_QUERY_KEY, 'court', seasonId, court],
    queryFn: () => standingService.getStandingsByCourt(seasonId, court),
  });
};

export const useUpsertStanding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (standing: Omit<Standing, 'id'>) =>
      standingService.upsertStanding(standing),
    onSuccess: (_, standing) => {
      queryClient.invalidateQueries({ queryKey: [...STANDING_QUERY_KEY, 'season', standing.seasonId] });
      queryClient.invalidateQueries({ queryKey: [...STANDING_QUERY_KEY, standing.seasonId, standing.playerId] });
    },
  });
};
