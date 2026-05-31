# memory/RULE.md - Quy tắc Vận hành Bộ nhớ Cộng tác

Quy tắc này quản lý cách ghi nhận, lưu trữ thông tin người dùng, bối cảnh dự án và vận hành Vòng lặp phản hồi khép kín (Closed Feedback Loop) để tự động hóa tiến hóa quy tắc.

## 📋 Quy tắc Cốt lõi

### 1. Trách nhiệm của Agent đối với Bộ Nhớ
Trước khi bắt đầu bất kỳ Turn nào, Agent bắt buộc phải:
1. Đọc chỉ mục `memory/MEMORY.md` và `memory/user_profile.md` để hiểu người dùng là ai, phong cách cộng tác thế nào.
2. Đọc tệp `memory/feedback_log.md` để cập nhật các bài học từ phiên chat trước để tránh phạm lại sai lầm cũ.
3. Đọc tệp `memory/project_context.md` để nắm được roadmap và trạng thái hiện tại của dự án.

### 2. Vận hành Vòng Lặp Phản Hồi Tự Động (Closed Feedback Loop)
- **Ghi nhận phản hồi ngay lập tức:** Khi người dùng đưa ra chỉ dẫn, sửa lỗi hoặc quy định mới trong chat, Agent phải lập tức ghi nhận vào file `memory/feedback_log.md` dưới trạng thái `status: pending-sync`.
- **Cấm tự ý sửa thủ công CLAUDE.md:** Mọi quy tắc phát sinh từ chat tuyệt đối không được sửa thủ công vào `CLAUDE.md` ở root. Phải thông qua script tự động.
- **Chạy Script Đồng bộ:** Chạy lệnh `python3 scripts/sync_rules_and_memory.py` để quét `feedback_log.md` và tự động cập nhật quy tắc vào `CLAUDE.md` hoặc các tệp `RULE.md` cục bộ liên quan, sau đó đổi trạng thái quy tắc sang `synced`.

### 3. Bảo vệ tính di động (Portability)
- Tuyệt đối không lưu trữ các thông tin môi trường mang tính tuyệt đối (đường dẫn ổ đĩa cục bộ, key bí mật) vào trong thư mục memory. Chỉ lưu trữ tri thức cộng tác và bối cảnh dự án.

---
*Bộ nhớ giúp AI Agent không bị lãng quên và đồng hành cùng con người như một đồng nghiệp thực thụ qua nhiều tháng làm việc.*
