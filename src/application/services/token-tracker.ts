export interface TokenEntry {
  phase: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export class TokenTracker {
  private entries: TokenEntry[] = [];

  add(entry: TokenEntry): void {
    this.entries.push(entry);
  }

  get totalInput(): number {
    return this.entries.reduce((sum, e) => sum + e.inputTokens, 0);
  }

  get totalOutput(): number {
    return this.entries.reduce((sum, e) => sum + e.outputTokens, 0);
  }

  get totalTokens(): number {
    return this.entries.reduce((sum, e) => sum + e.totalTokens, 0);
  }

  get history(): TokenEntry[] {
    return [...this.entries];
  }

  reset(): void {
    this.entries = [];
  }
}
export type { TokenTracker as ITokenTracker };
