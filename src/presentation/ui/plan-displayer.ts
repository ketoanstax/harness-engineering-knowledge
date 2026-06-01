import boxen from 'boxen';
import { select, isCancel, outro } from '@clack/prompts';
import chalk from 'chalk';
import * as fs from 'node:fs';

/**
 * Hàm mini render Markdown sang mã màu ANSI của Terminal
 */
function formatMarkdownForTerminal(md: string): string {
  return md
    // Tiêu đề H1: # Tiêu đề -> Bôi nền đen, chữ vàng đậm
    .replace(/^# (.*$)/gim, chalk.bgBlack.bold.yellow(' $1 '))
    
    // Tiêu đề H2: ## Tiêu đề -> Chữ Cyan đậm
    .replace(/^## (.*$)/gim, chalk.bold.cyan('🔹 $1'))
    
    // Tiêu đề H3: ### Tiêu đề -> Chữ gạch chân
    .replace(/^### (.*$)/gim, chalk.bold.underline('🔸 $1'))
    
    // In đậm: **text**
    .replace(/\*\*(.*?)\*\*/g, chalk.bold('$1'))
    
    // In nghiêng: *text* (chú ý không đè lên in đậm)
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, chalk.italic('$1'))
    
    // Inline code: `code` -> Bôi nền xám, chữ trắng
    .replace(/`([^`]+)`/g, chalk.bgGray.white(' $1 '))
    
    // Links: [text](url) -> Text xanh dương, url làm mờ
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `${chalk.blue.underline('$1')} ${chalk.dim('($2)')}`)
    
    // Gạch đầu dòng: - item
    .replace(/^[ \t]*- (.*$)/gim, chalk.magenta('  •') + ' $1')
    
    // Đường kẻ ngang: --- 
    .replace(/^---$/gim, chalk.dim('─'.repeat(50)));
}

/**
 * Hiển thị nội dung plan trong khung boxen đẹp mắt có Render Markdown.
 */
export function displayPlanInBox(planContent: string, timestamp: string): void {
  // Render Markdown sang Terminal Colors
  const renderedContent = formatMarkdownForTerminal(planContent.trim());

  console.log(boxen(renderedContent, {
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'yellow', // Đổi màu viền sang vàng để nhấn mạnh đây là Plan cần duyệt
    title: chalk.bold.yellow(` 📜 Kế hoạch: mrp_plan_${timestamp}.md `),
    titleAlignment: 'center',
  }));
}

/**
 * Dùng @clack/prompts select để hỏi người dùng: Approve / Reject / Exit.
 * Trả về kết quả cho use case xử lý tiếp.
 */
export async function askPlanAction(destPlanPath: string, timestamp: string): Promise<'approve' | 'reject' | 'exit'> {
  // Đọc và hiển thị nội dung plan
  const planContent = fs.readFileSync(destPlanPath, 'utf-8');
  displayPlanInBox(planContent, timestamp);

  const action = await select({
    message: '⏸️  Kế hoạch đã sẵn sàng — Bạn muốn làm gì?',
    options: [
      { value: 'approve' as const, label: '✅ Duyệt & chạy tiếp', hint: chalk.green('Chạy REFINE → VERIFY → COMMIT') },
      { value: 'reject' as const, label: '❌ Từ chối & dọn dẹp', hint: chalk.red('Xóa checkpoint, không tạo node') },
      { value: 'exit' as const, label: '🚪 Thoát', hint: chalk.dim('Quay lại shell') },
    ],
  });

  if (isCancel(action) || action === 'exit') {
    outro(chalk.gray('⏸️  Pipeline tạm dừng. Bạn có thể duyệt sau bằng lệnh approve/reject.'));
    return 'exit';
  }

  if (action === 'approve') {
    console.log(chalk.green('\n✅ Kế hoạch đã được phê duyệt! Đang chạy các pha tiếp theo...\n'));
  } else {
    console.log(chalk.red('\n❌ Đã từ chối kế hoạch. Dọn dẹp checkpoint.\n'));
  }

  return action;
}
