import { Inject, Injectable } from '@nestjs/common';
import { OSS_CLIENT } from './oss.constants';
import { OssOperationError } from './oss.errors';
import {
  AliOssClient,
  GenerateObjectKeyInput,
  UploadFileInput,
  UploadFileResult
} from './oss.types';

@Injectable()
export class OssService {
  constructor(@Inject(OSS_CLIENT) private readonly client: AliOssClient) {}

  generateObjectKey(input: GenerateObjectKeyInput) {
    const date = input.date ?? new Date();
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const filename = this.sanitizeFilename(input.filename);

    return `company/${input.companyId}/documents/${year}/${month}/${input.documentId}-${filename}`;
  }

  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    try {
      const options = input.mimeType ? { mime: input.mimeType } : undefined;
      const result = await this.client.put(input.key, input.content, options);

      return {
        key: result.name,
        url: result.url
      };
    } catch (error) {
      throw new OssOperationError('upload', input.key, error);
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const result = await this.client.get(key);
      if (!result.content) {
        return Buffer.alloc(0);
      }

      return Buffer.isBuffer(result.content)
        ? result.content
        : Buffer.from(result.content);
    } catch (error) {
      throw new OssOperationError('download', key, error);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.delete(key);
    } catch (error) {
      throw new OssOperationError('delete', key, error);
    }
  }

  private sanitizeFilename(filename: string) {
    const normalized = filename
      .replace(/[\\/]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/^\.+/g, '')
      .replace(/\.+$/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'file';
  }
}
