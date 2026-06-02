import { describe, test, expect } from 'bun:test';
import { TokenTracker, type TokenEntry } from '../../../src/application/services/token-tracker.ts';

describe('TokenTracker', () => {
  test('khởi tạo với danh sách rỗng', () => {
    const tracker = new TokenTracker();
    expect(tracker.totalInput).toBe(0);
    expect(tracker.totalOutput).toBe(0);
    expect(tracker.totalTokens).toBe(0);
    expect(tracker.history).toEqual([]);
  });

  test('thêm entry và tính tổng chính xác', () => {
    const tracker = new TokenTracker();

    tracker.add({ phase: 'mapper', operation: 'map', inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    tracker.add({ phase: 'planner', operation: 'plan', inputTokens: 200, outputTokens: 100, totalTokens: 300 });

    expect(tracker.totalInput).toBe(300);
    expect(tracker.totalOutput).toBe(150);
    expect(tracker.totalTokens).toBe(450);
  });

  test('thêm entry với số 0', () => {
    const tracker = new TokenTracker();
    tracker.add({ phase: 'test', operation: 'no-op', inputTokens: 0, outputTokens: 0, totalTokens: 0 });

    expect(tracker.totalInput).toBe(0);
    expect(tracker.totalOutput).toBe(0);
    expect(tracker.totalTokens).toBe(0);
    expect(tracker.history).toHaveLength(1);
  });

  test('history trả về bản sao không bị tham chiếu', () => {
    const tracker = new TokenTracker();
    tracker.add({ phase: 'mapper', operation: 'map', inputTokens: 100, outputTokens: 50, totalTokens: 150 });

    const history = tracker.history;
    history.push({ phase: 'fake', operation: 'fake', inputTokens: 999, outputTokens: 999, totalTokens: 1998 });

    // history bị sửa không ảnh hưởng entries gốc
    expect(tracker.history).toHaveLength(1);
    expect(tracker.totalTokens).toBe(150);
  });

  test('reset khôi phục trạng thái rỗng', () => {
    const tracker = new TokenTracker();
    tracker.add({ phase: 'mapper', operation: 'map', inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    tracker.reset();

    expect(tracker.totalInput).toBe(0);
    expect(tracker.totalOutput).toBe(0);
    expect(tracker.totalTokens).toBe(0);
    expect(tracker.history).toEqual([]);
  });

  test('nhiều entry với số liệu không đồng nhất', () => {
    const tracker = new TokenTracker();

    const entries: TokenEntry[] = [
      { phase: 'a', operation: 'op1', inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      { phase: 'b', operation: 'op2', inputTokens: 20, outputTokens: 10, totalTokens: 30 },
      { phase: 'c', operation: 'op3', inputTokens: 30, outputTokens: 15, totalTokens: 45 },
      { phase: 'd', operation: 'op4', inputTokens: 40, outputTokens: 20, totalTokens: 60 },
    ];

    for (const e of entries) tracker.add(e);

    expect(tracker.totalInput).toBe(100);
    expect(tracker.totalOutput).toBe(50);
    expect(tracker.totalTokens).toBe(150);
    expect(tracker.history).toHaveLength(4);
  });
});
