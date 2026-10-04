/**
 * React Hooks for Season data fetching
 * Wraps React Query and seasonService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seasonService } from '../services/seasons.service';
import type { Season } from '../types';

const SEASON_QUERY_KEY = ['seasons'];

export const useSeason = (seasonId: string) => {
  return useQuery({
    queryKey: [...SEASON_QUERY_KEY, seasonId],
    queryFn: () => seasonService.getSeason(seasonId),
  });
};

export const useSeasons = () => {
  return useQuery({
    queryKey: SEASON_QUERY_KEY,
    queryFn: () => seasonService.getSeasons(),
  });
};

export const useCurrentSeason = () => {
  return useQuery({
    queryKey: [...SEASON_QUERY_KEY, 'current'],
    queryFn: () => seasonService.getCurrentSeason(),
  });
};

export const useCreateSeason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (season: Omit<Season, 'id' | 'createdAt' | 'updatedAt'>) =>
      seasonService.createSeason(season),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEASON_QUERY_KEY });
    },
  });
};

export const useUpdateSeason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Season, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      seasonService.updateSeason(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...SEASON_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: SEASON_QUERY_KEY });
    },
  });
};

export const useUpdateSeasonStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Season['status'] }) =>
      seasonService.updateSeasonStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...SEASON_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: SEASON_QUERY_KEY });
    },
  });
};
