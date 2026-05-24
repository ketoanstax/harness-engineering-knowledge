# Context Handoff: Triển Khai Mạng Lưới Nhân Duyên Quả Động

Tài liệu này ghi nhận quyết định thiết kế kiến trúc tri thức từ turn thảo luận của kỹ năng `ka-think` về việc áp dụng triết lý Nhân - Duyên - Quả vào hệ thống kho tri thức.

## 📅 Thông tin chung
- **Ngày thực hiện:** 2026-05-24
- **Người thiết kế:** Lead Architect (User) & AI Technical Advisor (Claude Code)
- **Mục tiêu:** Thoát khỏi tư duy cây phân cấp tuyến tính (Parent-Child) cứng nhắc, chuyển sang mạng lưới Nhân Quả động phản ánh chính xác tính tương đối của các thực thể tri thức.

## 🔒 Các Quyết Định Đã Khóa (Locked Decisions)

### 1. Cấu trúc Markdown Nhân Duyên Quả Cục Bộ (Causal Web)
Mỗi nốt nguyên tử trong `02_atomic_nodes/` sẽ thay thế phần `## 🔗 Liên kết Tri thức (Knowledge Connections)` cũ bằng mục:
```markdown
## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)
- **Nhân gốc (Causal Core):**
  - `[Tên khái niệm Nhân](02_atomic_nodes/HAE-concept-nhan-slug.md)` — Giải thích lý do trực tiếp sinh ra nốt hiện tại.
- **Hội tụ Duyên (Supporting Conditions):**
  - `[Tên khái niệm Duyên](02_atomic_nodes/HAE-concept-duyen-slug.md)` — Mô tả vai trò chất xúc tác/điều kiện môi trường.
- **Quả chuyển hóa (Derivative Effects):**
  - `[Tên khái niệm Quả](02_atomic_nodes/HAE-concept-qua-slug.md)` — Nốt hiện tại là Nhân/Duyên sinh ra Quả nào tiếp theo.
```

### 2. Giao thức Tự động Phát hiện Duyên Ẩn (AI Dynamic Discovery Protocol)
- AI Agent chủ động phân tích sự tương đồng cấu trúc và đề xuất các "Duyên ẩn" (điều kiện hỗ trợ chéo giữa các cây tri thức) cho con người duyệt thông qua chat trước khi thiết lập liên kết.

## 📊 Giả Định Thiết Kế (Documented Assumptions)
- `[ASSUMPTION-01]`: Sử dụng hệ thống thẻ `#harness-primitive` và `#harness-concept` để dễ dàng lọc trên Obsidian Graph View khi mạng lưới kết nối quá dày đặc, ngăn ngừa hiệu ứng "Hairy Ball".
- `[ASSUMPTION-02]`: Việc giải thích ngữ cảnh Nhân Quả sau dấu gạch ngang (`—`) giúp AI dễ dàng nạp bối cảnh và suy luận động mà không cần lưu trữ YAML causality cứng nhắc phức tạp.
