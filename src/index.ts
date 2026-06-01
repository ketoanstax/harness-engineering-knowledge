#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import { Command } from 'commander';
import { MRPOrchestrator, MRPBatchOrchestrator } from './core/orchestrator.ts';
import { DIR_JOURNAL, DIR_RAW } from './core/config.ts';
import { PlanFile } from './models/plan.ts';

const program = new Command();

program
  .name('mrp')
  .description('🚀 MRP Ingestion Pipeline CLI — Hệ thống phân rã tri thức tối tân')
  .version('0.1.0');

// Lệnh: run
program
  .command('run')
  .description('Chạy Ingestion Pipeline cho file thô')
  .requiredOption('-s, --source <source>', 'Đường dẫn file thô ở 00_raw_docs (hoặc tên file)')
  .action(async (options) => {
    let sourcePath = options.source;
    if (!path.isAbsolute(sourcePath)) {
      sourcePath = path.resolve(sourcePath);
    }

    if (!fs.existsSync(sourcePath)) {
      // Thử tìm trong 00_raw_docs
      const testPath = path.join(DIR_RAW, options.source);
      if (fs.existsSync(testPath)) {
        sourcePath = testPath;
      } else {
        console.error(`❌ Lỗi: Không tìm thấy file [${options.source}]`);
        process.exit(1);
      }
    }

    const orchestrator = new MRPOrchestrator(sourcePath);
    const success = await orchestrator.run();
    process.exit(success ? 0 : 1);
  });

// Lệnh: batch
program
  .command('batch')
  .description('Chạy Batch Ingestion Pipeline tuần tự chronological')
  .option('-d, --dir <dir>', 'Thư mục chứa file thô (mặc định: 00_raw_docs)', DIR_RAW)
  .option('-a, --auto-approve', 'Cờ chạy tự động từ đầu đến cuối không dừng (Auto-Approve)', false)
  .action(async (options) => {
    let directory = options.dir;
    if (!path.isAbsolute(directory)) {
      directory = path.resolve(directory);
    }

    if (!fs.existsSync(directory)) {
      console.error(`❌ Lỗi: Thư mục không tồn tại [${directory}]`);
      process.exit(1);
    }

    const orchestrator = new MRPBatchOrchestrator(directory, options.autoApprove);
    const success = await orchestrator.run();
    process.exit(success ? 0 : 1);
  });

