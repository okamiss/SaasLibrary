import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWecomBot,
  deleteWecomBot,
  getWecomBots,
  testSendWecomBot
} from '../api/wecom';
import { useAuthStore } from '../stores/authStore';

export const wecomKeys = {
  bots: ['wecom', 'bots'] as const
};

export function useWecomBotsQuery() {
  const hasToken = useAuthStore((state) => Boolean(state.token));

  return useQuery({
    queryKey: wecomKeys.bots,
    queryFn: getWecomBots,
    enabled: hasToken
  });
}

export function useCreateWecomBotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWecomBot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wecomKeys.bots })
  });
}

export function useDeleteWecomBotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWecomBot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wecomKeys.bots })
  });
}

export function useTestSendWecomBotMutation() {
  return useMutation({
    mutationFn: testSendWecomBot
  });
}
