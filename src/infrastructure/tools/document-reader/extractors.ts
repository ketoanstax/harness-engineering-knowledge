import path from 'node:path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import type { IFileSystem } from '../../../domain/interfaces/file-system.interface.ts';

export interface IFileExtractor {
  supports(ext: string): boolean;
  extract(filepath: string): Promise<string>;
}

export class TextExtractor implements IFileExtractor {
  constructor(private fs: IFileSystem) {}

  supports(ext: string): boolean {
    return ['.md', '.txt', '.csv'].includes(ext);
  }

  async extract(filepath: string): Promise<string> {
    return this.fs.readFile(filepath);
  }
}

export class PdfTextExtractor implements IFileExtractor {
  constructor(private fs: IFileSystem) {}

  supports(ext: string): boolean {
    return ext === '.pdf';
  }

  async extract(filepath: string): Promise<string> {
    const buffer = this.fs.readFileBuffer(filepath);
    const uint8 = new Uint8Array(buffer);
    const parser = new PDFParse({ data: uint8 });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
}

export class DocxExtractor implements IFileExtractor {
  constructor(private fs: IFileSystem) {}

  supports(ext: string): boolean {
    return ext === '.docx';
  }

  async extract(filepath: string): Promise<string> {
    const buffer = this.fs.readFileBuffer(filepath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
