import { Document } from '@prisma/client';

export interface ParseDocumentJobPayload {
  documentId: string;
  companyId: string;
  fileKey: string;
  mimeType: string;
}

export type DocumentResponse = Omit<Document, 'status'> & {
  status: Lowercase<Document['status']>;
};

export interface DocumentUploadFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
