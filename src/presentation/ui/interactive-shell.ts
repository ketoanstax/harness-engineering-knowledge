import * as process from 'node:process';
import * as readline from 'node:readline';
import { Command } from 'commander';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { IngestDocumentUseCase } from '../../application/use-cases/ingest-document.use-case.ts';
import { pickFileForPipeline } from './file-picker.ts';
import { askPlanAction } from './plan-displayer.ts';
import { displayDomainStats } from '../tools/domain-scanner.ts';
import { displayGraphViz } from '../tools/graph-viz.ts';
import { displayVaultStats } from '../tools/vault-stats.ts';
import chalk from 'chalk';

let activeProgram: Command | null = null;
export let isInteractiveMode = false;
let isProcessing = false;

export function safeExit(code: number): boolean {
  if (isInteractiveMode) {
    return false; // Trả về false để runShell biết user muốn thoát
  }
  process.exit(code);
}

// === UI Helpers (Claude Code Style) ===
function getTermWidth(): number {
  return process.stdout.columns || 80;
}

function printTopDivider() {
  console.log(chalk.gray('─'.repeat(getTermWidth())));
}

function printBottomDivider() {
  console.log(chalk.gray('─'.repeat(getTermWidth())));
}

// Hiệu ứng "Shape-shifting" giống AI đang suy nghĩ
function createTerminalSpinner(message: string) {
  // Các khối hình học lật liên tục tạo cảm giác xử lý dữ liệu phẳng
  const frames = ['◰', '◳', '◲', '◱', '▖', '▘', '▝', '▗'];
  const colors = [chalk.cyan, chalk.blueBright, chalk.magentaBright, chalk.cyanBright];
  let i = 0;
  let running = true;
  
  process.stdout.write('\n'); // Cách 1 dòng cho thoáng trước khi quay
  
  const timer = setInterval(() => {
    if (!running) return;
    const frame = frames[i % frames.length];
    const color = colors[Math.floor(i / 2) % colors.length]; // Đổi màu mượt mà
    process.stdout.write(`\r\x1b[K  ${color(frame)} ${chalk.dim(message)}`);
    i++;
  }, 120); // 120ms: Chậm lại, không bị "chớp nhanh quá", tạo độ "ngầu"

  return {
    stop(finalMsg?: string) {
      running = false;
      clearInterval(timer);
      if (finalMsg) {
        process.stdout.write(`\r\x1b[K  ${finalMsg}\n`);
      } else {
        process.stdout.write(`\r\x1b[K`); // Xóa hẳn dòng spinner nếu không truyền text
      }
    },
  };
}

