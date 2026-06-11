import { ConfigService } from '@nestjs/config';
import { EMBEDDING_PROVIDER_NAMES } from './embedding.constants';
import { EmbeddingProvider } from './embedding.types';

interface OpenAICompatibleEmbeddingProviderOptions {
  label: string;
  apiKey?: string;
  baseUrl: string;
  model: string;
}

interface EmbeddingApiResponse {
  data?: Array<{
    index?: number;
    embedding?: number[];
  }>;
}

abstract class OpenAICompatibleEmbeddingProvider implements EmbeddingProvider {
  constructor(private readonly options: OpenAICompatibleEmbeddingProviderOptions) {}

  embedDocuments(texts: string[]) {
    return this.requestEmbeddings(texts);
  }

  async embedQuery(text: string) {
    const [embedding] = await this.requestEmbeddings([text]);
    return embedding;
  }

  private async requestEmbeddings(input: string[]) {
    if (!this.options.apiKey) {
      throw new Error(`${this.options.label} embedding API key is not configured`);
    }

    const response = await fetch(`${this.trimBaseUrl()}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.options.model,
        input
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `${this.options.label} embedding request failed: ${response.status} ${response.statusText} ${body}`.slice(
          0,
          1000
        )
      );
    }

    const payload = (await response.json()) as EmbeddingApiResponse;
    const embeddings = [...(payload.data ?? [])]
      .sort((left, right) => (left.index ?? 0) - (right.index ?? 0))
      .map((item) => item.embedding);

    if (embeddings.length !== input.length || embeddings.some((item) => !item)) {
      throw new Error(`${this.options.label} embedding response is invalid`);
    }

    return embeddings as number[][];
  }

  private trimBaseUrl() {
    return this.options.baseUrl.replace(/\/+$/, '');
  }
}

export class AliyunEmbeddingProvider extends OpenAICompatibleEmbeddingProvider {
  constructor(configService: ConfigService) {
    super({
      label: 'Aliyun',
      apiKey: configService.get<string>('ALI_EMBEDDING_API_KEY'),
      baseUrl: configService.get<string>(
        'ALI_EMBEDDING_BASE_URL',
        'https://dashscope.aliyuncs.com/compatible-mode/v1'
      ),
      model: configService.get<string>(
        'ALI_EMBEDDING_MODEL',
        'text-embedding-v4'
      )
    });
  }
}

export class ZhipuEmbeddingProvider extends OpenAICompatibleEmbeddingProvider {
  constructor(configService: ConfigService) {
    super({
      label: 'Zhipu',
      apiKey: configService.get<string>('ZHIPU_API_KEY'),
      baseUrl: configService.get<string>(
        'ZHIPU_EMBEDDING_BASE_URL',
        'https://open.bigmodel.cn/api/paas/v4'
      ),
      model: configService.get<string>('ZHIPU_EMBEDDING_MODEL', 'embedding-3')
    });
  }
}

export class OpenAIEmbeddingProvider extends OpenAICompatibleEmbeddingProvider {
  constructor(configService: ConfigService) {
    super({
      label: 'OpenAI',
      apiKey: configService.get<string>('OPENAI_API_KEY'),
      baseUrl: configService.get<string>(
        'OPENAI_BASE_URL',
        'https://api.openai.com/v1'
      ),
      model: configService.get<string>(
        'OPENAI_EMBEDDING_MODEL',
        'text-embedding-3-small'
      )
    });
  }
}

export function createEmbeddingProvider(configService: ConfigService) {
  const provider = configService
    .get<string>('EMBEDDING_PROVIDER', EMBEDDING_PROVIDER_NAMES.ALIYUN)
    .toLowerCase();

  if (provider === EMBEDDING_PROVIDER_NAMES.ZHIPU) {
    return new ZhipuEmbeddingProvider(configService);
  }

  if (provider === EMBEDDING_PROVIDER_NAMES.OPENAI) {
    return new OpenAIEmbeddingProvider(configService);
  }

  return new AliyunEmbeddingProvider(configService);
}
