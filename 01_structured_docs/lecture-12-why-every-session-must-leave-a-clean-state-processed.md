---
id: 202605241200-lecture-12-why-every-session-must-leave-a-clean-state-processed
aliases:
  - "Processed: Lecture 12 - Tại sao mỗi phiên làm việc phải để lại trạng thái sạch"
date: 2026-05-24
type: processed-note
source_note: "[Lecture 12 Why Every Session Must Leave A Clean State](00_raw_docs/lecture-12-why-every-session-must-leave-a-clean-state.md)"
tags:
  - processed
  - harness-engineering
short_summary: "Nguyên lý dọn dẹp môi trường sạch sẽ sau mỗi phiên làm việc để tránh rác tích tụ gây ảnh hưởng phiên tiếp theo."
keywords: ['clean-state', 'session-cleanup', 'git-clean', 'reproducibility']
---

# Processed: Lecture 12 - Tại sao mỗi phiên làm việc phải để lại trạng thái sạch

## 🤖 AI Summary
> Nguyên lý dọn dẹp môi trường sạch sẽ sau mỗi phiên làm việc để tránh rác tích tụ gây ảnh hưởng phiên tiếp theo.

### Key Takeaways
- Để lại các file tạm, tiến trình chạy ngầm hoặc file rác trong workspace sẽ làm nhiễu nhận thức của Agent ở phiên tiếp theo.
- Bắt buộc phải dọn dẹp môi trường (giết các tiến trình thừa, xóa file tạm, khôi phục các file không liên quan).
- Mỗi phiên làm việc của Agent phải kết thúc ở một trạng thái Git sạch sẽ và ổn định.

### 🔑 Keywords
- clean-state
- session-cleanup
- git-clean
- reproducibility

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [Lecture 12 - Tại sao mỗi phiên làm việc phải để lại trạng thái sạch](00_raw_docs/lecture-12-why-every-session-must-leave-a-clean-state.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-clean-state.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
