import { ConfigService } from '@nestjs/config';
import { CHAT_PROVIDER_NAMES } from './chat.constants';
import {
  ChatProvider,
  ChatProviderCompleteInput,
  ChatProviderCompleteResult
} from './chat.types';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  model?: string;
}

interface OpenAICompatibleChatProviderOptions {
  label: string;
  apiKey?: string;
  baseUrl: string;
  model: string;
}

abstract class OpenAICompatibleChatProvider implements ChatProvider {
  constructor(private readonly options: OpenAICompatibleChatProviderOptions) {}

  getModel() {
    return this.options.model;
  }

  async complete(
    input: ChatProviderCompleteInput
  ): Promise<ChatProviderCompleteResult> {
    if (!this.options.apiKey) {
      throw new Error(`${this.options.label} API key is not configured`);
    }

    const response = await fetch(`${this.trimBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.options.model,
        messages: [
          {
            role: 'system',
            content: input.systemPrompt
          },
          {
            role: 'user',
            content: input.userPrompt
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `${this.options.label} chat request failed: ${response.status} ${response.statusText} ${body}`.slice(
          0,
          1000
        )
      );
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const answer = payload.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      throw new Error(`${this.options.label} chat response is empty`);
    }

    return {
      answer,
      model: payload.model ?? this.options.model,
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0
    };
  }

  private trimBaseUrl() {
    return this.options.baseUrl.replace(/\/+$/, '');
  }
}

export class DeepSeekChatProvider extends OpenAICompatibleChatProvider {
  constructor(configService: ConfigService) {
    super({
      label: 'DeepSeek',
      apiKey: configService.get<string>('DEEPSEEK_API_KEY'),
      baseUrl: configService.get<string>(
        'DEEPSEEK_BASE_URL',
        'https://api.deepseek.com'
      ),
      model: configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat')
    });
  }
}

export class OpenAIChatProvider extends OpenAICompatibleChatProvider {
  constructor(configService: ConfigService) {
    super({
      label: 'OpenAI',
      apiKey: configService.get<string>('OPENAI_API_KEY'),
      baseUrl: configService.get<string>(
        'OPENAI_BASE_URL',
        'https://api.openai.com/v1'
      ),
      model: configService.get<string>('OPENAI_MODEL', 'gpt-4.1-mini')
    });
  }
}

export function createChatProvider(configService: ConfigService) {
  const provider = configService
    .get<string>('CHAT_PROVIDER', CHAT_PROVIDER_NAMES.DEEPSEEK)
    .toLowerCase();

  if (provider === CHAT_PROVIDER_NAMES.OPENAI) {
    return new OpenAIChatProvider(configService);
  }

  return new DeepSeekChatProvider(configService);
}
