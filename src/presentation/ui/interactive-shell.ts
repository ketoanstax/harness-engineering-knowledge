import * as readline from 'node:readline/promises';
import * as process from 'node:process';
import { Command } from 'commander';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IngestDocumentUseCase } from '../../application/use-cases/ingest-document.use-case.ts';
import { DIR_RAW } from '../../core/config.ts';
import { pickFileForPipeline } from './file-picker.ts';
import * as fs from 'node:fs';
import * as path from 'node:path';

let isInteractiveShell = false;
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

  /help      Hiển thị danh sách lệnh
  /exit      Thoát shell
  Ctrl+D     Thoát shell
`);
}

export function setActiveProgram(program: Command): void {
  activeProgram = program;
}

export function runShell(useCase: IngestDocumentUseCase, fileSystem: IFileSystem): Promise<void> {
  isInteractiveShell = true;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'mrp> ',
  });

  console.log(`
╔════════════════════════════════════════╗
║  💻 MRP Interactive Shell              ║
║  Gõ /help để xem danh sách lệnh       ║
║  Gõ /exit hoặc Ctrl+D để thoát        ║
╚════════════════════════════════════════╝
  `);

  rl.on('line', async (line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      rl.prompt();
      return;
    }

    if (trimmed === '/exit' || trimmed === '/quit') {
      rl.close();
      return;
    }

    if (trimmed === '/help') {
      printShellHelp();
      rl.prompt();
      return;
    }

    // Special handling: "run" without args → file picker
    if (trimmed === 'run') {
      rl.pause();
      const filepath = await pickFileForPipeline(fileSystem);
      if (filepath) {
        const success = await useCase.execute(filepath);
        if (!success) {
          console.log('⚠️ Pipeline hoàn tất với cảnh báo hoặc thất bại.');
        } else {
          console.log('✅ Pipeline hoàn tất thành công.');
        }
      }
      rl.resume();
      rl.prompt();
      return;
    }

    rl.pause();
    try {
      const args = trimmed.split(/\s+/);
      if (activeProgram) {
        await activeProgram.parseAsync(['node', 'mrp', ...args], { from: 'user' });
      }
    } catch (e: any) {
      if (e.code !== 'commander.exit' || e.exitCode !== 0) {
        console.error(`⚠️ ${e.message}`);
      }
    }
    rl.resume();
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n👋 Tạm biệt!');
    safeExit(0);
  });

  rl.prompt();

  return new Promise<void>(() => {
    // resolve never — shell runs until user exits
  });
}

export function isShellMode(): boolean {
  return isInteractiveShell;
}

export function safeExit(code: number): void {
  if (isInteractiveShell) {
    if (code !== 0) throw new Error(`Lệnh bị hủy hoặc thất bại (Mã: ${code})`);
  } else {
    process.exit(code);
  }
}
