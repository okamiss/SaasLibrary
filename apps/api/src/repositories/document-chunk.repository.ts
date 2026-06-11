import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import {
  ReplaceDocumentChunksInput,
  SimilarDocumentChunk
} from '../embedding/embedding.types';

interface SimilarDocumentChunkRow {
  id: string;
  company_id: string;
  document_id: string;
  document_name: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  metadata: unknown;
  similarity: number;
}

@Injectable()
export class DocumentChunkRepository {
  constructor(private readonly prisma: PrismaService) {}

  replaceForDocument(input: ReplaceDocumentChunksInput) {
    return this.prisma.$transaction(async (tx) => {
      await tx.documentChunk.deleteMany({
        where: {
          companyId: input.companyId,
          documentId: input.documentId
        }
      });

      for (const chunk of input.chunks) {
        await tx.$executeRaw`
          INSERT INTO document_chunks (
            id,
            company_id,
            document_id,
            chunk_index,
            content,
            embedding,
            token_count,
            metadata
          )
          VALUES (
            ${randomUUID()}::uuid,
            ${input.companyId}::uuid,
            ${input.documentId}::uuid,
            ${chunk.chunkIndex},
            ${chunk.content},
            ${this.toVectorLiteral(chunk.embedding)}::vector,
            ${chunk.tokenCount},
            ${JSON.stringify(chunk.metadata)}::jsonb
          )
        `;
      }
    });
  }

  async searchSimilar(
    companyId: string,
    queryEmbedding: number[],
    topK: number
  ): Promise<SimilarDocumentChunk[]> {
    const limit = Math.max(1, Math.min(topK, 20));
    const vectorLiteral = this.toVectorLiteral(queryEmbedding);
    const rows = await this.prisma.$queryRaw<SimilarDocumentChunkRow[]>`
      SELECT
        dc.id::text,
        dc.company_id::text,
        dc.document_id::text,
        d.original_name AS document_name,
        dc.chunk_index,
        dc.content,
        dc.token_count,
        dc.metadata,
        (1 - (dc.embedding <=> ${vectorLiteral}::vector))::double precision AS similarity
      FROM document_chunks dc
      INNER JOIN documents d
        ON d.id = dc.document_id
        AND d.company_id = dc.company_id
      WHERE dc.company_id = ${companyId}::uuid
      ORDER BY dc.embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      companyId: row.company_id,
      documentId: row.document_id,
      documentName: row.document_name,
      chunkIndex: row.chunk_index,
      content: row.content,
      tokenCount: row.token_count,
      metadata: row.metadata,
      similarity: row.similarity
    }));
  }

  private toVectorLiteral(embedding: number[]) {
    if (embedding.length === 0) {
      throw new Error('Embedding vector must not be empty');
    }

    for (const value of embedding) {
      if (!Number.isFinite(value)) {
        throw new Error('Embedding vector contains a non-finite value');
      }
    }

    return `[${embedding.join(',')}]`;
  }
}
