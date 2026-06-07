# AGENTS.md — DEV Mode (Phát triển Engine)

## 🛠️ Lệnh Toolchain (TypeScript / Bun)

```bash
bun src/index.ts              # Chạy Interactive Shell (CLI)
bunx tsc --noEmit             # Typecheck (bắt buộc trước khi test)
bun test                      # Test suite
bun run test:unit             # Unit tests
bun run test:integration      # Integration tests
bun run test:e2e              # E2E pipeline tests
```

## 🏗️ Kiến trúc Clean Architecture

| Tầng | Trách nhiệm |
|:---|:---|
| **Domain** | Entities + Interfaces thuần (không phụ thuộc framework) |
| **Application** | Use Cases + Phases + Services điều phối luồng |
| **Infrastructure** | Adapters: LLM Providers, File System, Parsers |
| **Presentation** | CLI Shell, Dashboard, UI Spinner |

## 📐 Code Style

- Early return, hàm <30 dòng
- Không comment thừa
- Không dùng hardcode — ConfigProvider cho mọi giá trị

## 🔬 Scripts kiểm toán (cho DEV)

```bash
bun scripts/sync_rules_and_memory.ts
bun scripts/validate_raw_docs.ts
```
