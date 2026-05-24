---
id: HAE-concept-session-continuity
title: "Bảo Toàn Tính Liên Tục Trong Tác Vụ Dài Hạn"
category: "Task Management"
tags:
  - task-continuity
  - state-loss
  - checkpoints
  - harness-concept
date: 2026-05-24
parent: null
---

# Bảo Toàn Tính Liên Tục Trong Tác Vụ Dài Hạn

## 💡 Định nghĩa & Nội dung Cốt lõi
Các tác vụ phần mềm lớn chạy trong nhiều giờ rất dễ bị đứt gãy do Agent bị mất bối cảnh (context resets) hoặc trôi bộ nhớ. Cần cơ chế lưu trạng thái phiên làm việc (Session Checkpoints) bền vững để duy trì tính liên tục.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Lưu trạng thái lên đĩa cứng:**  Ghi nhận tiến độ làm việc, các file đã thay đổi, các lỗi đang xử lý trực tiếp vào file log/checkpoint trên workspace.
- **Khởi tạo tự phục hồi:**  Khi phiên làm việc bị ngắt quãng hoặc Agent khởi động lại, bước đầu tiên của nó là đọc checkpoint và tiếp tục công việc tại điểm dừng trước đó.
- **Checklist động:**  Cập nhật danh sách công việc thời gian thực (Todo list) giúp Agent luôn biết rõ mình đã làm gì, đang làm gì và cần làm gì tiếp theo.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Instruction File Pitfall](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Initialization Phase](02_atomic_nodes/HAE-concept-initialization-phase.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) — Triển khai kỹ thuật cụ thể (JSONL append-only)
  - [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Quản lý context để duy trì liên tục

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Ghi chú cấu trúc: Lecture 05 - Tại sao các tác vụ dài hạn lại mất tính liên tục](01_structured_docs/lecture-05-why-long-running-tasks-lose-continuity-processed.md)
  - [Ghi chú thô: Lecture 05 - Tại sao các tác vụ dài hạn lại mất tính liên tục](00_raw_docs/lecture-05-why-long-running-tasks-lose-continuity.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
