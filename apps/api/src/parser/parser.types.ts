export interface ParseDocumentInput {
  mimeType: string;
  content: Buffer;
}

export interface ParseDocumentResult {
  text: string;
  metadata: {
    mimeType: string;
    characterCount: number;
    sheetCount?: number;
  };
}
