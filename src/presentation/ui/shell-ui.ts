// src/presentation/ui/shell-ui.ts
import * as process from 'node:process';
import type * as readline from 'node:readline';
import chalk from 'chalk';
import type { ShellCommand } from './shell-router.ts';
import boxen from 'boxen';

export function getTermWidth(): number {
  return process.stdout.columns || 80;
}

export function printTopDivider(): void {
  console.log(chalk.gray('─'.repeat(getTermWidth())));
}

export function printBottomDivider(): void {
  console.log(chalk.gray('─'.repeat(getTermWidth())));
}

// Hiệu ứng "Shape-shifting"
export function createTerminalSpinner(message: string) {
  const frames = ['◰', '◳', '◲', '◱', '▖', '▘', '▝', '▗'];
  const colors = [chalk.cyan, chalk.blueBright, chalk.magentaBright, chalk.cyanBright];
  let i = 0;
  let running = true;
  
  process.stdout.write('\n'); 
  
  const timer = setInterval(() => {
    if (!running) return;
    const frame = frames[i % frames.length];
    const color = colors[Math.floor(i / 2) % colors.length];
    process.stdout.write(`\r\x1b[K  ${color(frame)} ${chalk.dim(message)}`);
    i++;
  }, 120);

  return {
    stop(finalMsg?: string) {
      running = false;
      clearInterval(timer);
      if (finalMsg) {
        process.stdout.write(`\r\x1b[K  ${finalMsg}\n`);
      } else {
        process.stdout.write(`\r\x1b[K`);
      }
    },
  };
}

// Render Markdown mini
export function renderMarkdown(md: string): string {
  const formatted = md
    .replace(/^# (.*$)/gim, (_, p1) => chalk.bold.yellow(`⭐ ${p1}`))
    .replace(/^## (.*$)/gim, (_, p1) => chalk.bold.cyan(`🔹 ${p1}`))
    .replace(/^### (.*$)/gim, (_, p1) => chalk.bold.greenBright(`🔸 ${p1}`))
    .replace(/^[ \t]*> (.*$)/gim, (_, p1) => chalk.gray('│ ') + p1)
    .replace(/\*\*(.*?)\*\*/g, (_, p1) => chalk.bold(p1))
    .replace(/\*(.*?)\*/g, (_, p1) => chalk.italic(p1))
    .replace(/`(.*?)`/g, (_, p1) => chalk.bgGray.white(` ${p1} `))
    .replace(/\[(.*?)\]\((.*?)\)/g, (_, p1, p2) => `${chalk.blue.underline(p1)} ${chalk.dim(`(${p2})`)}`)
    .replace(/^- (.*$)/gim, (_, p1) => `  • ${p1}`);

  return boxen(formatted.trim(), {
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    margin: { top: 0, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'cyan',
    title: chalk.bold.cyan(' 🧠 Trợ Lý Tri Thức '),
    titleAlignment: 'left',
  });
}

// Highlight cú pháp & vẽ Menu gợi ý
export function redrawLine(rl: readline.Interface, line: string, selectedIndex = -1, matched: ShellCommand[] = []): void {
  const cursorPos = rl.cursor;
  const promptText = 'mrp❯ ';
  const promptLen = 5;
  const width = getTermWidth();

  // Di chuyển con trỏ lên dòng đầu tiên của prompt nếu dòng bị quấn (wrapped) trước khi xóa
  const cursorRow = Math.floor((promptText.length + cursorPos) / width);
  if (cursorRow > 0) {
    process.stdout.write(`\x1b[${cursorRow}A`);
  }
  process.stdout.write('\r\x1b[J');
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

  if (matched.length > 0) {
    const divider = chalk.dim('─'.repeat(getTermWidth()));
    process.stdout.write('\n' + divider);
    
    for (let i = 0; i < matched.length; i++) {
      const isSelected = i === selectedIndex;
      const { command, description } = matched[i];

      const row = isSelected
        ? chalk.bgCyan.black(` ❯ ${command.padEnd(25)} - ${description} `)
        : `   ${chalk.cyan(command.padEnd(25))} - ${chalk.dim(description)}`;
      process.stdout.write(`\n${row}`);
    }
    process.stdout.write('\n' + divider);
    process.stdout.write(`\x1b[${matched.length + 2}A`);
  }

  if (promptLen + cursorPos > 0) {
    process.stdout.write(`\r\x1b[${promptLen + cursorPos}C`);
  } else {
    process.stdout.write(`\r`);
  }
}