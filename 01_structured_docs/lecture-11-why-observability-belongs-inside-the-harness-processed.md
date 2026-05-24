---
id: 202605241200-lecture-11-why-observability-belongs-inside-the-harness-processed
aliases:
  - "Processed: Lecture 11 - Tại sao tính quan sát thuộc về bên trong Harness"
date: 2026-05-24
type: processed-note
source_note: "[Lecture 11 Why Observability Belongs Inside The Harness](00_raw_docs/lecture-11-why-observability-belongs-inside-the-harness.md)"
tags:
  - processed
  - harness-engineering
short_summary: "Thiết lập khả năng tự quan sát (observability) từ bên trong để theo dõi sát sao hoạt động của Agent."
keywords: ['internal-observability', 'logging', 'telemetry', 'agent-behavior']
---

# Processed: Lecture 11 - Tại sao tính quan sát thuộc về bên trong Harness

## 🤖 AI Summary
> Thiết lập khả năng tự quan sát (observability) từ bên trong để theo dõi sát sao hoạt động của Agent.

### Key Takeaways
- Phải có cơ chế lưu trữ logs, ghi nhận các lệnh shell đã chạy và các thay đổi file của Agent.
- Điều này giúp con người giám sát, phát hiện bất thường và debug hành vi của Agent dễ dàng.
- Khả năng tự quan sát giúp biến quá trình làm việc của Agent từ một chiếc 'hộp đen' thành một chiếc 'hộp kính' trong suốt.

### 🔑 Keywords
- internal-observability
- logging
- telemetry
- agent-behavior

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [Lecture 11 - Tại sao tính quan sát thuộc về bên trong Harness](00_raw_docs/lecture-11-why-observability-belongs-inside-the-harness.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-internal-observability.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
