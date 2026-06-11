import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ParseDocumentJobPayload } from '../document/document.types';
import { EmbeddingService } from '../embedding/embedding.service';
import { OssService } from '../oss/oss.service';
import { QUEUE_JOB_NAMES, QUEUE_NAMES } from '../queue/queue.constants';
import { DocumentRepository } from '../repositories/document.repository';
import { ParserService } from './parser.service';

@Injectable()
@Processor(QUEUE_NAMES.DEFAULT)
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly ossService: OssService,
    private readonly parserService: ParserService,
    private readonly embeddingService: EmbeddingService
  ) {
    super();
  }

  async process(job: Job<ParseDocumentJobPayload, unknown, string>) {
    if (job.name !== QUEUE_JOB_NAMES.PARSE_DOCUMENT) {
      this.logger.debug(`Ignoring unsupported job: ${job.name}`);
      return {
        ignored: true,
        jobName: job.name
      };
    }

    const { documentId, companyId } = job.data;
    const document = await this.documentRepository.findByCompanyAndId(
      companyId,
      documentId
    );

    if (!document) {
      this.logger.warn(
        `parse-document skipped: document not found. companyId=${companyId} documentId=${documentId}`
      );
      return {
        documentId,
        companyId,
        status: 'skipped',
        reason: 'document-not-found'
      };
    }

    try {
      await this.documentRepository.markParsing(companyId, documentId);
      const content = await this.ossService.downloadFile(document.fileKey);
      const result = await this.parserService.parse({
        mimeType: document.mimeType,
        content
      });
      const indexResult = await this.embeddingService.indexDocument({
        companyId,
        documentId,
        text: result.text,
        metadata: result.metadata
      });

      this.logger.log(
        `parse-document completed. companyId=${companyId} documentId=${documentId} textLength=${result.text.length} chunkCount=${indexResult.chunkCount}`
      );

      await this.documentRepository.markCompleted(companyId, documentId);

      return {
        documentId,
        companyId,
        textLength: result.text.length,
        chunkCount: indexResult.chunkCount,
        status: 'completed'
      };
    } catch (error) {
      const errorMessage = this.toErrorMessage(error);
      this.logger.error(
        `parse-document failed. companyId=${companyId} documentId=${documentId} error=${errorMessage}`
      );
      await this.documentRepository.markFailed(
        companyId,
        documentId,
        errorMessage
      );

      return {
        documentId,
        companyId,
        status: 'failed',
        errorMessage
      };
    }
  }

  private toErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
      return error.message.slice(0, 1000);
    }

    return String(error).slice(0, 1000);
  }
}
