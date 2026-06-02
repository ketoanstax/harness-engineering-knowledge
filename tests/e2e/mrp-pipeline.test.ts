import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import { LLMClient } from '../../src/infrastructure/llm/llm-client.ts';
import { IngestDocumentUseCase } from '../../src/application/use-cases/ingest-document.use-case.ts';
import { NodeFileSystem } from '../../src/infrastructure/fs/node-file-system.ts';
import { MarkdownGenerator } from '../../src/infrastructure/formatters/markdown.generator.ts';
import { ConfigProvider } from '../../src/infrastructure/config/config-provider.ts';
import { TokenTracker } from '../../src/application/services/token-tracker.ts';
import { PipelineDashboard } from '../../src/presentation/ui/pipeline-dashboard.ts';
import { GrayMatterParser } from '../../src/infrastructure/parsers/gray-matter.parser.ts';
import { DIR_RAW, DIR_ATOMIC, DIR_JOURNAL } from '../../src/core/config.ts';
import { VerifierPhase } from '../../src/application/phases/verifier.phase.ts';
import { MapperPhase } from '../../src/application/phases/mapper.phase.ts';
import { ReducerPhase } from '../../src/application/phases/reducer.phase.ts';
import { PlannerPhase } from '../../src/application/phases/planner.phase.ts';
import { RefinerPhase } from '../../src/application/phases/refiner.phase.ts';
import { CommitterPhase } from '../../src/application/phases/committer.phase.ts';
import { FileSystemNodeRepository } from '../../src/infrastructure/repositories/file-system-node-repository.ts';

const TEST_DIR_RAW = path.join(path.dirname(DIR_RAW), 'test_raw_docs');

function setupChronologicalTimes(): void {
  // Đảm bảo thư mục test tạm thời tồn tại
  if (!fs.existsSync(TEST_DIR_RAW)) {
    fs.mkdirSync(TEST_DIR_RAW, { recursive: true });
  }

  const f14 = path.join(TEST_DIR_RAW, 'lecture-14-blast-radius-advanced.md');
  const f15 = path.join(TEST_DIR_RAW, 'lecture-15-token-budget-under-large-load.md');
  const f16 = path.join(TEST_DIR_RAW, 'lecture-16-causal-web-visualization.md');

  // Tự động tạo các file mock nếu chưa tồn tại
  if (!fs.existsSync(f14)) {
    fs.writeFileSync(f14, `---\ntitle: "Lecture 14 - Kỹ thuật nâng cao kiểm soát Blast Radius trong Hệ thống AI"\nstatus: to-process\n---\nNội dung bài giảng 14`, 'utf-8');
  }
  if (!fs.existsSync(f15)) {
    fs.writeFileSync(f15, `---\ntitle: "Lecture 15 - Quản trị Token Budget dưới tải lớn"\nstatus: to-process\n---\nNội dung bài giảng 15`, 'utf-8');
  }
  if (!fs.existsSync(f16)) {
    fs.writeFileSync(f16, `---\ntitle: "Lecture 16 - Trực quan hóa Mạng lưới Nhân Duyên Quả (Causal Web)"\nstatus: to-process\n---\nNội dung bài giảng 16`, 'utf-8');
  }

  // Tự động tạo các nốt cha mock tạm thời để vượt qua kiểm toán liên kết
  const parentAO = path.join(DIR_ATOMIC, 'HAE-concept-agent-overreach.md');
  const parentTB = path.join(DIR_ATOMIC, 'HAE-concept-token-budget.md');
  const parentTM = path.join(DIR_ATOMIC, 'HAE-concept-three-tier-memory-architecture.md');
  const parentCS = path.join(DIR_ATOMIC, 'HAE-concept-clean-state.md');
  const manifesto = path.join(path.dirname(DIR_ATOMIC), '04_distilled', 'nikaya-distilled.md');

  if (!fs.existsSync(parentAO)) {
    fs.writeFileSync(parentAO, `---\nid: HAE-concept-agent-overreach\ntitle: "Agent Overreach"\nchildren:\n  - blast-radius-isolation\n---\nMock parent`, 'utf-8');
  }
  if (!fs.existsSync(parentTB)) {
    fs.writeFileSync(parentTB, `---\nid: HAE-concept-token-budget\ntitle: "Token Budget"\nchildren:\n  - token-load-control\n---\nMock parent`, 'utf-8');
  }
  if (!fs.existsSync(parentTM)) {
    fs.writeFileSync(parentTM, `---\nid: HAE-concept-three-tier-memory-architecture\ntitle: "Three Tier Memory Architecture"\nchildren:\n  - semantic-graph-visualization\n---\nMock parent`, 'utf-8');
  }
  if (!fs.existsSync(parentCS)) {
    fs.writeFileSync(parentCS, `---\nid: HAE-concept-clean-state\ntitle: "Clean State"\nchildren: []\n---\nMock parent`, 'utf-8');
  }
  if (!fs.existsSync(manifesto)) {
    fs.writeFileSync(manifesto, `# Đúc kết Kinh điển Nikaya Mock`, 'utf-8');
  }

  // Đảm bảo status của các file này là 'to-process' để test có thể chạy được
  for (const filepath of [f14, f15, f16]) {
    if (fs.existsSync(filepath)) {
      let content = fs.readFileSync(filepath, 'utf-8');
      if (content.includes('status: processed')) {
        content = content.replace('status: processed', 'status: to-process');
        fs.writeFileSync(filepath, content, 'utf-8');
      }
    }
  }

  const now = Date.now() / 1000;
  // Giả lập thời gian sửa đổi (mtime):
  // File 14 cũ nhất, File 15 ở giữa, File 16 mới nhất
  fs.utimesSync(f14, now - 300, now - 300); // 5 phút trước
  fs.utimesSync(f15, now - 200, now - 200); // 3 phút trước
  fs.utimesSync(f16, now - 100, now - 100); // 1 phút trước
}

