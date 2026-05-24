---
id: HAE-concept-system-of-record
title: "Repository là Nguồn Sự Thật Duy Nhất (System of Record)"
category: "Harness Core Concept"
tags:
  - system-of-record
  - git-truth
  - context-preservation
  - harness-concept
date: 2026-05-24
parent: null
---

# Repository là Nguồn Sự Thật Duy Nhất (System of Record)

## 💡 Định nghĩa & Nội dung Cốt lõi
Lịch sử trò chuyện (Chat history) là tạm thời và sẽ bị nén hoặc mất đi. Git Repository của dự án phải là nguồn lưu trữ tri thức và bối cảnh vĩnh viễn (System of Record) cho cả Con người và AI Agent.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Quy tắc và tri thức tự giải thích:**  Bất kỳ quy định đặc thù, quyết định thiết kế hay bài học xương máu nào cũng phải được commit trực tiếp vào repository (dưới dạng CLAUDE.md hoặc tài liệu khác).
- **Môi trường là bối cảnh:**  Trạng thái hiện tại của thư mục làm việc (mã nguồn, file config) phản ánh chính xác nhất thực tế mà Agent nhìn thấy. Không dùng chat làm nơi chứa tài liệu tham khảo dài lâu.
- **Tự động nạp bối cảnh:**  Khi bắt đầu một phiên làm việc mới, Agent chỉ cần quét thư mục hiện hành là có thể hiểu ngay cấu trúc dự án và quy tắc làm việc mà không cần nhắc lại.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Instruction File Pitfall](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md) — CLAUDE.md trong repo là nguồn sự thật cho prompt
  - [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) — JSONL file là nguồn sự thật cho session

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Ghi chú cấu trúc: Lecture 03 - Tại sao Repository phải trở thành Nguồn sự thật](01_structured_docs/lecture-03-why-the-repository-must-become-the-system-of-record-processed.md)
  - [Ghi chú thô: Lecture 03 - Tại sao Repository phải trở thành Nguồn sự thật](00_raw_docs/lecture-03-why-the-repository-must-become-the-system-of-record.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
