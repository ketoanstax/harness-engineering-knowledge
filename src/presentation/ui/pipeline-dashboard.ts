import type { IPipelineObserver } from '../../domain/interfaces/pipeline-observer.interface.ts';
import type { LLMUsage } from '../../domain/interfaces/llm-provider.interface.ts';
import type { TokenTracker } from '../../application/services/token-tracker.ts';
import chalk from 'chalk';

export type PhaseStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface PhaseInfo {
  name: string;
  label: string;
  status: PhaseStatus;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  durationMs?: number;
}

// Hàm tính độ rộng chữ chuẩn xác (bỏ qua mã màu ANSI)
const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, '');
const padR = (str: string, width: number) => str + ' '.repeat(Math.max(0, width - stripAnsi(str).length));
const padL = (str: string, width: number) => ' '.repeat(Math.max(0, width - stripAnsi(str).length)) + str;

export class PipelineDashboard implements IPipelineObserver {
  private tokenTracker: TokenTracker;
  private phases: PhaseInfo[] = [];
  private sourceSlug = '';
  private startTime: number = Date.now();

  // Animation & Rendering
  private renderInterval: NodeJS.Timeout | null = null;
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;
  private lastRenderedLines = 0;
  private readonly TABLE_WIDTH = 70;

  // Console Hijacking
  private isHooked = false;
  private origLog = console.log;
  private origError = console.error;
  private origWarn = console.warn;

  constructor(tokenTracker: TokenTracker) {
    this.tokenTracker = tokenTracker;
    this.resetPhases();
  }

  // ============ IPipelineObserver Implementation ============

  onStart(slug: string): void {
    this.sourceSlug = slug;
    this.startTime = Date.now();
    this.lastRenderedLines = 0;
    console.clear();
  }

  onPhaseStart(phase: string): void {
    const p = this.phases.find(p => p.name === phase);
    if (p) {
      p.status = 'running';
      p.durationMs = Date.now();
    }
    this.startEngine();
  }

  onPhaseComplete(phase: string, success: boolean): void {
    const p = this.phases.find(p => p.name === phase);
    if (p) {
      p.status = success ? 'completed' : 'failed';
      if (p.durationMs) p.durationMs = Date.now() - p.durationMs;
    }
    this.syncTokens(phase);

    if (!this.phases.some(p => p.status === 'running')) {
      this.stopEngine();
    }
  }

  onPhaseFail(phase: string, _error: string): void {
    const p = this.phases.find(p => p.name === phase);
    if (p) p.status = 'failed';
    this.stopEngine();
  }

  onPhaseSkip(phase: string): void {
    const p = this.phases.find(p => p.name === phase);
    if (p) p.status = 'skipped';
  }

  onTokenUsage(phase: string, usage: LLMUsage): void {
    this.tokenTracker.add({ phase, operation: `${phase} operation`, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens });
  }

  onFinalize(): void {
    this.stopEngine();
  }

  // ============ Internal Helpers ============

  reset(): void {
    this.stopEngine();
    this.resetPhases();
    this.sourceSlug = '';
    this.startTime = Date.now();
    this.lastRenderedLines = 0;
  }

