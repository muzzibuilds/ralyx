/**
 * React Hooks for Player data fetching
 * Wraps React Query and playerService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerService } from '../services/players.service';
import type { Player } from '../types';

const PLAYER_QUERY_KEY = ['players'];

export const usePlayer = (playerId: string) => {
  return useQuery({
    queryKey: [...PLAYER_QUERY_KEY, playerId],
    queryFn: () => playerService.getPlayer(playerId),
  });
};

export const usePlayers = (limit?: number, offset?: number) => {
  return useQuery({
    queryKey: [...PLAYER_QUERY_KEY, { limit, offset }],
    queryFn: () => playerService.getPlayers(limit, offset),
  });
};

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) =>
      playerService.createPlayer(player),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEY });
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Player, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      playerService.updatePlayer(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...PLAYER_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEY });
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: string) => playerService.deletePlayer(playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEY });
    },
  });
};
