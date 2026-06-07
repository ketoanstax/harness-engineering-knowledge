import { describe, test, expect, mock } from 'bun:test';
import { EpubExtractor } from '../../../src/infrastructure/tools/document-reader/extractors.ts';

// Mock EPub module
mock.module('epub', () => {
  return {
    default: class MockEPub {
      public flow = [{ id: 'ch1' }, { id: 'ch2' }];
      constructor(public filepath: string) {}
      on(event: string, callback: any) {
        if (event === 'end') {
          setTimeout(() => callback(), 10);
        }
      }
      getChapter(id: string, callback: any) {
        if (id === 'ch1') {
          callback(null, '<h1>Chapter 1</h1><p>Hello World</p>');
        } else if (id === 'ch2') {
          callback(null, '<h1>Chapter 2</h1><p>EPUB works</p>');
        } else {
          callback(new Error('Not found'), null);
        }
      }
      parse() {}
    }
  };
});

describe('EpubExtractor', () => {
  test('supports .epub extension', () => {
    const extractor = new EpubExtractor();
    expect(extractor.supports('.epub')).toBe(true);
    expect(extractor.supports('.pdf')).toBe(false);
  });

  test('extracts text content from mocked epub flow', async () => {
    const extractor = new EpubExtractor();
    const text = await extractor.extract('mocked_book.epub');
    expect(text).toContain('CHAPTER 1');
    expect(text).toContain('Hello World');
    expect(text).toContain('CHAPTER 2');
    expect(text).toContain('EPUB works');
  });
});