  private resetPhases(): void {
    this.phases = [
      { name: 'MAP',    label: '1. MAP (Mapper)',       status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'REDUCE', label: '2. REDUCE (Reducer)',   status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'PLAN',   label: '3. PLAN (Planner)',     status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'REFINE', label: '4. REFINE (Refiner)',   status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'VERIFY', label: '5. VERIFY (Verifier)',  status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'COMMIT', label: '6. COMMIT (Committer)', status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    ];
  }

  // === HỆ THỐNG KIỂM SOÁT GIAO DIỆN ===

  private hookConsole(): void {
    if (this.isHooked) return;
    this.isHooked = true;
    process.stdout.write('\x1b[?25l');

    const createHook = (originalFn: Function) => (...args: any[]) => {
      this.clearTable();
      originalFn.apply(console, args);
      this.drawTable();
    };

    console.log = createHook(this.origLog);
    console.error = createHook(this.origError);
    console.warn = createHook(this.origWarn);
  }

  private unhookConsole(): void {
    if (!this.isHooked) return;
    console.log = this.origLog;
    console.error = this.origError;
    console.warn = this.origWarn;
    this.isHooked = false;
    process.stdout.write('\x1b[?25h');
  }

  private clearTable(): void {
    if (this.lastRenderedLines > 0) {
      process.stdout.write(`\r\x1b[${this.lastRenderedLines}A\x1b[J`);
      this.lastRenderedLines = 0;
    }
  }

  private startEngine(): void {
    this.hookConsole();
    if (!this.renderInterval) {
      this.renderInterval = setInterval(() => {
        this.frameIndex++;
        this.clearTable();
        this.drawTable();
      }, 80);
    }
  }

  private stopEngine(): void {
    if (this.renderInterval) {
      clearInterval(this.renderInterval);
      this.renderInterval = null;
    }
    this.unhookConsole();
    this.clearTable();
    this.drawTable();
  }

  private syncTokens(phaseName: string): void {
    const p = this.phases.find(p => p.name === phaseName);
    if (p) {
      const entry = this.tokenTracker.history.find(e => e.phase === phaseName);
      if (entry) {
        p.inputTokens = entry.inputTokens;
        p.outputTokens = entry.outputTokens;
        p.totalTokens = entry.totalTokens;
      }
    }
  }

  // === HÀM VẼ BẢNG ===
  private drawTable(): void {
    const lines: string[] = [];
    const H = chalk.cyan;

    lines.push(H('╭' + '─'.repeat(this.TABLE_WIDTH) + '╮'));

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    let slugDisp = this.sourceSlug || 'Ingesting...';
    if (slugDisp.length > 40) slugDisp = slugDisp.substring(0, 37) + '...';

    const titleLeft = ` 🚀 PIPELINE: ${chalk.white(slugDisp)}`;
    const titleRight = `${chalk.dim(duration + 's')} `;

    const spaceCount = this.TABLE_WIDTH - stripAnsi(titleLeft).length - stripAnsi(titleRight).length;
    lines.push(H('│') + chalk.bold.yellow(titleLeft) + ' '.repeat(Math.max(0, spaceCount)) + titleRight + H('│'));
    lines.push(H('├' + '─'.repeat(this.TABLE_WIDTH) + '┤'));

    const colHeader = padR('  Phase', 24) + padR('Status', 10) + padL('Input', 8) + padL('Output', 8) + padL('Total', 8) + padL('Time  ', 12);
    lines.push(H('│') + chalk.bold(colHeader) + H('│'));
    lines.push(H('├' + '─'.repeat(this.TABLE_WIDTH) + '┤'));

    for (const p of this.phases) {
      let statusStr = '';
      if (p.status === 'pending') statusStr = chalk.gray('[ WAIT ]');
      else if (p.status === 'completed') statusStr = chalk.green('[ DONE ]');
      else if (p.status === 'failed') statusStr = chalk.red('[ FAIL ]');
      else if (p.status === 'skipped') statusStr = chalk.blue('[ SKIP ]');
      else if (p.status === 'running') {
        const frame = this.frames[this.frameIndex % this.frames.length];
        statusStr = chalk.yellow.bold(`[ ${frame} RUN]`);
      }

      const inStr = p.inputTokens > 0 ? String(p.inputTokens) : '—';
      const outStr = p.outputTokens > 0 ? String(p.outputTokens) : '—';
      const totStr = p.totalTokens > 0 ? String(p.totalTokens) : '—';
      const timeVal = p.durationMs && p.status !== 'running' && p.status !== 'pending' ? `${(p.durationMs / 1000).toFixed(1)}s` : '';

      const rowData = padR(`  ${p.label}`, 24)
                    + padR(statusStr, 10)
                    + padL(inStr, 8)
                    + padL(outStr, 8)
                    + padL(totStr, 8)
                    + padL(timeVal, 10) + '  ';

      lines.push(H('│') + rowData + H('│'));
    }

    lines.push(H('├' + '─'.repeat(this.TABLE_WIDTH) + '┤'));

    const totInput = this.tokenTracker.totalInput;
    const totOutput = this.tokenTracker.totalOutput;
    const totTotal = this.tokenTracker.totalTokens;

    const inSum = totInput > 0 ? String(totInput) : '—';
    const outSum = totOutput > 0 ? String(totOutput) : '—';
    const totSum = totTotal > 0 ? String(totTotal) : '—';

    const sumRow = padR('  TOTALS', 34) + padL(inSum, 8) + padL(outSum, 8) + padL(chalk.green.bold(totSum), 19) + '  ';
    lines.push(H('│') + chalk.bold(sumRow) + H('│'));
    lines.push(H('╰' + '─'.repeat(this.TABLE_WIDTH) + '╯'));

    process.stdout.write(lines.join('\n') + '\n');
    this.lastRenderedLines = lines.length;
  }
}
