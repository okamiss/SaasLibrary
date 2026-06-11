import type {
  AskChatResponse,
  ChatLogsResponse
} from '@ai-company-assistant/shared';
import { apiClient } from './http';

export async function askChat(question: string) {
  const response = await apiClient.post<AskChatResponse>('/chat/ask', {
    question
  });

  return response.data;
}

export async function getChatLogs() {
  const response = await apiClient.get<ChatLogsResponse>('/chat/logs');
  return response.data.logs;
}
