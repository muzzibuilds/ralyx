/**
 * React Hooks for Demand Lead data fetching
 * Wraps React Query and demandService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { demandService } from '../services/demand.service';
import type { DemandLead } from '../types';

const DEMAND_QUERY_KEY = ['demand'];

export const useDemandLeads = (limit?: number, offset?: number) => {
  return useQuery({
    queryKey: [...DEMAND_QUERY_KEY, { limit, offset }],
    queryFn: () => demandService.getDemandLeads(limit, offset),
  });
};

export const useDemandLeadsCount = () => {
  return useQuery({
    queryKey: [...DEMAND_QUERY_KEY, 'count'],
    queryFn: () => demandService.getDemandLeadsCount(),
  });
};

export const useCreateDemandLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lead: Omit<DemandLead, 'id' | 'createdAt'>) =>
      demandService.createDemandLead(lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEMAND_QUERY_KEY });
    },
  });
};

export const useDeleteDemandLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => demandService.deleteDemandLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEMAND_QUERY_KEY });
    },
  });
};
