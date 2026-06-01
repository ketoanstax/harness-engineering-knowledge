#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import * as readline from 'node:readline/promises';
import { Command } from 'commander';
import matter from 'gray-matter';
import { MRPOrchestrator, MRPBatchOrchestrator } from './core/orchestrator.ts';
import { DIR_JOURNAL, DIR_RAW } from './core/config.ts';
import { PlanFile } from './models/plan.ts';
import { intro, outro, select, spinner, isCancel } from '@clack/prompts';
import chalk from 'chalk';

let isInteractiveShell = false;

const program = new Command();

program
  .name('mrp')
  .description('🚀 MRP Ingestion Pipeline CLI — Hệ thống phân rã tri thức tối tân')
  .version('0.1.0');

// Lệnh: run
program
  .command('run')
  .description('Chạy Ingestion Pipeline cho file thô (nếu không có -s sẽ hiển thị danh sách chọn)')
  .option('-s, --source <source>', 'Đường dẫn file thô ở 00_raw_docs (hoặc tên file)')
  .action(async (options) => {
    if (!options.source) {
      await pickFileForPipeline();
      return;
    }

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
        safeExit(1);
      }
    }

    const orchestrator = new MRPOrchestrator(sourcePath);
    const success = await orchestrator.run();
    safeExit(success ? 0 : 1);
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
      safeExit(1);
    }

    const orchestrator = new MRPBatchOrchestrator(directory, options.autoApprove);
    const success = await orchestrator.run();
    safeExit(success ? 0 : 1);
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
      safeExit(1);
    }

    // Đọc nội dung plan để trích xuất source_slug
    const content = fs.readFileSync(planFilepath, 'utf-8');
    const sourceSlug = PlanFile.parseSourceSlug(content);
    if (!sourceSlug) {
      console.error('❌ Lỗi: Không thể phân tích tên tài liệu nguồn từ file kế hoạch.');
      safeExit(1);
    }

    const sourcePath = path.join(DIR_RAW, `${sourceSlug}.md`);
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Lỗi: Không tìm thấy tài liệu nguồn gốc [${sourceSlug}.md]`);
      safeExit(1);
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
    safeExit(success ? 0 : 1);
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
      safeExit(1);
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
    safeExit(0);
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

// Lệnh: shell
program
  .command('shell')
  .alias('sh')
  .description('💻 Vào Interactive Shell Mode (gõ /exit hoặc Ctrl+D để thoát)')
  .action(() => runShell());

// Xử lý khi không nhận diện được command
program.on('command:*', () => {
  console.error('Lệnh không hợp lệ: %s\nXem --help để biết các lệnh được hỗ trợ.', program.args.join(' '));
  safeExit(1);
});

// =============================
// FILE PICKER
// =============================

async function pickFileForPipeline(): Promise<void> {

  // Bắt đầu giao diện xịn xò
  intro(chalk.bgCyan.black(' 🚀 MRP KNOWLEDGE INGESTION PIPELINE '));

  const files = fs.readdirSync(DIR_RAW)
    .filter(f => f.endsWith('.md') && f !== 'RULE.md' && f !== 'index.md')
    .map(f => {
      const filepath = path.join(DIR_RAW, f);
      try {
        const content = fs.readFileSync(filepath, 'utf-8');
        const frontmatter = matter(content);
        return {
          filename: f,
          filepath,
          title: frontmatter.data?.title || f,
          status: frontmatter.data?.status || 'unknown',
        };
      } catch {
        return null;
      }
    })
    .filter((f): f is NonNullable<typeof f> => f !== null && f.status === 'to-process');

  if (files.length === 0) {
    console.log(chalk.yellow('  📭 Không có file nào ở trạng thái "to-process" trong 00_raw_docs/'));
    return;
  }

  // Thay thế toàn bộ hàm interactiveSelect cũ bằng đoạn này:
  const chosenFilepath = await select({
    message: '📋 Chọn tài liệu thô để nạp vào hệ thống:',
    options: files.map(f => ({
      value: f.filepath,
      label: f.title,
      hint: chalk.gray(f.filename) // Chữ mờ phụ họa
    })),
    maxItems: 10,
  });

  // Nếu người dùng bấm ESC hoặc Ctrl+C
  if (isCancel(chosenFilepath)) {
    outro(chalk.gray('Đã hủy thao tác.'));
    return;
  }

  // Chạy pipeline
  const orchestrator = new MRPOrchestrator(chosenFilepath as string);
  await orchestrator.run();
  
  outro(chalk.green('✅ Hoàn tất luồng công việc!'));

}

async function interactiveSelect(options: string[], prompt: string): Promise<number> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) {
    // Fallback: nếu không phải TTY thì dùng readline số
    const rl = readline.createInterface({ input: stdin, output: stdout });
    console.log(`\n${prompt}`);
    options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
    const answer = await rl.question('\nChọn số (hoặc 0 để hủy): ');
    rl.close();
    const choice = parseInt(answer.trim(), 10);
    if (choice >= 1 && choice <= options.length) return choice - 1;
    return -1;
  }

  // Raw TTY mode để bắt phím mũi tên
  const isRaw = stdin.isRaw;
  stdin.setRawMode(true);
  stdin.resume();

  let selected = 0;

  function render() {
    // Xoá dòng cũ và vẽ lại
    const lines = options.length + 3; // prompt + border + padding
    const ansiUp = `\x1b[${lines}A`;
    stdout.write(ansiUp);

    stdout.write(`\r${prompt}\n`);
    stdout.write('  ──────────────────────────────────────\n');
    options.forEach((opt, i) => {
      const prefix = i === selected ? '\x1b[7m ❯ ' : '   ';
      const suffix = i === selected ? ' \x1b[0m' : '';
      stdout.write(`\r${prefix}${opt}${suffix}\n`);
    });
  }

  // Vẽ lần đầu
  stdout.write(`\n${prompt}\n`);
  stdout.write('  ──────────────────────────────────────\n');
  options.forEach((_, i) => stdout.write(`   ${options[i]}\n`));
  // Di chuyển con trỏ lên đầu danh sách
  const totalLines = options.length + 2;
  stdout.write(`\x1b[${totalLines}A`);

  return new Promise<number>((resolve) => {
    const onData = (key: Buffer) => {
      const keyStr = key.toString();

      // Mũi tên lên
      if (keyStr === '\x1b[A') {
        selected = Math.max(0, selected - 1);
        render();
        return;
      }

      // Mũi tên xuống
      if (keyStr === '\x1b[B') {
        selected = Math.min(options.length - 1, selected + 1);
        render();
        return;
      }

      // Enter
      if (keyStr === '\r' || keyStr === '\n') {
        cleanup();
        resolve(selected);
        return;
      }

      // Escape hoặc Ctrl+C
      if (keyStr === '\x1b' || keyStr === '\x03') {
        cleanup();
        resolve(-1);
        return;
      }
    };

    function cleanup() {
      stdin.removeListener('data', onData);
      stdin.setRawMode(isRaw);

      // Vẽ lại kết quả cuối cùng
      stdout.write(`\x1b[${options.length + 2}B`); // xuống cuối
      const suffix = selected >= 0 ? options[selected] : '(đã hủy)';
      stdout.write(`\n  ✅ ${suffix}\n`);
    }

    stdin.on('data', onData);
  });
}

// =============================
// INTERACTIVE SHELL MODE
// =============================

function printShellHelp(): void {
  console.log(`
📋 DANH SÁCH LỆNH TRONG SHELL MODE:
─────────────────────────────────────
  run                           Liệt kê & chọn file để chạy pipeline
  run -s <file>                 Chạy pipeline trực tiếp cho file
  approve -t <timestamp>        Duyệt kế hoạch & chạy tiếp
  reject -t <timestamp>         Từ chối & dọn dẹp
  batch                         Chạy batch tuần tự
  batch --auto-approve          Chạy batch tự động
  guide                         Xem hướng dẫn vận hành

  /help      Hiển thị danh sách lệnh
  /exit      Thoát shell
  Ctrl+D     Thoát shell
`);
}

async function runShell(): Promise<void> {
  isInteractiveShell = true;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'mrp> ',
  });

  // Dùng exitOverride của Commander thay vì can thiệp process.exit (read-only)
  program.exitOverride();

  console.log(`
╔════════════════════════════════════════╗
║  💻 MRP Interactive Shell              ║
║  Gõ /help để xem danh sách lệnh       ║
║  Gõ /exit hoặc Ctrl+D để thoát        ║
╚════════════════════════════════════════╝
`);

  rl.on('line', async (line: string) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      rl.prompt();
      return;
    }

    if (trimmed === '/exit' || trimmed === '/quit') {
      rl.close();
      return;
    }

    if (trimmed === '/help') {
      printShellHelp();
      rl.prompt();
      return;
    }

    // Tạm dừng readline để nhường quyền nhập liệu cho interactiveSelect (File Picker)
    rl.pause();

    try {
      const args = trimmed.split(/\s+/);
      await program.parseAsync(['node', 'mrp', ...args], { from: 'user' });
    } catch (e: any) {
      if (e.code !== 'commander.exit' || e.exitCode !== 0) {
        console.error(`⚠️ ${e.message}`);
      }
    }
    
    // Xử lý xong, mở lại readline để nhận lệnh tiếp theo
    rl.resume();
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n👋 Tạm biệt!');
    safeExit(0);
  });

  rl.prompt();
}

// Nếu có tham số dòng lệnh → parse và chạy command tương ứng
// Nếu không → vào Shell Mode tương tác
if (process.argv.length <= 2) {
  runShell().catch((e) => {
    console.error(`❌ Shell error: ${e.message}`);
    safeExit(1);
  });
} else {
  program.parse(process.argv);
}

// Hàm thoát an toàn: Nếu ở trong shell thì ném lỗi (để shell catch lại), nếu ở ngoài thì exit thật.
function safeExit(code: number): void {
  if (isInteractiveShell) {
    if (code !== 0) throw new Error(`Lệnh bị hủy hoặc thất bại (Mã: ${code})`);
  } else {
    process.exit(code);
  }
}