# Kỹ năng Chuyên gia: Viết và Cấu trúc hóa Note (HAE Writer)

Kỹ năng này chịu trách nhiệm sinh ra các nốt tri thức nguyên tử (`02_atomic_nodes/`) và ghi chú cấu trúc (`01_structured_docs/`) đúng định dạng Obsidian, súc tích và có tính kết nối cao.

## ✍️ Quy tắc Soạn thảo Atomic Nodes
1.  **Tính Đơn nhất (Singularity)**: Một nốt nguyên tử chỉ được giải thích MỘT khái niệm duy nhất. Nếu xuất hiện khái niệm thứ hai, bắt buộc phải tách ra nốt mới.
2.  **Định dạng Tên Tệp**: Sử dụng tiền tố `HAE-concept-` theo sau là slug viết thường, nối nhau bằng dấu gạch ngang (ví dụ: `HAE-concept-system-of-record.md`).
3.  **Cực kỳ Cô đọng (Terse & High Density)**:
    - Loại bỏ toàn bộ từ ngữ thừa thãi.
    - Dùng bullet-point để tóm tắt thông tin kỹ thuật.
    - Đi thẳng vào nguyên lý và giải pháp vận hành.
4.  **Mạng lưới Nhân Duyên Quả (Causal Web) làm Mặc định**:
    - BẮT BUỘC chèn mục `## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)` ở cuối nốt nguyên tử.
    - Phân tách liên kết chéo động theo đúng 3 nhóm: Nhân gốc (Causal Core), Hội tụ Duyên (Supporting Conditions), Quả chuyển hóa (Derivative Effects).
    - Mọi liên kết chéo phải kèm theo giải thích bối cảnh Nhân Quả sau dấu gạch ngang (`—`).

## 🌳 Quy tắc Cây Mở Rộng (Tree Expansion Rules)
5.  **Lưu trữ Phẳng (Flat Storage)**: Tất cả node (gốc lẫn con) lưu PHẲNG trong `02_atomic_nodes/`. Quan hệ cha-con chỉ thể hiện bằng link và metadata frontmatter. KHÔNG tạo thư mục con.
6.  **Frontmatter Parent/Children**:
    - Node gốc: khai báo `parent: null` và `children: [slug-1, slug-2]`
    - Node con: khai báo `parent: slug-cha` và có thể có `children` riêng nếu cần chia sâu hơn. Sử dụng SLUG thuần túy (không có `HAE-concept-` hay `.md`).
7.  **Chia Node Có Chủ Đích**: Chỉ tạo sub-node khi nội dung node gốc đủ phức tạp. Nếu đơn giản → giải thích ngay trong node gốc là đủ. Tránh tạo node rỗng hoặc quá mỏng nội dung.
8.  **Mục Sub-Nodes trong Node Gốc**: Nếu node có children, thêm section `## 🌳 Nốt con (Sub-Nodes)` với danh sách liên kết đến các node con kèm mô tả ngắn.
9.  **Kết nối chéo Động**: Không dùng các liên kết ngang hàng (peer links) tĩnh. Thay vào đó, gộp vào mục Causal Web để thể hiện vai trò tương đối của liên kết (Nhân hay Duyên hay Quả) đối với ngữ cảnh hiện tại.

## 🔗 Quy tắc Đường Dẫn & Thẻ Tag
10. **Workspace-Relative Only**: Chỉ dùng đường dẫn tương đối từ gốc vault. KHÔNG bao giờ dùng đường dẫn tuyệt đối hoặc `../`.
    - ✅ `02_atomic_nodes/HAE-concept-outer-loop.md`
    - ❌ `/home/user/vault/02_atomic_nodes/HAE-concept-outer-loop.md`
    - ❌ `../02_atomic_nodes/HAE-concept-outer-loop.md`
11. **Gắn thẻ Tag thông minh**: Sử dụng `#harness-primitive` cho các Duyên công cụ/tiền đề kỹ thuật và `#harness-concept` cho các nốt tư duy/quy trình để hỗ trợ người dùng lọc Graph View chống hiệu ứng "Hairy Ball".

## 📋 Quy tắc Soạn thảo Structured Docs
- Trích xuất 3 thông tin bắt buộc:
  - `short_summary`: Tóm tắt 1 câu dành cho AI.
  - `ai_summary`: Tóm tắt cấu trúc chi tiết.
  - `keywords`: Bộ từ khóa thẻ tag để phân loại tri thức.
