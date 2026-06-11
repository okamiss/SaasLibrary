import { DocumentStatus } from '@prisma/client';
import { Job } from 'bullmq';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QUEUE_JOB_NAMES } from '../queue/queue.constants';
import { ParseDocumentJobPayload } from '../document/document.types';
import { DocumentProcessor } from './document.processor';

describe('DocumentProcessor', () => {
  const payload: ParseDocumentJobPayload = {
    documentId: 'document-1',
    companyId: 'company-1',
    fileKey: 'company/company-1/documents/2026/06/document-1-Handbook.pdf',
    mimeType: 'application/pdf'
  };
  const document = {
    id: payload.documentId,
    companyId: payload.companyId,
    uploadedBy: 'user-1',
    originalName: 'Handbook.pdf',
    fileKey: payload.fileKey,
    fileSize: 1024,
    mimeType: payload.mimeType,
    status: DocumentStatus.UPLOADED,
    errorMessage: null,
    createdAt: new Date('2026-06-11T00:00:00.000Z'),
    updatedAt: new Date('2026-06-11T00:00:00.000Z')
  };
  const documentRepository = {
    findByCompanyAndId: vi.fn(),
    markParsing: vi.fn(),
    markCompleted: vi.fn(),
    markFailed: vi.fn()
  };
  const ossService = {
    downloadFile: vi.fn()
  };
  const parserService = {
    parse: vi.fn()
  };
  const embeddingService = {
    indexDocument: vi.fn()
  };
  let processor: DocumentProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    documentRepository.findByCompanyAndId.mockResolvedValue(document);
    documentRepository.markParsing.mockResolvedValue({
      ...document,
      status: DocumentStatus.PARSING
    });
    documentRepository.markCompleted.mockResolvedValue({
      ...document,
      status: DocumentStatus.COMPLETED
    });
    documentRepository.markFailed.mockResolvedValue({
      ...document,
      status: DocumentStatus.FAILED,
      errorMessage: 'parse failed'
    });
    ossService.downloadFile.mockResolvedValue(Buffer.from('pdf'));
    parserService.parse.mockResolvedValue({
      text: 'Parsed text',
      metadata: {
        mimeType: payload.mimeType,
        characterCount: 11
      }
    });
    embeddingService.indexDocument.mockResolvedValue({ chunkCount: 1 });
    processor = new DocumentProcessor(
      documentRepository as never,
      ossService as never,
      parserService as never,
      embeddingService as never
    );
  });

  it('downloads, parses, indexes chunks, and completes a current-company document job', async () => {
    const result = await processor.process(buildJob(payload));

    expect(documentRepository.findByCompanyAndId).toHaveBeenCalledWith(
      payload.companyId,
      payload.documentId
    );
    expect(documentRepository.markParsing).toHaveBeenCalledWith(
      payload.companyId,
      payload.documentId
    );
    expect(ossService.downloadFile).toHaveBeenCalledWith(document.fileKey);
    expect(parserService.parse).toHaveBeenCalledWith({
      mimeType: document.mimeType,
      content: Buffer.from('pdf')
    });
    expect(embeddingService.indexDocument).toHaveBeenCalledWith({
      companyId: payload.companyId,
      documentId: payload.documentId,
      text: 'Parsed text',
      metadata: {
        mimeType: payload.mimeType,
        characterCount: 11
      }
    });
    expect(documentRepository.markCompleted).toHaveBeenCalledWith(
      payload.companyId,
      payload.documentId
    );
    expect(result).toEqual({
      documentId: payload.documentId,
      companyId: payload.companyId,
      textLength: 11,
      chunkCount: 1,
      status: 'completed'
    });
  });

  it('marks the document as failed and resolves when parsing throws', async () => {
    parserService.parse.mockRejectedValue(new Error('PDF password required'));

    const result = await processor.process(buildJob(payload));

    expect(documentRepository.markFailed).toHaveBeenCalledWith(
      payload.companyId,
      payload.documentId,
      'PDF password required'
    );
    expect(result).toEqual({
      documentId: payload.documentId,
      companyId: payload.companyId,
      status: 'failed',
      errorMessage: 'PDF password required'
    });
  });

  it('marks the document as failed when embedding indexing throws', async () => {
    embeddingService.indexDocument.mockRejectedValue(
      new Error('Aliyun embedding request failed: 401 Unauthorized')
    );

    const result = await processor.process(buildJob(payload));

    expect(documentRepository.markFailed).toHaveBeenCalledWith(
      payload.companyId,
      payload.documentId,
      'Aliyun embedding request failed: 401 Unauthorized'
    );
    expect(documentRepository.markCompleted).not.toHaveBeenCalled();
    expect(result).toEqual({
      documentId: payload.documentId,
      companyId: payload.companyId,
      status: 'failed',
      errorMessage: 'Aliyun embedding request failed: 401 Unauthorized'
    });
  });

  it('ignores unrelated job names without touching documents', async () => {
    const result = await processor.process(
      buildJob(payload, 'different-job')
    );

    expect(documentRepository.findByCompanyAndId).not.toHaveBeenCalled();
    expect(result).toEqual({
      ignored: true,
      jobName: 'different-job'
    });
  });

  it('does not crash when the document is missing in the current company', async () => {
    documentRepository.findByCompanyAndId.mockResolvedValue(null);

    const result = await processor.process(buildJob(payload));

    expect(documentRepository.markParsing).not.toHaveBeenCalled();
    expect(result).toEqual({
      documentId: payload.documentId,
      companyId: payload.companyId,
      status: 'skipped',
      reason: 'document-not-found'
    });
  });
});

function buildJob(
  data: ParseDocumentJobPayload,
  name = QUEUE_JOB_NAMES.PARSE_DOCUMENT
) {
  return {
    name,
    data
  } as Job<ParseDocumentJobPayload, unknown, string>;
}
