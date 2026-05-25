---
id: HAE-concept-four-governance-layers
title: "Hệ thống quản trị 4 tầng cho AI Agents (Governance Stack)"
category: "Agent Governance"
tags:
  - governance
  - pep
  - audit-trail
  - hitl
  - cost-governance
date: 2026-05-25
parent: harness-moat-factor80
---

# Hệ thống quản trị 4 tầng cho AI Agents (Governance Stack)

## 💡 Định nghĩa & Nội dung Cốt lõi
Governance của Agent khó hơn governance phần mềm truyền thống vì hành vi Agent nổi lên từ tổ hợp instructions + tools + context + LLM sampling. Giải pháp: 4 tầng phụ thuộc lẫn nhau — Identity (ai), Policy Enforcement (được làm gì), Audit Trail (đã làm gì), Human Oversight (khi nào cần người). Cost Governance là một pillar xuyên suốt.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn

- **Layer 1 — Identity & Permissions:** Mỗi Agent có principal riêng với scoped permissions. Shared service accounts/API keys bị cấm. IAM roles với resource-level policies trong AWS. Database: read-only schema users unless write needed. Automated audit hàng tháng, thu hồi permission không dùng sau 30 ngày. **Capability delegation principle**: Orchestrator không thể grant permissions nó không có.

- **Layer 2 — Policy Enforcement (PEP):** Policy Enforcement Point intercept mọi tool call trước khi thực thi. Quyết định: Allow, Deny, hoặc Escalate. **CRITICAL:** Policy rules sống bên ngoài agent context — KHÔNG phải prompt instructions. Ví dụ rule cụ thể: deny account status mod trên $50K, deny bulk operations 100+ records không sign-off, deny pricing discount trên 20%.

- **Layer 3 — Audit Trails & Explainability:** Task ID + parent context. Full execution trace (timestamps, inputs, outputs, latency). Policy decisions + LLM completions (model version, temperature, token counts). Identity chain. **Append-only log system. Agents không thể modify audit records của chính mình.**

- **Layer 4 — Human Oversight & Escalation:** Hai mode: Pre-authorization (chờ duyệt) và Post-execution review (exec ngay, auto rollback). Escalation route tới specific individuals, kèm full decision context, deadline. Auto-deny nếu không response.

- **Cost Governance:** Budget overrun là governance failure, không chỉ reliability problem. Max per task, per hour, per day. Enforced ở harness layer, không phải API settings. Baseline: $0.08/record, per-task limit 2.5x baseline ($0.20), anomaly alert ở 1.5x baseline.

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md) — Governance là một phần của Harness Engineering.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md) — Cung cấp phân quyền 3 mức cho Identity layer.
  - [Dynamic Permission Classification](02_atomic_nodes/HAE-concept-dynamic-permission-classification.md) — Phân loại quyền động cho PEP layer.
  - [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Vấn đề mà Governance stack giải quyết.
  - [Early Victory](02_atomic_nodes/HAE-concept-early-victory.md) — Cơ chế kiểm soát chất lượng bổ trợ cho Verification.
  - [E2E Testing](02_atomic_nodes/HAE-concept-e2e-testing.md) — Cung cấp evaluation cho Behavioral Drift monitoring.

- **Quả chuyển hóa (Derivative Effects):**
  - [Triển khai sản xuất 5 cổng](02_atomic_nodes/HAE-concept-five-stage-deployment.md) — Governance quyết định cách ta deploy qua các cổng.
  - [Context-Switch Fatigue Handoff](02_atomic_nodes/HAE-concept-context-switch-fatigue-handoff.md) — Multi-Agent governance liên quan tới trust boundaries.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Structured Doc: harness-engineering-ai-processed.md](01_structured_docs/harness-engineering-ai-processed.md)
  - [Raw Doc: Phần IV](00_raw_docs/harness-engineering-ai.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Báo cáo Tổng hợp](04_distilled/harness-engineering-ai-report.md)
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
