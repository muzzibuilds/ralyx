/**
 * React Hooks for Registration data fetching
 * Wraps React Query and registrationService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationService } from '../services/registrations.service';
import type { Registration, RegistrationStatus } from '../types';

const REGISTRATION_QUERY_KEY = ['registrations'];

export const useRegistration = (registrationId: string) => {
  return useQuery({
    queryKey: [...REGISTRATION_QUERY_KEY, registrationId],
    queryFn: () => registrationService.getRegistration(registrationId),
  });
};

export const useSeasonRegistrations = (seasonId: string, status?: RegistrationStatus) => {
  return useQuery({
    queryKey: [...REGISTRATION_QUERY_KEY, 'season', seasonId, status],
    queryFn: () => registrationService.getRegistrationsBySeason(seasonId, status),
  });
};

export const useConfirmedCount = (seasonId: string) => {
  return useQuery({
    queryKey: [...REGISTRATION_QUERY_KEY, 'count', seasonId],
    queryFn: () => registrationService.getConfirmedCount(seasonId),
  });
};

export const usePlayerRegistrations = (playerId: string) => {
  return useQuery({
    queryKey: [...REGISTRATION_QUERY_KEY, 'player', playerId],
    queryFn: () => registrationService.getPlayerRegistrations(playerId),
  });
};

export const useCreateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registration: Omit<Registration, 'id'>) =>
      registrationService.createRegistration(registration),
    onSuccess: (_, registration) => {
      queryClient.invalidateQueries({ queryKey: [...REGISTRATION_QUERY_KEY, 'season', registration.seasonId] });
      queryClient.invalidateQueries({ queryKey: [...REGISTRATION_QUERY_KEY, 'count', registration.seasonId] });
    },
  });
};

export const useUpdateRegistrationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RegistrationStatus }) =>
      registrationService.updateRegistrationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGISTRATION_QUERY_KEY });
    },
  });
};

export const useMarkAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount, stripeSessionId }: { id: string; amount: number; stripeSessionId: string }) =>
      registrationService.markAsPaid(id, amount, stripeSessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGISTRATION_QUERY_KEY });
    },
  });
};
