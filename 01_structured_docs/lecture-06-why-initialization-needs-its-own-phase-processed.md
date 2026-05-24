---
id: 202605241200-lecture-06-why-initialization-needs-its-own-phase-processed
aliases:
  - "Processed: Lecture 06 - Tại sao quá trình khởi tạo cần một giai đoạn riêng"
date: 2026-05-24
type: processed-note
source_note: "[Lecture 06 Why Initialization Needs Its Own Phase](00_raw_docs/lecture-06-why-initialization-needs-its-own-phase.md)"
tags:
  - processed
  - harness-engineering
short_summary: "Tầm quan trọng của việc phân tách giai đoạn khởi tạo/lập kế hoạch (Plan Mode) thành một bước độc lập trước khi viết code."
keywords: ['initialization-phase', 'plan-mode', 'exploration-first']
---

# Processed: Lecture 06 - Tại sao quá trình khởi tạo cần một giai đoạn riêng

## 🤖 AI Summary
> Tầm quan trọng của việc phân tách giai đoạn khởi tạo/lập kế hoạch (Plan Mode) thành một bước độc lập trước khi viết code.

### Key Takeaways
- Bắt Agent code ngay lập tức khi chưa hiểu rõ dự án là nguyên nhân hàng đầu gây ra code rác và phá vỡ cấu trúc có sẵn.
- Bắt buộc phải có một pha khởi tạo (Initialization/Plan Mode) để Agent khám phá mã nguồn, định hình thiết kế và được Con người phê duyệt.
- Giai đoạn này là hoàn toàn đọc (Read-only) và viết kế hoạch, tuyệt đối không được sửa đổi mã nguồn sản phẩm.

### 🔑 Keywords
- initialization-phase
- plan-mode
- exploration-first

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [Lecture 06 - Tại sao quá trình khởi tạo cần một giai đoạn riêng](00_raw_docs/lecture-06-why-initialization-needs-its-own-phase.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-initialization-phase.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
