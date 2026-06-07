import * as path from 'node:path';
import type { IFileSystem } from '../../domain/interfaces/file-system.interface.ts';
import type { ILLMProvider, LLMUsage } from '../../domain/interfaces/llm-provider.interface.ts';
import type { IMarkdownGenerator } from '../../domain/interfaces/markdown-generator.interface.ts';
import type { IConfigProvider } from '../../domain/interfaces/config-provider.interface.ts';
import type { IPipelineObserver } from '../../domain/interfaces/pipeline-observer.interface.ts';
import type { INodeRepository } from '../../domain/interfaces/node-repository.interface.ts';
import type { ILogger } from '../../domain/interfaces/logger.interface.ts';
import { PlanFile } from '../../domain/entities/plan.entity.ts';
import type { MapperPhase } from '../phases/mapper.phase.ts';
import type { ReducerPhase } from '../phases/reducer.phase.ts';
import type { PlannerPhase } from '../phases/planner.phase.ts';
import type { RefinerPhase } from '../phases/refiner.phase.ts';
import type { VerifierPhase } from '../phases/verifier.phase.ts';
import type { CommitterPhase } from '../phases/committer.phase.ts';
import type { PlanResult, MappedData, ReducedData } from '../phases/_types.ts';
import type { TokenTracker } from '../services/token-tracker.ts';
import { filterRelevantNodes, tokenize } from '../../core/context-filter.ts';
import type { LearningService } from '../services/learning.service.ts';
import type { DraftNode } from '../../domain/entities/learning.entity.ts';

type PhaseResult = 'continue' | 'fail' | 'wait';

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

