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

// === Real-time Syntax Highlighting & Suggestion Panel ===
function redrawLine(rl: readline.Interface, line: string, selectedIndex = -1, matched: typeof COMMANDS = []): void {
  const cursorPos = rl.cursor;
  const prompt = chalk.bold.magenta('mrp❯ ');
  const promptLen = 5;

  // 1. Dòng kẻ ngang ranh giới ở trên prompt
  // Để tránh rác khi gõ, ta chỉ in đường kẻ trên khi vẽ prompt đầu tiên của phiên gõ mới

  // Xóa toàn bộ từ con trỏ hiện tại tới hết màn hình dưới để tránh rác
  process.stdout.write('\r\x1b[K' + prompt);

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

  // Xóa hết phần màn hình bên dưới (để dọn bảng gợi ý cũ)
  process.stdout.write('\x1b[J');

  // 2. Vẽ bảng gợi ý bên dưới dòng gõ lệnh
  if (matched.length > 0) {
    // Xuống dòng vẽ bảng
    process.stdout.write('\n' + chalk.gray('  ' + '─'.repeat(60)));
    for (let i = 0; i < matched.length; i++) {
      const isSelected = i === selectedIndex;
      const cmdText = matched[i].command;
      const descText = matched[i].description;

      const row = isSelected
        ? chalk.bgCyan.black(` ❯ ${cmdText.padEnd(25)} - ${descText} `)
        : `   ${chalk.cyan(cmdText.padEnd(25))} - ${chalk.dim(descText)}`;
      process.stdout.write(`\n${row}`);
    }
    process.stdout.write('\n' + chalk.gray('  ' + '─'.repeat(60)));

    // Dịch con trỏ ngược lên dòng input (số dòng dịch lên = matched.length + 3)
    const linesToMoveUp = matched.length + 3;
    process.stdout.write(`\x1b[${linesToMoveUp}A`);
  }

  // 3. Trả con trỏ về vị trí cũ trên dòng input
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
    console.log(renderMarkdown(result.answer));
    if (result.tokensUsed) {
      console.log(chalk.dim(`\n🔤 Token: ${result.tokensUsed}`));
    }
    console.log(chalk.cyan('━'.repeat(56)) + '\n');
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    s.stop(chalk.red('❌ Lỗi truy vấn'));
    console.log(chalk.red(`⚠️ ${err}`));
  }
}

