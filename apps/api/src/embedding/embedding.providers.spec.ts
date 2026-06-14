import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AliyunEmbeddingProvider,
  OpenAIEmbeddingProvider,
  ZhipuEmbeddingProvider,
  createEmbeddingProvider
} from './embedding.providers';

const createAliyunProvider = () =>
  new AliyunEmbeddingProvider(
    new ConfigService({
      ALI_EMBEDDING_API_KEY: 'ali-secret-key',
      ALI_EMBEDDING_BASE_URL: 'https://dashscope.example/v1',
      ALI_EMBEDDING_MODEL: 'text-embedding-v4'
    })
  );

const mockEmbeddingResponse = (batchSize: number, requestOffset: number) => ({
  ok: true,
  json: async () => ({
    data: Array.from({ length: batchSize }, (_, index) => ({
      index,
      embedding: [requestOffset + index]
    }))
  })
});

afterEach(() => {
  vi.restoreAllMocks();
});

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

describe('AliyunEmbeddingProvider', () => {
  it('batches document embeddings into at most 10 inputs and preserves order', async () => {
    let requestOffset = 0;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string) as { input: string[] };
      const response = mockEmbeddingResponse(body.input.length, requestOffset);
      requestOffset += body.input.length;
      return response;
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = createAliyunProvider();
    const embeddings = await provider.embedDocuments(
      Array.from({ length: 11 }, (_, index) => `chunk-${index}`)
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      fetchMock.mock.calls.map(([, init]) => {
        const body = JSON.parse(init?.body as string) as { input: string[] };
        return body.input;
      })
    ).toEqual([
      Array.from({ length: 10 }, (_, index) => `chunk-${index}`),
      ['chunk-10']
    ]);
    expect(embeddings).toEqual(
      Array.from({ length: 11 }, (_, index) => [index])
    );
  });

  it('logs failed batch metadata without exposing the API key', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string) as { input: string[] };
      if (body.input.length === 1) {
        return {
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          text: async () => 'too many inputs'
        };
      }

      return mockEmbeddingResponse(body.input.length, 0);
    });
    vi.stubGlobal('fetch', fetchMock);
    const errorSpy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    const provider = createAliyunProvider();

    await expect(
      provider.embedDocuments(
        Array.from({ length: 11 }, (_, index) => `chunk-${index}`)
      )
    ).rejects.toThrow('Aliyun embedding request failed');

    const logOutput = errorSpy.mock.calls.flat().join('\n');
    expect(logOutput).toContain('provider=Aliyun');
    expect(logOutput).toContain('batchIndex=1');
    expect(logOutput).toContain('batchSize=1');
    expect(logOutput).toContain('model=text-embedding-v4');
    expect(logOutput).not.toContain('ali-secret-key');
  });
});
