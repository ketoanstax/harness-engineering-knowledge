---
id: HAE-concept-six-harness-layers
title: "6 lớp kiến trúc Harness cho AI Agents"
category: "Harness Components"
tags:
  - harness-layers
  - architecture
  - harness-definition
date: 2026-05-25
parent: harness-moat-factor80
---

# 6 lớp kiến trúc Harness cho AI Agents

## 💡 Định nghĩa & Nội dung Cốt lõi
Một Agent Harness hiện đại gồm 6 lớp hạ tầng xếp tầng, được chia thành 2 nhóm: **Foundation Layer** (3 lớp nền tảng) quản lý năng lực hoạt động của Agent, và **Safety Layer** (3 lớp an toàn) kiểm soát và bảo vệ. 6 lớp này tạo thành khung sườn hoàn chỉnh cho bất kỳ Harness production nào.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn

### Foundation Group (Nhóm Hạ tầng Nền tảng)
- **Context Engineering:** Quản lý chính xác thông tin mô hình thấy ở mỗi bước — system prompt, retrieval, lịch sử, trạng thái môi trường. Chủ động prune/tóm tắt để tránh tràn context window. Dữ liệu: Vercel giảm 15 tool xuống 2 -> accuracy 80% lên 100%, token giảm 37%.
- **Tool Orchestration:** Kiểm soát tool nào được dùng ở phase nào, argument validation, sandboxing, timeouts, error handling. Constraint tool set per step giảm lỗi và token waste. Mỗi tool gọi đi kèm input validation, output parsing và timeout.
- **State & Memory Management:** Durable checkpoint-resume để agent phục hồi sau crash, cộng cross-session memory. Giảm 30-50% token cost khi phục hồi từ checkpoint thay vì chạy lại từ đầu.

### Safety Group (Nhóm An toàn)
- **Verification & Safety:** Post-output checks trước khi real-world action — schema validation, test execution, failure-triggered retry hoặc escalation. Là "single highest-ROI component" (một team tăng 83% lên 96% task completion chỉ nhờ verification, model không đổi).
- **Human-in-the-Loop:** Approval gates cho destructive/financial/external actions. Hai chế độ: Pre-authorization (chờ duyệt trước) và Post-execution review (tự động rollback sau). Calibrated theo reversibility-impact matrix.
- **Lifecycle Management:** Health checks, resource limits, graceful shutdown, crash recovery. Đối xử với agent như long-running production processes.

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md) — 6 layers là sự triển khai chi tiết của khái niệm Harness.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) — Cung cấp vòng lặp giao tiếp thô với LLM cho Context Engineering.
  - [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Cung cấp cơ chế quản lý context window.
  - [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md) — Cung cấp hệ thống phân quyền cho Safety Group.
  - [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) — Cung cấp cơ chế lưu trữ bền vững.
  - [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — Cung cấp 4 hook lifecycle cho Lifecycle Management.

- **Quả chuyển hóa (Derivative Effects):**
  - [Triển khai sản xuất 5 cổng](02_atomic_nodes/HAE-concept-five-stage-deployment.md) — Các layer quyết định cách ta deploy agent qua 5 cổng.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Structured Doc: harness-engineering-ai-processed.md](01_structured_docs/harness-engineering-ai-processed.md)
  - [Raw Doc: Phần II](00_raw_docs/harness-engineering-ai.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Báo cáo Tổng hợp](04_distilled/harness-engineering-ai-report.md)
