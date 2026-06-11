export interface GenerateObjectKeyInput {
  companyId: string;
  documentId: string;
  filename: string;
  date?: Date;
}

export interface UploadFileInput {
  key: string;
  content: Buffer;
  mimeType?: string;
}

export interface UploadFileResult {
  key: string;
  url?: string;
}

export interface AliOssClient {
  put(
    key: string,
    content: Buffer,
    options?: { mime?: string }
  ): Promise<{ name: string; url?: string }>;
  get(key: string): Promise<{ content?: Buffer | Uint8Array | string }>;
  delete(key: string): Promise<unknown>;
}
