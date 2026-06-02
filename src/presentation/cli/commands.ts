import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import { PlanFile } from '../../domain/entities/plan.entity.ts';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { IngestDocumentUseCase } from '../../application/use-cases/ingest-document.use-case.ts';
import { pickFileForPipeline } from '../ui/file-picker.ts';
import { displayPlanInBox } from '../ui/plan-displayer.ts';
import { safeExit } from '../ui/interactive-shell.ts';
import { setActiveProgram } from '../ui/shell-router.ts';

const SUPPORTED_EXTS = ['.md', '.txt', '.pdf', '.docx', '.csv'];

function findSourceFileBySlug(slug: string, dirRaw: string): string | null {
  for (const ext of SUPPORTED_EXTS) {
    const candidate = path.join(dirRaw, `${slug}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function buildProgram(useCase: IngestDocumentUseCase, fileSystem: IFileSystem, config: IConfigProvider): Command {
  const program = new Command();

  program
    .name('mrp')
    .description('🚀 MRP Ingestion Pipeline CLI — Hệ thống phân rã tri thức tối tân')
    .version('0.1.0');

  // Lệnh: run
  program
    .command('run')
    .description('Chạy Ingestion Pipeline cho file thô')
    .option('-s, --source <source>', 'Đường dẫn file thô ở 00_raw_docs (hoặc tên file)')
    .action(async (options) => {
      if (!options.source) {
        const filepath = await pickFileForPipeline(fileSystem, config);
        if (filepath) {
          const success = await useCase.execute(filepath);
          safeExit(success ? 0 : 1);
        }
        return;
      }

      let sourcePath = options.source;
      if (!path.isAbsolute(sourcePath)) {
        sourcePath = path.resolve(sourcePath);
      }

      if (!fs.existsSync(sourcePath)) {
        const testPath = path.join(config.dirRaw, options.source);
        if (fs.existsSync(testPath)) {
          sourcePath = testPath;
        } else {
          console.error(`❌ Lỗi: Không tìm thấy file [${options.source}]`);
          safeExit(1);
        }
      }

      const success = await useCase.execute(sourcePath);
      safeExit(success ? 0 : 1);
    });

  // Lệnh: batch
  program
    .command('batch')
    .description('Chạy Batch Ingestion Pipeline tuần tự chronological')
    .option('-d, --dir <dir>', 'Thư mục chứa file thô', config.dirRaw)
    .option('-a, --auto-approve', 'Cờ chạy tự động từ đầu đến cuối', false)
    .action(async (options) => {
      let directory = options.dir;
      if (!path.isAbsolute(directory)) {
        directory = path.resolve(directory);
      }

      if (!fs.existsSync(directory)) {
        console.error(`❌ Lỗi: Thư mục không tồn tại [${directory}]`);
        safeExit(1);
      }

      const success = await useCase.runBatch(directory, options.autoApprove);
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
      const planFilepath = path.join(config.dirJournal, planFilename);

      if (!fs.existsSync(planFilepath)) {
        console.error(`❌ Lỗi: Không tìm thấy kế hoạch [${planFilename}]`);
        safeExit(1);
      }

      // Đọc nội dung plan để lấy source_slug
      const content = fs.readFileSync(planFilepath, 'utf-8');
      const sourceSlug = PlanFile.parseSourceSlug(content);
      if (!sourceSlug) {
        console.error('❌ Lỗi: Không thể phân tích tên tài liệu nguồn từ file kế hoạch.');
        safeExit(1);
      }

      // Tìm file nguồn theo slug (không hardcode .md — hỗ trợ .pdf, .docx...)
      const sourcePath = findSourceFileBySlug(sourceSlug as string, config.dirRaw);
      if (!sourcePath) {
        console.error(`❌ Lỗi: Không tìm thấy tài liệu nguồn [${sourceSlug}] trong [${config.dirRaw}]`);
        safeExit(1);
        return;
      }

      // Hiển thị plan trước khi duyệt
      displayPlanInBox(content, timestamp);

      // Cập nhật trạng thái phê duyệt
      let planContent = fs.readFileSync(planFilepath, 'utf-8');
      planContent = planContent.replace('Trạng thái: `pending`', 'Trạng thái: `approved`');
      fs.writeFileSync(planFilepath, planContent, 'utf-8');

      console.log(chalk.green(`\n✅ Kế hoạch [${planFilename}] đã được phê duyệt.`));
      console.log(chalk.cyan('🔄 Tiếp tục chạy các pha REFINE → VERIFY → COMMIT...\n'));

      const success = await useCase.execute(sourcePath);
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
      const planFilepath = path.join(config.dirJournal, planFilename);

      if (!fs.existsSync(planFilepath)) {
        console.error(`❌ Lỗi: Không tìm thấy kế hoạch [${planFilename}]`);
        safeExit(1);
      }

      let content = fs.readFileSync(planFilepath, 'utf-8');

      content = content.replace('Trạng thái: `pending`', 'Trạng thái: `rejected`');
      content = content.replace('Trạng thái: `approved`', 'Trạng thái: `rejected`');

      fs.writeFileSync(planFilepath, content, 'utf-8');

      // Dọn checkpoint
      const sourceSlug = PlanFile.parseSourceSlug(content);
      if (sourceSlug) {
        const checkpointPath = path.join(config.dirJournal, `mrp_checkpoint_${sourceSlug}.json`);
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
    .description('📖 Hiển thị hướng dẫn vận hành')
    .action(() => {
      console.log(`
=====================================================================
📖 HƯỚNG DẪN VẬN HÀNH QUY TRÌNH NẠP TRI THỨC (MRP PIPELINE WORKFLOW)
=====================================================================

Hệ thống hoạt động theo mô hình MAP-REDUCE-PLAN-REFINE-VERIFY-COMMIT:

1️⃣  Pha MAP (Mapper): ...
2️⃣  Pha REDUCE (Reducer): ...
3️⃣  Pha PLAN (Planner): ...
4️⃣  Pha REFINE (Refiner): ...
5️⃣  Pha VERIFY (Verifier): ...
6️⃣  Pha COMMIT (Committer): ...

---------------------------------------------------------------------
💻 CÁC LỆNH ĐIỀU HÀNH CHÍNH (CLI COMMANDS):
---------------------------------------------------------------------

👉 1. Chạy quy trình cho 1 tệp tin thô:
   $ pnpm start run -s <file.md>

👉 2. Duyệt kế hoạch:
   $ pnpm start approve -t <timestamp>

👉 3. Từ chối kế hoạch và dọn dẹp checkpoint:
   $ pnpm start reject -t <timestamp>

👉 4. Chạy Batch tuần tự tự động:
   $ pnpm start batch --auto-approve

👉 5. Chạy Batch từng bước:
   $ pnpm start batch
`);
    });

  // Xử lý command không hợp lệ
  program.on('command:*', () => {
    console.error('Lệnh không hợp lệ: %s\nXem --help để biết các lệnh được hỗ trợ.', program.args.join(' '));
    // Không gọi process.exit — khi chạy trong shell, safeExit sẽ giết chết shell.
    // exitOverride() + throw đủ để Commander báo lỗi mà không tắt tiến trình.
    throw new Error(`Command not found: ${program.args.join(' ')}`);
  });

  program.exitOverride();
  setActiveProgram(program);

  return program;
}