// Lệnh: approve
program
  .command('approve')
  .description('Phê duyệt kế hoạch và thực thi gộp nốt')
  .requiredOption('-t, --timestamp <timestamp>', 'Mã thời gian của kế hoạch (vd: 20260531_220000)')
  .action(async (options) => {
    const timestamp = options.timestamp;
    const planFilename = `mrp_plan_${timestamp}.md`;
    const planFilepath = path.join(DIR_JOURNAL, planFilename);

    if (!fs.existsSync(planFilepath)) {
      console.error(`❌ Lỗi: Không tìm thấy kế hoạch [${planFilename}]`);
      process.exit(1);
    }

    // Đọc nội dung plan để trích xuất source_slug
    const content = fs.readFileSync(planFilepath, 'utf-8');
    const sourceSlug = PlanFile.parseSourceSlug(content);
    if (!sourceSlug) {
      console.error('❌ Lỗi: Không thể phân tích tên tài liệu nguồn từ file kế hoạch.');
      process.exit(1);
    }

    const sourcePath = path.join(DIR_RAW, `${sourceSlug}.md`);
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Lỗi: Không tìm thấy tài liệu nguồn gốc [${sourceSlug}.md]`);
      process.exit(1);
    }

    // Khởi tạo Orchestrator từ checkpoint hoặc tạo mới để chạy tiếp
    const orchestrator = new MRPOrchestrator(sourcePath);

    // Cập nhật trạng thái duyệt trong file kế hoạch
    let planContent = fs.readFileSync(planFilepath, 'utf-8');
    planContent = planContent.replace('Trạng thái: `pending`', 'Trạng thái: `approved`');
    fs.writeFileSync(planFilepath, planContent, 'utf-8');

    // Chuyển trạng thái State Machine sang REFINE
    orchestrator.state.current_phase = 'REFINE';
    orchestrator.saveCheckpoint();

    // Chạy nốt các pha còn lại
    const success = await orchestrator.run();
    process.exit(success ? 0 : 1);
  });

// Lệnh: reject
program
  .command('reject')
  .description('Từ chối và dọn dẹp kế hoạch')
  .requiredOption('-t, --timestamp <timestamp>', 'Mã thời gian của kế hoạch')
  .action((options) => {
    const timestamp = options.timestamp;
    const planFilename = `mrp_plan_${timestamp}.md`;
    const planFilepath = path.join(DIR_JOURNAL, planFilename);

    if (!fs.existsSync(planFilepath)) {
      console.error(`❌ Lỗi: Không tìm thấy kế hoạch [${planFilename}]`);
      process.exit(1);
    }

    // Đọc nội dung
    let content = fs.readFileSync(planFilepath, 'utf-8');

    content = content.replace('Trạng thái: `pending`', 'Trạng thái: `rejected`');
    content = content.replace('Trạng thái: `approved`', 'Trạng thái: `rejected`');

    fs.writeFileSync(planFilepath, content, 'utf-8');

    // Trích xuất source_slug để dọn checkpoint
    const sourceSlug = PlanFile.parseSourceSlug(content);
    if (sourceSlug) {
      const checkpointPath = path.join(DIR_JOURNAL, `mrp_checkpoint_${sourceSlug}.json`);
      if (fs.existsSync(checkpointPath)) {
        fs.unlinkSync(checkpointPath);
      }
    }

    console.log(`❌ Đã từ chối kế hoạch [${planFilename}]. Đã dọn dẹp checkpoint.`);
    process.exit(0);
  });

// Lệnh: guide
program
  .command('guide')
  .description('📖 Hiển thị hướng dẫn vận hành chi tiết quy trình nạp tri thức (MRP Ingestion Workflow)')
  .action(() => {
    console.log(`
=====================================================================
📖 HƯỚNG DẪN VẬN HÀNH QUY TRÌNH NẠP TRI THỨC (MRP PIPELINE WORKFLOW)
=====================================================================

Hệ thống hoạt động theo mô hình MAP-REDUCE-PLAN-REFINE-VERIFY-COMMIT:

1️⃣  Pha MAP (Mapper):
    - Đọc tài liệu thô tại 'vault/00_raw_docs/' có trạng thái 'status: to-process'.
    - Phân tích và trích xuất khái niệm chính, từ khóa và tạo file chắt lọc cấu trúc tại 'vault/01_structured_docs/'.

2️⃣  Pha REDUCE (Reducer):
    - Dùng cơ chế lọc ngữ cảnh động (Active Context Filtering).
    - So sánh khái niệm mới với các nốt tri thức cũ trong vault để tìm trùng lặp hoặc xung đột.

3️⃣  Pha PLAN (Planner):
    - LLM đề xuất phương án hành động cụ thể (Tạo nốt mới hoặc Trộn vào nốt cũ).
    - Xuất file kế hoạch hành động dạng Markdown tại 'vault/05_journal/mrp_plan_<timestamp>.md'.
    - Pipeline TẠM DỪNG ở pha này để chờ người dùng phê duyệt.

4️⃣  Pha REFINE (Refiner):
    - Sau khi được duyệt, hệ thống tự động tạo mới hoặc trộn nội dung các nốt nguyên tử tại 'vault/02_atomic_nodes/'.
    - Ghi nhận liên kết ngược dòng dẫn chứng (evidence) về tận tài liệu thô ban đầu.

5️⃣  Pha VERIFY (Verifier):
    - Kiểm toán liên kết (Link Audit) & Kiểm toán cấu trúc cha-con (Tree Integrity Audit) để tránh liên kết gãy.

6️⃣  Pha COMMIT (Committer):
    - Cập nhật trạng thái tài liệu thô sang 'processed'.
    - Cập nhật chỉ mục đồ thị vào 'vault/03_neural_map/INDEX.md' và bảng định tuyến 'vault/03_neural_map/AI_ROUTING_TABLE.md'.

---------------------------------------------------------------------
💻 CÁC LỆNH ĐIỀU HÀNH CHÍNH (CLI COMMANDS):
---------------------------------------------------------------------

👉 1. Chạy quy trình cho 1 tệp tin thô (ví dụ sutta-mn-003.md):
   $ pnpm start run -s sutta-mn-003.md
   (Hoặc: node --experimental-strip-types src/index.ts run -s sutta-mn-003.md)

👉 2. Duyệt kế hoạch (sau khi kiểm tra file mrp_plan_<timestamp>.md):
   $ pnpm start approve -t <timestamp>
   (Ví dụ: pnpm start approve -t 20260601_092811)

👉 3. Từ chối kế hoạch và dọn dẹp checkpoint:
   $ pnpm start reject -t <timestamp>

👉 4. Chạy Batch tuần tự tự động cho toàn bộ tệp thô mới (không dừng duyệt):
   $ pnpm start batch --auto-approve

👉 5. Chạy Batch tuần tự dừng duyệt từng bước:
   $ pnpm start batch
`);
  });

// Xử lý khi không nhận diện được command
program.on('command:*', () => {
  console.error('Lệnh không hợp lệ: %s\nXem --help để biết các lệnh được hỗ trợ.', program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);

// Nếu không truyền lệnh nào, in trợ giúp
if (process.argv.length <= 2) {
  program.outputHelp();
}
