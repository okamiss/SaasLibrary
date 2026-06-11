export interface ChatProviderCompleteInput {
  systemPrompt: string;
  userPrompt: string;
}

export interface ChatProviderCompleteResult {
  answer: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
}

export interface ChatProvider {
  getModel(): string;
  complete(input: ChatProviderCompleteInput): Promise<ChatProviderCompleteResult>;
}

export interface ChatSource {
  documentId: string;
  documentName: string;
  chunkId: string;
  contentSnippet: string;
  similarityScore: number;
}
