import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import { LLMClient } from './llm.ts';
import { DIR_JOURNAL, DIR_RAW, VAULT_ROOT } from './config.ts';
import { PhaseMapper } from '../phases/mapper.ts';
import { PhaseReducer } from '../phases/reducer.ts';
import { PhasePlanner } from '../phases/planner.ts';
import { PhaseRefiner } from '../phases/refiner.ts';
import { PhaseVerifier, auditLinks, auditTreeIntegrity } from '../phases/verifier.ts';
import { PhaseCommitter } from '../phases/committer.ts';

export class MRPOrchestrator {
  sourcePath: string;
  sourceSlug: string;
  skipVerify: boolean;
  vaultRoot: string;
  llm: LLMClient;
  timestamp: string;
  checkpointPath: string;
  state: {
    source_slug: string;
    source_path: string;
    current_phase: string;
    timestamp: string;
    mapped_data: any;
    reduced_data: any;
    plan_timestamp: any;
    refined: boolean;
    verified: boolean;
    committed: boolean;
    plan_item_data?: any;
  };

  constructor(sourcePath: string, skipVerify = false) {
    this.sourcePath = sourcePath;
    this.sourceSlug = path.basename(sourcePath).replace('.md', '');
    this.skipVerify = skipVerify;
    this.vaultRoot = VAULT_ROOT;

    // Thiết lập biến môi trường cục bộ để định tuyến Mock LLM chính xác
    process.env.CURRENT_MRP_SOURCE_SLUG = this.sourceSlug;

    this.llm = new LLMClient();

    // Tạo timestamp dạng YYYYMMDD_HHMMSS
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    this.timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    this.checkpointPath = path.join(DIR_JOURNAL, `mrp_checkpoint_${this.sourceSlug}.json`);

    this.state = {
      source_slug: this.sourceSlug,
      source_path: this.sourcePath,
      current_phase: 'MAP',
      timestamp: this.timestamp,
      mapped_data: null,
      reduced_data: null,
      plan_timestamp: null,
      refined: false,
      verified: false,
      committed: false,
    };

    this.loadCheckpoint();
  }

  loadCheckpoint(): void {
    if (fs.existsSync(this.checkpointPath)) {
      try {
        const saved = JSON.parse(fs.readFileSync(this.checkpointPath, 'utf-8'));
        Object.assign(this.state, saved);
        this.timestamp = this.state.timestamp;
        console.log(`🔄 Khôi phục checkpoint! Pha hiện tại: ${this.state.current_phase}`);
      } catch (e: any) {
        console.log(`⚠️ Không thể đọc checkpoint: ${e.message}. Tạo mới.`);
      }
    }
  }

