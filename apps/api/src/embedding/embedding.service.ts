import { Inject, Injectable } from '@nestjs/common';
import { DocumentChunkRepository } from '../repositories/document-chunk.repository';
import { EMBEDDING_PROVIDER } from './embedding.constants';
import {
  EmbeddingProvider,
  IndexDocumentInput
} from './embedding.types';

const TARGET_CHUNK_SIZE = 800;
const MIN_CHUNK_SIZE = 500;
const MAX_CHUNK_SIZE = 1000;

@Injectable()
export class EmbeddingService {
  constructor(
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly documentChunkRepository: DocumentChunkRepository
  ) {}

  chunkText(text: string) {
    const normalized = text.trim();
    if (!normalized) {
      return [];
    }

    const chunks: string[] = [];
    for (let offset = 0; offset < normalized.length; offset += TARGET_CHUNK_SIZE) {
      chunks.push(normalized.slice(offset, offset + TARGET_CHUNK_SIZE));
    }

    const lastChunk = chunks[chunks.length - 1];
    const previousChunk = chunks[chunks.length - 2];
    if (
      chunks.length > 1 &&
      lastChunk.length < MIN_CHUNK_SIZE &&
      previousChunk.length + lastChunk.length <= MAX_CHUNK_SIZE
    ) {
      chunks.splice(chunks.length - 2, 2, previousChunk + lastChunk);
    }

    return chunks;
  }

  async indexDocument(input: IndexDocumentInput) {
    const chunks = this.chunkText(input.text);
    if (chunks.length === 0) {
      await this.documentChunkRepository.replaceForDocument({
        companyId: input.companyId,
        documentId: input.documentId,
        chunks: []
      });
      return { chunkCount: 0 };
    }

    const embeddings = await this.embeddingProvider.embedDocuments(chunks);
    await this.documentChunkRepository.replaceForDocument({
      companyId: input.companyId,
      documentId: input.documentId,
      chunks: chunks.map((content, index) => ({
        chunkIndex: index,
        content,
        embedding: embeddings[index],
        tokenCount: this.estimateTokenCount(content),
        metadata: {
          parser: input.metadata,
          chunk: {
            startOffset: this.getStartOffset(chunks, index),
            endOffset: this.getStartOffset(chunks, index) + content.length
          }
        }
      }))
    });

    return { chunkCount: chunks.length };
  }

  search(companyId: string, queryEmbedding: number[], topK: number) {
    return this.documentChunkRepository.searchSimilar(
      companyId,
      queryEmbedding,
      topK
    );
  }

  async searchByText(companyId: string, query: string, topK: number) {
    const queryEmbedding = await this.embeddingProvider.embedQuery(query);
    return this.search(companyId, queryEmbedding, topK);
  }

  private estimateTokenCount(content: string) {
    return content.length;
  }

  private getStartOffset(chunks: string[], index: number) {
    return chunks
      .slice(0, index)
      .reduce((offset, chunk) => offset + chunk.length, 0);
  }
}
