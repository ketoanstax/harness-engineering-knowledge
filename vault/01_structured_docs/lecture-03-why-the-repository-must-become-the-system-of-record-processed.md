---
id: 202605241200-lecture-03-why-the-repository-must-become-the-system-of-record-processed
aliases:
  - "Processed: Lecture 03 - Tại sao Repository phải trở thành Nguồn sự thật"
date: 2026-05-24
type: processed-note
source_note: "[Lecture 03 Why The Repository Must Become The System Of Record](00_raw_docs/lecture-03-why-the-repository-must-become-the-system-of-record.md)"
tags:
  - processed
  - harness-engineering
short_summary: "Lý giải tại sao toàn bộ lịch sử, cấu trúc và tri thức dự án phải nằm trực tiếp trong Git Repository của dự án."
keywords: ['system-of-record', 'git-truth', 'ephemeral-chats', 'documentation']
---

# Processed: Lecture 03 - Tại sao Repository phải trở thành Nguồn sự thật

## 🤖 AI Summary
> Lý giải tại sao toàn bộ lịch sử, cấu trúc và tri thức dự án phải nằm trực tiếp trong Git Repository của dự án.

### Key Takeaways
- Chat history là tạm thời và sẽ bị nén hoặc mất đi. Repository (Git) mới là nguồn lưu trữ tri thức vĩnh viễn (System of Record).
- Mọi quyết định thiết kế, quy tắc code và ngữ cảnh bắt buộc phải được commit trực tiếp vào mã nguồn dưới dạng CLAUDE.md hoặc các file tài liệu.
- Agent hoạt động dựa trên trạng thái repository hiện tại. Nếu repository không tự giải thích chính nó, Agent sẽ đoán mò và gây lỗi.

### 🔑 Keywords
- system-of-record
- git-truth
- ephemeral-chats
- documentation

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [Lecture 03 - Tại sao Repository phải trở thành Nguồn sự thật](00_raw_docs/lecture-03-why-the-repository-must-become-the-system-of-record.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-system-of-record.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
