/**
 * React Hooks for Session data fetching
 * Wraps React Query and sessionService
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '../services/sessions.service';
import type { Session } from '../types';

const SESSION_QUERY_KEY = ['sessions'];

export const useSeasonSessions = (seasonId: string) => {
  return useQuery({
    queryKey: [...SESSION_QUERY_KEY, 'season', seasonId],
    queryFn: () => sessionService.getSeasonSessions(seasonId),
    enabled: Boolean(seasonId),
  });
};

export const useSession = (sessionId: string) => {
  return useQuery({
    queryKey: [...SESSION_QUERY_KEY, sessionId],
    queryFn: () => sessionService.getSession(sessionId),
    enabled: Boolean(sessionId),
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) =>
      sessionService.createSession(session),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SESSION_QUERY_KEY, 'season', variables.seasonId],
      });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Session, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      sessionService.updateSession(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
};
