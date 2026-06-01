import * as path from 'node:path';
import * as fs from 'node:fs';
import type { ILLMProvider } from '../../domain/interfaces/llm-provider.interface.ts';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IMarkdownGenerator } from '../../domain/interfaces/markdown-generator.interface.ts';
import { DIR_JOURNAL, DIR_RAW } from '../../core/config.ts';
import { PlanFile } from '../../domain/entities/plan.entity.ts';
import { MapperPhase } from '../phases/mapper.phase.ts';
import { ReducerPhase } from '../phases/reducer.phase.ts';
import { PlannerPhase } from '../phases/planner.phase.ts';
import { RefinerPhase } from '../phases/refiner.phase.ts';
import { VerifierPhase } from '../phases/verifier.phase.ts';
import { CommitterPhase } from '../phases/committer.phase.ts';
import type { PlanResult } from '../phases/_types.ts';

interface PipelineState {
  source_slug: string;
  source_path: string;
  current_phase: string;
  timestamp: string;
  mapped_data: any;
  reduced_data: any;
  plan_timestamp: string | null;
  plan_item_data: any;
  refined: boolean;
  verified: boolean;
  committed: boolean;
}

export class IngestDocumentUseCase {
  private mapper: MapperPhase;
  private reducer: ReducerPhase;
  private planner: PlannerPhase;
  private refiner: RefinerPhase;
  private verifier: VerifierPhase;
  private committer: CommitterPhase;
  private fs: IFileSystem;
  private llm: ILLMProvider;
  private mdGenerator: IMarkdownGenerator;

  constructor(fs: IFileSystem, llm: ILLMProvider, mdGenerator: IMarkdownGenerator) {
    this.fs = fs;
    this.llm = llm;
    this.mdGenerator = mdGenerator;
    this.mapper = new MapperPhase(llm, fs, mdGenerator);
    this.reducer = new ReducerPhase(llm);
    this.planner = new PlannerPhase(llm);
    this.refiner = new RefinerPhase(fs, mdGenerator);
    this.verifier = new VerifierPhase(fs);
    this.committer = new CommitterPhase(fs, mdGenerator);
  }

  async execute(
    sourcePath: string,
    onPlanGenerated?: (destPlanPath: string, timestamp: string) => Promise<'approve' | 'reject' | 'exit'>,
  ): Promise<boolean> {
    const state = this.initState(sourcePath);

    // Thiết lập biến môi trường để mock provider phân biệt source slug
    process.env.CURRENT_MRP_SOURCE_SLUG = state.source_slug;

    console.log(`\n=======================================================`);
    console.log(`🚀 KHỞI CHẠY MRP PIPELINE CHO: [${state.source_slug}]`);
    console.log(`=======================================================`);

    try {
      // Phase MAP
      if (state.current_phase === 'MAP') {
        const mappedData = await this.mapper.execute(sourcePath);
        if (!mappedData) return false;
        state.mapped_data = mappedData;
        state.current_phase = 'REDUCE';
        this.saveCheckpoint(state);
      }

      // Phase REDUCE
      if (state.current_phase === 'REDUCE') {
        const reducedData = await this.reducer.execute(state.mapped_data);
        state.reduced_data = reducedData;
        state.current_phase = 'PLAN';
        this.saveCheckpoint(state);
      }

      // Phase PLAN
      if (state.current_phase === 'PLAN') {
        const planResult = await this.planner.execute(state.reduced_data, state.mapped_data);
        state.plan_item_data = planResult;
        state.plan_timestamp = state.timestamp;

        // Ghi plan file
        const planFile = new PlanFile(
          [{
            source_slug: state.source_slug,
            new_nodes: planResult.new_nodes,
            merge_nodes: planResult.merge_nodes,
            depends_on: [],
            reasoning: planResult.reasoning,
          }],
          state.timestamp,
        );
        const destPlanPath = path.join(DIR_JOURNAL, planFile.filename);
        this.fs.writeFile(destPlanPath, this.mdGenerator.generatePlan(planFile));

        this.saveCheckpoint(state);

        // NẾU CÓ CALLBACK THÌ HỎI USER TRỰC TIẾP
        if (onPlanGenerated) {
          const action = await onPlanGenerated(destPlanPath, state.timestamp);
          if (action === 'approve') {
            // Tự động gán approved và chạy tiếp
            let pContent = this.fs.readFile(destPlanPath);
            pContent = pContent.replace('Trạng thái: \`pending\`', 'Trạng thái: \`approved\`');
            this.fs.writeFile(destPlanPath, pContent);
            state.current_phase = 'REFINE';
            this.saveCheckpoint(state);
          } else if (action === 'reject') {
            let pContent = this.fs.readFile(destPlanPath);
            pContent = pContent.replace('Trạng thái: \`pending\`', 'Trạng thái: \`rejected\`');
            this.fs.writeFile(destPlanPath, pContent);
            this.clearCheckpoint(state);
            return false;
          } else {
            // exit -> thoát ra ngoài shell
            return true;
          }
        } else {
          // DỪNG CHỜ DUYỆT (CLI/non-interactive)
          console.log(`
═══════════════════════════════════════════════════════════════════════
⏸️  PIPELINE ĐÃ HOÀN TẤT PHA PLAN - CHỜ DUYỆT
═══════════════════════════════════════════════════════════════════════
📄 File kế hoạch:  ${destPlanPath}
📂 Tài liệu nguồn: ${state.source_slug}

Vui lòng chọn hành động tiếp theo:

  [A] ✅ Duyệt & chạy tiếp
      → pnpm start approve -t ${state.timestamp}

  [R] ❌ Từ chối & dọn dẹp
      → pnpm start reject -t ${state.timestamp}

  [V] 📖 Xem hướng dẫn vận hành
      → pnpm start guide

  [Q] 🚪 Thoát
`);
          return true;
        }
      }

      // Phase REFINE
      if (state.current_phase === 'REFINE') {
        const planData = state.plan_item_data as PlanResult;
        if (!planData) {
          console.log('❌ Lỗi: Không tìm thấy dữ liệu Planning.');
          return false;
        }
        this.refiner.execute(planData, state.source_slug);
        state.current_phase = 'VERIFY';
        this.saveCheckpoint(state);
      }

      // Phase VERIFY
      if (state.current_phase === 'VERIFY') {
        const result = this.verifier.execute();
        if (result.brokenLinks > 0 || result.portabilityViolations > 0 || result.inconsistencies > 0) {
          console.log(`  ❌ Phát hiện lỗi kiểm toán: brokenLinks=${result.brokenLinks}, portabilityViolations=${result.portabilityViolations}, inconsistencies=${result.inconsistencies}`);
          return false;
        }
        console.log('  ✅ Kiểm toán hoàn tất. Không phát hiện lỗi nghiêm trọng.');
        state.current_phase = 'COMMIT';
        this.saveCheckpoint(state);
      }

      // Phase COMMIT
      if (state.current_phase === 'COMMIT') {
        const planResult = state.plan_item_data as PlanResult;
        this.committer.execute(planResult, sourcePath, state.timestamp);
        this.clearCheckpoint(state);
        console.log(`\n🎉 HOÀN THÀNH MRP PIPELINE THÀNH CÔNG CHO [${state.source_slug}]!`);
        return true;
      }
    } catch (e: any) {
      console.log(`❌ Lỗi thực thi Pipeline: ${e.message}`);
      this.saveCheckpoint(state);
      throw e;
    }

    return false;
  }

