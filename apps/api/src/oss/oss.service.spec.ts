import { describe, expect, it, vi } from 'vitest';
import { OssOperationError } from './oss.errors';
import { OssService } from './oss.service';

describe('OssService', () => {
  const client = {
    put: vi.fn(),
    get: vi.fn(),
    delete: vi.fn()
  };

  const service = new OssService(client as never);

  it('generates tenant-scoped document object keys', () => {
    const key = service.generateObjectKey({
      companyId: 'company-1',
      documentId: 'document-1',
      filename: '员工 手册.pdf',
      date: new Date('2026-06-11T10:00:00.000Z')
    });

    expect(key).toBe(
      'company/company-1/documents/2026/06/document-1-员工-手册.pdf'
    );
  });

  it('removes path separators from filenames when generating keys', () => {
    const key = service.generateObjectKey({
      companyId: 'company-1',
      documentId: 'document-1',
      filename: '../payroll\\private.xlsx',
      date: new Date('2026-01-02T10:00:00.000Z')
    });

    expect(key).toBe(
      'company/company-1/documents/2026/01/document-1-payroll-private.xlsx'
    );
  });

  it('uploads content to OSS using the generated key and mime type', async () => {
    client.put.mockResolvedValueOnce({
      name: 'object-key',
      url: 'https://bucket.oss-cn-shanghai.aliyuncs.com/object-key',
      res: { status: 200 }
    });

    const result = await service.uploadFile({
      key: 'object-key',
      content: Buffer.from('hello'),
      mimeType: 'text/plain'
    });

    expect(client.put).toHaveBeenCalledWith(
      'object-key',
      Buffer.from('hello'),
      { mime: 'text/plain' }
    );
    expect(result.key).toBe('object-key');
    expect(result.url).toContain('object-key');
  });

  it('downloads content from OSS as a buffer', async () => {
    client.get.mockResolvedValueOnce({
      content: Buffer.from('hello')
    });

    const result = await service.downloadFile('object-key');

    expect(client.get).toHaveBeenCalledWith('object-key');
    expect(result.equals(Buffer.from('hello'))).toBe(true);
  });

  it('deletes content from OSS by object key', async () => {
    client.delete.mockResolvedValueOnce({ res: { status: 204 } });

    await service.deleteFile('object-key');

    expect(client.delete).toHaveBeenCalledWith('object-key');
  });

  it('wraps OSS SDK upload failures with operation context', async () => {
    client.put.mockRejectedValueOnce(new Error('network down'));

    await expect(
      service.uploadFile({
        key: 'object-key',
        content: Buffer.from('hello')
      })
    ).rejects.toMatchObject({
      operation: 'upload',
      key: 'object-key'
    } satisfies Partial<OssOperationError>);
  });
});