  saveCheckpoint(): void {
    try {
      fs.writeFileSync(this.checkpointPath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e: any) {
      console.log(`⚠️ Lỗi lưu checkpoint: ${e.message}`);
    }
  }

  clearCheckpoint(): void {
    if (fs.existsSync(this.checkpointPath)) {
      try {
        fs.unlinkSync(this.checkpointPath);
      } catch (e: any) {
        console.log(`⚠️ Lỗi xóa checkpoint: ${e.message}`);
      }
    }
  }

  async run(): Promise<boolean> {
    console.log(`\n=======================================================`);
    console.log(`🚀 KHỞI CHẠY MRP PIPELINE CHO: [${this.sourceSlug}]`);
    console.log(`=======================================================`);

    try {
      // Phase MAP
      if (this.state.current_phase === 'MAP') {
        const success = await this.runMap();
        if (!success) return false;
        this.state.current_phase = 'REDUCE';
        this.saveCheckpoint();
      }

      // Phase REDUCE
      if (this.state.current_phase === 'REDUCE') {
        const success = await this.runReduce();
        if (!success) return false;
        this.state.current_phase = 'PLAN';
        this.saveCheckpoint();
      }

      // Phase PLAN
      if (this.state.current_phase === 'PLAN') {
        const success = await this.runPlan();
        if (!success) return false;
        this.saveCheckpoint();
        // DỪNG LẠI tại đây, chờ duyệt
        console.log(`\n⏸️ PIPELINE ĐÃ DỪNG ĐỂ CHỜ DUYỆT.`);
        console.log(`👉 Vui lòng kiểm tra file kế hoạch tại:`);
        console.log(`   05_journal/mrp_plan_${this.timestamp}.md`);
        console.log(`👉 Hãy cập nhật trạng thái hoặc gõ lệnh để tiếp tục.`);
        return true;
      }

      // Phase REFINE
      if (this.state.current_phase === 'REFINE') {
        const success = await this.runRefine();
        if (!success) return false;
        this.state.current_phase = 'VERIFY';
        this.saveCheckpoint();
      }

      // Phase VERIFY
      if (this.state.current_phase === 'VERIFY') {
        if (this.skipVerify) {
          console.log('  ⏭️ Chế độ Batch chuyển tiếp: Tạm thời bỏ qua kiểm toán đồ thị để tránh báo động giả.');
          this.state.verified = true;
        } else {
          const success = await this.runVerify();
          if (!success) return false;
        }
        this.state.current_phase = 'COMMIT';
        this.saveCheckpoint();
      }

      // Phase COMMIT
      if (this.state.current_phase === 'COMMIT') {
        const success = await this.runCommit();
        if (!success) return false;
        this.clearCheckpoint();
        console.log(`\n🎉 HOÀN THÀNH MRP PIPELINE THÀNH CÔNG CHO [${this.sourceSlug}]!`);
        return true;
      }
    } catch (e: any) {
      console.log(`❌ Lỗi thực thi Pipeline: ${e.message}`);
      this.saveCheckpoint();
      throw e;
    }

    return false;
  }

  async runAutoToEnd(): Promise<boolean> {
    console.log(`⚡ Đang chạy tự động hoàn toàn (Auto-Approve Mode)...`);
    try {
      if (this.state.current_phase === 'MAP') {
        if (!(await this.runMap())) return false;
        this.state.current_phase = 'REDUCE';
        this.saveCheckpoint();
      }
      if (this.state.current_phase === 'REDUCE') {
        if (!(await this.runReduce())) return false;
        this.state.current_phase = 'PLAN';
        this.saveCheckpoint();
      }
      if (this.state.current_phase === 'PLAN') {
        if (!(await this.runPlan())) return false;
        // Tự động approve kế hoạch
        const planTimestamp = this.timestamp;
        const planFilepath = path.join(DIR_JOURNAL, `mrp_plan_${planTimestamp}.md`);
        if (fs.existsSync(planFilepath)) {
          let content = fs.readFileSync(planFilepath, 'utf-8');
          content = content.replace('Trạng thái: `pending`', 'Trạng thái: `approved`');
          fs.writeFileSync(planFilepath, content, 'utf-8');
        }
        this.state.current_phase = 'REFINE';
        this.saveCheckpoint();
      }
      if (this.state.current_phase === 'REFINE') {
        if (!(await this.runRefine())) return false;
        this.state.current_phase = 'VERIFY';
        this.saveCheckpoint();
      }
      if (this.state.current_phase === 'VERIFY') {
        if (this.skipVerify) {
          console.log('  ⏭️ Chế độ Batch chuyển tiếp: Tạm thời bỏ qua kiểm toán đồ thị để tránh báo động giả.');
          this.state.verified = true;
        } else {
          if (!(await this.runVerify())) return false;
        }
        this.state.current_phase = 'COMMIT';
        this.saveCheckpoint();
      }
      if (this.state.current_phase === 'COMMIT') {
        if (!(await this.runCommit())) return false;
        this.clearCheckpoint();
        return true;
      }
    } catch (e: any) {
      console.log(`❌ Lỗi thực thi tự động Pipeline: ${e.message}`);
      throw e;
    }
    return false;
  }

  async runMap(): Promise<boolean> {
    const mapper = new PhaseMapper(this);
    return mapper.execute();
  }

  async runReduce(): Promise<boolean> {
    const reducer = new PhaseReducer(this);
    return reducer.execute();
  }

  async runPlan(): Promise<boolean> {
    const planner = new PhasePlanner(this);
    return planner.execute();
  }

  async runRefine(): Promise<boolean> {
    const refiner = new PhaseRefiner(this);
    return refiner.execute();
  }

  async runVerify(): Promise<boolean> {
    const verifier = new PhaseVerifier(this);
    return verifier.execute();
  }

  async runCommit(): Promise<boolean> {
    const committer = new PhaseCommitter(this);
    return committer.execute();
  }
}

export class MRPBatchOrchestrator {
  directory: string;
  autoApprove: boolean;

  constructor(directory: string, autoApprove = false) {
    this.directory = directory;
    this.autoApprove = autoApprove;
  }

