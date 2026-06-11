import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { askChat, getChatLogs } from '../api/chat';
import { useAuthStore } from '../stores/authStore';

export const chatKeys = {
  logs: ['chat', 'logs'] as const
};

export function useAskChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: askChat,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.logs })
  });
}

export function useChatLogsQuery() {
  const hasToken = useAuthStore((state) => Boolean(state.token));

  return useQuery({
    queryKey: chatKeys.logs,
    queryFn: getChatLogs,
    enabled: hasToken
  });
}