interface RunStateMachineOpts {
  sourcePath: string;
  autoApprove: boolean;
  skipVerify?: boolean;
  onPlanGenerated?: (destPlanPath: string, timestamp: string) => Promise<'approve' | 'reject' | 'exit'>;
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
  private observer: IPipelineObserver;
  private nodeRepo: INodeRepository;
  private currentPhaseName: string | null = null;
  private llm: ILLMProvider;
  private logger: ILogger;
  private learningService: LearningService;

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
    observer: IPipelineObserver,
    llm: ILLMProvider,
    nodeRepo: INodeRepository,
    logger: ILogger,
    learningService: LearningService,
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
    this.observer = observer;
    this.llm = llm;
    this.nodeRepo = nodeRepo;
    this.logger = logger;
    this.learningService = learningService;
  }

  // ============ Public API ============

  async execute(
    sourcePath: string,
    onPlanGenerated?: (destPlanPath: string, timestamp: string) => Promise<'approve' | 'reject' | 'exit'>,
  ): Promise<boolean> {
    return this.runStateMachine({ sourcePath, autoApprove: false, onPlanGenerated });
  }

  async runAutoToEnd(sourcePath: string, skipVerify = false): Promise<boolean> {
    return this.runStateMachine({ sourcePath, autoApprove: true, skipVerify });
  }

  async query(question: string): Promise<{ answer: string; tokensUsed?: number; draft?: DraftNode; status?: 'success' | 'learning' }> {
    try {
      const cleanWords = Array.from(tokenize(question));
      const keywords = cleanWords.map(w => ({ name: w, definition: '' }));

      // Lấy nodes từ Repository thay vì context-filter tự đọc FS
      const allNodes = this.nodeRepo.findAll();
      const maxResults = process.env.MAX_QUERY_RESULTS ? parseInt(process.env.MAX_QUERY_RESULTS, 10) : 8;
      const relevantNodes = filterRelevantNodes(keywords, allNodes, maxResults);

      if (relevantNodes.length === 0) {
        this.logger.info(`🔍 Không tìm thấy nốt liên quan cho câu hỏi "${question}". Đang kích hoạt luồng LEARN...`);
        const draft = await this.learningService.generateDraft(question, []);
        return {
          answer: `Rất tiếc, tôi chưa tìm thấy khái niệm nào liên quan trong kho tri thức hiện tại.\nĐã khởi tạo nốt nháp cho khái niệm mới: **${draft.title}**.`,
          status: 'learning',
          draft,
        };
      }

      const contextBlocks = relevantNodes.map((node, i) => {
        return `[${i + 1}] NỐT: ${node.title} (slug: ${node.slug})\nĐịnh nghĩa: ${node.definition}\nLiên kết cha: ${node.parent || 'không có'}\nLiên kết con: ${node.children.join(', ') || 'không có'}`;
      }).join('\n\n');

      const prompt = `Bạn là một người bạn đồng hành tri thức, thông thái và gần gũi.
Nhiệm vụ của bạn: trả lời câu hỏi của người dùng dựa trên các ghi chép tri thức dưới đây.

Câu hỏi: "${question}"

Dưới đây là các tài liệu liên quan tôi tìm được cho bạn:
${contextBlocks}

Hãy trả lời bằng tiếng Việt theo cách sau:
1. Trả lời tự nhiên, ấm áp, súc tích — như đang nói chuyện với một người bạn (khoảng 3–5 câu).
2. Chỉ dựa vào dữ liệu trên. Nếu chưa đủ thông tin, hãy thành thật nói là tôi chưa có đủ dữ liệu và gợi ý người dùng bổ sung thêm.
3. Nếu cần tham khảo thêm bài kinh hoặc nguồn gốc, hãy chỉ rõ: "Xem chi tiết tại structured doc: [structured-slug-processed](01_structured_docs/structured-slug-processed.md)".
`;

      const response = await this.llm.generate(prompt, 'Bạn là người bạn đồng hành tri thức ấm áp, tinh tế và sâu sắc.', false);

      return {
        answer: response.content,
        tokensUsed: response.usage?.totalTokens,
        status: 'success',
      };
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      return { answer: `❌ Lỗi khi truy vấn kho tri thức: ${err}` };
    }
  }

  // ============ State Machine ============

  private async runStateMachine(opts: RunStateMachineOpts): Promise<boolean> {
    const state = this.initState(opts.sourcePath);
    process.env.CURRENT_MRP_SOURCE_SLUG = state.source_slug;
    this.observer.onStart(state.source_slug);

    const handlers: Record<string, (s: PipelineState, o: RunStateMachineOpts) => Promise<PhaseResult>> = {
      MAP: this.runMap.bind(this),
      REDUCE: this.runReduce.bind(this),
      PLAN: this.runPlan.bind(this),
      REFINE: this.runRefine.bind(this),
      VERIFY: this.runVerify.bind(this),
      COMMIT: this.runCommit.bind(this),
    };

    try {
      while (state.current_phase && handlers[state.current_phase]) {
        const handler = handlers[state.current_phase];
        const result = await handler(state, opts);
        if (result === 'fail') return false;
        if (result === 'wait') return true;
      }

      this.observer.onFinalize();
      this.logger.success(`\n🎉 HOÀN THÀNH MRP PIPELINE THÀNH CÔNG CHO [${state.source_slug}]!`);
      return true;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      if (this.currentPhaseName) {
        this.observer.onPhaseFail(this.currentPhaseName, err);
      }
      this.logger.error(`❌ Lỗi thực thi Pipeline: ${err}`);
      this.saveCheckpoint(state);
      throw e;
    }
  }

  // ============ Phase Handlers ============

  private async runMap(state: PipelineState, opts: RunStateMachineOpts): Promise<PhaseResult> {
    this.observer.onPhaseStart('MAP');
    this.currentPhaseName = 'MAP';
    const mappedData = await this.mapper.execute(opts.sourcePath, (usage) => {
      this.observer.onTokenUsage('MAP', usage);
      this.tokenTracker.add({ phase: 'MAP', operation: 'chắt lọc tài liệu', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens });
    });
    if (!mappedData) { this.observer.onPhaseComplete('MAP', false); return 'fail'; }
    state.mapped_data = mappedData;
    state.current_phase = 'REDUCE';
    this.saveCheckpoint(state);
    this.observer.onPhaseComplete('MAP', true);
    this.currentPhaseName = null;
    return 'continue';
  }

  private async runReduce(state: PipelineState, _opts: RunStateMachineOpts): Promise<PhaseResult> {
    this.observer.onPhaseStart('REDUCE');
    this.currentPhaseName = 'REDUCE';
    if (!state.mapped_data) { this.observer.onPhaseComplete('REDUCE', false); return 'fail'; }
    const reducedData = await this.reducer.execute(state.mapped_data, (usage) => {
      this.observer.onTokenUsage('REDUCE', usage);
      this.tokenTracker.add({ phase: 'REDUCE', operation: 'phân tích trùng lặp', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, totalTokens: usage.totalTokens });
    });
    state.reduced_data = reducedData;
    state.current_phase = 'PLAN';
    this.saveCheckpoint(state);
    this.observer.onPhaseComplete('REDUCE', true);
    this.currentPhaseName = null;
    return 'continue';
  }

  private async runPlan(state: PipelineState, opts: RunStateMachineOpts): Promise<PhaseResult> {
    this.observer.onPhaseStart('PLAN');
    this.currentPhaseName = 'PLAN';
    if (!state.reduced_data || !state.mapped_data) { this.observer.onPhaseComplete('PLAN', false); return 'fail'; }
    const planResult = await this.planner.execute(state.reduced_data, state.mapped_data, (usage) => {
      this.observer.onTokenUsage('PLAN', usage);
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
    this.observer.onPhaseComplete('PLAN', true);
    this.currentPhaseName = null;

    // Quyết định approve hay user duyệt
    if (opts.autoApprove) {
      let pContent = this.fs.readFile(destPlanPath);
      pContent = pContent.replace('Trạng thái: `pending`', 'Trạng thái: `approved`');
      this.fs.writeFile(destPlanPath, pContent);
      state.current_phase = 'REFINE';
      this.saveCheckpoint(state);
      return 'continue';
    } else if (opts.onPlanGenerated) {
      const action = await opts.onPlanGenerated(destPlanPath, state.timestamp);
      if (action === 'approve') {
        let pContent = this.fs.readFile(destPlanPath);
        pContent = pContent.replace('Trạng thái: \`pending\`', 'Trạng thái: \`approved\`');
        this.fs.writeFile(destPlanPath, pContent);
        state.current_phase = 'REFINE';
        this.saveCheckpoint(state);
        return 'continue';
      } else if (action === 'reject') {
        let pContent = this.fs.readFile(destPlanPath);
        pContent = pContent.replace('Trạng thái: \`pending\`', 'Trạng thái: \`rejected\`');
        this.fs.writeFile(destPlanPath, pContent);
        this.clearCheckpoint(state);
        return 'fail';
      } else {
        return 'wait';
      }
    } else {
      // Batch mode không auto-approve — dừng chờ user CLI
      this.logger.info(`
═══════════════════════════════════════════════════════════════════════
⏸️  PIPELINE ĐÃ HOÀN TẤT PHA PLAN - CHỜ DUYỆT
═══════════════════════════════════════════════════════════════════════
📄 File kế hoạch:  ${destPlanPath}
📂 Tài liệu nguồn: ${state.source_slug}

Vui lòng chọn hành động tiếp theo:

  [A] ✅ Duyệt & chạy tiếp
      → bun start approve -t ${state.timestamp}

  [R] ❌ Từ chối & dọn dẹp
      → bun start reject -t ${state.timestamp}

  [V] 📖 Xem hướng dẫn vận hành
      → bun start guide

  [Q] 🚪 Thoát
`);
      return 'wait';
    }
  }

  private async runRefine(state: PipelineState, _opts: RunStateMachineOpts): Promise<PhaseResult> {
    this.observer.onPhaseStart('REFINE');
    this.currentPhaseName = 'REFINE';
    const planData = state.plan_item_data as PlanResult;
    if (!planData) { this.observer.onPhaseComplete('REFINE', false); return 'fail'; }
    this.refiner.execute(planData, state.source_slug);
    state.current_phase = 'VERIFY';
    this.saveCheckpoint(state);
    this.observer.onPhaseComplete('REFINE', true);
    this.currentPhaseName = null;
    return 'continue';
  }

  private async runVerify(state: PipelineState, opts: RunStateMachineOpts): Promise<PhaseResult> {
    this.observer.onPhaseStart('VERIFY');
    this.currentPhaseName = 'VERIFY';
    if (opts.skipVerify) {
      this.logger.info('  ⏭️ Chế độ Batch chuyển tiếp: Tạm thời bỏ qua kiểm toán đồ thị để tránh báo động giả.');
      this.observer.onPhaseSkip('VERIFY');
    } else {
      const result = this.verifier.execute();
      if (result.brokenLinks > 0 || result.portabilityViolations > 0 || result.inconsistencies > 0) {
        this.logger.error(`  ❌ Phát hiện lỗi kiểm toán: brokenLinks=${result.brokenLinks}, portabilityViolations=${result.portabilityViolations}, inconsistencies=${result.inconsistencies}`);
        this.observer.onPhaseComplete('VERIFY', false);
        return 'fail';
      }
      this.observer.onPhaseComplete('VERIFY', true);
    }
    state.current_phase = 'COMMIT';
    this.saveCheckpoint(state);
    this.currentPhaseName = null;
    return 'continue';
  }

  private async runCommit(state: PipelineState, opts: RunStateMachineOpts): Promise<PhaseResult> {
    this.observer.onPhaseStart('COMMIT');
    this.currentPhaseName = 'COMMIT';
    const planResult = state.plan_item_data as PlanResult;
    if (!planResult) { this.observer.onPhaseComplete('COMMIT', false); return 'fail'; }
    this.committer.execute(planResult, opts.sourcePath, state.timestamp);
    this.clearCheckpoint(state);
    this.observer.onPhaseComplete('COMMIT', true);
    this.currentPhaseName = null;
    state.current_phase = ''; // Kết thúc
    return 'continue';
  }

  // ============ State Machine Helpers ============

  private initState(sourcePath: string): PipelineState {
    const sourceSlug = path.basename(sourcePath).replace(/\.[^.]+$/, '');
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
        this.logger.info(`🔄 Khôi phục checkpoint! Pha hiện tại: ${saved.current_phase}`);
        return { ...state, ...saved };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`⚠️ Không thể đọc checkpoint: ${msg}. Tạo mới.`);
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
      this.logger.warn(`⚠️ Lỗi lưu checkpoint: ${msg}`);
    }
  }

  private clearCheckpoint(state: PipelineState): void {
    const cpPath = this.getCheckpointPath(state);
    if (this.fs.fileExists(cpPath)) {
      try {
        this.fs.unlink(cpPath);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`⚠️ Lỗi xóa checkpoint: ${msg}`);
      }
    }
  }

  // ============ Batch ============

  async runBatch(directory: string, autoApprove: boolean): Promise<boolean> {
    const files = this.scanAndSortFiles(directory);
    if (files.length === 0) {
      this.logger.info('\n🎉 Không có tài liệu thô nào cần xử lý (status: to-process)!');
      return true;
    }

    this.logger.info(`\n=======================================================`);
    this.logger.info(`📦 BẮT ĐẦU CHẠY BATCH TUẦN TỰ CHO ${files.length} FILES`);
    this.logger.info(`=======================================================`);

    for (let i = 0; i < files.length; i++) {
      const filepath = files[i];
      const filename = path.basename(filepath);
      this.logger.info(`\n[TIẾN TRÌNH ${i + 1}/${files.length}] ───────────────`);
      this.logger.info(`👉 Đang xử lý: ${filename}`);

      if (autoApprove) {
        const success = await this.runAutoToEnd(filepath, true);
        if (!success) {
          this.logger.error(`❌ Lỗi: Chạy tự động thất bại tại file: ${filename}`);
          return false;
        }
      } else {
        const success = await this.execute(filepath);
        if (!success) return false;

        this.logger.info(`\n⏸️ Hàng đợi Batch tạm dừng tại [${filename}].`);
        this.logger.info(`👉 Vui lòng duyệt kế hoạch trước khi Batch tự động chuyển sang file tiếp theo.`);
        break;
      }
    }

    return true;
  }

  private scanAndSortFiles(directory: string): string[] {
    if (!this.fs.fileExists(directory)) return [];

    const supportedExts = ['.md', '.txt', '.pdf', '.docx', '.csv'];
    const filesToProcess: Array<{ mtime: number; filepath: string }> = [];
    const files = this.fs.readdir(directory);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!supportedExts.includes(ext)) continue;
      const filepath = path.join(directory, file);

      try {
        if (ext === '.md') {
          const content = this.fs.readFile(filepath);
          if (!content.includes('status: to-process')) continue;
        }
        // File không phải .md luôn được xử lý (to-process implicit)
        const stat = this.fs.stat(filepath);
        filesToProcess.push({ mtime: stat.mtimeMs, filepath });
      } catch {
        // Bỏ qua file lỗi
      }
    }

    filesToProcess.sort((a, b) => a.mtime - b.mtime);
    return filesToProcess.map(x => x.filepath);
  }

  async approveDraft(draft: DraftNode): Promise<void> {
    await this.learningService.saveDraft(draft);
  }
}
