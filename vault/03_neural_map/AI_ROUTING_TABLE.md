# Bảng Định Tuyến Tri Thức Dành Cho AI Agent (AI Routing Table)

Tài liệu này cung cấp bảng tra cứu nhanh (routing table) giúp AI Agent xác định chính xác nốt nguyên tử nào cần đọc để tuân thủ quy tắc khi gặp các tình huống cụ thể trong quá trình làm việc với kho tri thức Kinh điển Nikaya.

---

## 🧭 Bảng định tuyến nhanh (Quick Routing Matrix)

| Tình huống của AI | Vấn đề / Lỗi tiềm ẩn | Nốt nguyên tử hoặc Tệp tin cần đọc lập tức | Hướng xử lý chính (Duyệt theo Đồ thị ngang) |
| :--- | :--- | :--- | :--- |
| **Bắt đầu Turn mới** | Lãng quên bối cảnh người dùng, phong cách cộng tác | [memory/MEMORY.md](memory/MEMORY.md), [memory/user_profile.md](memory/user_profile.md), [memory/feedback_log.md](memory/feedback_log.md) | Đọc để nạp bộ nhớ, tránh lặp lại sai lầm đã bị feedback trước đó. |
| **Tìm hiểu một Khái niệm** | Đọc lan man, tốn token của tài liệu thô | [03_neural_map/INDEX.md](03_neural_map/INDEX.md) → Nốt tương ứng tại `02_atomic_nodes/` | Tra cứu Chỉ mục, nhảy trực tiếp tới nốt nguyên tử của khái niệm đó. |
| **Khái niệm có Causal Web** | Chưa hiểu mối liên hệ sâu với các khái niệm khác | Xem phần `## 🔗 Mạng lưới Nhân Duyên Quả` ở cuối nốt hiện tại | **Duyệt Ngang (Horizontal Traversal):** Nhảy trực tiếp tới nốt của Causal Core, Supporting, hoặc Derivative. |
| **Nốt nguyên tử thiếu chi tiết** | AI cần thêm dẫn chứng cụ thể hoặc bối cảnh lịch sử | Click link **Dẫn chứng & Nguồn gốc (Evidence & Context)** ở cuối nốt | **Duyệt Ngược Dòng:** Đọc tệp processed `01_structured_docs/{{slug}}-processed.md` để lấy bối cảnh chắt lọc. |
| **Processed doc thiếu chi tiết** | Cần câu chữ chính xác của nguyên bản bài kinh | Click link **Ghi chú thô** trong Processed doc | **Duyệt Tận Gốc:** Đọc tệp gốc `00_raw_docs/{{slug}}.md` (Hạn chế tối đa vì tốn token). |
| **Người dùng yêu cầu sửa quy tắc** | Tự ý sửa file CLAUDE.md dẫn đến mất đồng bộ | [memory/RULE.md](memory/RULE.md) | Ghi nhận feedback vào `feedback_log.md` ở dạng `pending-sync`, chạy script `scripts/sync_rules_and_memory.py`. |

---

## 🛠️ Hướng dẫn dành cho AI Agent

Khi gặp một vấn đề kỹ thuật hoặc nghi ngờ về hành vi của mình, bạn bắt buộc phải:
1. Xác định tình huống của bạn trong cột 1.
2. Áp dụng triệt để nguyên lý kỹ thuật tương ứng.
3. **Quy tắc Vàng về Token:** Không bao giờ đọc file `.md` trong `00_raw_docs/` làm bước đầu tiên. Chỉ đọc khi có liên kết ngược dòng (evidence link) trỏ về từ một nốt cụ thể và bạn thực sự cần trích dẫn nguyên văn.
