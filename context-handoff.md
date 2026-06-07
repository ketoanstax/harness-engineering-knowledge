# 📑 BIÊN BẢN BÀN GIAO SESSION (SESSION HANDOFF)
*Ngày: 2026-06-07 | Branch: `feature/rewrite-engine-in-typescript`*

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
✅ Đã tích hợp gói chính thức `openai` SDK thay thế cho HTTP fetch thủ công trong OpenAIProvider.
✅ Khắc phục triệt để lỗi parse format API OpenAI từ 9Router (hoạt động tốt với base_url tùy biến cục bộ).
✅ Đã tạo file siêu tụ thực tế `vault/04_distilled/nikaya-distilled.md` (giải quyết 214 link hỏng trỏ về đây).
✅ Đã sửa file e2e test (`mrp-pipeline.test.ts`) để bảo vệ file thực tế `nikaya-distilled.md` không bị xóa sau khi test.
✅ Đã dọn dẹp sạch liên kết hỏng (0 broken links) và cấu trúc cây hoàn hảo (0 tree errors).
✅ Đã dọn dẹp TOÀN BỘ file Python cũ (scripts/mrp_pipeline/ và các script .py).
✅ Đã chuyển dịch 100% các công cụ chẩn đoán (sync_rules, audit, validate_raw_docs) sang **TypeScript** chạy bằng Bun.

## Cấu trúc thư mục Domain (Layer 1) mới:
1. **nikaya_trung_bo/**: Chứa 152 file thô nguyên bản Kinh điển Nikaya (định dạng `sutta-mn-*.md`), domain: "nikaya-trung-bo".
2. **giang_giai_trung_bo_modern/**: Chứa 11 file thô giảng giải Trung Bộ hiện đại (định dạng `mn-*.md`), domain: "giang-giai-trung-bo-modern".
3. **loi_phat_day_brahm/**: Chứa 15 file thô Lời Phật Dạy của thiền sư Ajahn Brahm (định dạng `buoi_*.md`), domain: "loi-phat-day-brahm".
4. **lecture/**: Đã loại bỏ hoàn toàn (không còn rác từ bài giảng cũ).

## File đúc kết vĩ mô (Layer 3)
- Đã tạo và duy trì bền vững **`vault/04_distilled/nikaya-distilled.md`** để làm nốt siêu tụ (super-hub) liên kết toàn bộ 215 nốt nguyên tử trên Obsidian Graph View.

## Lịch sử session hiện tại:
- Sửa lỗi `LLMClient` và `OpenAIProvider` để tương thích hoàn toàn với 9Router API (thông qua local proxy `localhost:20128` hoặc cloud).
- Chuyển `OpenAIProvider` sang dùng SDK `openai` chính thức giúp tăng độ ổn định, tự động parse response và ngăn ngừa lỗi 404/định dạng do curl/fetch thủ công.
- Cấu hình `.env` khớp chính xác với 9Router (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL=KhaBoDo_1.0`).
- Sửa lỗi trong `tests/e2e/mrp-pipeline.test.ts` ở phần dọn dẹp `afterAll`: chỉ xóa tệp mock của test nếu nó chứa nội dung mock, tránh xóa nhầm file siêu tụ thực tế của Vault.
- Tạo tệp `vault/04_distilled/nikaya-distilled.md` thực tế cho Obsidian.
- Đồng bộ hóa Vault đạt 0 liên kết hỏng, 0 lỗi parent/children, test suite pass 100%.
- Dọn dẹp toàn bộ file Python cũ, viết lại `validate_raw_docs.ts` và `sync_rules_and_memory.ts`.
- Cập nhật CLAUDE.md và shell router (/doctor) để gọi lệnh kiểm toán hoàn toàn bằng Bun TS.

## Điểm cần lưu ý cho Session tiếp theo:
- Chạy `bun scripts/sync_rules_and_memory.ts` và `bun scripts/validate_raw_docs.ts` để đảm bảo hệ thống luôn ở trạng thái 0 lỗi.
- Hiện tại Vault đã sạch bóng liên kết hỏng (0 broken links) và cấu trúc cây hoàn hảo.
- Việc tiếp theo là chạy MRP Ingestion Pipeline bằng TypeScript Engine để tinh lọc sâu các nốt nháp (draft/placeholder) cho Trung Bộ Kinh.
```

---

## 🏗 2. Danh sách Domain Mới & Mapping

| Thư mục | Slug Domain | Định dạng File thô | RULE.md |
| :--- | :--- | :--- | :--- |
| `nikaya_trung_bo/` | `nikaya-trung-bo` | `sutta-mn-*.md` | [nikaya_trung_bo/RULE.md](vault/00_raw_docs/nikaya_trung_bo/RULE.md) |
| `giang_giai_trung_bo_modern/` | `giang-giai-trung-bo-modern` | `mn-*.md` | [giang_giai_trung_bo_modern/RULE.md](vault/00_raw_docs/giang_giai_trung_bo_modern/RULE.md) |
| `loi_phat_day_brahm/` | `loi-phat-day-brahm` | `buoi_*.md` | [loi_phat_day_brahm/RULE.md](vault/00_raw_docs/loi_phat_day_brahm/RULE.md) |

---

## 🧪 3. Lệnh Verification & Diagnostics

```bash
bun scripts/validate_raw_docs.ts     # Đảm bảo 0 lỗi cấu trúc domain thô
bun scripts/sync_rules_and_memory.ts # Đảm bảo 0 liên kết hỏng, 0 lỗi parent/children
bun test                             # Đảm bảo test suite TypeScript pass 100%
```
