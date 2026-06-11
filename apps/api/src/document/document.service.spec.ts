import {
  BadRequestException,
  NotFoundException,
  UnsupportedMediaTypeException
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  const now = new Date('2026-06-11T00:00:00.000Z');
  const currentUser = {
    id: 'user-1',
    companyId: 'company-1',
    email: 'admin@example.com',
    role: 'ADMIN'
  };
  const uploadedDocument = {
    id: 'document-1',
    companyId: currentUser.companyId,
    uploadedBy: currentUser.id,
    originalName: 'Handbook.pdf',
    fileKey: 'company/company-1/documents/2026/06/document-1-Handbook.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    status: 'UPLOADED',
    errorMessage: null,
    createdAt: now,
    updatedAt: now
  };
  const file = {
    originalname: 'Handbook.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('pdf')
  } as Express.Multer.File;

  const documentRepository = {
    create: vi.fn(),
    findManyByCompany: vi.fn(),
    findByCompanyAndId: vi.fn(),
    deleteWithChunks: vi.fn(),
    markUploadedForReparse: vi.fn()
  };
  const ossService = {
    generateObjectKey: vi.fn(),
    uploadFile: vi.fn(),
    deleteFile: vi.fn()
  };
  const parseQueue = {
    add: vi.fn()
  };

  let service: DocumentService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(now);
    documentRepository.create.mockResolvedValue(uploadedDocument);
    documentRepository.findByCompanyAndId.mockResolvedValue(uploadedDocument);
    documentRepository.deleteWithChunks.mockResolvedValue(uploadedDocument);
    documentRepository.markUploadedForReparse.mockResolvedValue(uploadedDocument);
    ossService.generateObjectKey.mockReturnValue(uploadedDocument.fileKey);
    ossService.uploadFile.mockResolvedValue({ key: uploadedDocument.fileKey });
    parseQueue.add.mockResolvedValue({ id: 'job-1' });

    service = new DocumentService(
      documentRepository as never,
      ossService as never,
      parseQueue as never
    );
  });

  it('uploads a supported file to OSS, creates document metadata, and enqueues parsing', async () => {
    const result = await service.upload(currentUser, file);

    expect(ossService.generateObjectKey).toHaveBeenCalledWith({
      companyId: currentUser.companyId,
      documentId: expect.any(String),
      filename: file.originalname,
      date: now
    });
    expect(ossService.uploadFile).toHaveBeenCalledWith({
      key: uploadedDocument.fileKey,
      content: file.buffer,
      mimeType: file.mimetype
    });
    expect(documentRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      companyId: currentUser.companyId,
      uploadedBy: currentUser.id,
      originalName: file.originalname,
      fileKey: uploadedDocument.fileKey,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: 'UPLOADED',
      errorMessage: null
    });
    expect(parseQueue.add).toHaveBeenCalledWith('parse-document', {
      documentId: uploadedDocument.id,
      companyId: currentUser.companyId,
      fileKey: uploadedDocument.fileKey,
      mimeType: file.mimetype
    });
    expect(result).toEqual({
      document: {
        id: uploadedDocument.id,
        companyId: uploadedDocument.companyId,
        uploadedBy: uploadedDocument.uploadedBy,
        originalName: uploadedDocument.originalName,
        fileKey: uploadedDocument.fileKey,
        fileSize: uploadedDocument.fileSize,
        mimeType: uploadedDocument.mimeType,
        status: 'uploaded',
        errorMessage: null,
        createdAt: uploadedDocument.createdAt,
        updatedAt: uploadedDocument.updatedAt
      }
    });
  });

  it('cleans up metadata and OSS file when queue creation fails after metadata is created', async () => {
    parseQueue.add.mockRejectedValue(new Error('Redis unavailable'));

    await expect(service.upload(currentUser, file)).rejects.toThrow(
      'Redis unavailable'
    );

    expect(documentRepository.create).toHaveBeenCalled();
    expect(documentRepository.deleteWithChunks).toHaveBeenCalledWith(
      currentUser.companyId,
      uploadedDocument.id
    );
    expect(ossService.deleteFile).toHaveBeenCalledWith(uploadedDocument.fileKey);
  });

  it('rejects unsupported file types before uploading', async () => {
    await expect(
      service.upload(currentUser, {
        ...file,
        originalname: 'image.png',
        mimetype: 'image/png'
      } as Express.Multer.File)
    ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);

    expect(ossService.uploadFile).not.toHaveBeenCalled();
    expect(documentRepository.create).not.toHaveBeenCalled();
  });

  it('rejects files that exceed the configured max size before uploading', async () => {
    await expect(
      service.upload(currentUser, {
        ...file,
        size: 26 * 1024 * 1024
      } as Express.Multer.File)
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(ossService.uploadFile).not.toHaveBeenCalled();
  });

  it('lists documents only for the current company', async () => {
    documentRepository.findManyByCompany.mockResolvedValue([uploadedDocument]);

    const result = await service.findMany(currentUser.companyId);

    expect(documentRepository.findManyByCompany).toHaveBeenCalledWith(
      currentUser.companyId
    );
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].status).toBe('uploaded');
  });

  it('returns one document only inside the current company', async () => {
    const result = await service.findById(currentUser.companyId, 'document-1');

    expect(documentRepository.findByCompanyAndId).toHaveBeenCalledWith(
      currentUser.companyId,
      'document-1'
    );
    expect(result.document.id).toBe('document-1');
  });

  it('throws when a document is not owned by the current company', async () => {
    documentRepository.findByCompanyAndId.mockResolvedValue(null);

    await expect(
      service.findById(currentUser.companyId, 'foreign-document')
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes OSS file and document chunks for a current-company document', async () => {
    const result = await service.delete(currentUser.companyId, 'document-1');

    expect(documentRepository.findByCompanyAndId).toHaveBeenCalledWith(
      currentUser.companyId,
      'document-1'
    );
    expect(ossService.deleteFile).toHaveBeenCalledWith(uploadedDocument.fileKey);
    expect(documentRepository.deleteWithChunks).toHaveBeenCalledWith(
      currentUser.companyId,
      'document-1'
    );
    expect(result).toEqual({ deleted: true, id: 'document-1' });
  });

  it('reparse resets current-company document status and enqueues parse-document', async () => {
    const result = await service.reparse(currentUser.companyId, 'document-1');

    expect(documentRepository.findByCompanyAndId).toHaveBeenCalledWith(
      currentUser.companyId,
      'document-1'
    );
    expect(documentRepository.markUploadedForReparse).toHaveBeenCalledWith(
      currentUser.companyId,
      'document-1'
    );
    expect(parseQueue.add).toHaveBeenCalledWith('parse-document', {
      documentId: uploadedDocument.id,
      companyId: currentUser.companyId,
      fileKey: uploadedDocument.fileKey,
      mimeType: uploadedDocument.mimeType
    });
    expect(result.document.status).toBe('uploaded');
  });
});
