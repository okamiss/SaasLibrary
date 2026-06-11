export const DOCUMENT_UPLOAD_FIELD = 'file';
export const MAX_DOCUMENT_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export const SUPPORTED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'application/markdown',
  'text/x-markdown'
]);
