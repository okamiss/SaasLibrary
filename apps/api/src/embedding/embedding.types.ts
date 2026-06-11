export interface EmbeddingProvider {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

export interface IndexDocumentInput {
  companyId: string;
  documentId: string;
  text: string;
  metadata: Record<string, unknown>;
}

export interface DocumentChunkInput {
  chunkIndex: number;
  content: string;
  embedding: number[];
  tokenCount: number;
  metadata: Record<string, unknown>;
}

export interface ReplaceDocumentChunksInput {
  companyId: string;
  documentId: string;
  chunks: DocumentChunkInput[];
}

export interface SimilarDocumentChunk {
  id: string;
  companyId: string;
  documentId: string;
  documentName?: string;
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
  metadata: unknown;
  similarity: number;
}
