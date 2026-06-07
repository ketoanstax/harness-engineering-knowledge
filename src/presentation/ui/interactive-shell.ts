// src/presentation/ui/interactive-shell.ts
import * as process from 'node:process';
import * as readline from 'node:readline';
import chalk from 'chalk';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { IngestDocumentUseCase } from '../../application/use-cases/ingest-document.use-case.ts';
import { printTopDivider, printBottomDivider, redrawLine } from './shell-ui.ts';
import { handleCommand, handleQuery, COMMANDS, type ShellCommand } from './shell-router.ts';

export let isInteractiveMode = false;
let isProcessing = false;

export function safeExit(code: number): boolean {
  if (isInteractiveMode) {
    return false; 
  }
  process.exit(code);
}

// === Shell Lõi (Vòng Lặp Sự Kiện) ===
export async function runShell(useCase: IngestDocumentUseCase, fileSystem: IFileSystem, config: IConfigProvider): Promise<void> {
  isInteractiveMode = true;
  console.clear();

  console.log(`
${chalk.bold.cyan('  💻 HARRNESS KNOWLEDGE OS')}
  Gõ câu hỏi · ${chalk.cyan('/exit')} thoát · ${chalk.cyan('/help')} trợ giúp · Tab tự động hoàn thành
  `);

  let rl = createReadline();

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
    let matchedCommands: ShellCommand[] = [];
    let isSuggesting = false;

    process.stdin.setRawMode?.(true);

    // Xử lý phím tắt & Suggestion
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
        const chosen = matchedCommands[selectedIndex].command;
        r.write(null, { ctrl: true, name: 'u' });
        r.write(chosen);
        redrawLine(r, chosen, selectedIndex, matchedCommands);
        return;
      }

      if (isSuggesting && key?.name === 'up') {
        selectedIndex = selectedIndex === -1 ? matchedCommands.length - 1 : selectedIndex - 1;
        if (selectedIndex < 0) selectedIndex = matchedCommands.length - 1;
        const chosen = matchedCommands[selectedIndex].command;
        r.write(null, { ctrl: true, name: 'u' });
        r.write(chosen);
        redrawLine(r, chosen, selectedIndex, matchedCommands);
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

      // Xử lý gõ phím thường (Auto-complete list)
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

    // Xử lý nộp lệnh (Enter)
    r.on('line', async (line) => {
      if (isProcessing) return;

      isProcessing = true;
      r.pause();
      process.stdin.setRawMode?.(false);

      const input = line.trim();
      process.stdout.write('\x1b[1A\r\x1b[J'); // Xóa dòng echoed cũ bằng cách di chuyển lên 1 dòng và xóa
      
      const finalInputText = input.startsWith('/') ? chalk.cyan.bold(input) : chalk.white(input);
      process.stdout.write(`${chalk.bold.magenta('mrp❯ ')}${finalInputText}\n`);
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
        
        console.log('');
        triggerPrompt(); 
      }
    });

    r.on('close', () => {
      if (isInteractiveMode && process.stdin.isTTY) {
        rl = createReadline();
        triggerPrompt();
      } else if (isInteractiveMode) {
        process.exit(0);
      }
    });

    return r;
  }

  triggerPrompt(); 
  await new Promise<never>(() => {});
}
