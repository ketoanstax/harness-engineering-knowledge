---
id: 202605241200-lecture-04-why-one-giant-instruction-file-fails-processed
aliases:
  - "Processed: Lecture 04 - Tại sao một file hướng dẫn khổng lồ lại thất bại"
date: 2026-05-24
type: processed-note
source_note: "[Lecture 04 Why One Giant Instruction File Fails](00_raw_docs/lecture-04-why-one-giant-instruction-file-fails.md)"
tags:
  - processed
  - harness-engineering
short_summary: "Phân tích bẫy thiết kế khi dồn tất cả các luật vào một file chỉ dẫn khổng lồ (như CLAUDE.md quá tải) và cách giải quyết bằng phân mảnh tri thức."
keywords: ['instruction-overload', 'claudemd-pitfall', 'knowledge-splitting']
---

# Processed: Lecture 04 - Tại sao một file hướng dẫn khổng lồ lại thất bại

## 🤖 AI Summary
> Phân tích bẫy thiết kế khi dồn tất cả các luật vào một file chỉ dẫn khổng lồ (như CLAUDE.md quá tải) và cách giải quyết bằng phân mảnh tri thức.

### Key Takeaways
- Dồn hàng nghìn dòng quy tắc vào một file chỉ dẫn duy nhất làm loãng context của Agent, khiến nó bỏ qua các quy tắc quan trọng nhất.
- Phải chia nhỏ quy tắc thành các phần độc lập (Atomic Nodes, Thư mục .agent/, hoặc file tài liệu chuyên đề).
- CLAUDE.md chỉ đóng vai trò là 'Hiến pháp' chứa các định hướng vĩ mô và bảng định tuyến (routing table) trỏ tới các nốt quy tắc chi tiết.

### 🔑 Keywords
- instruction-overload
- claudemd-pitfall
- knowledge-splitting

### 📝 Core Content Summary
*Dưới đây là tóm tắt nội dung cốt lõi của bài học phục vụ việc truy vấn nhanh:*
- **Vấn đề đặt ra**: Agent thường bị quá tải nhận thức do môi trường thiếu cấu trúc và bối cảnh mơ hồ.
- **Giải pháp đề xuất**: Thiết lập một khung làm việc (Harness) bao gồm các quy tắc nghiêm ngặt, cơ chế lưu trạng thái, bộ test E2E để dẫn dắt và kiểm soát hành vi của Agent.
- **Đóng góp kiến thức**: Định hình tư duy thiết kế hệ thống bao quanh Agent, thay thế cho tư duy viết prompt đơn thuần.

---

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Tài liệu gốc (Raw)**: [Lecture 04 - Tại sao một file hướng dẫn khổng lồ lại thất bại](00_raw_docs/lecture-04-why-one-giant-instruction-file-fails.md)
- **Nốt nguyên tử (Atomic Nodes)**:
  - [Atomic Node tương ứng](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md)
- **Đúc kết (Distilled)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
