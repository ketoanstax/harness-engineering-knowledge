// src/presentation/ui/shell-router.ts
import * as process from 'node:process';
import { Command } from 'commander';
import chalk from 'chalk';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { IngestDocumentUseCase } from '../../application/use-cases/ingest-document.use-case.ts';
import { pickFileForPipeline } from './file-picker.ts';
import { askPlanAction } from './plan-displayer.ts';
import { displayDomainStats } from '../tools/domain-scanner.ts';
import { displayGraphViz } from '../tools/graph-viz.ts';
import { displayVaultStats } from '../tools/vault-stats.ts';
import { createTerminalSpinner, renderMarkdown } from './shell-ui.ts';
import type { DraftNode } from '../../domain/entities/learning.entity.ts';

export interface ShellCommand {
  command: string;
  description: string;
}

export const COMMANDS: ShellCommand[] = [
  { command: '/run', description: 'Chọn & chạy pipeline' },
  { command: '/approve -t <ts>', description: 'Duyệt kế hoạch & chạy tiếp' },
  { command: '/reject -t <ts>', description: 'Từ chối & dọn dẹp' },
  { command: '/approve-draft', description: 'Duyệt bản thảo nốt nháp' },
  { command: '/reject-draft', description: 'Từ chối bản thảo nốt nháp' },
  { command: '/batch', description: 'Chạy batch tuần tự' },
  { command: '/batch --auto-approve', description: 'Chạy batch tự động' },
  { command: '/guide', description: 'Xem hướng dẫn vận hành' },
  { command: '/doctor', description: 'Kiểm tra sức khỏe Vault' },
  { command: '/scan', description: 'Quét domain subdirs 00_raw_docs' },
  { command: '/domain', description: 'Liệt kê domain subdirectories' },
  { command: '/graph', description: 'Xem cây tri thức ASCII' },
  { command: '/status', description: 'Tổng quan Vault' },
  { command: '/exit', description: 'Thoát shell' },
];

let activeProgram: Command | null = null;
let activeDraft: DraftNode | null = null;

export function setActiveProgram(program: Command): void {
  activeProgram = program;
}

/**
 * Trả về false nếu shell cần phải thoát hoàn toàn.
 */
