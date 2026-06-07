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
✅ Đã khắc phục hoàn toàn 218 liên kết hỏng và 11 lỗi cây tri thức trong Vault.
✅ Đã cấu trúc lại `00_raw_docs` theo đúng chuẩn domain/folder riêng.

## Cấu trúc thư mục Domain (Layer 1) mới:
1. **nikaya_trung_bo/**: Chứa 152 file thô nguyên bản Kinh điển Nikaya (định dạng `sutta-mn-*.md`), domain: "nikaya-trung-bo".
2. **giang_giai_trung_bo_modern/**: Chứa 11 file thô giảng giải Trung Bộ hiện đại (định dạng `mn-*.md`), domain: "giang-giai-trung-bo-modern".
3. **loi_phat_day_brahm/**: Chứa 15 file thô Lời Phật Dạy của thiền sư Ajahn Brahm (định dạng `buoi_*.md`), domain: "loi-phat-day-brahm".
4. **lecture/**: Đã loại bỏ hoàn toàn (không còn rác từ bài giảng cũ).

## File đúc kết vĩ mô (Layer 3)
- Đã tạo **`vault/04_distilled/nikaya-distilled.md`** để làm nốt siêu tụ (super-hub) liên kết toàn bộ 215 nốt nguyên tử trên Obsidian Graph View.

## Lịch sử session hiện tại:
- Reorganize `00_raw_docs` từ root vào đúng các thư mục domain con mới (`nikaya_trung_bo/`, `giang_giai_trung_bo_modern/`, `loi_phat_day_brahm/`).
- Sửa lỗi YAML frontmatter `ndomain:` thành `domain:` và mapping chính xác với tên thư mục cha dạng slug.
- Xóa bỏ folder `lecture/` và các liên kết hỏng trỏ về `lecture-14-blast-radius-advanced-processed.md` trong `HAE-concept-kho-dau.md`, `HAE-concept-vo-thuong.md` và `HAE-concept-sati.md`.
- Sửa đổi metadata `parent`/`children` trong 11 nốt nguyên tử bị báo lệch.
- Đồng bộ `vault/memory/project_context.md` khớp chính xác 100% với thực tế dự án.

## Điểm cần lưu ý cho Session tiếp theo:
- Chạy `python3 scripts/sync_rules_and_memory.py` và `python3 scripts/validate_raw_docs.py` để đảm bảo hệ thống luôn ở trạng thái 0 lỗi.
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
python3 scripts/validate_raw_docs.py     # Đảm bảo 0 lỗi cấu trúc domain thô
python3 scripts/sync_rules_and_memory.py # Đảm bảo 0 liên kết hỏng, 0 lỗi parent/children
bun test                                 # Đảm bảo test suite TypeScript pass 100%
```
