import { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import {
  DeepSeekChatProvider,
  OpenAIChatProvider,
  createChatProvider
} from './chat.providers';

describe('createChatProvider', () => {
  it('uses DeepSeek as the default provider', () => {
    const provider = createChatProvider(
      new ConfigService({
        DEEPSEEK_API_KEY: 'deepseek-key',
        DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
        DEEPSEEK_MODEL: 'deepseek-chat'
      })
    );

    expect(provider).toBeInstanceOf(DeepSeekChatProvider);
  });

  it('can select OpenAI provider from environment', () => {
    const provider = createChatProvider(
      new ConfigService({
        CHAT_PROVIDER: 'openai',
        OPENAI_API_KEY: 'openai-key',
        OPENAI_MODEL: 'gpt-4.1-mini'
      })
    );

    expect(provider).toBeInstanceOf(OpenAIChatProvider);
  });
});
