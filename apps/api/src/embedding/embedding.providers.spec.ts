import { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import {
  AliyunEmbeddingProvider,
  OpenAIEmbeddingProvider,
  ZhipuEmbeddingProvider,
  createEmbeddingProvider
} from './embedding.providers';

describe('createEmbeddingProvider', () => {
  it('uses aliyun as the default provider', () => {
    const provider = createEmbeddingProvider(
      new ConfigService({
        ALI_EMBEDDING_API_KEY: 'ali-key',
        ALI_EMBEDDING_BASE_URL: 'https://dashscope.example/v1',
        ALI_EMBEDDING_MODEL: 'text-embedding-v4'
      })
    );

    expect(provider).toBeInstanceOf(AliyunEmbeddingProvider);
  });

  it('can select zhipu provider from environment', () => {
    const provider = createEmbeddingProvider(
      new ConfigService({
        EMBEDDING_PROVIDER: 'zhipu',
        ZHIPU_API_KEY: 'zhipu-key',
        ZHIPU_EMBEDDING_MODEL: 'embedding-3'
      })
    );

    expect(provider).toBeInstanceOf(ZhipuEmbeddingProvider);
  });

  it('can select OpenAI provider from environment', () => {
    const provider = createEmbeddingProvider(
      new ConfigService({
        EMBEDDING_PROVIDER: 'openai',
        OPENAI_API_KEY: 'openai-key',
        OPENAI_EMBEDDING_MODEL: 'text-embedding-3-small'
      })
    );

    expect(provider).toBeInstanceOf(OpenAIEmbeddingProvider);
  });
});
