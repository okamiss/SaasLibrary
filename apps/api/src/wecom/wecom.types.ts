import { WecomBot, WecomBotStatus } from '@prisma/client';

export type WecomBotResponse = Omit<WecomBot, 'status'> & {
  status: Lowercase<WecomBotStatus>;
};

export interface WecomWebhookResult {
  errcode: number;
  errmsg?: string;
}

export type WecomWebhookPayload =
  | {
      msgtype: 'text';
      text: {
        content: string;
      };
    }
  | {
      msgtype: 'markdown';
      markdown: {
        content: string;
      };
    };