describe('E2E MRP Ingestion Pipeline', () => {
  const originalEnv: Record<string, string | undefined> = {};
  const envVars = ['ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY'];

  beforeAll(() => {
    // Ép chạy ở Mock Mode khi chạy test E2E để bảo vệ đồ thị tri thức tĩnh và tránh gọi LLM thật
    for (const envVar of envVars) {
      originalEnv[envVar] = process.env[envVar];
      delete process.env[envVar];
    }

    // 1. Setup thời gian và tài liệu thô giả lập
    setupChronologicalTimes();

    // 2. Xóa các checkpoint cũ nếu có
    if (fs.existsSync(DIR_JOURNAL)) {
      const journalFiles = fs.readdirSync(DIR_JOURNAL);
      for (const f of journalFiles) {
        if (f.includes('mrp_checkpoint_')) {
          fs.unlinkSync(path.join(DIR_JOURNAL, f));
        }
      }
    }

    // Xóa các nốt atomic test trước đó nếu tồn tại
    const testNodes = ['blast-radius-isolation', 'token-load-control', 'semantic-graph-visualization'];
    for (const slug of testNodes) {
      const filepath = path.join(DIR_ATOMIC, `HAE-concept-${slug}.md`);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Xóa mọi checkpoint cũ để test chạy sạch
    for (const slug of ['lecture-14-blast-radius-advanced', 'lecture-15-token-budget-under-large-load', 'lecture-16-causal-web-visualization']) {
      const cpPath = path.join(DIR_JOURNAL, `mrp_checkpoint_${slug}.json`);
      if (fs.existsSync(cpPath)) fs.unlinkSync(cpPath);
    }
  });

  afterAll(() => {
    // Khôi phục env ban đầu
    for (const envVar of envVars) {
      if (originalEnv[envVar] !== undefined) {
        process.env[envVar] = originalEnv[envVar];
      }
    }

    // DỌN DẸP SAU KHI TEST (BẢO VỆ VAULT TRỐNG CHO NIKAYA)
    // Raw files
    if (fs.existsSync(TEST_DIR_RAW)) {
      fs.rmSync(TEST_DIR_RAW, { recursive: true, force: true });
    }
    // Structured files
    const DIR_STRUCTURED = path.join(path.dirname(DIR_ATOMIC), '01_structured_docs');
    for (const slug of ['lecture-14-blast-radius-advanced', 'lecture-15-token-budget-under-large-load', 'lecture-16-causal-web-visualization']) {
      const sPath = path.join(DIR_STRUCTURED, `${slug}-processed.md`);
      if (fs.existsSync(sPath)) {
        fs.unlinkSync(sPath);
      }
    }
    // Atomic files
    const testNodes = ['blast-radius-isolation', 'token-load-control', 'semantic-graph-visualization'];
    const allAtomicToDelete = [
      ...testNodes.map(slug => `HAE-concept-${slug}.md`),
      'HAE-concept-agent-overreach.md',
      'HAE-concept-token-budget.md',
      'HAE-concept-three-tier-memory-architecture.md',
      'HAE-concept-clean-state.md'
    ];
    for (const filename of allAtomicToDelete) {
      const briPath = path.join(DIR_ATOMIC, filename);
      if (fs.existsSync(briPath)) {
        fs.unlinkSync(briPath);
      }
    }
    // Manifesto mock
    const manifesto = path.join(path.dirname(DIR_ATOMIC), '04_distilled', 'nikaya-distilled.md');
    if (fs.existsSync(manifesto)) {
      fs.unlinkSync(manifesto);
    }
    // Journal plans
    if (fs.existsSync(DIR_JOURNAL)) {
      const files = fs.readdirSync(DIR_JOURNAL);
      for (const f of files) {
        if (f.startsWith('mrp_plan_') || f.startsWith('mrp_checkpoint_')) {
          fs.unlinkSync(path.join(DIR_JOURNAL, f));
        }
      }
    }
    // Reset INDEX.md
    const realPathIndex = path.join(path.dirname(DIR_ATOMIC), '03_neural_map', 'INDEX.md');
    if (fs.existsSync(realPathIndex)) {
      fs.writeFileSync(realPathIndex, `# Bản đồ Chỉ mục Tri thức Trung bộ kinh - Tạng Nikaya (Knowledge Index)

Chào mừng bạn đến với Bản đồ mạng lưới thần kinh tri thức về Kinh điển Nikaya - Trung bộ kinh. Dưới đây là phân loại chi tiết các nốt nguyên tử theo chủ đề, danh mục và từ khóa (tags).

---

## 🗂️ Phân loại theo Danh mục (Categories)

### 1. Tứ Thánh Đế (Four Noble Truths)

### 2. Duyên Khởi (Dependent Origination)

### 3. Bát Chánh Đạo (Noble Eightfold Path)

### 4. Ngũ Uẩn (Five Aggregates)

### 5. Giới Định Tuệ (Virtue, Concentration, Wisdom)

### 6. Vô Thường - Khổ - Vô Ngã (Three Marks of Existence)

### 7. Giáo lý Khác (Other Dharma)

---

## 🏷️ Chỉ mục theo Thẻ (Tags Index)
`, 'utf-8');
    }
  });

  test('Chạy luồng batch ingestion tuần tự thành công (100% Pass)', async () => {
    const testFs = new NodeFileSystem();
    const testLlm = LLMClient.createFromEnv();
    const testMd = new MarkdownGenerator();
    const configProvider = new ConfigProvider();
    const tokenTracker = new TokenTracker();
    const pipelineDashboard = new PipelineDashboard(tokenTracker);
    const testNodeRepo = new FileSystemNodeRepository(testFs, configProvider);
    const testParser = new GrayMatterParser();

    const mapper = new MapperPhase(testLlm, testFs, testMd, configProvider, testParser);
    const reducer = new ReducerPhase(testLlm, testNodeRepo);
    const planner = new PlannerPhase(testLlm, configProvider);
    const refiner = new RefinerPhase(testFs, testMd, configProvider, testParser);
    const testVerifier = new VerifierPhase(testFs, testMd, configProvider, testParser);
    const committer = new CommitterPhase(testFs, testMd, configProvider, testParser);

    const useCase = new IngestDocumentUseCase(
      mapper,
      reducer,
      planner,
      refiner,
      testVerifier,
      committer,
      testFs,
      testMd,
      configProvider,
      tokenTracker,
      pipelineDashboard,
      testLlm,
      testNodeRepo,
    );

    const success = await useCase.runBatch(TEST_DIR_RAW, true);
    expect(success).toBe(true);

    // Kiểm chứng kết quả đồ thị tri thức
    const briPath = path.join(DIR_ATOMIC, 'HAE-concept-blast-radius-isolation.md');
    expect(fs.existsSync(briPath)).toBe(true);

    const briContent = fs.readFileSync(briPath, 'utf-8');
    const briContentLower = briContent.toLowerCase();
    const hasMerge = briContent.includes('lecture-15-token-budget-under-large-load-processed.md') || briContentLower.includes('lecture-15');
    expect(hasMerge).toBe(true);

    const tlcPath = path.join(DIR_ATOMIC, 'HAE-concept-token-load-control.md');
    expect(fs.existsSync(tlcPath)).toBe(true);

    const tlcContent = fs.readFileSync(tlcPath, 'utf-8');
    expect(tlcContent.includes('parent: token-budget')).toBe(true);

    const sgvPath = path.join(DIR_ATOMIC, 'HAE-concept-semantic-graph-visualization.md');
    expect(fs.existsSync(sgvPath)).toBe(true);

    // Chạy bộ kiểm toán tĩnh xác nhận 0 lỗi
    const verifier = new VerifierPhase(new NodeFileSystem(), new MarkdownGenerator(), configProvider, new GrayMatterParser());
    const { brokenLinks, portabilityViolations, inconsistencies } = verifier.execute();

    expect(brokenLinks).toBe(0);
    expect(portabilityViolations).toBe(0);
    expect(inconsistencies).toBe(0);
  });
});
