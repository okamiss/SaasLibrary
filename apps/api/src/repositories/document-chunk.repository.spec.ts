import { describe, expect, it, vi } from 'vitest';
import { DocumentChunkRepository } from './document-chunk.repository';

describe('DocumentChunkRepository', () => {
  it('deletes old chunks with companyId and documentId before inserting replacements', async () => {
    const prisma = {
      $transaction: vi.fn(async (callback) =>
        callback({
          documentChunk: {
            deleteMany: vi.fn()
          },
          $executeRaw: vi.fn()
        })
      )
    };
    const repository = new DocumentChunkRepository(prisma as never);

    await repository.replaceForDocument({
      companyId: 'company-1',
      documentId: 'document-1',
      chunks: [
        {
          chunkIndex: 0,
          content: 'content',
          embedding: [0.1, 0.2],
          tokenCount: 1,
          metadata: {
            chunk: {
              startOffset: 0,
              endOffset: 7
            }
          }
        }
      ]
    });

    const tx = prisma.$transaction.mock.calls[0][0];
    const documentChunk = {
      deleteMany: vi.fn()
    };
    const executeRaw = vi.fn();
    await tx({
      documentChunk,
      $executeRaw: executeRaw
    });

    expect(documentChunk.deleteMany).toHaveBeenCalledWith({
      where: {
        companyId: 'company-1',
        documentId: 'document-1'
      }
    });
    expect(executeRaw).toHaveBeenCalledOnce();
  });

  it('searches similar chunks with companyId and topK', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValue([])
    };
    const repository = new DocumentChunkRepository(prisma as never);

    await repository.searchSimilar('company-1', [0.1, 0.2], 3);

    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
    const sql = String(prisma.$queryRaw.mock.calls[0][0].join(' '));
    expect(sql).toContain('WHERE dc.company_id =');
    expect(sql).toContain('ORDER BY dc.embedding <=>');
    expect(sql).toContain('LIMIT');
  });
});
