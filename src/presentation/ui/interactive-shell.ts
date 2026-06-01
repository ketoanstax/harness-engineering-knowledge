import * as process from 'node:process';
import * as readline from 'node:readline';
import { Command } from 'commander';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IngestDocumentUseCase } from '../../application/use-cases/ingest-document.use-case.ts';
import { pickFileForPipeline } from './file-picker.ts';
import { askPlanAction } from './plan-displayer.ts';
import { spinner } from '@clack/prompts';
import chalk from 'chalk';

let activeProgram: Command | null = null;
let currentInput = '';

const COMMANDS = [
  { command: '/run', description: 'Chọn & chạy pipeline' },
  { command: '/approve -t <ts>', description: 'Duyệt kế hoạch & chạy tiếp' },
  { command: '/reject -t <ts>', description: 'Từ chối & dọn dẹp' },
  { command: '/batch', description: 'Chạy batch tuần tự' },
  { command: '/batch --auto-approve', description: 'Chạy batch tự động' },
  { command: '/guide', description: 'Xem hướng dẫn vận hành' },
  { command: '/doctor', description: 'Kiểm tra sức khỏe Vault' },
  { command: '/exit', description: 'Thoát shell' },
];

function printShellHelp(): void {
  console.log(`
${chalk.bold.yellow('📋 DANH SÁCH LỆNH TRONG SHELL MODE:')}
${chalk.gray('─────────────────────────────────────')}
${COMMANDS.map(c => `  ${chalk.cyan.bold(c.command.padEnd(30))}${chalk.dim(c.description)}`).join('\n')}
`);
}

export function setActiveProgram(program: Command): void {
  activeProgram = program;
}

// === Readline completer — Tab completion cho /commands ===
function completer(line: string, callback: (err: Error | null, result: [string[], string]) => void): void {
  if (line.startsWith('/')) {
    const hits = COMMANDS.filter(c => c.command.startsWith(line)).map(c => c.command);
    callback(null, [hits.length ? hits : COMMANDS.map(c => c.command), line]);
  } else {
    callback(null, [[], line]);
  }
}

// === Real-time Syntax Highlighting ===
function redrawLine(rl: readline.Interface, line: string): void {
  const cursorPos = rl.cursor;
  const prompt = chalk.bold.magenta('mrp❯ ');
  const promptLen = 5; // 'mrp❯ ' chiều dài visual

  // Xóa dòng hiện tại + di về đầu
  process.stdout.write('\x1b[K\r' + prompt);

  if (line.startsWith('/')) {
    const firstSpace = line.indexOf(' ');
    if (firstSpace === -1) {
      process.stdout.write(chalk.cyan.bold(line));
    } else {
      const cmd = line.slice(0, firstSpace);
      const rest = line.slice(firstSpace);
      process.stdout.write(chalk.cyan.bold(cmd) + chalk.yellow(rest));
    }
  } else {
    process.stdout.write(chalk.white(line));
  }

  // Di chuyển con trỏ tới vị trí đúng (cộng thêm độ dài prompt)
  process.stdout.write(`\x1b[${promptLen + cursorPos}G`);
}