// Hàm render markdown tối giản, an toàn cho Terminal
function renderMarkdown(md: string): string {
  return md
    // H1, H2, H3
    .replace(/^# (.*$)/gim, (_, p1) => chalk.bold.yellow(`\n⭐ ${p1}\n`))
    .replace(/^## (.*$)/gim, (_, p1) => chalk.bold.cyan(`\n🔹 ${p1}\n`))
    .replace(/^### (.*$)/gim, (_, p1) => chalk.bold.underline(`\n🔸 ${p1}\n`))
    // Bold
    .replace(/\*\*(.*?)\*\*/g, (_, p1) => chalk.bold(p1))
    // Italic
    .replace(/\*(.*?)\*/g, (_, p1) => chalk.italic(p1))
    // Code block inline `code`
    .replace(/`(.*?)`/g, (_, p1) => chalk.bgGray.black(` ${p1} `))
    // Link [text](url) -> text (url)
    .replace(/\[(.*?)\]\((.*?)\)/g, (_, p1, p2) => `${chalk.bold.blue(p1)} (${chalk.dim(p2)})`)
    // List item -
    .replace(/^- (.*$)/gim, (_, p1) => `  • ${p1}`);
}

// === Shell chính ===
export async function runShell(useCase: IngestDocumentUseCase, fileSystem: IFileSystem): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  ${chalk.bold.cyan('💻 HARRNESS KNOWLEDGE OS')}                        ║
║  Gõ ${chalk.cyan.bold('/')} để mở menu phím mũi tên / Tab                  ║
║  Gõ câu hỏi tự do để truy vấn kho tri thức             ║
║  Gõ ${chalk.cyan.bold('/exit')} để thoát                                    ║
╚══════════════════════════════════════════════════════════╝
  `);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: () => [[], ''], // Tắt completer mặc định của readline để ta tự xử lý
    prompt: '',
    terminal: true,
  });

  let selectedIndex = -1;
  let matchedCommands: typeof COMMANDS = [];
  let isSuggesting = false;

  // Kích hoạt Raw Mode để nghe keystroke chính xác
  process.stdin.setRawMode?.(true);

  process.stdin.on('keypress', (char, key) => {
    // 1. Ctrl+C / Ctrl+D → Exit ngay
    if (key?.ctrl && (key.name === 'c' || key.name === 'd')) {
      console.log('\n👋 Tạm biệt!');
      process.exit(0);
    }

    // 2. Phím mũi tên Xuống / Lên / Tab khi đang hiển thị Suggestion
    if (isSuggesting && (key?.name === 'down' || key?.name === 'tab')) {
      selectedIndex = (selectedIndex + 1) % matchedCommands.length;
      redrawLine(rl, rl.line, selectedIndex, matchedCommands);
      return;
    }

    if (isSuggesting && key?.name === 'up') {
      selectedIndex = selectedIndex === -1 ? matchedCommands.length - 1 : selectedIndex - 1;
      if (selectedIndex < 0) selectedIndex = matchedCommands.length - 1;
      redrawLine(rl, rl.line, selectedIndex, matchedCommands);
      return;
    }

    // 3. Phím Enter khi đang highlight một gợi ý lệnh
    if (isSuggesting && selectedIndex >= 0 && (key?.name === 'enter' || key?.name === 'return')) {
      const chosen = matchedCommands[selectedIndex].command;

      // Ghi đè dòng input hiện tại
      // rl.write(null, {ctrl: true, name: 'u'}) // Xóa dòng cũ
      // Tự cập nhật nội dung vào readline
      const promptLen = 5;
      process.stdout.write(`\r\x1b[K${chalk.bold.magenta('mrp❯ ')}${chalk.cyan.bold(chosen)}`);

      // Đồng bộ readline line buffer
      const lineLen = rl.line.length;
      rl.write(null, { ctrl: true, name: 'u' }); // Xóa buffer cũ
      rl.write(chosen); // Viết buffer mới

      isSuggesting = false;
      selectedIndex = -1;
      matchedCommands = [];
      redrawLine(rl, rl.line, selectedIndex, matchedCommands);
      return;
    }

    // 4. Các phím gõ thông thường
    setImmediate(() => {
      const line = rl.line;

      if (line.startsWith('/')) {
        isSuggesting = true;
        // Lọc các command bắt đầu khớp
        matchedCommands = COMMANDS.filter(c => c.command.startsWith(line));

        // Giới hạn hiển thị tối đa 5 items để không tràn màn hình
        matchedCommands = matchedCommands.slice(0, 5);

        if (matchedCommands.length === 0) {
          isSuggesting = false;
          selectedIndex = -1;
        } else if (selectedIndex >= matchedCommands.length) {
          selectedIndex = 0;
        }
      } else {
        isSuggesting = false;
        selectedIndex = -1;
        matchedCommands = [];
      }

      // Xử lý scroll/height control: nếu vị trí gõ quá sát mép dưới terminal (còn dưới 6 dòng)
      // thì in thêm dòng trống và dịch màn hình lên để có khoảng vẽ menu gợi ý bên dưới
      const rows = process.stdout.rows || 24;
      // Lấy cursor position thật từ readline
      const cursorY = rl.cursor; // readline cursor chỉ cho X, vị trí dòng khó xác định chính xác
      // Giải thuật đơn giản: khi mở menu gợi ý, ta cứ scroll 1 khoảng cố định nếu cần
      if (isSuggesting && matchedCommands.length > 0) {
        // Tạm thời in thêm dòng trống xuống đáy để cuộn terminal lên
        process.stdout.write('\n'.repeat(matchedCommands.length + 1));
        process.stdout.write(`\x1b[${matchedCommands.length + 1}A`); // dịch ngược con trỏ lên
      }

      currentInput = line;
      redrawLine(rl, line, selectedIndex, matchedCommands);
    });
  });

  // Main loop
  rl.on('line', async (line) => {
    const input = line.trim();
    currentInput = '';

    // Dọn sạch bảng gợi ý bên dưới khi nhấn Enter để submit
    process.stdout.write('\x1b[J');

    if (!input) {
      process.stdout.write(chalk.bold.magenta('mrp❯ '));
      return;
    }

    // Kẹp khung input bằng 2 đường kẻ ngang cân đối
    console.log(chalk.gray('━'.repeat(60)));

    if (input.startsWith('/') || input === 'help' || input === 'run') {
      await handleCommand(input, useCase, fileSystem);
    } else {
      await handleQuery(input, useCase);
    }

    console.log(chalk.gray('━'.repeat(60)));
    process.stdout.write(chalk.bold.magenta('mrp❯ '));
  });

  rl.on('close', () => {
    // Ngăn đóng
  });

  // Vẽ prompt ban đầu
  process.stdout.write(chalk.bold.magenta('mrp❯ '));

  await new Promise<never>(() => {});
}

export function safeExit(code: number): void {
  process.exit(code);
}
