# 📑 BIÊN BẢN BÀN GIAO SESSION (SESSION HANDOFF)
*Ngày: 2026-06-02 | Branch: `feature/rewrite-engine-in-typescript`*

---

## 🎯 1. Prompt Bàn Giao (Copy-paste cho session mới)

```markdown
Bạn đang làm việc trong dự án Harness Engineering — một hệ thống quản lý tri thức đa domain 
với MRP Ingestion Pipeline (TypeScript). Branch hiện tại: `feature/rewrite-engine-in-typescript`.

## Trạng thái hiện tại
Dự án đã được refactor hoàn TOÀN theo Clean Architecture 4 tầng:
- Domain (entities + interfaces thuần TS, không NPM)
- Application (use-cases + phases thuần business logic)
- Infrastructure (implement cụ thể: FS, LLM, parsers, repositories)
- Presentation (CLI, Interactive Shell, UI tools)

pnpm tsc --noEmit = 0 errors. pnpm start hoạt động bình thường.

## Kiến trúc Layer
Domain:        domain/interfaces/ (IFileSystem, ILLMProvider, IMarkdownGenerator,
               IConfigProvider, IPipelineObserver, IFrontmatterParser, INodeRepository)
               domain/entities/ (source-doc, structured-doc, atomic-node, plan)
Application:   application/use-cases/ingest-document.use-case.ts
               application/phases/ (mapper, reducer, planner, refiner, verifier, committer)
Infrastructure: infrastructure/fs/node-file-system.ts
                infrastructure/llm/ (anthropic, openai, gemini, deepseek, mock)
                infrastructure/parsers/gray-matter.parser.ts
                infrastructure/repositories/file-system-node-repository.ts
                infrastructure/formatters/markdown.generator.ts
                infrastructure/config/config-provider.ts
Presentation:  presentation/composition-root.ts (DI container)
               presentation/cli/commands.ts (Commander CLI)
               presentation/ui/ (interactive-shell, file-picker, plan-displayer, pipeline-dashboard)
               presentation/tools/ (domain-scanner, graph-viz, vault-stats)

## 5 Commits chính trong session này (từ cũ đến mới):
1. feat: hoàn thiện TS engine tools + tổ chức domain subdirs
2. fix: Clean Architecture — tách Presentation khỏi Application layer
3. refactor: DRY + Repository pattern + tách God class context-filter
4. fix: tách gray-matter khỏi Domain/Application + UI dùng ConfigProvider
5. fix: restore gray-matter trong Presentation tools, bỏ regex thủ công

## Những gì đã hoàn thành
✅ 3 TS engine tools mới: /scan, /graph, /status (trong interactive shell)
✅ /doctor mở rộng: validate domain + sync rules + env check
✅ Tổ chức 00_raw_docs/ theo domain subdirectories (loi_phat_day, trung_bo_kinh)
✅ scripts/validate_raw_docs.py — auto-detect file sai domain
✅ IPipelineObserver (Domain) — UseCase không biết Presentation
✅ runStateMachine() duy nhất thay vì 2 hàm copy-paste
✅ INodeRepository (Domain) + FileSystemNodeRepository (Infra)
✅ context-filter.ts: bỏ FS/gray-matter, chỉ còn thuật toán thuần
✅ IFrontmatterParser (Domain) + GrayMatterParser (Infra)
✅ Bỏ gray-matter khỏi Domain và Application
✅ Presentation tools dùng IConfigProvider thay vì core/config.ts

## Lưu ý kỹ thuật
- Node.js dùng `--experimental-strip-types` → KHÔNG dùng parameter properties
  (VD: constructor(private fs: IFileSystem) là SAI → phải khai báo this.fs = fs tường minh)
- .env cấu hình GEMINI_API_KEY đang active (model: gemini-3.1-flash-lite)
- core/config.ts vẫn tồn tại — Presentation và Infrastructure import nó (OK)
- Các file tools ở presentation/tools/ dùng gray-matter (Presentation layer được phép)
```

