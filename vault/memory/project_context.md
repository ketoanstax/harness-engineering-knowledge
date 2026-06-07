# Bối cảnh & Trạng thái Dự án (Project Context & Status)

## 📌 Tổng quan Dự án
Xây dựng một kho tri thức chuẩn mực (Obsidian Vault) về **Kinh điển Phật giáo Nikaya - Trung bộ kinh** dựa trên các nguồn tư liệu.
Dự án đã được phát triển hoàn thiện phiên bản **TypeScript Engine** chạy bằng `bun` thay thế cho Python Engine cũ, tổ chức code theo cấu trúc Clean Architecture.

**Triết lý trung tâm**: *"Framework viết cho lập trình viên. Harness viết cho AI."* (Dựng môi trường tự động cho AI Agent chạy an toàn và tự kiểm toán).

## 📊 Thống kê Vault Thực tế (Cập nhật 2026-06-07)
- **00_raw_docs/**: 183 file (Đã phân bổ về các domain: `nikaya_trung_bo/` 152 file, `loi_phat_day_brahm/` 15 file, `giang_giai_trung_bo_modern/` 11 file, không còn thư mục `lecture`).
- **01_structured_docs/**: 39 file processed.
- **02_atomic_nodes/**: 215 nốt nguyên tử.
- **03_neural_map/**: INDEX.md + AI_ROUTING_TABLE.md + categories.json.
- **04_distilled/**: 1 file (RULE.md).
- **Tổng liên kết**: 218 liên kết hỏng.

## 🗺️ Lộ trình Phát triển (Roadmap)
- [x] Thiết lập cấu trúc thư mục 2 chữ số và các Templates.
- [x] Tạo hệ thống RULE (`CLAUDE.md`), SKILL (`.agent/`), MEMORY (`memory/`).
- [x] Xây dựng script tự động đồng bộ hóa `scripts/sync_rules_and_memory.py`.
- [x] Chuyển đổi và viết lại Engine sang TypeScript hoạt động ổn định.
- [x] Gom nhóm toàn bộ dữ liệu trong `00_raw_docs/` vào các domain/folder riêng (`nikaya_trung_bo/`, `loi_phat_day_brahm/`, `giang_giai_trung_bo_modern/`).
- [x] Loại bỏ hoàn toàn domain phụ `lecture` không còn cần thiết.
- [ ] Chạy MRP Ingestion Pipeline (TypeScript Engine) để cập nhật, tinh lọc và sinh các nốt nguyên tử chuẩn hóa cho Trung bộ kinh.
- [ ] Khắc phục 218 liên kết hỏng và 11 lỗi cây tri thức.
- [ ] Xây dựng file đúc kết tổng quan `04_distilled/nikaya-distilled.md`.

## 📈 Trạng thái Hiện tại
- Dự án đang ở giai đoạn: **Nạp dữ liệu nâng cao và sửa lỗi chất lượng liên kết**.
- Vault đã được cấu trúc lại hoàn toàn, các file thô đã được di chuyển vào đúng thư mục domain và bổ sung frontmatter `domain:` chuẩn chỉnh.
