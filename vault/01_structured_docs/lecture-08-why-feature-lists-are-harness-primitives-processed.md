---
id: 202605241200-lecture-08-why-feature-lists-are-harness-primitives-processed
aliases:
  - "Processed: Lecture 08 - Tại sao Feature List là nguyên lý cốt lõi của Harness"
date: 2026-05-24
type: processed-note
source_note: "[Lecture 08 Why Feature Lists Are Harness Primitives](00_raw_docs/lecture-08-why-feature-lists-are-harness-primitives.md)"
tags:
  - processed
  - harness-engineering
short_summary: "Định nghĩa Feature List như một thực thể nguyên thủy tối quan trọng trong Harness để dẫn dắt hành vi của Agent."
keywords: ['feature-list', 'task-tracking', 'primitives', 'alignment']
---

# Processed: Lecture 08 - Tại sao Feature List là nguyên lý cốt lõi của Harness

## 🤖 AI Summary
> Định nghĩa Feature List như một thực thể nguyên thủy tối quan trọng trong Harness để dẫn dắt hành vi của Agent.

### Key Takeaways
- Feature List (danh mục tính năng) là bản đồ dẫn đường cho Agent. Nó định nghĩa rõ trạng thái: Chưa làm, Đang làm, Đã xong.
- Mỗi turn làm việc, Agent chỉ được phép tập trung vào đúng 1 task duy nhất trong Feature List ở trạng thái `in_progress`.
- Việc duy trì Feature List trực quan giúp cả Con người và Agent có sự đồng thuận tuyệt đối về tiến độ dự án.

### 🔑 Keywords
- feature-list
- task-tracking
- primitives
- alignment

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [Lecture 08 - Tại sao Feature List là nguyên lý cốt lõi của Harness](00_raw_docs/lecture-08-why-feature-lists-are-harness-primitives.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-feature-list-primitive.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