---

## 🏗 2. Bản đồ Kiến trúc Hiện tại

### Domain Layer (`src/domain/`) — Pure TS, 0 NPM
```
interfaces/
├── file-system.interface.ts          # IFileSystem
├── llm-provider.interface.ts         # ILLMProvider + LLMUsage
├── markdown-generator.interface.ts   # IMarkdownGenerator
├── config-provider.interface.ts      # IConfigProvider
├── pipeline-observer.interface.ts    # IPipelineObserver + NullPipelineObserver
├── frontmatter-parser.interface.ts   # IFrontmatterParser
└── node-repository.interface.ts      # INodeRepository + AtomicNodeMeta

entities/
├── source-doc.entity.ts              # SourceDoc (parseFrontmatter nhận parser qua tham số)
├── structured-doc.entity.ts          # StructuredDoc
├── atomic-node.entity.ts             # AtomicNode + CausalWeb
└── plan.entity.ts                    # PlanFile + PlanItem
```

### Application Layer (`src/application/`) — Business logic, 0 NPM
```
use-cases/
└── ingest-document.use-case.ts       # IngestDocumentUseCase
                                      # - runStateMachine() duy nhất (autoApprove + onPlanGenerated)
                                      # - query() dùng INodeRepository
                                      # - runBatch() tuần tự

phases/
├── mapper.phase.ts                   # Đọc file thô → structured doc (DI: parser)
├── reducer.phase.ts                  # So khớp trùng lặp (DI: nodeRepo)
├── planner.phase.ts                  # Thiết kế atomic nodes + Causal Web
├── refiner.phase.ts                  # Tạo/cập nhật file .md
├── verifier.phase.ts                 # Kiểm toán link + tree healing (DI: parser)
├── committer.phase.ts                # Cập nhật status, INDEX.md
├── _types.ts                         # Zod schemas
└── _utils.ts                         # extractJson()

services/
└── token-tracker.ts                  # TokenEntry + tổng hợp
```

### Infrastructure Layer (`src/infrastructure/`) — Cụ thể, có NPM
```
fs/node-file-system.ts               # Node.js FS implementation
llm/
├── llm-client.ts                     # Factory: chọn provider theo env
├── anthropic-sdk.provider.ts         # Anthropic SDK
├── anthropic-rest.provider.ts        # Anthropic REST
├── openai.provider.ts                # OpenAI
├── gemini.provider.ts                # Google Gemini
├── deepseek.provider.ts              # DeepSeek
└── mock.provider.ts                  # Mock (khi không có API key)

parsers/
└── gray-matter.parser.ts            # GrayMatterParser implement IFrontmatterParser

repositories/
└── file-system-node-repository.ts   # Đọc 02_atomic_nodes/ → AtomicNodeMeta[]

config/config-provider.ts            # IConfigProvider implementation
formatters/markdown.generator.ts     # Sinh .md cho atomic nodes, structured docs, plan
```

### Presentation Layer (`src/presentation/`) — UI, CLI
```
composition-root.ts                   # DI Container (wire toàn bộ dependencies)
cli/commands.ts                       # Commander: run, batch, approve, reject, guide
ui/
├── interactive-shell.ts              # Shell với real-time suggestion + /commands
├── file-picker.ts                    # File browser (clack prompts)
├── plan-displayer.ts                 # Plan render (boxen)
└── pipeline-dashboard.ts             # Dashboard real-time (implement IPipelineObserver)
tools/
├── domain-scanner.ts                 # /scan command
├── graph-viz.ts                      # /graph command
└── vault-stats.ts                    # /status command
```

### Core (Layer trung gian)
```
core/
├── config.ts                         # Hằng số path + loadCategories() — Presentation/Infra import
└── context-filter.ts                 # filterRelevantNodes() thuần túy (nhận nodes từ Repository)
```

---

## 📋 3. Các CLI Commands

