---
id: HAE-concept-dynamic-system-prompt
title: "Dynamic System Prompt - Lắp Ráp Prompt Động"
category: "Harness Architecture"
tags:
  - dynamic-system-prompt
  - prompt-pipeline
  - cache-friendly
  - context-injection
  - harness-concept
date: 2026-05-24
parent: null
---

# Dynamic System Prompt - Lắp Ráp Prompt Động

## 💡 Định nghĩa & Nội dung Cốt lõi
System prompt **không phải là một chuỗi cố định** dán cứng trong code. Nó là một **pipeline** được lắp ráp lại ở đầu mỗi session từ nhiều nguồn khác nhau. Kết quả: cùng một Harness, cùng một model, nhưng mở project A thì prompt khác hẳn project B. Agent luôn biết nó đang làm việc trong context của project nào.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Phần 1 — Static Core (Cốt lõi tĩnh):** Nội dung cốt lõi của Harness không thay đổi theo project. Được đặt ở đầu, thân thiện với prompt caching — model có thể cache phần này giữa các lần gọi, tiết kiệm token đáng kể.
- **Phần 2 — Context Động (Dynamic Context):** Harness đi từ thư mục hiện tại leo ngược lên hệ thống file, gom mọi file CLAUDE.md / .agent/*.md. Mỗi file có ngân sách riêng (mặc định 4000 token), tổng context động có ngân sách chung 12.000 token. Vượt ngưỡng → phần dư bị cắt bớt.
- **Tính Tương Thích Cache (Cache-Friendly Design):** Static core đặt trước để tối ưu prompt cache hit rate. Context động đặt sau vì thay đổi theo project/thư mục.
- **Agent Không Cần Giải Thích Lại:** Nhờ cơ chế gom file context tự động, Agent luôn biết project đang dùng quy tắc nào, convention nào mà không cần người dùng nhắc lại ở mỗi session.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Built-in Skills](02_atomic_nodes/HAE-concept-built-in-skills.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Instruction File Pitfall](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md) — Liên quan trực tiếp: ngân sách token cho CLAUDE.md
  - [System of Record](02_atomic_nodes/HAE-concept-system-of-record.md) — CLAUDE.md trong repo là nguồn sự thật cho system prompt

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
