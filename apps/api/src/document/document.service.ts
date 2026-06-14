import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnsupportedMediaTypeException
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Document, DocumentStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { OssService } from '../oss/oss.service';
import { QUEUE_JOB_NAMES, QUEUE_NAMES } from '../queue/queue.constants';
import { DocumentRepository } from '../repositories/document.repository';
import {
  MAX_DOCUMENT_FILE_SIZE_BYTES,
  SUPPORTED_DOCUMENT_MIME_TYPES
} from './document.constants';
import {
  DocumentResponse,
  DocumentUploadFile,
  ParseDocumentJobPayload
} from './document.types';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly ossService: OssService,
    @InjectQueue(QUEUE_NAMES.DEFAULT)
    private readonly parseQueue: Queue<ParseDocumentJobPayload>
  ) {}

  async upload(
    currentUser: { id: string; companyId: string },
    file?: DocumentUploadFile
  ) {
    this.validateFile(file);

    const documentId = randomUUID();
    const originalName = this.normalizeOriginalFilename(file.originalname);
    const fileKey = this.ossService.generateObjectKey({
      companyId: currentUser.companyId,
      documentId,
      filename: originalName,
      date: new Date()
    });

    await this.ossService.uploadFile({
      key: fileKey,
      content: file.buffer,
      mimeType: file.mimetype
    });

    let document: Document | undefined;
    try {
      document = await this.documentRepository.create({
        id: documentId,
        companyId: currentUser.companyId,
        uploadedBy: currentUser.id,
        originalName,
        fileKey,
        fileSize: file.size,
        mimeType: file.mimetype,
        status: DocumentStatus.UPLOADED,
        errorMessage: null
      });

      await this.enqueueParseDocument(document);

      return {
        document: this.toResponse(document)
      };
    } catch (error) {
      if (document) {
        await this.cleanupCreatedDocument(document.companyId, document.id);
      }
      await this.cleanupUploadedFile(fileKey);
      throw error;
    }
  }

  async findMany(companyId: string) {
    const documents = await this.documentRepository.findManyByCompany(
      companyId
    );

    return {
      documents: documents.map((document) => this.toResponse(document))
    };
  }

  async findById(companyId: string, id: string) {
    const document = await this.getOwnedDocument(companyId, id);

    return {
      document: this.toResponse(document)
    };
  }

  async delete(companyId: string, id: string) {
    const document = await this.getOwnedDocument(companyId, id);

    await this.ossService.deleteFile(document.fileKey);
    await this.documentRepository.deleteWithChunks(companyId, id);

    return {
      deleted: true,
      id
    };
  }

  async reparse(companyId: string, id: string) {
    await this.getOwnedDocument(companyId, id);
    const document = await this.documentRepository.markUploadedForReparse(
      companyId,
      id
    );
    await this.enqueueParseDocument(document);

    return {
      document: this.toResponse(document)
    };
  }

  private validateFile(
    file?: DocumentUploadFile
  ): asserts file is DocumentUploadFile {
    if (!file) {
      throw new BadRequestException('Document file is required');
    }

    if (!file.buffer || file.size <= 0) {
      throw new BadRequestException('Document file is empty');
    }

    if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `Document file must be ${MAX_DOCUMENT_FILE_SIZE_BYTES} bytes or smaller`
      );
    }

    if (!SUPPORTED_DOCUMENT_MIME_TYPES.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        'Supported document types: PDF, Word, Excel, TXT, Markdown'
      );
    }
  }

  private async getOwnedDocument(companyId: string, id: string) {
    const document = await this.documentRepository.findByCompanyAndId(
      companyId,
      id
    );
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  private enqueueParseDocument(document: Document) {
    return this.parseQueue.add(QUEUE_JOB_NAMES.PARSE_DOCUMENT, {
      documentId: document.id,
      companyId: document.companyId,
      fileKey: document.fileKey,
      mimeType: document.mimeType
    });
  }

  private async cleanupUploadedFile(fileKey: string) {
    try {
      await this.ossService.deleteFile(fileKey);
    } catch (error) {
      throw new InternalServerErrorException(
        'Document upload failed and uploaded file cleanup failed'
      );
    }
  }

  private async cleanupCreatedDocument(companyId: string, id: string) {
    await this.documentRepository.deleteWithChunks(companyId, id);
  }

  private normalizeOriginalFilename(filename: string) {
    const decoded = Buffer.from(filename, 'latin1').toString('utf8');
    const hasReplacementCharacter = decoded.includes('\uFFFD');
    const looksLikeMojibake = /[\u0080-\u009FÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(
      filename
    );

    if (!hasReplacementCharacter && looksLikeMojibake) {
      return decoded;
    }

    return filename;
  }

  private toResponse(document: Document): DocumentResponse {
    return {
      ...document,
      originalName: this.normalizeOriginalFilename(document.originalName),
      status: document.status.toLowerCase() as Lowercase<DocumentStatus>
    };
  }
}
