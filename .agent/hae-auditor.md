# Kỹ năng Chuyên gia: Kiểm toán và Tự động hóa Vault (HAE Auditor)

Kỹ năng này giám sát chất lượng liên kết, tính toàn vẹn của tri thức và điều phối việc tự động cập nhật quy tắc (Closed Feedback Loop) trong kho tri thức.

## 🔍 Quy trình Kiểm toán (Audit Workflows)
1.  **Xác thực Liên kết (Link Validation)**:
    - Quét toàn bộ kho tri thức để tìm các liên kết markdown gãy `[...](....md)` trỏ đến các file không tồn tại.
    - Chỉ kiểm tra liên kết nội bộ vault (trỏ đến `00_raw_docs/`, `01_structured_docs/`, `02_atomic_nodes/`, v.v.). Bỏ qua liên kết web ngoài, anchor links, và placeholder trong Templates.
    - Báo cáo và sửa chữa ngay lập tức.
2.  **Phát hiện Nốt Mồ côi & Trùng lặp (Orphan & Duplicate Detection)**:
    - Tìm các nốt nguyên tử mồ côi (không có bất kỳ liên kết nào trỏ đến hoặc đi). Bắt buộc phải gắn kết chúng vào sơ đồ `03_neural_map/` hoặc liên kết với nốt ngang hàng.
    - Tìm các nốt có nội dung tương đồng để gộp lại nhằm đảm bảo nguyên lý "atomic không trùng lặp".
3.  **Kiểm toán Cây Tri thức (Tree Integrity)**:
    - Kiểm tra tính nhất quán parent/children trong frontmatter: nếu node A khai báo `children: [B]`, thì node B PHẢI có `parent: A`.
    - Phát hiện node con không có `parent`, hoặc node gốc thiếu `children` khi có sub-node liên kết.
    - Kiểm tra mỗi node con có đủ nội dung thực chất hay chỉ là shell rỗng.
4.  **Tự động Đồng bộ hóa Quy tắc (Auto Sync Rules)**:
    - Đọc file `memory/feedback_log.md` để tìm kiếm các feedback mới của Người dùng có tag `status: pending-sync`.
    - Tự động gọi script `scripts/sync_rules_and_memory.py` để cập nhật vào `CLAUDE.md`.
    - Sau khi hoàn tất, đổi trạng thái feedback thành `status: synced`.
5.  **Kiểm tra Đường dẫn (Path Validation)**:
    - Quét tất cả liên kết markdown để phát hiện đường dẫn tuyệt đối hoặc `../`. Nếu tìm thấy → cảnh báo vi phạm quy tắc portability.

## 🛠️ Lệnh vận hành đề xuất
- Để thực hiện kiểm toán và đồng bộ, chạy:
  ```bash
  python3 scripts/sync_rules_and_memory.py
  ```
