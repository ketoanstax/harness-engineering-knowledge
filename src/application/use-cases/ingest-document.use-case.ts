import * as path from 'node:path';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { IMarkdownGenerator } from '../../domain/interfaces/markdown-generator.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import { PlanFile } from '../../domain/entities/plan.entity.ts';
import type { MapperPhase } from '../phases/mapper.phase.ts';
import type { ReducerPhase } from '../phases/reducer.phase.ts';
import type { PlannerPhase } from '../phases/planner.phase.ts';
import type { RefinerPhase } from '../phases/refiner.phase.ts';
import type { VerifierPhase } from '../phases/verifier.phase.ts';
import type { CommitterPhase } from '../phases/committer.phase.ts';
import type { PlanResult, MappedData, ReducedData } from '../phases/_types.ts';
import type { TokenTracker } from '../services/token-tracker.ts';
import type { PipelineDashboard } from '../../presentation/ui/pipeline-dashboard.ts';

interface PipelineState {
  source_slug: string;
  source_path: string;
  current_phase: string;
  timestamp: string;
  mapped_data: MappedData | null;
  reduced_data: ReducedData | null;
  plan_timestamp: string | null;
  plan_item_data: PlanResult | null;
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
  private mdGenerator: IMarkdownGenerator;
  private config: IConfigProvider;
  private tokenTracker: TokenTracker;
  private dashboard: PipelineDashboard;
  private currentPhaseName: string | null = null;

  constructor(
    mapper: MapperPhase,
    reducer: ReducerPhase,
    planner: PlannerPhase,
    refiner: RefinerPhase,
    verifier: VerifierPhase,
    committer: CommitterPhase,
    fs: IFileSystem,
    mdGenerator: IMarkdownGenerator,
    config: IConfigProvider,
    tokenTracker: TokenTracker,
    dashboard: PipelineDashboard,
  ) {
    this.mapper = mapper;
    this.reducer = reducer;
    this.planner = planner;
    this.refiner = refiner;
    this.verifier = verifier;
    this.committer = committer;
    this.fs = fs;
    this.mdGenerator = mdGenerator;
    this.config = config;
    this.tokenTracker = tokenTracker;
    this.dashboard = dashboard;
  }