export async function handleCommand(input: string, useCase: IngestDocumentUseCase, fileSystem: IFileSystem, config: IConfigProvider): Promise<boolean | void> {
  if (!input || input.startsWith('#')) return;

  if (input === '/exit' || input === '/quit') {
    console.log(chalk.gray('\n👋 Tạm biệt!'));
    return false; // Báo hiệu cho shell thoát
  }

  if (input === '/help' || input === 'help') {
    console.log(`\n${chalk.bold.yellow('📋 DANH SÁCH LỆNH TRONG SHELL MODE:')}`);
    COMMANDS.forEach(c => console.log(`  ${chalk.cyan.bold(c.command.padEnd(30))}${chalk.dim(c.description)}`));
    return;
  }

  if (input === '/run' || input === 'run') {
    const filepath = await pickFileForPipeline(fileSystem, config);
    if (filepath) {
      const ok = await useCase.execute(filepath, askPlanAction);
      if (!ok) console.log(chalk.red('⚠️ Pipeline thất bại'));
    }
    return;
  }

  if (input === '/approve-draft') {
    if (activeDraft) {
      await useCase.approveDraft(activeDraft);
      console.log(chalk.green(`\n✅ Đã lưu khái niệm "${activeDraft.title}" vào Vault. Bạn có thể hỏi lại câu hỏi này.`));
      activeDraft = null;
    } else {
      console.log(chalk.yellow('\n⚠️ Không có bản thảo nốt nháp nào đang chờ duyệt.'));
    }
    return;
  }

  if (input === '/reject-draft') {
    if (activeDraft) {
      console.log(chalk.yellow(`\n❌ Đã từ chối bản thảo nốt nháp "${activeDraft.title}".`));
      activeDraft = null;
    } else {
      console.log(chalk.yellow('\n⚠️ Không có bản thảo nốt nháp nào đang chờ duyệt.'));
    }
    return;
  }

  if (input === '/doctor') {
    await runDoctor();
    return;
  }

  if (input === '/scan' || input === '/domain') {
    displayDomainStats(fileSystem, config);
    return;
  }

  if (input === '/graph') {
    displayGraphViz(fileSystem, config);
    return;
  }

  if (input === '/status') {
    displayVaultStats(fileSystem, config);
    return;
  }

  // Pass to Commander (cho lệnh /batch, /approve...)
  try {
    const args = input.replace(/^\//, '').split(/\s+/);
    if (activeProgram) {
      await activeProgram.parseAsync(['node', 'mrp', ...args], { from: 'user' });
    }
  } catch (e: any) {
    if (e.code !== 'commander.exit' || e.exitCode !== 0) {
      process.stderr.write(`⚠️ ${e.message}\n`);
    }
  }
}

export async function handleQuery(input: string, useCase: IngestDocumentUseCase): Promise<void> {
  const s = createTerminalSpinner('Đang truy vấn đồ thị tri thức...');
  try {
    const result = await useCase.query(input);
    s.stop('');
    console.log(renderMarkdown(result.answer));
    if (process.env.NODE_ENV === 'development' && result.tokensUsed !== undefined) {
      console.log(chalk.dim(`📊 [Dev Mode] Token đã tiêu thụ: ${result.tokensUsed}`));
    }
    if (result.status === 'learning' && result.draft) {
      activeDraft = result.draft;
      console.log(chalk.bold.yellow('\n📋 CHI TIẾT BẢN THẢO NỐT NHÁP:'));
      console.log(chalk.cyan(`  - Tiêu đề: `) + chalk.white(activeDraft.title));
      console.log(chalk.cyan(`  - Định nghĩa: `) + chalk.white(activeDraft.definition));
      console.log(chalk.cyan(`  - Thẻ: `) + chalk.white(activeDraft.tags.join(', ')));
      console.log(chalk.bold.magenta('\n👉 Chọn hành động:'));
      console.log(`  Gõ ${chalk.cyan('/approve-draft')} để duyệt lưu nốt mới vào Vault.`);
      console.log(`  Gõ ${chalk.cyan('/reject-draft')} để hủy bỏ.`);
    }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    s.stop('');
    console.log(chalk.red(`  ❌ ${err}`));
  }
}

// Logic phụ cho /doctor
async function runDoctor() {
  const s = createTerminalSpinner('Chạy Diagnostics Vault...');
  const { execSync } = await import('node:child_process');
  let hasError = false;

  try {
    console.log(chalk.cyan('\n  🔍 Bước 1: Validate domain raw docs...'));
    execSync('bun scripts/validate_raw_docs.ts', { stdio: 'inherit' });
    console.log(chalk.green('  ✅ Domain validation OK'));
  } catch {
    console.log(chalk.red('  ⚠️ Domain validation có vấn đề'));
    hasError = true;
  }

  try {
    console.log(chalk.cyan('\n  🔍 Bước 2: Sync rules & audit...'));
    execSync('bun scripts/sync_rules_and_memory.ts', { stdio: 'inherit' });
    console.log(chalk.green('  ✅ Sync & audit OK'));
  } catch {
    console.log(chalk.red('  ⚠️ Sync/audit thất bại'));
    hasError = true;
  }

  const { existsSync, readFileSync } = await import('node:fs');
  if (!existsSync('node_modules')) {
    console.log(chalk.yellow('  ⚠️ node_modules không tồn tại'));
    hasError = true;
  } else {
    console.log(chalk.green('  ✅ node_modules OK'));
  }

  try {
    const envContent = readFileSync('.env', 'utf-8');
    if (envContent.includes('API_KEY') || envContent.includes('AUTH_TOKEN')) {
      console.log(chalk.green('  ✅ .env có API key'));
    } else {
      console.log(chalk.yellow('  ⚠️ .env không có API key — chạy mock mode'));
    }
  } catch {
    console.log(chalk.yellow('  ⚠️ .env không tồn tại — chạy mock mode'));
  }

  s.stop(hasError ? chalk.yellow('⚠️ Diagnostics hoàn tất — 1 số vấn đề cần xem xét') : chalk.green('✅ Diagnostics hoàn tất — mọi thứ OK!'));
}