### Interactive Shell (`pnpm start`)
| Lệnh | Mô tả |
|---|---|
| `/run` | Chọn file → chạy pipeline (có duyệt plan) |
| `/scan` | Quét domain subdirs 00_raw_docs/ |
| `/domain` | Liệt kê domain & file stats |
| `/graph` | Cây tri thức ASCII từ atomic nodes |
| `/status` | Tổng quan toàn Vault |
| `/doctor` | Full diagnostics (validate domain + sync rules + env check) |
| `/guide` | Hướng dẫn vận hành MRP |
| `/help` | Danh sách lệnh |
| `/exit` | Thoát |

### CLI Direct (`pnpm start <command>`)
```bash
pnpm start run -s <file.md>           # Chạy pipeline cho 1 file
pnpm start batch                      # Batch tuần tự
pnpm start batch --auto-approve       # Batch tự động
pnpm start approve -t <timestamp>     # Duyệt plan
pnpm start reject -t <timestamp>       # Từ chối plan
pnpm start guide                      # Hướng dẫn
```

### Python Scripts
```bash
python3 scripts/validate_raw_docs.py         # Validate domain subdirs
python3 scripts/sync_rules_and_memory.py     # Audit links + sync rules
```

---

## 🔧 4. Cấu hình Môi trường

File `.env`:
```env
# Gemini (đang active)
GEMINI_API_KEY=AIzaSyBoKcUg1b0RI9w3tmlLTeUzGzm-PDKlFbY
GEMINI_MODEL=gemini-3.1-flash-lite

# Anthropic (comment — có thể dùng thay thế)
# ANTHROPIC_AUTH_TOKEN=...
# ANTHROPIC_MODEL=KhaBoDo_1.0
# ANTHROPIC_CONNECTION_MODE=sdk
```

---

## 🧠 5. Vault Structure (Obsidian)

```
vault/
├── 00_raw_docs/                    # Layer 1: Tài liệu thô
│   ├── RULE.md                     # Domain subdirectory architecture
│   ├── loi_phat_day/               # Domain: Giảng giải Phật học
│   │   ├── RULE.md
│   │   └── buoi_*.md
│   ├── trung_bo_kinh/              # Domain: Giảng giải Trung Bộ Kinh
│   │   ├── RULE.md
│   │   └── mn-*.md
│   ├── sutta-mn-*.md              # Legacy (Nikaya)
│   └── lecture-*.md               # Legacy (Harness Engineering)
├── 01_structured_docs/             # Layer 2: Chắt lọc
├── 02_atomic_nodes/                # Lõi tri thức: nốt nguyên tử
├── 03_neural_map/                  # INDEX.md + AI_ROUTING_TABLE.md
├── 04_distilled/                   # Layer 3: Đúc kết vĩ mô
├── 05_journal/                     # MRP Plan + Checkpoint
├── memory/                         # User profile, feedback, project context
├── RULE.md                         # Hiến pháp vault
└── Templates/                      # Obsidian templates
```

---

## 📌 6. Điểm cần lưu ý cho Session tiếp theo

1. **Node.js `--experimental-strip-types`**: Không hỗ trợ parameter properties. Luôn viết tường minh.

2. **Clean Architecture**: Domain/Application KHÔNG import NPM packages. Mọi thư viện bên ngoài chỉ dùng ở Infrastructure và Presentation.

3. **Code style**: File `.ts` import nhau với đuôi `.ts` (VD: `from './foo.ts'`) — do `--experimental-strip-types` yêu cầu.

4. **Config**: `core/config.ts` vẫn được Presentation/Infra import trực tiếp. Application layer không import nó.

5. **Test**: `pnpm test` = `node --experimental-strip-types src/test_mrp_pipeline.ts` — chạy pipeline test với dữ liệu tạm.

6. **Vault data**: 00_raw_docs/ có thể mở rộng thêm domain mới bằng cách tạo thư mục con + RULE.md + validate bằng `python3 scripts/validate_raw_docs.py`.

7. **Commit gần nhất**: `bd0618f` — restore gray-matter trong Presentation tools.
