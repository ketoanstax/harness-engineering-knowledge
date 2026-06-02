# 📑 BIÊN BẢN BÀN GIAO SESSION (SESSION HANDOFF)
*Ngày: 2026-06-02 | Branch: `feature/rewrite-engine-in-typescript`*

---

## 🎯 1. Prompt Bàn Giao (Copy-paste cho session mới)

```markdown
Bạn đang làm việc trong dự án Harness Engineering — hệ thống quản lý tri thức đa domain 
với MRP Ingestion Pipeline (TypeScript). Branch: `feature/rewrite-engine-in-typescript`.

## Trạng thái hiện tại
✅ Clean Architecture 4 tầng hoàn chỉnh (Domain, Application, Infrastructure, Presentation)
✅ Runtime: **Bun** (v1.3.14) — không dùng Node/pnpm nữa
✅ Test: **Bun Test** (Unit/Integration/E2E) — `bun test` 
✅ `bunx tsc --noEmit` = 0 errors, `bun test` = 20/20 pass, `bun start` hoạt động

## 11 commits gần nhất (từ cũ đến mới):
1. chore: chuyển đổi runtime sang Bun
2. feat: tách phần test ra khỏi source + Bun Test
3. refactor: loại bỏ magic strings + regex manipulation nguy hiểm
4. refactor: inject ILogger thay vì console.log ở Application layer
5. refactor: tách God function runStateMachine → Phase Step pattern
6. refactor: chuyển AtomicNode.fromFile() từ Domain → Infrastructure Factory
7. refactor: config hoá hardcoded values + inject atomicPrefix
8. fix: shell không nhắc lại lệnh khi input từ pipe
9. fix: xoá in đè prompt gây lệnh xuất hiện 2 lần

## Kiến trúc Layer
- **Domain:** interfaces/ (ILogger, IPipelineObserver, IConfigProvider...) + entities/
- **Application:** use-cases/ingest-document.use-case.ts (Phase Step SM) + phases/ (6 phase)
- **Infrastructure:** fs/, llm/, parsers/ (AtomicNodeFactory, GrayMatterParser), repositories/, formatters/ (MarkdownGenerator inject atomicPrefix), config/, logging/ (ConsoleLogger, SilentLogger)
- **Presentation:** composition-root.ts (DI), cli/, ui/ (Dashboard, Logger tích hợp), tools/

## Lưu ý kỹ thuật
- **Bun** — không cần --experimental-strip-types, import .ts vẫn giữ
- **Clean Architecture**: Domain/Application KHÔNG import NPM
- **Logging**: Mọi Phase/UseCase dùng ILogger (injected), không console.log
- **State Machine**: runStateMachine = vòng lặp handler Map (thêm phase = viết 1 method + 1 dòng)
- **Config**: core/config.ts cung cấp ensureDirectories(), IConfigProvider implement ở Infra
- **Import test**: tests/ nằm trong tsconfig include — type-checked
- **Shell**: isTTY guard tránh recreate readline vô tận khi pipe
- **Hiện tại đang dùng Anthropic KhaBoDo_1.0** (xem .env)
```

---

## 🏗 2. Bản đồ Kiến trúc Hiện tại

### Domain Layer (`src/domain/`) — Pure TS, 0 NPM
```
interfaces/
├── file-system.interface.ts       # IFileSystem
├── llm-provider.interface.ts      # ILLMProvider + LLMUsage
├── markdown-generator.interface.ts # IMarkdownGenerator
├── config-provider.interface.ts   # IConfigProvider
├── pipeline-observer.interface.ts # IPipelineObserver + NullPipelineObserver
├── frontmatter-parser.interface.ts # IFrontmatterParser
├── node-repository.interface.ts   # INodeRepository + AtomicNodeMeta
└── logger.interface.ts            # ILogger (info/success/warn/error/log)

entities/
├── source-doc.entity.ts
├── structured-doc.entity.ts
├── atomic-node.entity.ts          # Thuần data + getters, KHÔNG có fromFile()
└── plan.entity.ts
```

### Application Layer (`src/application/`)
```
use-cases/
└── ingest-document.use-case.ts    # runStateMachine = vòng lặp handler Map

phases/
├── mapper.phase.ts                # Đọc file thô → structured doc
├── reducer.phase.ts               # So khớp trùng lặp
├── planner.phase.ts               # Thiết kế atomic nodes
├── refiner.phase.ts               # Tạo/cập nhật file .md
├── verifier.phase.ts              # Kiểm toán link + tree healing
├── committer.phase.ts             # Cập nhật status, INDEX.md
├── _types.ts                      # Zod schemas
└── _utils.ts                      # extractJson()

services/
└── token-tracker.ts               # TokenEntry + tổng hợp
```

