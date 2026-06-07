# 📑 BIÊN BẢN BÀN GIAO SESSION (SESSION HANDOFF)
*Ngày: 2026-06-07 | Branch: `feature/rewrite-engine-in-typescript`*

---

## 🎯 1. Prompt Bàn Giao (Copy-paste cho session mới)

```markdown
Bạn đang làm việc trong dự án Harness Engineering — hệ thống quản lý tri thức đa domain
với MRP Ingestion Pipeline (TypeScript). Branch: `feature/rewrite-engine-in-typescript`.

## Trạng thái hiện tại
- Runtime: Bun (v1.3.14) — **đã loại bỏ hoàn toàn Python**.
- `bunx tsc --noEmit` = 0 errors, `bun test` = 20/20 pass.
- Vault: 0 broken links, 0 tree inconsistencies, 0 domain validation errors.
- 9Router (local proxy) cho LLM Provider — dùng OpenAI SDK chính thức.

## Cấu trúc hướng dẫn (Lazy-loading, tiết kiệm token)
CLAUDE.md chỉ đóng vai trò bảng chỉ dẫn. Tuỳ nhiệm vụ mà load đúng file AGENTS.md:

| Nhiệm vụ | File cần load |
|:---|---:|
| Sửa code Engine, chạy test, biên dịch (DEV) | [AGENTS.md](./AGENTS.md) |
| Vận hành Vault, audit, query, feedback (USE) | [vault/AGENTS.md](./vault/AGENTS.md) |

**⚠️ Bắt buộc:** Trình bày Plan Mode trước khi sửa/tạo file. (FB-013)

## Công việc tiếp theo
Chạy MRP Ingestion Pipeline (bun src/index.ts) để tinh lọc sâu các nốt nháp
(draft/placeholder) cho Trung Bộ Kinh.
```

---

## 🏗 2. Domain Mapping

| Thư mục | Slug Domain | Định dạng File thô | RULE.md |
| :--- | :--- | :--- | :--- |
| `nikaya_trung_bo/` | `nikaya-trung-bo` | `sutta-mn-*.md` | [nikaya_trung_bo/RULE.md](vault/00_raw_docs/nikaya_trung_bo/RULE.md) |
| `giang_giai_trung_bo_modern/` | `giang-giai-trung-bo-modern` | `mn-*.md` | [giang_giai_trung_bo_modern/RULE.md](vault/00_raw_docs/giang_giai_trung_bo_modern/RULE.md) |
| `loi_phat_day_brahm/` | `loi-phat-day-brahm` | `buoi_*.md` | [loi_phat_day_brahm/RULE.md](vault/00_raw_docs/loi_phat_day_brahm/RULE.md) |

---

## 🧪 3. Lệnh Verification & Diagnostics

```bash
bun scripts/validate_raw_docs.ts       # 0 lỗi domain thô
bun scripts/sync_rules_and_memory.ts   # 0 link hỏng + 0 tree lỗi
bun test                                # test suite pass 100%
```