  async runAutoToEnd(sourcePath: string, skipVerify = false): Promise<boolean> {
    const state = this.initState(sourcePath);
    process.env.CURRENT_MRP_SOURCE_SLUG = state.source_slug;
    console.log(`⚡ Đang chạy tự động hoàn toàn (Auto-Approve Mode)...`);

    try {
      if (state.current_phase === 'MAP') {
        const mappedData = await this.mapper.execute(sourcePath);
        if (!mappedData) return false;
        state.mapped_data = mappedData;
        state.current_phase = 'REDUCE';
        this.saveCheckpoint(state);
      }

      if (state.current_phase === 'REDUCE') {
        state.reduced_data = await this.reducer.execute(state.mapped_data);
        state.current_phase = 'PLAN';
        this.saveCheckpoint(state);
      }

      if (state.current_phase === 'PLAN') {
        const planResult = await this.planner.execute(state.reduced_data, state.mapped_data);
        state.plan_item_data = planResult;
        state.plan_timestamp = state.timestamp;

        const planFile = new PlanFile(
          [{
            source_slug: state.source_slug,
            new_nodes: planResult.new_nodes,
            merge_nodes: planResult.merge_nodes,
            depends_on: [],
            reasoning: planResult.reasoning,
          }],
          state.timestamp,
        );
        const destPlanPath = path.join(DIR_JOURNAL, planFile.filename);
        this.fs.writeFile(destPlanPath, this.mdGenerator.generatePlan(planFile));

        // Tự động approve
        let pContent = this.fs.readFile(destPlanPath);
        pContent = pContent.replace('Trạng thái: `pending`', 'Trạng thái: `approved`');
        this.fs.writeFile(destPlanPath, pContent);

        state.current_phase = 'REFINE';
        this.saveCheckpoint(state);
      }

      if (state.current_phase === 'REFINE') {
        this.refiner.execute(state.plan_item_data as PlanResult, state.source_slug);
        state.current_phase = 'VERIFY';
        this.saveCheckpoint(state);
      }

      if (state.current_phase === 'VERIFY') {
        if (skipVerify) {
          console.log('  ⏭️ Chế độ Batch chuyển tiếp: Tạm thời bỏ qua kiểm toán đồ thị để tránh báo động giả.');
        } else {
          const result = this.verifier.execute();
          if (result.brokenLinks > 0 || result.portabilityViolations > 0 || result.inconsistencies > 0) {
            console.log(`  ❌ Phát hiện lỗi kiểm toán cuối cùng.`);
            return false;
          }
        }
        state.current_phase = 'COMMIT';
        this.saveCheckpoint(state);
      }

      if (state.current_phase === 'COMMIT') {
        this.committer.execute(state.plan_item_data as PlanResult, sourcePath, state.timestamp);
        this.clearCheckpoint(state);
        console.log(`\n🎉 HOÀN THÀNH MRP PIPELINE THÀNH CÔNG CHO [${state.source_slug}]!`);
        return true;
      }
    } catch (e: any) {
      console.log(`❌ Lỗi thực thi tự động: ${e.message}`);
      throw e;
    }
    return false;
  }