  scanAndSortFiles(): string[] {
    if (!fs.existsSync(this.directory)) {
      return [];
    }

    const filesToProcess: Array<{ mtime: number; filepath: string }> = [];
    const files = fs.readdirSync(this.directory);

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filepath = path.join(this.directory, file);
        try {
          const content = fs.readFileSync(filepath, 'utf-8');
          if (content.includes('status: to-process')) {
            const stat = fs.statSync(filepath);
            filesToProcess.push({ mtime: stat.mtimeMs, filepath });
          }
        } catch (e) {
          // Bỏ qua nếu có lỗi đọc file
        }
      }
    }

    // Sắp xếp theo mtime tăng dần (cũ nhất đứng trước)
    filesToProcess.sort((a, b) => a.mtime - b.mtime);
    return filesToProcess.map(x => x.filepath);
  }

  async run(): Promise<boolean> {
    const files = this.scanAndSortFiles();
    if (files.length === 0) {
      console.log('\n🎉 Không có tài liệu thô nào cần xử lý (status: to-process)!');
      return true;
    }

    console.log(`\n=======================================================`);
    console.log(`📦 BẮT ĐẦU CHẠY BATCH TUẦN TỰ CHO ${files.length} FILES`);
    console.log(`   (Sắp xếp theo thứ tự thời gian sửa đổi cũ -> mới)`);
    console.log(`=======================================================`);

    for (let i = 0; i < files.length; i++) {
      const filepath = files[i];
      const filename = path.basename(filepath);
      console.log(`\n[TIẾN TRÌNH ${i + 1}/${files.length}] ───────────────`);
      console.log(`👉 Đang xử lý: ${filename}`);

      // Đặt cờ skipVerify=true để tạm thời bỏ qua báo động giả khi chạy batch trung gian
      const orchestrator = new MRPOrchestrator(filepath, true);

      // Reset checkpoint cũ nếu chạy batch mới để đảm bảo tính tuần tự sạch
      if (!this.autoApprove && ['REFINE', 'VERIFY', 'COMMIT'].includes(orchestrator.state.current_phase)) {
        // Nếu không auto-approve và checkpoint đang ở nửa sau -> tiếp tục (user vừa approve thủ công)
      } else {
        // Nếu chạy từ đầu hoặc auto-approve -> reset checkpoint
        if (fs.existsSync(orchestrator.checkpointPath)) {
          fs.unlinkSync(orchestrator.checkpointPath);
        }
        orchestrator.state.current_phase = 'MAP';
        orchestrator.saveCheckpoint();
      }

      if (this.autoApprove) {
        // Chạy một mạch từ đầu đến cuối không dừng
        const success = await orchestrator.runAutoToEnd();
        if (!success) {
          console.log(`❌ Lỗi: Chạy tự động thất bại tại file: ${filename}`);
          return false;
        }
      } else {
        // Dừng ở PLAN, chờ duyệt thủ công
        const success = await orchestrator.run();
        if (!success) {
          return false;
        }

        // Sau khi xuất plan, chúng ta phải dừng Batch
        console.log(`\n⏸️ Hàng đợi Batch tạm dừng tại [${filename}].`);
        console.log(`👉 Vui lòng duyệt kế hoạch trước khi Batch tự động chuyển sang file tiếp theo.`);
        break;
      }
    }

    // 🔥 CHỈ CHẠY 1 LẦN KIỂM TOÁN TĨNH TOÀN DIỆN CUỐI CÙNG SAU KHI BATCH HOÀN TẤT
    if (this.autoApprove) {
      console.log(`\n=======================================================`);
      console.log('🕵️‍♂️  BATCH VERIFIER: Bắt đầu kiểm toán đồ thị tri thức tối hậu');
      console.log(`=======================================================`);
      try {
        const { brokenLinks, portabilityViolations } = auditLinks();
        const inconsistencies = auditTreeIntegrity();

        if (brokenLinks === 0 && portabilityViolations === 0 && inconsistencies === 0) {
          console.log('  ✅ Đồ thị tri thức đạt trạng thái an toàn tuyệt đối 100%!');
        } else {
          throw new Error('Đồ thị chứa liên kết hỏng hoặc không nhất quán.');
        }
      } catch (e: any) {
        console.log(`  ❌ Phát hiện lỗi kiểm toán cuối cùng: ${e.message}`);
        return false;
      }

      console.log(`\n🎉 HOÀN THÀNH TOÀN BỘ BÀN BATCH TỰ ĐỘNG THÀNH CÔNG!`);
    }
    return true;
  }
}
