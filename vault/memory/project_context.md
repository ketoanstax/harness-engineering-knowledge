# Bối cảnh & Trạng thái Dự án (Project Context & Status)

## 📌 Tổng quan Dự án
Xây dựng một kho tri thức chuẩn mực (Obsidian Vault) về **Kinh điển Phật giáo Nikaya - Trung bộ kinh** dựa trên các nguồn tư liệu cào từ website.

**Triết lý trung tâm**: *"Framework viết cho lập trình viên. Harness viết cho AI."* (Vẫn giữ triết lý Harness để AI Agent tự động hóa nạp và kiểm toán thông tin).

## 📊 Thống kê Vault Hiện tại
- **00_raw_docs/**: 0 file (Đã dọn dẹp sạch tri thức Harness cũ)
- **01_structured_docs/**: 0 file processed
- **02_atomic_nodes/**: 0 nốt nguyên tử
- **03_neural_map/**: INDEX.md + AI_ROUTING_TABLE.md (đã được reset)
- **04_distilled/**: 0 file
- **Tổng liên kết**: 0 liên kết hoạt động, 0 liên kết gãy.

## 🗺️ Lộ trình Phát triển (Roadmap)
- [x] Thiết lập cấu trúc thư mục 2 chữ số và các Templates.
- [x] Tạo hệ thống RULE (`CLAUDE.md`), SKILL (`.agent/`), MEMORY (`memory/`).
- [x] Xây dựng script tự động đồng bộ hóa `scripts/sync_rules_and_memory.py`.
- [x] Chuyển đổi và viết lại Engine sang TypeScript hoạt động ổn định.
- [x] Làm sạch toàn bộ dữ liệu tri thức Harness cũ khỏi các thư mục `vault/0*_*`.
- [ ] **Bắt đầu cào và nạp dữ liệu thô về Trung bộ kinh trong tạng Nikaya** vào `vault/00_raw_docs/`.
- [ ] Chạy MRP Ingestion Pipeline để phân tích, chắt lọc và tạo các nốt nguyên tử cho Trung bộ kinh.
- [ ] Thiết lập liên kết đồ thị nhân quả và Bản đồ Thần kinh Tri thức cho Kinh điển Nikaya.
- [ ] Kiểm toán và tối ưu hóa hiệu suất quét bằng TS Engine.

## 📈 Trạng thái Hiện tại
- Dự án đang ở giai đoạn: **Chuẩn bị dữ liệu đầu vào cho Trung bộ kinh Nikaya**.
- Vault đã được dọn sạch hoàn toàn tri thức cũ, cấu trúc `RULE.md` và `memory/` vẫn được bảo toàn nguyên vẹn.
