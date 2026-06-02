import path from 'node:path';
import type { IDocumentReader } from '../../../domain/interfaces/document-reader.interface.ts';
import type { IFileExtractor } from './extractors.ts';

export class DocumentReaderTool implements IDocumentReader {
  constructor(private extractors: IFileExtractor[]) {}

  isSupported(filepath: string): boolean {
    const ext = path.extname(filepath).toLowerCase();
    return this.extractors.some(extractor => extractor.supports(ext));
  }

  async readAsText(filepath: string): Promise<string> {
    const ext = path.extname(filepath).toLowerCase();
    const extractor = this.extractors.find(e => e.supports(ext));
    if (!extractor) {
      throw new Error(`Định dạng không được hỗ trợ: ${ext}`);
    }
    return await extractor.extract(filepath);
  }
}
