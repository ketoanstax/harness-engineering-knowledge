---
id: 202605241200-lecture-10-why-end-to-end-testing-changes-results-processed
aliases:
  - "Processed: Lecture 10 - Tại sao kiểm thử End-to-End thay đổi kết quả"
date: 2026-05-24
type: processed-note
source_note: "[Lecture 10 Why End To End Testing Changes Results](00_raw_docs/lecture-10-why-end-to-end-testing-changes-results.md)"
tags:
  - processed
  - harness-engineering
short_summary: "Tầm quan trọng sống còn của kiểm thử End-to-End (E2E) trong việc bảo đảm chất lượng code do Agent tạo ra."
keywords: ['e2e-testing', 'code-correctness', 'regression-prevention']
---

# Processed: Lecture 10 - Tại sao kiểm thử End-to-End thay đổi kết quả

## 🤖 AI Summary
> Tầm quan trọng sống còn của kiểm thử End-to-End (E2E) trong việc bảo đảm chất lượng code do Agent tạo ra.

### Key Takeaways
- Unit test chỉ kiểm tra tính đúng đắn của hàm đơn lẻ, dễ dàng bị Agent đánh lừa bằng cách mock dữ liệu ảo.
- Kiểm thử E2E (chạy thực tế hệ thống) là thước đo tối hậu phản ánh chính xác tính năng hoạt động thật.
- Harness bắt buộc phải tích hợp và tự động chạy kiểm thử E2E sau mỗi thay đổi lớn của Agent.

### 🔑 Keywords
- e2e-testing
- code-correctness
- regression-prevention

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [Lecture 10 - Tại sao kiểm thử End-to-End thay đổi kết quả](00_raw_docs/lecture-10-why-end-to-end-testing-changes-results.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-e2e-testing.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
