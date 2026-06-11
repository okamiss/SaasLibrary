import type {
  DeleteDocumentResponse,
  DocumentResponse,
  DocumentsResponse
} from '@ai-company-assistant/shared';
import { apiClient } from './http';

const DOCUMENT_UPLOAD_FIELD = 'file';

export async function getDocuments() {
  const response = await apiClient.get<DocumentsResponse>('/documents');
  return response.data.documents;
}

export async function getDocument(id: string) {
  const response = await apiClient.get<DocumentResponse>(`/documents/${id}`);
  return response.data.document;
}

export async function uploadDocument(file: File) {
  const body = new FormData();
  body.append(DOCUMENT_UPLOAD_FIELD, file);

  const response = await apiClient.post<DocumentResponse>(
    '/documents/upload',
    body
  );

  return response.data.document;
}

export async function deleteDocument(id: string) {
  const response = await apiClient.delete<DeleteDocumentResponse>(
    `/documents/${id}`
  );
  return response.data;
}

export async function reparseDocument(id: string) {
  const response = await apiClient.post<DocumentResponse>(
    `/documents/${id}/reparse`
  );
  return response.data.document;
}
