---
id: HAE-concept-five-stage-deployment
title: "Quy trình triển khai sản xuất 5 cổng (5-Gate Deployment)"
category: "Agent Deployment"
tags:
  - deployment
  - production
  - shadow-mode
  - canary
  - rollout
date: 2026-05-25
parent: harness-moat-factor80
---

# Quy trình triển khai sản xuất 5 cổng (5-Gate Deployment)

## 💡 Định nghĩa & Nội dung Cốt lõi
Một quy trình triển khai Agent an toàn gồm 5 cổng (gates) bắt buộc: Evaluation (đánh giá nền tảng) -> Shadow Mode (chạy song song, không deliver) -> Canary (5% traffic, 48h) -> Graduated Rollout (25% -> 50% -> 100%) -> Post-Deployment Validation (giám sát 1 tuần). Không giống deployment phần mềm truyền thống, Agent deployment cần statistical evaluation patterns vì hành vi stochastic của Agent.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn

1. **Evaluation:** Kiểm tra baseline accuracy với 3 loại input: (a) câu hỏi thông thường, (b) câu hỏi biên (edge case), (c) câu hỏi độc hại. Cả con người và tự động.

2. **Shadow Mode:** Chạy Agent với production traffic thật nhưng KHÔNG deliver output cho người dùng. So sánh hành vi giữa Agent mới và cũ.

3. **Canary:** 5% traffic -> Agent mới, 48h quan sát. Metric quan trọng: task completion rate, latency, cost, tool call success rate, escalation frequency.

4. **Graduated Rollout:** Tăng dần: 25% -> 50% -> 100%, mỗi mức giữ tối thiểu 24h.

5. **Post-Deployment Validation:** Giám sát chặt 1 tuần để phát hiện behavioral drift (thay đổi hành vi từ từ mà không ai thấy).

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md) — Harness Engineering định nghĩa cách ta deploy Agent.

- **Hội tụ Duyên (Supporting Conditions):**
  - [E2E Testing](02_atomic_nodes/HAE-concept-e2e-testing.md) — Cung cấp test framework cho Evaluation gate.
  - [Clean State](02_atomic_nodes/HAE-concept-clean-state.md) — Quản lý trạng thái sạch giữa các lần deploy.
  - [Internal Observability](02_atomic_nodes/HAE-concept-internal-observability.md) — Cung cấp metrics cho Post-Deployment Validation.
  - [4 tầng Governance](02_atomic_nodes/HAE-concept-four-governance-layers.md) — Shadow mode yêu cầu governance framework.

- **Quả chuyển hóa (Derivative Effects):**
  - [Chỉ số đo lường hiệu quả](02_atomic_nodes/HAE-concept-harness-quantified-metrics.md) — 5-Gate cho ra số liệu để đo lường.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Structured Doc: harness-engineering-ai-processed.md](01_structured_docs/harness-engineering-ai-processed.md)
  - [Raw Doc: Phần V](00_raw_docs/harness-engineering-ai.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Báo cáo Tổng hợp](04_distilled/harness-engineering-ai-report.md)
