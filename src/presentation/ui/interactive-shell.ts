import * as process from 'node:process';
import { Command } from 'commander';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IngestDocumentUseCase } from '../../application/use-cases/ingest-document.use-case.ts';
import { pickFileForPipeline } from './file-picker.ts';
import { askPlanAction } from './plan-displayer.ts';
import { outro, text, isCancel, spinner } from '@clack/prompts';
import chalk from 'chalk';

let activeProgram: Command | null = null;

function printShellHelp(): void {
  console.log(`
📋 DANH SÁCH LỆNH TRONG SHELL MODE:
─────────────────────────────────────
  run                           Liệt kê & chọn file để chạy pipeline
  run -s <file>                 Chạy pipeline trực tiếp cho file
  approve -t <timestamp>        Duyệt kế hoạch & chạy tiếp
  reject -t <timestamp>         Từ chối & dọn dẹp
  batch                         Chạy batch tuần tự
  batch --auto-approve          Chạy batch tự động
  guide                         Xem hướng dẫn vận hành

  exit                          Thoát shell
  help                          Hiển thị danh sách lệnh
`);
}

export function setActiveProgram(program: Command): void {
  activeProgram = program;
}

async function getShellInput(): Promise<string> {
  const result = await text({
    message: 'mrp>',
    placeholder: 'Gõ lệnh (help để xem DS)',
  });

  if (isCancel(result)) return 'exit';
  return (result as string).trim();
}

async function handleCommand(cmd: string, useCase: IngestDocumentUseCase, fileSystem: IFileSystem): Promise<void> {
  if (!cmd || cmd.startsWith('#')) return;

  if (cmd === 'exit' || cmd === 'quit') {
    outro(chalk.gray('👋 Tạm biệt!'));
    process.exit(0);
    return;
  }

  if (cmd === 'help') {
    printShellHelp();
    return;
  }

  // "run" không tham số → file picker
  if (cmd === 'run') {
    const filepath = await pickFileForPipeline(fileSystem);
    if (filepath) {
      const s = spinner();
      s.start('🔄 Đang chạy Pipeline...');
      const success = await useCase.execute(filepath, askPlanAction);
      s.stop(success ? chalk.green('✅ Pipeline hoàn tất thành công!') : chalk.red('⚠️ Pipeline thất bại.'));
    }
    return;
  }

  // Các lệnh còn lại qua Commander
  try {
    const args = cmd.split(/\s+/);
    if (activeProgram) {
      await activeProgram.parseAsync(['node', 'mrp', ...args], { from: 'user' });
    }
  } catch (e: any) {
    if (e.code !== 'commander.exit' || e.exitCode !== 0) {
      process.stderr.write(`⚠️ ${e.message}\n`);
    }
  }
}

export async function runShell(useCase: IngestDocumentUseCase, fileSystem: IFileSystem): Promise<void> {
  console.log(`
╔════════════════════════════════════════╗
║  💻 MRP Interactive Shell              ║
║  Gõ help để xem danh sách lệnh        ║
║  Gõ exit hoặc Ctrl+C để thoát         ║
╚════════════════════════════════════════╝
  `);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const cmd = await getShellInput();
      await handleCommand(cmd, useCase, fileSystem);
    } catch (e: any) {
      process.stderr.write(`⚠️ ${e.message}\n`);
    }
  }
}

export function safeExit(code: number): void {
  process.exit(code);
}
