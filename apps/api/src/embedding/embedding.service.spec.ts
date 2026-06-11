import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmbeddingService } from './embedding.service';

describe('EmbeddingService', () => {
  const provider = {
    embedDocuments: vi.fn(),
    embedQuery: vi.fn()
  };
  const chunkRepository = {
    replaceForDocument: vi.fn(),
    searchSimilar: vi.fn()
  };
  let service: EmbeddingService;

  beforeEach(() => {
    vi.clearAllMocks();
    provider.embedDocuments.mockResolvedValue([
      [0.1, 0.2, 0.3],
      [0.2, 0.3, 0.4]
    ]);
    service = new EmbeddingService(provider as never, chunkRepository as never);
  });

  it('splits long Chinese text into chunks between 500 and 1000 characters', () => {
    const text = '知'.repeat(1800);

    const chunks = service.chunkText(text);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].length).toBeGreaterThanOrEqual(500);
    expect(chunks[0].length).toBeLessThanOrEqual(1000);
    expect(chunks[1].length).toBeGreaterThanOrEqual(500);
    expect(chunks[1].length).toBeLessThanOrEqual(1000);
    expect(chunks.join('')).toBe(text);
  });

  it('embeds chunks and replaces document chunks with metadata', async () => {
    await service.indexDocument({
      companyId: 'company-1',
      documentId: 'document-1',
      text: '知'.repeat(1300),
      metadata: {
        mimeType: 'text/plain',
        characterCount: 1300
      }
    });

    expect(provider.embedDocuments).toHaveBeenCalledWith([
      '知'.repeat(800),
      '知'.repeat(500)
    ]);
    expect(chunkRepository.replaceForDocument).toHaveBeenCalledWith({
      companyId: 'company-1',
      documentId: 'document-1',
      chunks: [
        {
          chunkIndex: 0,
          content: '知'.repeat(800),
          embedding: [0.1, 0.2, 0.3],
          tokenCount: 800,
          metadata: {
            parser: {
              mimeType: 'text/plain',
              characterCount: 1300
            },
            chunk: {
              startOffset: 0,
              endOffset: 800
            }
          }
        },
        {
          chunkIndex: 1,
          content: '知'.repeat(500),
          embedding: [0.2, 0.3, 0.4],
          tokenCount: 500,
          metadata: {
            parser: {
              mimeType: 'text/plain',
              characterCount: 1300
            },
            chunk: {
              startOffset: 800,
              endOffset: 1300
            }
          }
        }
      ]
    });
  });

  it('skips embedding and clears chunks for empty parsed text', async () => {
    await service.indexDocument({
      companyId: 'company-1',
      documentId: 'document-1',
      text: '   ',
      metadata: {
        mimeType: 'text/plain',
        characterCount: 0
      }
    });

    expect(provider.embedDocuments).not.toHaveBeenCalled();
    expect(chunkRepository.replaceForDocument).toHaveBeenCalledWith({
      companyId: 'company-1',
      documentId: 'document-1',
      chunks: []
    });
  });

  it('embeds query text and searches similar chunks within a company', async () => {
    provider.embedQuery.mockResolvedValue([0.9, 0.8, 0.7]);
    chunkRepository.searchSimilar.mockResolvedValue([
      {
        id: 'chunk-1',
        companyId: 'company-1',
        documentId: 'document-1',
        chunkIndex: 0,
        content: 'policy',
        tokenCount: 10,
        metadata: {},
        similarity: 0.93
      }
    ]);

    const result = await service.searchByText('company-1', 'policy', 5);

    expect(provider.embedQuery).toHaveBeenCalledWith('policy');
    expect(chunkRepository.searchSimilar).toHaveBeenCalledWith(
      'company-1',
      [0.9, 0.8, 0.7],
      5
    );
    expect(result).toHaveLength(1);
  });
});
