import boxen from 'boxen';
import { select, isCancel, outro } from '@clack/prompts';
import chalk from 'chalk';
import * as fs from 'node:fs';

/**
 * Hiển thị nội dung plan trong khung boxen đẹp mắt.
 */
export function displayPlanInBox(planContent: string, timestamp: string): void {
  const mainContent = planContent.split('---')[0]?.trim() || planContent;

  console.log(boxen(mainContent, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    title: `📜 Kế hoạch: mrp_plan_${timestamp}.md`,
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
    message: '⏸️  Plan đã sẵn sàng — Bạn muốn làm gì?',
    options: [
      { value: 'approve' as const, label: '✅ Duyệt & chạy tiếp', hint: 'Chạy REFINE → VERIFY → COMMIT' },
      { value: 'reject' as const, label: '❌ Từ chối & dọn dẹp', hint: 'Xóa checkpoint, không tạo node' },
      { value: 'exit' as const, label: '🚪 Thoát', hint: 'Quay lại shell' },
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
