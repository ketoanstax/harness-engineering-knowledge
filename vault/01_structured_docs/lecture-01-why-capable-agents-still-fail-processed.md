---
id: 202605241200-lecture-01-why-capable-agents-still-fail-processed
aliases:
  - "Processed: Lecture 01 - Tại sao các Agent mạnh vẫn thất bại"
date: 2026-05-24
type: processed-note
source_note: "[Lecture 01 Why Capable Agents Still Fail](00_raw_docs/lecture-01-why-capable-agents-still-fail.md)"
tags:
  - processed
  - harness-engineering
short_summary: "Phân tích nguyên nhân tại sao các AI Agent cực kỳ mạnh mẽ (như Claude 3.5 Sonnet) vẫn thất bại trong các tác vụ thực tế."
keywords: ['agent-failures', 'cognitive-load', 'harness-concept']
---

# Processed: Lecture 01 - Tại sao các Agent mạnh vẫn thất bại

## 🤖 AI Summary
> Phân tích nguyên nhân tại sao các AI Agent cực kỳ mạnh mẽ (như Claude 3.5 Sonnet) vẫn thất bại trong các tác vụ thực tế.

### Key Takeaways
- Agent thất bại không phải vì mô hình LLM yếu, mà vì bối cảnh xung quanh quá lớn hoặc quá mơ hồ, dẫn đến quá tải nhận thức (cognitive overload).
- Thiếu các neo phản hồi (feedback loops) và điểm neo trực quan để Agent biết mình đang ở đâu và đã làm gì.
- Vai trò của Harness là giải tỏa áp lực nhận thức cho Agent bằng cách cấu trúc hóa môi trường làm việc.

### 🔑 Keywords
- agent-failures
- cognitive-load
- harness-concept

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [Lecture 01 - Tại sao các Agent mạnh vẫn thất bại](00_raw_docs/lecture-01-why-capable-agents-still-fail.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-harness-definition.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