const COMMANDS = [
  { command: '/run', description: 'Chọn & chạy pipeline' },
  { command: '/approve -t <ts>', description: 'Duyệt kế hoạch & chạy tiếp' },
  { command: '/reject -t <ts>', description: 'Từ chối & dọn dẹp' },
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

export function setActiveProgram(program: Command): void {
  activeProgram = program;
}

// === Real-time Syntax Highlighting & Menu Panel ===
function redrawLine(rl: readline.Interface, line: string, selectedIndex = -1, matched: typeof COMMANDS = []): void {
  const cursorPos = rl.cursor;
  const promptText = 'mrp❯ ';
  const promptLen = 5;

  process.stdout.write('\r\x1b[J'); // Xóa sạch dưới con trỏ
  process.stdout.write(chalk.bold.magenta(promptText));

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

  // Vẽ menu gợi ý 
  if (matched.length > 0) {
    const divider = chalk.dim('─'.repeat(getTermWidth()));
    process.stdout.write('\n' + divider);
    
    for (let i = 0; i < matched.length; i++) {
      const isSelected = i === selectedIndex;
      const cmdText = matched[i].command;
      const descText = matched[i].description;

      const row = isSelected
        ? chalk.bgCyan.black(` ❯ ${cmdText.padEnd(25)} - ${descText} `)
        : `   ${chalk.cyan(cmdText.padEnd(25))} - ${chalk.dim(descText)}`;
      process.stdout.write(`\n${row}`);
    }
    process.stdout.write('\n' + divider);

    // Trả con trỏ lên
    process.stdout.write(`\x1b[${matched.length + 2}A`);
  }

  // Đặt lại tọa độ X
  if (promptLen + cursorPos > 0) {
    process.stdout.write(`\r\x1b[${promptLen + cursorPos}C`);
  } else {
    process.stdout.write(`\r`);
  }
}

// === Logic Xử lý Lệnh (trả về false nếu cần thoát shell) ===
async function handleCommand(input: string, useCase: IngestDocumentUseCase, fileSystem: IFileSystem, config: IConfigProvider): Promise<boolean | void> {
  if (!input || input.startsWith('#')) return;

  if (input === '/exit' || input === '/quit') {
    console.log(chalk.gray('\n👋 Tạm biệt!'));
    process.exit(0);
  }

  if (input === '/help' || input === 'help') {
    console.log(`\n${chalk.bold.yellow('📋 DANH SÁCH LỆNH TRONG SHELL MODE:')}`);
    COMMANDS.forEach(c => console.log(`  ${chalk.cyan.bold(c.command.padEnd(30))}${chalk.dim(c.description)}`));
    return;
  }

  if (input === '/run' || input === 'run') {
    const filepath = await pickFileForPipeline(fileSystem, config);
    if (filepath) {
      // NOTE: Lệnh /run sẽ kích hoạt PipelineDashboard (UI full màn hình), 
      // nên ta không dùng spinner inline ở đây để tránh đè lấn UI.
      const ok = await useCase.execute(filepath, askPlanAction);
      if (!ok) console.log(chalk.red('⚠️ Pipeline thất bại'));
    }
    return;
  }

  if (input === '/doctor') {
    const s = createTerminalSpinner('Chạy Diagnostics Vault...');
    const { execSync } = await import('node:child_process');
    let hasError = false;

    // 1. Validate domain raw docs
    try {
      console.log(chalk.cyan('\n  🔍 Bước 1: Validate domain raw docs...'));
      execSync('python3 scripts/validate_raw_docs.py', { stdio: 'inherit' });
      console.log(chalk.green('  ✅ Domain validation OK'));
    } catch {
      console.log(chalk.red('  ⚠️ Domain validation có vấn đề (có thể do file legacy thiếu domain field)'));
      hasError = true;
    }

    // 2. Sync rules & audit
    try {
      console.log(chalk.cyan('\n  🔍 Bước 2: Sync rules & audit...'));
      execSync('python3 scripts/sync_rules_and_memory.py', { stdio: 'inherit' });
      console.log(chalk.green('  ✅ Sync & audit OK'));
    } catch {
      console.log(chalk.red('  ⚠️ Sync/audit thất bại'));
      hasError = true;
    }

    // 3. Check node_modules
    const { existsSync } = await import('node:fs');
    if (!existsSync('node_modules')) {
      console.log(chalk.yellow('  ⚠️ node_modules không tồn tại — chạy pnpm install nếu cần'));
      hasError = true;
    } else {
      console.log(chalk.green('  ✅ node_modules OK'));
    }

    // 4. Check .env
    const { readFileSync } = await import('node:fs');
    try {
      const envContent = readFileSync('.env', 'utf-8');
      const hasKey = envContent.includes('API_KEY') || envContent.includes('AUTH_TOKEN');
      if (hasKey) {
        console.log(chalk.green('  ✅ .env có API key'));
      } else {
        console.log(chalk.yellow('  ⚠️ .env không có API key — chạy mock mode'));
      }
    } catch {
      console.log(chalk.yellow('  ⚠️ .env không tồn tại — chạy mock mode'));
    }

    s.stop(hasError ? chalk.yellow('⚠️ Diagnostics hoàn tất — 1 số vấn đề cần xem xét') : chalk.green('✅ Diagnostics hoàn tất — mọi thứ OK!'));
    return;
  }

  if (input === '/scan') {
    displayDomainStats(fileSystem, config);
    return;
  }

  if (input === '/domain') {
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

  // Các lệnh batch, approve... chuyển qua Commander
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

async function handleQuery(input: string, useCase: IngestDocumentUseCase): Promise<void> {
  const s = createTerminalSpinner('Đang truy vấn đồ thị tri thức...');
  try {
    const result = await useCase.query(input);
    s.stop(''); // Xóa spinner để nhường chỗ in kết quả gọn gàng
    console.log(renderMarkdown(result.answer));
    if (result.tokensUsed) {
      console.log(chalk.dim(`\n  🔤 Tokens: ${result.tokensUsed}`));
    }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    s.stop('');
    console.log(chalk.red(`  ❌ ${err}`));
  }
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^# (.*$)/gim, (_, p1) => chalk.bold.yellow(`\n  ⭐ ${p1}\n`))
    .replace(/^## (.*$)/gim, (_, p1) => chalk.bold.cyan(`\n  🔹 ${p1}\n`))
    .replace(/^### (.*$)/gim, (_, p1) => chalk.bold.underline(`\n  🔸 ${p1}\n`))
    .replace(/\*\*(.*?)\*\*/g, (_, p1) => chalk.bold(p1))
    .replace(/\*(.*?)\*/g, (_, p1) => chalk.italic(p1))
    .replace(/`(.*?)`/g, (_, p1) => chalk.bgGray.black(` ${p1} `))
    .replace(/\[(.*?)\]\((.*?)\)/g, (_, p1, p2) => `${chalk.bold.blue(p1)} (${chalk.dim(p2)})`)
    .replace(/^- (.*$)/gim, (_, p1) => `    • ${p1}`);
}

// === Shell Chính ===
export async function runShell(useCase: IngestDocumentUseCase, fileSystem: IFileSystem, config: IConfigProvider): Promise<void> {
  isInteractiveMode = true;
  console.clear();

  console.log(`
${chalk.bold.cyan('  💻 HARRNESS KNOWLEDGE OS')}
  Gõ câu hỏi · ${chalk.cyan('/exit')} thoát · ${chalk.cyan('/help')} trợ giúp · Tab tự động hoàn thành
  `);

  let rl = createReadline();

  // Hàm mồi vẽ khối viền trên và dấu nháy
  function triggerPrompt() {
    printTopDivider();
    rl.prompt();       
  }

  function createReadline() {
    const r = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.bold.magenta('mrp❯ '),
      terminal: true,
      completer: () => [[], ''], 
    });

    let selectedIndex = -1;
    let matchedCommands: typeof COMMANDS = [];
    let isSuggesting = false;

    process.stdin.setRawMode?.(true);

    process.stdin.on('keypress', (char, key) => {
      if (isProcessing) {
        if (key?.ctrl && (key.name === 'c' || key.name === 'd')) {
          console.log('\n👋 Hủy tiến trình. Tạm biệt!');
          process.exit(0);
        }
        return; 
      }

      if (key?.ctrl && (key.name === 'c' || key.name === 'd')) {
        console.log('\n👋 Tạm biệt!');
        process.exit(0);
      }

      if (isSuggesting && (key?.name === 'down' || key?.name === 'tab')) {
        selectedIndex = (selectedIndex + 1) % matchedCommands.length;
        redrawLine(r, r.line, selectedIndex, matchedCommands);
        return;
      }

      if (isSuggesting && key?.name === 'up') {
        selectedIndex = selectedIndex === -1 ? matchedCommands.length - 1 : selectedIndex - 1;
        if (selectedIndex < 0) selectedIndex = matchedCommands.length - 1;
        redrawLine(r, r.line, selectedIndex, matchedCommands);
        return;
      }

      if (isSuggesting && selectedIndex >= 0 && (key?.name === 'enter' || key?.name === 'return')) {
        const chosen = matchedCommands[selectedIndex].command;
        process.stdout.write(`\r\x1b[K${chalk.bold.magenta('mrp❯ ')}${chalk.cyan.bold(chosen)}`);
        
        r.write(null, { ctrl: true, name: 'u' }); 
        r.write(chosen); 

        isSuggesting = false;
        selectedIndex = -1;
        matchedCommands = [];
        redrawLine(r, r.line, selectedIndex, matchedCommands);
        return;
      }

      setImmediate(() => {
        if (isProcessing) return;
        const line = r.line;

        if (line.startsWith('/')) {
          isSuggesting = true;
          matchedCommands = COMMANDS.filter(c => c.command.startsWith(line)).slice(0, 5);
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

        if (isSuggesting && matchedCommands.length > 0) {
          const extraLines = matchedCommands.length + 2;
          process.stdout.write('\n'.repeat(extraLines));
          process.stdout.write(`\x1b[${extraLines}A`); 
        }

        redrawLine(r, line, selectedIndex, matchedCommands);
      });
    });

    r.on('line', async (line) => {
      if (isProcessing) return;

      isProcessing = true;
      r.pause();
      process.stdin.setRawMode?.(false);

      const input = line.trim();
      process.stdout.write('\r\x1b[J'); // Dọn dẹp menu gợi ý
      
      // In đè lại lệnh user vừa gõ (chống rác màn hình)
      const finalInputText = input.startsWith('/') ? chalk.cyan.bold(input) : chalk.white(input);
      process.stdout.write(`${chalk.bold.magenta('mrp❯ ')}${finalInputText}\n`);
      
      // Chốt đường kẻ viền DƯỚI bao bọc Input
      printBottomDivider(); 

      try {
        if (!input) return;

        if (input.startsWith('/') || input === 'help' || input === 'run') {
          const shouldExit = await handleCommand(input, useCase, fileSystem, config);
          if (shouldExit === false) {
            r.close();
            isProcessing = false;
            return;
          }
        } else {
          await handleQuery(input, useCase);
        }
      } catch (e: unknown) {
        const err = e instanceof Error ? e.message : String(e);
        console.error(chalk.red(`\n  ❌ Lỗi: ${err}`));
      } finally {
        process.stdin.resume(); 
        process.stdin.setRawMode?.(true);
        r.resume();
        isProcessing = false;
        
        console.log(''); // Cách một dòng trước khi ra lượt mới
        triggerPrompt(); // Kẻ đường trên và ra Prompt
      }
    });

    r.on('close', () => {
      if (isInteractiveMode) {
        rl = createReadline();
        triggerPrompt();
      }
    });

    return r;
  }

  triggerPrompt(); // Bắt đầu
  await new Promise<never>(() => {});
}
