import type { LLMUsage } from './llm-provider.interface.ts';

/**
 * Pipeline Observer — Interface thuần Domain/Application
 *
 * Cho phép tầng Application (Use Case) thông báo trạng thái pipeline
 * mà không cần biết đến tầng Presentation (UI).
 *
 * Tầng Presentation implement interface này để render dashboard.
 */
export interface IPipelineObserver {
  onStart(slug: string): void;
  onPhaseStart(phase: string): void;
  onPhaseComplete(phase: string, success: boolean): void;
  onPhaseFail(phase: string, error: string): void;
  onPhaseSkip(phase: string): void;
  onTokenUsage(phase: string, usage: LLMUsage): void;
  onFinalize(): void;
}

/**
 * NullObserver — Implementation mặc định (no-op)
 * Dùng khi chạy pipeline không cần UI (test, batch headless)
 */
export class NullPipelineObserver implements IPipelineObserver {
  onStart(_slug: string): void {}
  onPhaseStart(_phase: string): void {}
  onPhaseComplete(_phase: string, _success: boolean): void {}
  onPhaseFail(_phase: string, _error: string): void {}
  onPhaseSkip(_phase: string): void {}
  onTokenUsage(_phase: string, _usage: LLMUsage): void {}
  onFinalize(): void {}
}
