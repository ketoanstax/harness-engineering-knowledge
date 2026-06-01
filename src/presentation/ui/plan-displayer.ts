import boxen from 'boxen';

/**
 * Hiển thị nội dung plan trong khung boxen đẹp mắt.
 */
export function displayPlanInBox(planContent: string, timestamp: string): void {
  // Lấy phần nội dung chính, bỏ phần hướng dẫn duyệt
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