  async execute(
    sourcePath: string,
    onPlanGenerated?: (destPlanPath: string, timestamp: string) => Promise<'approve' | 'reject' | 'exit'>,
  ): Promise<boolean> {
    const state = this.initState(sourcePath);

    // Thiết lập biến môi trường để mock provider phân biệt source slug
    process.env.CURRENT_MRP_SOURCE_SLUG = state.source_slug;

    this.dashboard.setSourceSlug(state.source_slug);
    this.dashboard.render();

    try {
      // Phase MAP
      if (state.current_phase === 'MAP') {
        this.dashboard.startPhase('MAP');
        this.currentPhaseName = 'MAP';
        const mappedData = await this.mapper.execute(sourcePath, (usage) => {
          this.tokenTracker.add({ phase: 'MAP', operation: 'chắt lọc tài liệu', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens });
        });
        if (!mappedData) { this.dashboard.completePhase('MAP', false); return false; }
        state.mapped_data = mappedData;
        state.current_phase = 'REDUCE';
        this.saveCheckpoint(state);
        this.dashboard.completePhase('MAP', true);
        this.currentPhaseName = null;
      } else {
        this.dashboard.skipPhase('MAP');
      }

      // Phase REDUCE
      if (state.current_phase === 'REDUCE') {
        this.dashboard.startPhase('REDUCE');
        this.currentPhaseName = 'REDUCE';
        if (!state.mapped_data) { this.dashboard.completePhase('REDUCE', false); return false; }
        const reducedData = await this.reducer.execute(state.mapped_data, (usage) => {
          this.tokenTracker.add({ phase: 'REDUCE', operation: 'phân tích trùng lặp', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens });
        });
        state.reduced_data = reducedData;
        state.current_phase = 'PLAN';
        this.saveCheckpoint(state);
        this.dashboard.completePhase('REDUCE', true);
        this.currentPhaseName = null;
      } else {
        this.dashboard.skipPhase('REDUCE');
      }

      // Phase PLAN
      if (state.current_phase === 'PLAN') {
        this.dashboard.startPhase('PLAN');
        this.currentPhaseName = 'PLAN';
        if (!state.reduced_data || !state.mapped_data) { this.dashboard.completePhase('PLAN', false); return false; }
        const planResult = await this.planner.execute(state.reduced_data, state.mapped_data, (usage) => {
          this.tokenTracker.add({ phase: 'PLAN', operation: 'thiết kế nốt', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens });
        });
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
        const destPlanPath = path.join(this.config.dirJournal, planFile.filename);
        this.fs.writeFile(destPlanPath, this.mdGenerator.generatePlan(planFile));

        this.saveCheckpoint(state);
        this.dashboard.completePhase('PLAN', true);
        this.currentPhaseName = null;

        if (onPlanGenerated) {
          const action = await onPlanGenerated(destPlanPath, state.timestamp);
          if (action === 'approve') {
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
            return true;
          }
        } else {
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
      } else {
        this.dashboard.skipPhase('PLAN');
      }

      // Phase REFINE
      if (state.current_phase === 'REFINE') {
        this.dashboard.startPhase('REFINE');
        this.currentPhaseName = 'REFINE';
        const planData = state.plan_item_data as PlanResult;
        if (!planData) { this.dashboard.completePhase('REFINE', false); return false; }
        this.refiner.execute(planData, state.source_slug);
        state.current_phase = 'VERIFY';
        this.saveCheckpoint(state);
        this.dashboard.completePhase('REFINE', true);
        this.currentPhaseName = null;
      } else {
        this.dashboard.skipPhase('REFINE');
      }

      // Phase VERIFY
      if (state.current_phase === 'VERIFY') {
        this.dashboard.startPhase('VERIFY');
        this.currentPhaseName = 'VERIFY';
        const result = this.verifier.execute();
        if (result.brokenLinks > 0 || result.portabilityViolations > 0 || result.inconsistencies > 0) {
          console.log(`  ❌ Phát hiện lỗi kiểm toán: brokenLinks=${result.brokenLinks}, portabilityViolations=${result.portabilityViolations}, inconsistencies=${result.inconsistencies}`);
          this.dashboard.completePhase('VERIFY', false);
          return false;
        }
        state.current_phase = 'COMMIT';
        this.saveCheckpoint(state);
        this.dashboard.completePhase('VERIFY', true);
        this.currentPhaseName = null;
      } else {
        this.dashboard.skipPhase('VERIFY');
      }

      // Phase COMMIT
      if (state.current_phase === 'COMMIT') {
        this.dashboard.startPhase('COMMIT');
        this.currentPhaseName = 'COMMIT';
        const planResult = state.plan_item_data as PlanResult;
        if (!planResult) { this.dashboard.completePhase('COMMIT', false); return false; }
        this.committer.execute(planResult, sourcePath, state.timestamp);
        this.clearCheckpoint(state);
        this.dashboard.completePhase('COMMIT', true);
        this.currentPhaseName = null;
        this.dashboard.finalize();
        console.log(`\n🎉 HOÀN THÀNH MRP PIPELINE THÀNH CÔNG CHO [${state.source_slug}]!`);
        return true;
      } else {
        this.dashboard.skipPhase('COMMIT');
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      if (this.currentPhaseName) {
        this.dashboard.failPhase(this.currentPhaseName, err);
      }
      console.log(`❌ Lỗi thực thi Pipeline: ${err}`);
      this.saveCheckpoint(state);
      throw e;
    }

    return false;
  }

  async runAutoToEnd(sourcePath: string, skipVerify = false): Promise<boolean> {
    const state = this.initState(sourcePath);
    this.dashboard.setSourceSlug(state.source_slug);
    process.env.CURRENT_MRP_SOURCE_SLUG = state.source_slug;

    this.dashboard.render();

    try {
      // Phase MAP
      if (state.current_phase === 'MAP') {
        this.dashboard.startPhase('MAP');
        this.currentPhaseName = 'MAP';
        const mappedData = await this.mapper.execute(sourcePath, (usage) => {
          this.tokenTracker.add({ phase: 'MAP', operation: 'chắt lọc tài liệu', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens });
        });
        if (!mappedData) { this.dashboard.completePhase('MAP', false); return false; }
        state.mapped_data = mappedData;
        state.current_phase = 'REDUCE';
        this.saveCheckpoint(state);
        this.dashboard.completePhase('MAP', true);
        this.currentPhaseName = null;
      } else {
        this.dashboard.skipPhase('MAP');
      }

      // Phase REDUCE
      if (state.current_phase === 'REDUCE') {
        this.dashboard.startPhase('REDUCE');
        this.currentPhaseName = 'REDUCE';
        if (!state.mapped_data) { this.dashboard.completePhase('REDUCE', false); return false; }
        state.reduced_data = await this.reducer.execute(state.mapped_data, (usage) => {
          this.tokenTracker.add({ phase: 'REDUCE', operation: 'phân tích trùng lặp', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens });
        });
        state.current_phase = 'PLAN';
        this.saveCheckpoint(state);
        this.dashboard.completePhase('REDUCE', true);
        this.currentPhaseName = null;
      } else {
        this.dashboard.skipPhase('REDUCE');
      }

      // Phase PLAN
      if (state.current_phase === 'PLAN') {
        this.dashboard.startPhase('PLAN');
        this.currentPhaseName = 'PLAN';
        if (!state.reduced_data || !state.mapped_data) { this.dashboard.completePhase('PLAN', false); return false; }
        const planResult = await this.planner.execute(state.reduced_data, state.mapped_data, (usage) => {
          this.tokenTracker.add({ phase: 'PLAN', operation: 'thiết kế nốt', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens });
        });
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
        const destPlanPath = path.join(this.config.dirJournal, planFile.filename);
        this.fs.writeFile(destPlanPath, this.mdGenerator.generatePlan(planFile));

        // Tự động approve
        let pContent = this.fs.readFile(destPlanPath);
        pContent = pContent.replace('Trạng thái: `pending`', 'Trạng thái: `approved`');
        this.fs.writeFile(destPlanPath, pContent);

        state.current_phase = 'REFINE';
        this.saveCheckpoint(state);
        this.dashboard.completePhase('PLAN', true);
        this.currentPhaseName = null;
      } else {
        this.dashboard.skipPhase('PLAN');
      }

      // Phase REFINE
      if (state.current_phase === 'REFINE') {
        this.dashboard.startPhase('REFINE');
        this.currentPhaseName = 'REFINE';
        if (!state.plan_item_data) { this.dashboard.completePhase('REFINE', false); return false; }
        this.refiner.execute(state.plan_item_data as PlanResult, state.source_slug);
        state.current_phase = 'VERIFY';
        this.saveCheckpoint(state);
        this.dashboard.completePhase('REFINE', true);
        this.currentPhaseName = null;
      } else {
        this.dashboard.skipPhase('REFINE');
      }

      // Phase VERIFY
      if (state.current_phase === 'VERIFY') {
        this.dashboard.startPhase('VERIFY');
        this.currentPhaseName = 'VERIFY';
        if (skipVerify) {
          console.log('  ⏭️ Chế độ Batch chuyển tiếp: Tạm thời bỏ qua kiểm toán đồ thị để tránh báo động giả.');
          this.dashboard.skipPhase('VERIFY');
        } else {
          const result = this.verifier.execute();
          if (result.brokenLinks > 0 || result.portabilityViolations > 0 || result.inconsistencies > 0) {
            console.log(`  ❌ Phát hiện lỗi kiểm toán cuối cùng.`);
            this.dashboard.completePhase('VERIFY', false);
            return false;
          }
          this.dashboard.completePhase('VERIFY', true);
        }
        state.current_phase = 'COMMIT';
        this.saveCheckpoint(state);
        this.currentPhaseName = null;
      } else {
        this.dashboard.skipPhase('VERIFY');
      }

      // Phase COMMIT
      if (state.current_phase === 'COMMIT') {
        this.dashboard.startPhase('COMMIT');
        this.currentPhaseName = 'COMMIT';
        if (!state.plan_item_data) { this.dashboard.completePhase('COMMIT', false); return false; }
        this.committer.execute(state.plan_item_data as PlanResult, sourcePath, state.timestamp);
        this.clearCheckpoint(state);
        this.dashboard.completePhase('COMMIT', true);
        this.currentPhaseName = null;
        this.dashboard.finalize();
        console.log(`\n🎉 HOÀN THÀNH MRP PIPELINE THÀNH CÔNG CHO [${state.source_slug}]!`);
        return true;
      } else {
        this.dashboard.skipPhase('COMMIT');
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      if (this.currentPhaseName) {
        this.dashboard.failPhase(this.currentPhaseName, err);
      }
      console.log(`❌ Lỗi thực thi tự động: ${err}`);
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

  private getCheckpointPath(state: PipelineState): string {
    return path.join(this.config.dirJournal, `mrp_checkpoint_${state.source_slug}.json`);
  }

  private loadCheckpoint(state: PipelineState): PipelineState {
    const cpPath = this.getCheckpointPath(state);
    if (this.fs.fileExists(cpPath)) {
      try {
        const saved = JSON.parse(this.fs.readFile(cpPath));
        console.log(`🔄 Khôi phục checkpoint! Pha hiện tại: ${saved.current_phase}`);
        return { ...state, ...saved };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log(`⚠️ Không thể đọc checkpoint: ${msg}. Tạo mới.`);
      }
    }
    return state;
  }

  private saveCheckpoint(state: PipelineState): void {
    const cpPath = this.getCheckpointPath(state);
    try {
      this.fs.writeFile(cpPath, JSON.stringify(state, null, 2));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`⚠️ Lỗi lưu checkpoint: ${msg}`);
    }
  }

  private clearCheckpoint(state: PipelineState): void {
    const cpPath = this.getCheckpointPath(state);
    if (this.fs.fileExists(cpPath)) {
      try {
        this.fs.unlink(cpPath);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log(`⚠️ Lỗi xóa checkpoint: ${msg}`);
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