### Infrastructure Layer (`src/infrastructure/`) — Cụ thể, có NPM
```
fs/node-file-system.ts
llm/
├── llm-client.ts                  # Factory: chọn provider theo env
├── anthropic-sdk.provider.ts
├── anthropic-rest.provider.ts
├── openai.provider.ts             # max_tokens từ OPENAI_MAX_TOKENS env
├── gemini.provider.ts
├── deepseek.provider.ts           # Kế thừa OpenAIProvider
└── mock.provider.ts               # Mock LLM responses
parsers/
├── gray-matter.parser.ts
└── atomic-node-factory.ts         # fromFile() di chuyển từ Domain
repositories/
└── file-system-node-repository.ts
logging/
├── console-logger.ts              # Dùng chalk
└── silent-logger.ts               # No-op cho test
config/config-provider.ts
formatters/markdown.generator.ts   # Inject atomicPrefix qua constructor
```

### Presentation Layer (`src/presentation/`)
```
composition-root.ts                # DI container
cli/commands.ts                    # Commander: run, batch, approve, reject, guide
ui/
├── interactive-shell.ts           # Shell với real-time suggestion + /commands
├── file-picker.ts
├── plan-displayer.ts
└── pipeline-dashboard.ts          # Dashboard + DashboardLogger (thay console hijacking)
tools/
├── domain-scanner.ts              # /scan
├── graph-viz.ts                   # /graph
└── vault-stats.ts                 # /status
```

### Core (Layer trung gian)
```
core/
├── config.ts                      # ensureDirectories(), hằng số path, ATOMIC_PREFIX...
└── context-filter.ts              # filterRelevantNodes() configurable threshold + ILogger
```

---

## 📋 3. Các CLI Commands

### Interactive Shell (`bun start`)
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

### CLI Direct (`bun start <command>`)
```bash
bun start run -s <file.md>           # Chạy pipeline cho 1 file
bun start batch                      # Batch tuần tự
bun start batch --auto-approve       # Batch tự động
bun start approve -t <timestamp>     # Duyệt plan
bun start reject -t <timestamp>      # Từ chối plan
bun start guide                      # Hướng dẫn
```

### Lệnh test
```bash
bun test                  # Toàn bộ suite (20 tests)
bun run test:unit         # Unit tests (6)
bun run test:integration  # Integration tests (13)
bun run test:e2e          # E2E pipeline test (1)
bun run typecheck         # bunx tsc --noEmit
```

### Python Scripts
```bash
python3 scripts/validate_raw_docs.py         # Validate domain subdirs
python3 scripts/sync_rules_and_memory.py     # Audit links + sync rules
```

---

## 🔧 4. Cấu hình Môi trường

File `.env` (đang active):
```env
# Anthropic (đang active - bun start thấy Anthropic SDK KhaBoDo_1.0)
ANTHROPIC_BASE_URL=http://localhost:20128/v1
ANTHROPIC_AUTH_TOKEN=sk-...
ANTHROPIC_MODEL=KhaBoDo_1.0
ANTHROPIC_CONNECTION_MODE=sdk

# Gemini (comment)
# GEMINI_API_KEY=...
# GEMINI_MODEL=gemini-3.1-flash-lite

# DeepSeek
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-v4-flash

# OpenAI (comment)
# OPENAI_API_KEY=...
# OPENAI_MODEL=gpt-4o

# Tuỳ chọn thêm
# OPENAI_MAX_TOKENS=3000
```

---

## 🧠 5. Vault Structure (Obsidian)

```
vault/
├── 00_raw_docs/                    # Layer 1: Tài liệu thô
│   ├── RULE.md
│   ├── loi_phat_day/               # Domain: Giảng giải Phật học
│   └── trung_bo_kinh/              # Domain: Giảng giải Trung Bộ Kinh
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

1. **Runtime**: Dùng `bun`, KHÔNG dùng `pnpm` hoặc `node`. `bunx tsc --noEmit` để typecheck.

2. **Clean Architecture**: Domain/Application KHÔNG import NPM. Infrastructure có NPM, Presentation có NPM.

3. **Logging**: Mọi Phase dùng `this.logger.info/success/warn/error` (ILogger). Inject từ DI.

4. **State Machine**: Muốn thêm phase → viết 1 private method + thêm 1 dòng vào `handlers` map trong `runStateMachine()`.

5. **Entity**: `AtomicNode` thuần data + getters. Parse từ Markdown file dùng `AtomicNodeFactory` (Infrastructure).

6. **Config**: `core/config.ts` có `ensureDirectories()` gọi ở entry point. Các hằng số path, prefix ở đây.

7. **Shell**: Tránh in đè prompt (readline tự echo). `close` event check `isTTY` để tránh loop.

8. **Test**: E2E test xoá env vars (kể cả DEEPSEEK) để ép Mock mode. Timeout mặc định 5s.

9. **Commit gần nhất**: `ed0e3de` — fix double prompt.
