---
id: HAE-concept-initialization-phase
title: "Sự Cần Thiết Của Giai Đoạn Khởi Tạo (Plan Mode)"
category: "Workflow Architecture"
tags:
  - initialization-phase
  - plan-mode
  - exploration-first
  - harness-concept
date: 2026-05-24
parent: null
---

# Sự Cần Thiết Của Giai Đoạn Khởi Tạo (Plan Mode)

## 💡 Định nghĩa & Nội dung Cốt lõi
Bắt Agent viết code hoặc sửa đổi dự án ngay lập tức khi chưa hiểu rõ bối cảnh là nguyên nhân hàng đầu gây ra lỗi hệ thống. Quy trình làm việc bắt buộc phải phân tách riêng pha Khởi tạo / Lập kế hoạch (Plan Mode) độc lập.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Pha Đọc & Tìm hiểu (Read-only Phase):**  Dành 1-3 turn đầu tiên chỉ để khám phá cấu trúc mã nguồn, định vị các tệp tin load-bearing và tìm kiếm các mẫu thiết kế sẵn có.
- **Tạo Kế hoạch trước khi Viết code:**  Yêu cầu Agent phác thảo kế hoạch sửa đổi cụ thể vào một file kế hoạch chuyên biệt và trình Con người phê duyệt trước khi gọi bất kỳ công cụ Edit/Write nào.
- **Ngăn chặn phản xạ vội vã:**  Kìm hãm thói quen tự ý sinh code tự động của LLM để đảm bảo tính nhất quán của hệ thống.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Ghi chú cấu trúc: Lecture 06 - Tại sao quá trình khởi tạo cần một giai đoạn riêng](01_structured_docs/lecture-06-why-initialization-needs-its-own-phase-processed.md)
  - [Ghi chú thô: Lecture 06 - Tại sao quá trình khởi tạo cần một giai đoạn riêng](00_raw_docs/lecture-06-why-initialization-needs-its-own-phase.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
