# 03_neural_map/RULE.md - Quy tắc Bản đồ Thần kinh Tri thức (Lớp Định Tuyến)

Quy tắc này quản lý cách cấu trúc chỉ mục phân loại và bảng định tuyến định hướng hành vi dành cho AI Agent và Con người.

## 📋 Quy tắc Cốt lõi

1. **Quản lý Chỉ mục (INDEX.md):**
   - Phân loại toàn bộ các nốt nguyên tử trong `02_atomic_nodes/` theo các chủ đề lớn (Categories).
   - Khi tạo một nốt nguyên tử mới, bắt buộc phải đăng ký nốt đó vào đúng phân mục tương ứng trong `INDEX.md`.
   - Cập nhật danh sách Thẻ Tag ở cuối INDEX.md để dễ dàng lọc trên Obsidian.

2. **Quản lý Bảng Định Tuyến AI (AI_ROUTING_TABLE.md):**
   - Bảng định tuyến được viết dưới dạng bảng Markdown.
   - Cung cấp giải pháp cho các tình huống thực tế mà AI gặp phải khi vận hành.
   - Định dạng bảng bắt buộc:
     `| Tình huống thực tế | Vấn đề / Khó khăn | Tri thức cần nạp | Hành động cụ thể của Agent |`
   - Khi có khái niệm mới bổ sung năng lực giải quyết vấn đề của Agent, bắt buộc phải cập nhật một dòng mới vào bảng định tuyến này.

3. **Cấm sử dụng ký tự thoát bảng:**
   - Trong bảng Markdown, KHÔNG được sử dụng ký tự thoát như `\|` cho các cột liên kết, vì nó sẽ phá hỏng trình phân tích cú pháp liên kết của Obsidian. Hãy viết link markdown dạng thẳng: `[INDEX](03_neural_map/INDEX.md)`.

4. **Đường dẫn Workspace-Relative:**
   - Tất cả các liên kết trong `INDEX.md` và `AI_ROUTING_TABLE.md` bắt buộc phải là đường dẫn workspace-relative không có tiền tố `../`.

---
*Bản đồ thần kinh là la bàn định hướng cho Agent. Giữ cho la bàn luôn chính xác và cập nhật.*
