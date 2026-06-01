import { spinner } from '@clack/prompts';
import chalk from 'chalk';
import boxen from 'boxen';
import type { TokenTracker } from '../../application/services/token-tracker.ts';

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

export class PipelineDashboard {
  private tokenTracker: TokenTracker;
  private phases: PhaseInfo[] = [];
  private activeSpinner: ReturnType<typeof spinner> | null = null;
  private currentPhaseName: string | null = null;
  private sourceSlug = '';
  private startTime: number = Date.now();

  constructor(tokenTracker: TokenTracker) {
    this.tokenTracker = tokenTracker;
    this.resetPhases();
  }

  setSourceSlug(slug: string): void {
    this.sourceSlug = slug;
    this.startTime = Date.now();
  }

  reset(): void {
    this.resetPhases();
    this.sourceSlug = '';
    this.startTime = Date.now();
  }

  private resetPhases(): void {
    this.phases = [
      { name: 'MAP', label: '1️⃣  MAP (Mapper)', status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'REDUCE', label: '2️⃣  REDUCE (Reducer)', status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'PLAN', label: '3️⃣  PLAN (Planner)', status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'REFINE', label: '4️⃣  REFINE (Refiner)', status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'VERIFY', label: '5️⃣  VERIFY (Verifier)', status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      { name: 'COMMIT', label: '6️⃣  COMMIT (Committer)', status: 'pending', inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    ];
  }

  startPhase(name: string): void {
    this.currentPhaseName = name;
    const phase = this.phases.find(p => p.name === name);
    if (phase) {
      phase.status = 'running';
      phase.durationMs = Date.now();
    }

    if (this.activeSpinner) {
      this.activeSpinner.stop('Done');
    }

    this.activeSpinner = spinner();
    this.activeSpinner.start(`🔄 Đang chạy pha: ${chalk.cyan.bold(name)}...`);
    this.render();
  }

  completePhase(name: string, success = true): void {
    const phase = this.phases.find(p => p.name === name);
    if (phase) {
      phase.status = success ? 'completed' : 'failed';
      if (phase.durationMs) {
        phase.durationMs = Date.now() - phase.durationMs;
      }
    }

    if (this.activeSpinner) {
      this.activeSpinner.stop(success ? chalk.green(`✅ Pha ${name} hoàn tất!`) : chalk.red(`❌ Pha ${name} thất bại.`));
      this.activeSpinner = null;
    }
    this.currentPhaseName = null;

    // Cập nhật token cho phase từ TokenTracker
    this.syncTokens(name);
    this.render();
  }

  failPhase(name: string, err: string): void {
    const phase = this.phases.find(p => p.name === name);
    if (phase) {
      phase.status = 'failed';
    }
    if (this.activeSpinner) {
      this.activeSpinner.stop(chalk.red(`❌ Pha ${name} thất bại: ${err}`));
      this.activeSpinner = null;
    }
    this.currentPhaseName = null;
    this.render();
  }

  skipPhase(name: string): void {
    const phase = this.phases.find(p => p.name === name);
    if (phase) {
      phase.status = 'skipped';
    }
    this.render();
  }

  private syncTokens(phaseName: string): void {
    const phase = this.phases.find(p => p.name === phaseName);
    if (phase) {
      const entry = this.tokenTracker.history.find(e => e.phase === phaseName);
      if (entry) {
        phase.inputTokens = entry.inputTokens;
        phase.outputTokens = entry.outputTokens;
        phase.totalTokens = entry.totalTokens;
      }
    }
  }

  render(): void {
    const lines: string[] = [];

    // Header
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    lines.push(chalk.bold.yellow(`🚀 ENGINE PIPELINE: ${chalk.white(this.sourceSlug || 'Ingesting...')} — ${chalk.dim(`${duration}s`)}`));
    lines.push(chalk.gray('═'.repeat(60)));

    // Table Header
    lines.push(
      chalk.bold(
        '  Phase' + ' '.repeat(17) + 'Status' + ' '.repeat(7) + 'Input' + ' '.repeat(5) + 'Output' + ' '.repeat(4) + 'Total'
      )
    );
    lines.push(chalk.gray('─'.repeat(60)));

    // Rows
    for (const p of this.phases) {
      let statusStr = '';
      switch (p.status) {
        case 'pending':
          statusStr = chalk.gray('⏳ pending ');
          break;
        case 'running':
          statusStr = chalk.yellow.bold('🔄 running ');
          break;
        case 'completed':
          statusStr = chalk.green('✅ done    ');
          break;
        case 'failed':
          statusStr = chalk.red('❌ failed  ');
          break;
        case 'skipped':
          statusStr = chalk.blue('⏭️  skipped ');
          break;
      }

      const inputTok = p.inputTokens > 0 ? String(p.inputTokens).padEnd(8, ' ') : '—'.padEnd(8, ' ');
      const outputTok = p.outputTokens > 0 ? String(p.outputTokens).padEnd(8, ' ') : '—'.padEnd(8, ' ');
      const totalTok = p.totalTokens > 0 ? String(p.totalTokens).padEnd(8, ' ') : '—'.padEnd(8, ' ');

      const durationStr = p.durationMs && p.status !== 'running' && p.status !== 'pending'
        ? chalk.dim(` (${(p.durationMs / 1000).toFixed(1)}s)`)
        : '';

      const cleanLabel = p.label.replace(/[][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
      const labelPadding = 24 - cleanLabel.length;
      const row = `  ${p.label}${' '.repeat(Math.max(0, labelPadding))}${statusStr}  ${inputTok}${outputTok}${totalTok}${durationStr}`;
      lines.push(row);
    }

    lines.push(chalk.gray('─'.repeat(60)));

    // Totals
    const totInput = this.tokenTracker.totalInput;
    const totOutput = this.tokenTracker.totalOutput;
    const totTotal = this.tokenTracker.totalTokens;

    const inputSum = totInput > 0 ? String(totInput).padEnd(8, ' ') : '—'.padEnd(8, ' ');
    const outputSum = totOutput > 0 ? String(totOutput).padEnd(8, ' ') : '—'.padEnd(8, ' ');
    const totalSum = totTotal > 0 ? String(totTotal).padEnd(8, ' ') : '—'.padEnd(8, ' ');

    lines.push(
      chalk.bold(
        '  📊 TOTALS' + ' '.repeat(15) + '          ' + inputSum + outputSum + totalSum
      )
    );

    // Render Boxen
    console.clear();
    console.log(
      boxen(lines.join('\n'), {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: this.currentPhaseName ? 'yellow' : 'green',
      })
    );
  }

  finalize(): void {
    if (this.activeSpinner) {
      this.activeSpinner.stop(chalk.green('✅ Pipeline hoàn thành!'));
      this.activeSpinner = null;
    }
    this.render();
  }
}
