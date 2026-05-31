# Bối cảnh & Trạng thái Dự án (Project Context & Status)

## 📌 Tổng quan Dự án
Xây dựng một kho tri thức chuẩn mực (Obsidian Vault) về **Harness Engineering** dựa trên nhiều nguồn:
- Giáo trình tiếng Việt: https://walkinglabs.github.io/learn-harness-engineering/vi/ (13 bài giảng)
- Video transcript: 9 thành phần lõi của Harness hiện đại (`harness-temp.md`)
- Các nguồn bổ sung trong tương lai (paper, thảo luận, dự án thực tế...)

**Triết lý trung tâm**: *"Framework viết cho lập trình viên. Harness viết cho AI."*

## 📊 Thống kê Vault Hiện tại
- **00_raw_docs/**: 14 file (13 bài giảng + 1 video transcript)
- **01_structured_docs/**: 14 file processed
- **02_atomic_nodes/**: 26 nốt nguyên tử (11 từ khóa học gốc + 9 root nodes + 6 sub-nodes từ video transcript)
- **03_neural_map/**: INDEX.md + AI_ROUTING_TABLE.md (đã cập nhật)
- **04_distilled/**: Tuyên ngôn Harness Engineering (đã cập nhật gồm cả 9 Components + Harness vs Framework)
- **Tổng liên kết**: 70+ file markdown, 1 placeholder link (Template — bình thường)

## 🗺️ Lộ trình Phát triển (Roadmap)
- [x] Thiết lập cấu trúc thư mục 2 chữ số và các Templates.
- [x] Tạo hệ thống RULE (`CLAUDE.md`), SKILL (`.agent/`), MEMORY (`memory/`).
- [x] Xây dựng script tự động đồng bộ hóa `scripts/sync_rules_and_memory.py`.
- [x] Fetch dữ liệu 13 bài học từ website và tạo Layer 1 & Layer 2.
- [x] Phân rã tri thức và thiết lập 11 Nốt nguyên tử ban đầu.
- [x] Thiết kế Bản đồ Thần kinh Tri thức (`03_neural_map/`).
- [x] Viết Tuyên ngôn Harness Engineering (`04_distilled/`).
- [x] Xử lý `harness-temp.md` qua pipeline → 9 root nodes + 6 sub-nodes (Tree Expansion Model).
- [x] Thiết lập liên kết chéo giữa 2 cây tri thức (khóa học gốc ↔ video transcript).
- [ ] **Cập nhật bộ 3 RULE/SKILL/MEMORY** với các bài học rút ra từ 2 phiên làm việc (7 quy tắc mới FB-005→FB-011).
- [ ] Xử lý nguồn dữ liệu thô tiếp theo (nếu có) theo mô hình Tree Expansion.
- [ ] Script kiểm toán nâng cao: phát hiện quan hệ parent/children không nhất quán.
- [ ] Chuẩn bị cấu trúc gộp vault (Multi-Vault Merge) trong tương lai.

## 📈 Trạng thái Hiện tại
- Dự án đang ở giai đoạn: **Cập nhật bộ 3 RULE/SKILL/MEMORY** với 7 quy tắc mới phát sinh.
- Vault đã có 2 "cây tri thức" hoạt động song song và liên kết chéo:
  - Cây 1: 13 bài giảng → 11 atomic nodes (Harness Engineering Principles)
  - Cây 2: Video transcript → 9 root + 6 sub-nodes (9 Core Harness Components)
