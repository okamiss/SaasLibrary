import type {
  DeleteWecomBotResponse,
  TestSendWecomBotInput,
  TestSendWecomBotResponse,
  WecomBotResponse,
  WecomBotsResponse
} from '@ai-company-assistant/shared';
import { apiClient } from './http';

export interface CreateWecomBotInput {
  name: string;
  webhookUrl: string;
  secret?: string;
}

export async function getWecomBots() {
  const response = await apiClient.get<WecomBotsResponse>('/wecom/bots');
  return response.data.bots;
}

export async function createWecomBot(input: CreateWecomBotInput) {
  const response = await apiClient.post<WecomBotResponse>('/wecom/bots', input);
  return response.data.bot;
}

export async function deleteWecomBot(id: string) {
  const response = await apiClient.delete<DeleteWecomBotResponse>(
    `/wecom/bots/${id}`
  );
  return response.data;
}

export async function testSendWecomBot({
  id,
  msgtype,
  content
}: TestSendWecomBotInput) {
  const response = await apiClient.post<TestSendWecomBotResponse>(
    `/wecom/bots/${id}/test-send`,
    {
      msgtype,
      content
    }
  );
  return response.data;
}
