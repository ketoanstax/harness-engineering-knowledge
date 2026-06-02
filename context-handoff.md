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
✅ `bunx tsc --noEmit` = 0 errors, `bun test` = 20/20 pass
✅ Hỗ trợ đa định dạng raw input: **.md, .txt, .pdf, .docx, .csv**
✅ Đã kiểm toán lỗi hardcoded extension và sửa đổi toàn bộ glue code (initState, scanAndSortFiles, approve command) để PDF/DOCX chạy mượt mà trực tiếp không cần sinh file trung gian (Option B).

## Lịch sử commit gần đây & session hiện tại:
1. chore: chuyển đổi runtime sang Bun
2. feat: tách phần test ra khỏi source + Bun Test
3. refactor: di chuyển AtomicNode.fromFile() từ Domain → Infrastructure Factory
4. refactor: di chuyển cấu hình cứng + inject atomicPrefix
5. feat: Tích hợp IDocumentReader (Strategy Pattern) hỗ trợ PDF (pdf-parse v2) & DOCX (mammoth)
6. fix: Sửa toàn bộ lỗi hardcoded `.md` ở initState(), scanAndSortFiles() và approve command để hỗ trợ đa định dạng hoàn chỉnh.

## Kiến trúc Layer
- **Domain:** interfaces/ (IDocumentReader, IFileSystem, ILogger...) + entities/ (SourceDoc, StructuredDoc, AtomicNode, Plan)
- **Application:** use-cases/ingest-document.use-case.ts + phases/ (MapperPhase, ReducerPhase, PlannerPhase...)
- **Infrastructure:** fs/ (NodeFileSystem), llm/ (Anthropic, OpenAI, Gemini...), parsers/ (GrayMatterParser, AtomicNodeFactory), tools/document-reader/ (DocumentReaderTool, TextExtractor, PdfTextExtractor, DocxExtractor)
- **Presentation:** cli/commands.ts, ui/ (file-picker.ts với icon 📕/📘/📊/📃)

## Điểm cần lưu ý cho Session tiếp theo
- E2E Test (`mrp-pipeline.test.ts`) đang mock DocumentReader qua TextExtractor.
- pdf-parse v2.4.5 đã được wire hoàn chỉnh (sử dụng class PDFParse và destruct/destroy an toàn).
- Mọi định dạng raw doc nạp vào vault/00_raw_docs đều được auto-detect và có thể chạy trực tiếp.
```

---

## 🏗 2. Bản đồ Kiến trúc Đầy đủ (Cập nhật Document Reader)

### Domain Layer (`src/domain/`) — Pure TS, 0 NPM
```
interfaces/
├── document-reader.interface.ts   # IDocumentReader (isSupported, readAsText) - MỚI
├── file-system.interface.ts       # IFileSystem (thêm readFileBuffer) - CẬP NHẬT
├── logger.interface.ts            # ILogger
└── ...
entities/
├── source-doc.entity.ts           # parseFrontmatter() hỗ trợ pseudo-frontmatter cho PDF/DOCX
└── ...
```

### Infrastructure Layer (`src/infrastructure/`) — Có NPM
```
fs/
└── node-file-system.ts            # Thêm readFileBuffer()
tools/document-reader/             # MỚI (Strategy Pattern)
├── extractors.ts                  # TextExtractor, PdfTextExtractor, DocxExtractor
└── document-reader.tool.ts        # Orchestrator DocumentReaderTool
```

---

## 💻 3. CLI & Hướng dẫn sử dụng Đa Định Dạng

Bất kỳ file PDF, DOCX, TXT, CSV nào ném vào `vault/00_raw_docs/` đều được xử lý mượt mà.

### Cách 1: Qua Shell tương tác
```bash
# Ném file PDF vào raw doc
cp ~/tailieu.pdf vault/00_raw_docs/loi_phat_day/

# Chạy shell
bun start
# Chọn /run -> File picker sẽ hiển thị file PDF với icon 📕 (hoặc DOCX với 📘)
```

### Cách 2: CLI trực tiếp
```bash
bun start run -s "vault/00_raw_docs/loi_phat_day/tailieu.pdf"
```

### Cách 3: Batch tự động
```bash
# Quét và xử lý tuần tự toàn bộ file MD, PDF, DOCX... trong thư mục
bun start batch --auto-approve
```

---

## 🧪 4. Lệnh Test & Diagnostics

```bash
bunx tsc --noEmit          # Kiểm tra TypeScript (0 errors)
bun test                   # Chạy toàn bộ suite (20/20 pass)
bun run test:unit          # Chỉ chạy Unit test
bun run test:integration   # Chỉ chạy Integration test
bun run test:e2e           # Chạy E2E Pipeline test với Mock LLM
```

---

## 🧠 5. Nhật ký Thiết kế & Quyết định Nghiệp vụ (Session 2026-06-02)

### Vấn đề thảo luận: **Có nên convert PDF sang .md trước khi nạp?**

Chúng ta đã thảo luận 3 phương án:
- **Option A (Converter):** Tạo script convert PDF → .md trước khi chạy.
- **Option B (Fix straight):** Sửa toàn bộ glue code (initState, approve, scanAndSortFiles) để pipeline nuốt trực tiếp PDF.
- **Option C (Companion Metadata):** PDF đi kèm file `.md` metadata trong raw docs.

**Quyết định:** Chọn **Option B (Fix straight)** vì:
- Tối ưu về logic, không bị smell về thiết kế (1 tài liệu = 1 file duy nhất).
- Tránh lệch trạng thái đồng bộ giữa PDF gốc và file metadata companion.
- Tận dụng triệt để bộ hạ tầng `DocumentReader` Strategy Pattern đã xây dựng.
- Output sinh ra (atomic nodes) vẫn là `.md` có đầy đủ cấu trúc để Obsidian/User search dễ dàng. Raw input chỉ đóng vai trò nguyên liệu đầu vào.
