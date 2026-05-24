---
id: 202605241200-lecture-07-why-agents-overreach-and-under-finish-processed
aliases:
  - "Processed: Lecture 07 - Tại sao Agent làm quá giới hạn và chưa hoàn thành"
date: 2026-05-24
type: processed-note
source_note: "[Lecture 07 Why Agents Overreach And Under Finish](00_raw_docs/lecture-07-why-agents-overreach-and-under-finish.md)"
tags:
  - processed
  - harness-engineering
short_summary: "Cách khống chế hành vi tự ý sửa đổi tràn lan ngoài phạm vi (overreach) và tình trạng để lại code dang dở (under-finish) của Agent."
keywords: ['agent-overreach', 'blast-radius', 'incomplete-tasks']
---

# Processed: Lecture 07 - Tại sao Agent làm quá giới hạn và chưa hoàn thành

## 🤖 AI Summary
> Cách khống chế hành vi tự ý sửa đổi tràn lan ngoài phạm vi (overreach) và tình trạng để lại code dang dở (under-finish) của Agent.

### Key Takeaways
- Agent có xu hướng tự ý refactor các file không liên quan hoặc sửa đổi vượt quá blast radius cho phép.
- Ngược lại, Agent hay để lại các bình luận dạng '// TODO: implement later' khiến tính năng chưa thực sự hoàn thành.
- Harness phải áp đặt giới hạn nghiêm ngặt (chỉ sửa các file được phép) và cấm tuyệt đối việc để lại code rỗng hoặc code dang dở.

### 🔑 Keywords
- agent-overreach
- blast-radius
- incomplete-tasks

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [Lecture 07 - Tại sao Agent làm quá giới hạn và chưa hoàn thành](00_raw_docs/lecture-07-why-agents-overreach-and-under-finish.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-agent-overreach.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
