import { UnsupportedMediaTypeException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { utils, write } from 'xlsx';
import { ParserService } from './parser.service';

describe('ParserService', () => {
  const service = new ParserService();

  it('extracts and cleans plain text documents', async () => {
    const result = await service.parse({
      mimeType: 'text/plain',
      content: Buffer.from('  Alpha\t\tBeta  \r\n\r\n\r\n Gamma  ', 'utf8')
    });

    expect(result.text).toBe('Alpha Beta\n\nGamma');
    expect(result.metadata).toEqual({
      mimeType: 'text/plain',
      characterCount: 17
    });
  });

  it('extracts markdown documents as cleaned text', async () => {
    const result = await service.parse({
      mimeType: 'text/markdown',
      content: Buffer.from('# Title\r\n\r\n- Item', 'utf8')
    });

    expect(result.text).toBe('# Title\n\n- Item');
  });

  it('extracts workbook sheets into searchable text', async () => {
    const workbook = utils.book_new();
    const worksheet = utils.aoa_to_sheet([
      ['Name', 'Role'],
      ['Alice', 'Admin']
    ]);
    utils.book_append_sheet(workbook, worksheet, 'Users');
    const content = Buffer.from(
      write(workbook, { type: 'buffer', bookType: 'xlsx' })
    );

    const result = await service.parse({
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      content
    });

    expect(result.text).toContain('Sheet: Users');
    expect(result.text).toContain('Name,Role');
    expect(result.text).toContain('Alice,Admin');
  });

  it('rejects unsupported mime types', async () => {
    await expect(
      service.parse({
        mimeType: 'image/png',
        content: Buffer.from('png')
      })
    ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
  });
});
