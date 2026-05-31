import * as fs from 'node:fs';
import * as path from 'node:path';
import { DIR_JOURNAL, PATH_INDEX, ATOMIC_PREFIX } from '../core/config.ts';

export class PhaseCommitter {
  private o: any;

  constructor(orchestrator: any) {
    this.o = orchestrator;
  }

  private updateRawFileStatus(): void {
    const rawPath = this.o.sourcePath;
    if (!fs.existsSync(rawPath)) {
      return;
    }

    let content = fs.readFileSync(rawPath, 'utf-8');

    if (content.includes('status: to-process')) {
      content = content.replace('status: to-process', 'status: processed');
    } else {
      content = content.replace(/^status:.*$/m, 'status: processed');
    }

    fs.writeFileSync(rawPath, content, 'utf-8');
    console.log('  ✅ Cập nhật trạng thái file nguồn gốc sang [processed].');
  }

  private archivePlanFile(): void {
    const planTimestamp = this.o.state.plan_timestamp;
    if (!planTimestamp) {
      return;
    }

    const planFilepath = path.join(DIR_JOURNAL, `mrp_plan_${planTimestamp}.md`);
    if (!fs.existsSync(planFilepath)) {
      return;
    }

    let content = fs.readFileSync(planFilepath, 'utf-8');

    content = content.replace('Trạng thái: `pending`', 'Trạng thái: `executed`');
    content = content.replace('Trạng thái: `approved`', 'Trạng thái: `executed`');

    fs.writeFileSync(planFilepath, content, 'utf-8');
    console.log('  ✅ Đánh dấu tệp kế hoạch sang [executed].');
  }

  private updateIndexFile(): void {
    if (!fs.existsSync(PATH_INDEX)) {
      return;
    }

    const planData = this.o.state.plan_item_data;
    if (!planData) {
      return;
    }

    const newNodes = planData.new_nodes || [];
    if (newNodes.length === 0) {
      return;
    }

    let content = fs.readFileSync(PATH_INDEX, 'utf-8');

    for (const nn of newNodes) {
      const slug = nn.slug;
      const title = nn.title || slug;
      const linkStr = `- [${title}](02_atomic_nodes/${ATOMIC_PREFIX}${slug}.md)`;

      if (content.includes(linkStr)) {
        continue;
      }

      // Tìm danh mục phù hợp
      const category = nn.category || '';
      let marker = '';
      if (category.includes('Core')) {
        marker = '### 1. Khung gá cốt lõi (Harness Core Concepts)';
      } else if (category.includes('Cognitive')) {
        marker = '### 2. Quản lý Nhận thức (Cognitive & Context Management)';
      } else if (category.includes('Workflow')) {
        marker = '### 3. Kiến trúc Quy trình làm việc (Workflow Architecture)';
      } else if (category.includes('Guardrails')) {
        marker = '### 4. Rào chắn An toàn (Guardrails & Safety)';
      } else if (category.includes('Verification')) {
        marker = '### 5. Xác thực & Đo lường chất lượng (Verification)';
      } else {
        marker = '### 1. Khung gá cốt lõi (Harness Core Concepts)';
      }

      if (content.includes(marker)) {
        content = content.replace(
          marker,
          `${marker}\n- [${title}](02_atomic_nodes/${ATOMIC_PREFIX}${slug}.md) — Bổ sung tự động bởi MRP Ingestion Pipeline.`
        );
      }
    }

    fs.writeFileSync(PATH_INDEX, content, 'utf-8');
    console.log('  ✅ Đã tự động cập nhật và lập chỉ mục trong [03_neural_map/INDEX.md].');
  }

  async execute(): Promise<boolean> {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📦  Phase C - COMMITTER: Đóng dấu và lưu trữ tri thức`);
    console.log(`${'='.repeat(50)}`);

    try {
      this.updateRawFileStatus();
      this.archivePlanFile();
      this.updateIndexFile();

      this.o.state.committed = true;
      console.log('  ✅ Commit thành công.');
      return true;
    } catch (e: any) {
      console.log(`  ❌ Lỗi commit: ${e.message}`);
      return false;
    }
  }
}
