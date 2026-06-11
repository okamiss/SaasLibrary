import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';
import { read, utils } from 'xlsx';
import { ParseDocumentInput, ParseDocumentResult } from './parser.types';

const PDF_MIME_TYPE = 'application/pdf';
const WORD_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const EXCEL_MIME_TYPES = new Set([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);
const TEXT_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'application/markdown',
  'text/x-markdown'
]);

@Injectable()
export class ParserService {
  async parse(input: ParseDocumentInput): Promise<ParseDocumentResult> {
    const rawText = await this.extractText(input);
    const text = this.cleanText(rawText);

    return {
      text,
      metadata: {
        mimeType: input.mimeType,
        characterCount: text.length,
        ...this.buildMetadata(input.mimeType, input.content)
      }
    };
  }

  private async extractText(input: ParseDocumentInput) {
    if (input.mimeType === PDF_MIME_TYPE) {
      return this.extractPdfText(input.content);
    }

    if (WORD_MIME_TYPES.has(input.mimeType)) {
      return this.extractWordText(input.content);
    }

    if (EXCEL_MIME_TYPES.has(input.mimeType)) {
      return this.extractExcelText(input.content);
    }

    if (TEXT_MIME_TYPES.has(input.mimeType)) {
      return input.content.toString('utf8');
    }

    throw new UnsupportedMediaTypeException(
      `Unsupported document mime type: ${input.mimeType}`
    );
  }

  private async extractPdfText(content: Buffer) {
    const parser = new PDFParse({ data: content });

    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  private async extractWordText(content: Buffer) {
    const result = await mammoth.extractRawText({ buffer: content });
    return result.value;
  }

  private extractExcelText(content: Buffer) {
    const workbook = read(content, { type: 'buffer' });

    return workbook.SheetNames.map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const csv = utils.sheet_to_csv(worksheet, {
        blankrows: false
      });

      return [`Sheet: ${sheetName}`, csv].filter(Boolean).join('\n');
    }).join('\n\n');
  }

  private cleanText(text: string) {
    return text
      .replace(/^\uFEFF/, '')
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private buildMetadata(mimeType: string, content: Buffer) {
    if (!EXCEL_MIME_TYPES.has(mimeType)) {
      return {};
    }

    const workbook = read(content, { type: 'buffer', bookSheets: true });

    return {
      sheetCount: workbook.SheetNames.length
    };
  }
}