// === Handle Commands ===
async function handleCommand(input: string, useCase: IngestDocumentUseCase, fileSystem: IFileSystem): Promise<void> {
  if (!input || input.startsWith('#')) return;

  // Lệnh /exit
  if (input === '/exit' || input === '/quit') {
    console.log(chalk.gray('👋 Tạm biệt!'));
    process.exit(0);
    return;
  }

  // Lệnh /help
  if (input === '/help' || input === 'help') {
    printShellHelp();
    return;
  }

  // /run không tham số → file picker
  if (input === '/run' || input === 'run') {
    const filepath = await pickFileForPipeline(fileSystem);
    if (filepath) {
      const s = spinner();
      s.start('🔄 Đang chạy Pipeline...');
      const success = await useCase.execute(filepath, askPlanAction);
      s.stop(success ? chalk.green('✅ Pipeline hoàn tất thành công!') : chalk.red('⚠️ Pipeline thất bại.'));
    }
    return;
  }

  // /doctor — kiểm tra sức khỏe Vault
  if (input === '/doctor') {
    console.log(chalk.bold.cyan('\n🩺 Chạy Diagnostics Vault...\n'));
    const { execSync } = await import('node:child_process');
    try {
      execSync('python3 scripts/sync_rules_and_memory.py', { stdio: 'inherit' });
    } catch {
      console.log(chalk.red('⚠️ Script kiểm tra không chạy được.'));
    }
    return;
  }

  // Các lệnh còn lại → chuyển qua Commander
  try {
    const args = input.replace(/^\//, '').split(/\s+/);
    if (activeProgram) {
      await activeProgram.parseAsync(['node', 'mrp', ...args], { from: 'user' });
    }
    return;
  } catch (e: any) {
    if (e.code !== 'commander.exit' || e.exitCode !== 0) {
      process.stderr.write(`⚠️ ${e.message}\n`);
    }
    return;
  }
}

// === Hàm query — gửi câu hỏi tới LLM ===
async function handleQuery(input: string, useCase: IngestDocumentUseCase): Promise<void> {
  const s = spinner();
  s.start('🔍 Đang truy vấn kho tri thức...');

  try {
    const result = await useCase.query(input);
    s.stop(chalk.green('✅ Trả lời xong!'));

    console.log(chalk.cyan('\n' + '━'.repeat(56)));
    console.log(result.answer);
    if (result.tokensUsed) {
      console.log(chalk.dim(`\n🔤 Token tiêu tốn: ${result.tokensUsed}`));
    }
    console.log(chalk.cyan('━'.repeat(56)) + '\n');
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    s.stop(chalk.red('❌ Lỗi truy vấn'));
    console.log(chalk.red(`⚠️ ${err}`));
  }
}

// === Shell chính ===
export async function runShell(useCase: IngestDocumentUseCase, fileSystem: IFileSystem): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  ${chalk.bold.cyan('💻 HARRNESS KNOWLEDGE OS')}                        ║
║  Gõ ${chalk.cyan.bold('/')} + Tab xem lệnh                               ║
║  Gõ câu hỏi tự do để truy vấn kho tri thức             ║
║  Gõ ${chalk.cyan.bold('/exit')} để thoát                                    ║
╚══════════════════════════════════════════════════════════╝
  `);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer,
    prompt: '',
    terminal: true,
  });

  // Real-time syntax highlighting qua keypress event
  process.stdin.setRawMode?.(true);
  process.stdin.on('keypress', (char, key) => {
    // Xử lý Enter — submit dòng
    if (key?.name === 'enter' || key?.name === 'return') {
      // Để readline xử lý line event
      return;
    }

    // Xử lý Ctrl+C/Ctrl+D → exit hoặc cancel
    if (key?.ctrl && (key.name === 'c' || key.name === 'd')) {
      console.log('\n👋 Tạm biệt!');
      process.exit(0);
    }

    // Vẽ lại dòng với syntax highlighting sau mỗi lần gõ
    setImmediate(() => {
      if (rl.line !== currentInput) {
        currentInput = rl.line;
        redrawLine(rl, rl.line);
      }
    });
  });

  // Main loop — dùng sự kiện line
  await new Promise<void>((resolve) => {
    rl.on('line', async (line) => {
      const input = line.trim();

      // Vẽ lại prompt cho dòng tiếp theo
      currentInput = '';

      if (!input) {
        process.stdout.write(chalk.bold.magenta('mrp❯ '));
        rl.resume();
        return;
      }

      // Xác định: lệnh / hay câu hỏi?
      if (input.startsWith('/') || input === 'help' || input === 'run') {
        await handleCommand(input, useCase, fileSystem);
      } else {
        await handleQuery(input, useCase);
      }

      // Vẽ lại prompt
      process.stdout.write('\n' + chalk.bold.magenta('mrp❯ '));
      rl.resume();
    });

    // Vẽ prompt ban đầu
    process.stdout.write(chalk.bold.magenta('mrp❯ '));
  });
}

export function safeExit(code: number): void {
  process.exit(code);
}
