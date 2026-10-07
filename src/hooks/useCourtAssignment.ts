/**
 * React hooks for court assignments
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courtAssignmentService } from '../services/courtAssignments.service';

const COURT_ASSIGNMENT_QUERY_KEY = ['court-assignments'];

export const useSessionCourtAssignments = (sessionId: string) => {
  return useQuery({
    queryKey: [...COURT_ASSIGNMENT_QUERY_KEY, sessionId],
    queryFn: () => courtAssignmentService.getSessionAssignments(sessionId),
    enabled: Boolean(sessionId),
  });
};

export const useReplaceSessionAssignments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, groups }: { sessionId: string; groups: string[][] }) =>
      courtAssignmentService.replaceSessionAssignments(sessionId, groups),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...COURT_ASSIGNMENT_QUERY_KEY, variables.sessionId],
      });
      queryClient.invalidateQueries({ queryKey: COURT_ASSIGNMENT_QUERY_KEY });
    },
  });
};
