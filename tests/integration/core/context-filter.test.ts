import { describe, test, expect } from 'bun:test';
import type { AtomicNodeMeta } from '../../../src/domain/interfaces/node-repository.interface.ts';
import { tokenize, calculateJaccard, filterRelevantNodes } from '../../../src/core/context-filter.ts';

describe('context-filter', () => {
  // ─── tokenize ───────────────────────────────────────────────────────────────
  describe('tokenize', () => {
    test('tách từ thô thành set các token viết thường', () => {
      const result = tokenize('Hello World! AI-Powered.');
      expect(result).toEqual(new Set(['hello', 'world', 'ai', 'powered']));
    });

    test('chuỗi rỗng trả về Set rỗng', () => {
      expect(tokenize('')).toEqual(new Set());
    });

    test('chuỗi chỉ có ký tự đặc biệt trả về Set rỗng', () => {
      expect(tokenize('!@#$%^&*()')).toEqual(new Set());
    });

    test('xử lý unicode tiếng Việt', () => {
      const result = tokenize('Tứ Thánh Đế, Duyên Khởi');
      expect(result.has('tứ')).toBe(true);
      expect(result.has('thánh')).toBe(true);
      expect(result.has('đế')).toBe(true);
      expect(result.has('duyên')).toBe(true);
      expect(result.has('khởi')).toBe(true);
    });
  });

  // ─── calculateJaccard ───────────────────────────────────────────────────────
  describe('calculateJaccard', () => {
    test('2 set giống hệt nhau trả về 1', () => {
      const set = new Set(['a', 'b', 'c']);
      expect(calculateJaccard(set, set)).toBe(1);
    });

    test('2 set không có phần tử chung trả về 0', () => {
      const set1 = new Set(['a', 'b']);
      const set2 = new Set(['c', 'd']);
      expect(calculateJaccard(set1, set2)).toBe(0);
    });

    test('2 set có phần tử chung một phần', () => {
      const set1 = new Set(['a', 'b', 'c']);
      const set2 = new Set(['a', 'b', 'd']);
      // intersection = {a, b} = 2, union = {a, b, c, d} = 4
      expect(calculateJaccard(set1, set2)).toBe(0.5);
    });

    test('1 trong 2 set rỗng trả về 0', () => {
      expect(calculateJaccard(new Set(['a']), new Set())).toBe(0);
      expect(calculateJaccard(new Set(), new Set(['a']))).toBe(0);
    });
  });

  // ─── filterRelevantNodes ────────────────────────────────────────────────────
  describe('filterRelevantNodes', () => {
    const sampleNodes: AtomicNodeMeta[] = [
      { slug: 'tu-de', title: 'Tứ Diệu Đế', tags: ['dharma'], definition: 'Bốn chân lý cao quý', parent: null, children: ['bat-chanh-dao'] },
      { slug: 'bat-chanh-dao', title: 'Bát Chánh Đạo', tags: ['practice', 'path'], definition: 'Con đường tám ngành', parent: 'tu-de', children: [] },
      { slug: 'duyen-khoi', title: 'Duyên Khởi', tags: ['dharma', 'causality'], definition: 'Lý nhân duyên', parent: null, children: [] },
      { slug: 'vo-thuong', title: 'Vô Thường', tags: ['existence'], definition: 'Mọi sự đều biến đổi', parent: null, children: [] },
    ];

    test('trả về mảng rỗng nếu allNodes trống', () => {
      const result = filterRelevantNodes([{ name: 'test', definition: 'test' }], [], 10);
      expect(result).toEqual([]);
    });

    test('trả về mảng rỗng nếu keywords trống', () => {
      const result = filterRelevantNodes([], sampleNodes, 10);
      expect(result).toEqual([]);
    });

    test('lọc nốt liên quan dựa trên từ khóa', () => {
      const keywords = [{ name: 'Tứ Diệu Đế', definition: 'Bốn chân lý cao quý trong Phật giáo' }];
      const result = filterRelevantNodes(keywords, sampleNodes, 10);

      // Kết quả phải chứa 'tu-de' (điểm Jaccard cao nhất: title matches)
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].slug).toBe('tu-de');
    });

    test('mở rộng đồ thị kéo theo nốt con', () => {
      const keywords = [{ name: 'Tứ Diệu Đế', definition: '' }];
      const result = filterRelevantNodes(keywords, sampleNodes, 10);

      // Kết quả phải chứa cả 'tu-de' và 'bat-chanh-dao' (con của tu-de)
      const slugs = result.map(n => n.slug);
      expect(slugs).toContain('tu-de');
      expect(slugs).toContain('bat-chanh-dao');
    });

    test('giới hạn maxResults', () => {
      const result = filterRelevantNodes([{ name: 'dharma', definition: 'Phật pháp' }], sampleNodes, 1);
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });
});
