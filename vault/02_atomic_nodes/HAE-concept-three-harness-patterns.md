---
id: HAE-concept-three-harness-patterns
title: "3 mô hình kiến trúc Agent Deployment"
category: "Agent Architecture"
tags:
  - architecture-patterns
  - single-agent
  - supervisor
  - multi-agent
  - deployment
date: 2026-05-25
parent: harness-moat-factor80
---

# 3 mô hình kiến trúc Agent Deployment

## 💡 Định nghĩa & Nội dung Cốt lõi
Ba mô hình kiến trúc Agent cơ bản tương ứng với 3 mức độ phức tạp và yêu cầu: Single Agent với Verification Loop (80% use cases), Two-Agent Supervisor Pattern (khi chi phí của sai lầm cao), và Multi-Agent với Shared Harness Layer (khi cần cô lập domain triệt để).

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn

### Pattern 1: Single Agent + Verification Loop
- Một Agent duy nhất, một verification schema kiểm tra mọi tool action.
- Có cost ceiling, context update ở mỗi bước.
- **Khi nào dùng:** Default cho 80%+ use cases. Đơn giản, dễ debug, chi phí thấp nhất.

### Pattern 2: Two-Agent Supervisor (Anthropic Pattern)
- Agent chính thực thi, Supervisor Agent riêng review từng bước. Supervisor có thể override, yêu cầu chỉnh sửa, hoặc phê duyệt.
- Thêm latency (1 LLM call/bước), ~2x token cost.
- **Khi nào dùng:** "Khi chi phí của kết quả sai cao hơn chi phí xác minh" — báo cáo tài chính, customer-facing agent, coding agent trên production systems.
- **Best practice:** "Treat agent handoffs like shift changes at a hospital."

### Pattern 3: Multi-Agent with Shared Harness Layer
- Nhiều Agent chuyên biệt (nghiên cứu, phân tích, viết code) phối hợp qua một tầng Harness dùng chung.
- Trade-off: Complexity cao, context-switch fatigue xuất hiện (xem node Context-Switch Fatigue). Chi phí ~15x single agent.
- **Khi nào dùng:** Khi yêu cầu quá vượt khả năng single agent, hoặc cần cô lập trust boundary cứng giữa các domain.
- **Monolithic-Agent-First Rule:** Luôn bắt đầu với single agent. Chỉ split khi cần tool isolation, parallelism, hoặc trust boundaries.

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md) — Các patterns là biểu hiện kiến trúc của Harness.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md) — Cơ chế ủy quyền cho Explore/General/Verify sub-agents.
  - [Context Isolation](02_atomic_nodes/HAE-concept-context-isolation.md) — Cô lập context giữa các agent trong Multi-Agent pattern.
  - [Tool Skill Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md) — Hệ thống tool mà các Agent pattern sử dụng.

- **Quả chuyển hóa (Derivative Effects):**
  - [Context-Switch Fatigue](02_atomic_nodes/HAE-concept-context-switch-fatigue-handoff.md) — Hệ quả tiêu cực khi dùng Multi-Agent pattern không đúng cách.
  - [Kiến trúc bộ nhớ 3 tầng](02_atomic_nodes/HAE-concept-three-tier-memory-architecture.md) — Yêu cầu của Multi-Agent về quản lý state.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Structured Doc: harness-engineering-ai-processed.md](01_structured_docs/harness-engineering-ai-processed.md)
  - [Raw Doc: Phần I & II](00_raw_docs/harness-engineering-ai.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Báo cáo Tổng hợp](04_distilled/harness-engineering-ai-report.md)