  // ============ State Machine Helpers ============

  private initState(sourcePath: string): PipelineState {
    const sourceSlug = path.basename(sourcePath).replace('.md', '');
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const state: PipelineState = {
      source_slug: sourceSlug,
      source_path: sourcePath,
      current_phase: 'MAP',
      timestamp,
      mapped_data: null,
      reduced_data: null,
      plan_timestamp: null,
      plan_item_data: null,
      refined: false,
      verified: false,
      committed: false,
    };

    return this.loadCheckpoint(state);
  }

  private get checkpointPath(): string {
    return '';
  }

  private getCheckpointPath(state: PipelineState): string {
    return path.join(DIR_JOURNAL, `mrp_checkpoint_${state.source_slug}.json`);
  }

  private loadCheckpoint(state: PipelineState): PipelineState {
    const cpPath = this.getCheckpointPath(state);
    if (this.fs.fileExists(cpPath)) {
      try {
        const saved = JSON.parse(this.fs.readFile(cpPath));
        console.log(`🔄 Khôi phục checkpoint! Pha hiện tại: ${saved.current_phase}`);
        return { ...state, ...saved };
      } catch (e: any) {
        console.log(`⚠️ Không thể đọc checkpoint: ${e.message}. Tạo mới.`);
      }
    }
    return state;
  }

  private saveCheckpoint(state: PipelineState): void {
    const cpPath = this.getCheckpointPath(state);
    try {
      this.fs.writeFile(cpPath, JSON.stringify(state, null, 2));
    } catch (e: any) {
      console.log(`⚠️ Lỗi lưu checkpoint: ${e.message}`);
    }
  }

  private clearCheckpoint(state: PipelineState): void {
    const cpPath = this.getCheckpointPath(state);
    if (this.fs.fileExists(cpPath)) {
      try {
        this.fs.unlink(cpPath);
      } catch (e: any) {
        console.log(`⚠️ Lỗi xóa checkpoint: ${e.message}`);
      }
    }
  }

  // ============ Batch ============

  async runBatch(directory: string, autoApprove: boolean): Promise<boolean> {
    const files = this.scanAndSortFiles(directory);
    if (files.length === 0) {
      console.log('\n🎉 Không có tài liệu thô nào cần xử lý (status: to-process)!');
      return true;
    }

    console.log(`\n=======================================================`);
    console.log(`📦 BẮT ĐẦU CHẠY BATCH TUẦN TỰ CHO ${files.length} FILES`);
    console.log(`=======================================================`);

    for (let i = 0; i < files.length; i++) {
      const filepath = files[i];
      const filename = path.basename(filepath);
      console.log(`\n[TIẾN TRÌNH ${i + 1}/${files.length}] ───────────────`);
      console.log(`👉 Đang xử lý: ${filename}`);

      if (autoApprove) {
        const success = await this.runAutoToEnd(filepath, true);
        if (!success) {
          console.log(`❌ Lỗi: Chạy tự động thất bại tại file: ${filename}`);
          return false;
        }
      } else {
        const success = await this.execute(filepath);
        if (!success) return false;

        console.log(`\n⏸️ Hàng đợi Batch tạm dừng tại [${filename}].`);
        console.log(`👉 Vui lòng duyệt kế hoạch trước khi Batch tự động chuyển sang file tiếp theo.`);
        break;
      }
    }

    return true;
  }

  private scanAndSortFiles(directory: string): string[] {
    if (!this.fs.fileExists(directory)) return [];

    const filesToProcess: Array<{ mtime: number; filepath: string }> = [];
    const files = this.fs.readdir(directory);

    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const filepath = path.join(directory, file);
      try {
        const content = this.fs.readFile(filepath);
        if (content.includes('status: to-process')) {
          const stat = this.fs.stat(filepath);
          filesToProcess.push({ mtime: stat.mtimeMs, filepath });
        }
      } catch {
        // Bỏ qua file lỗi
      }
    }

    filesToProcess.sort((a, b) => a.mtime - b.mtime);
    return filesToProcess.map(x => x.filepath);
  }
}
