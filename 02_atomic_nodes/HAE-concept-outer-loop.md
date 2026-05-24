---
id: HAE-concept-outer-loop
title: "Outer Loop - Trái Tim Của Mọi Harness"
category: "Harness Architecture"
tags:
  - outer-loop
  - agent-loop
  - model-invocation
  - harness-core
  - harness-concept
date: 2026-05-24
parent: null
---

# Outer Loop - Trái Tim Của Mọi Harness

## 💡 Định nghĩa & Nội dung Cốt lõi
Outer Loop (Vòng lặp ngoài) là vòng lặp trung tâm và là **nơi DUY NHẤT trong toàn bộ Harness được phép gọi model**. Cấu trúc: Khi chưa xong → Model suy nghĩ → Model gọi tool → Đọc kết quả → Nghĩ tiếp → Lặp lại cho tới khi model tự trả về stop reason. Không có thành phần nào khác (Context Manager, Permission, Hook) được phép gọi model trực tiếp.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Nguyên tắc Điểm Gọi Duy Nhất (Single Invocation Point):** Tập trung toàn bộ logic gọi model về một chỗ giúp kiểm soát được token count, retry logic và hook execution. Quan trọng nhất: có một điểm duy nhất để dò lỗi khi mọi thứ trục trặc.
- **Kiến trúc Phục Vụ (Service Architecture):** Mọi thành phần khác (context, tool, permission, hook) đều tồn tại để phục vụ vòng lặp này chạy lâu hơn và an toàn hơn. Đây là lý do Harness có kiến trúc đúng như nó đang có.
- **Giới hạn Bước Lặp (Step Limit):** Vòng lặp có giới hạn tối đa (ví dụ 100 bước). Vượt quá mà chưa xong → báo lỗi timeout, tránh Agent chạy vô hạn.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Tool Skill Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md) — Định nghĩa tổng thể Harness
  - [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Outer Loop cần duy trì liên tục

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
