---
id: HAE-concept-context-switch-fatigue-handoff
title: "Context-Switch Fatigue và Structured Handoff Schema trong Multi-Agent"
category: "Agent Architecture"
tags:
  - context-switch-fatigue
  - handoff
  - multi-agent
  - context-loss
date: 2026-05-25
parent: harness-moat-factor80
---

# Context-Switch Fatigue và Structured Handoff Schema trong Multi-Agent

## 💡 Định nghĩa & Nội dung Cốt lõi
Context-Switch Fatigue là **sự suy giảm thông tin thầm lặng (silent degradation)** khi execution chuyển qua nhiều Agent trong pipeline. Không giống crash hay error, degradation này vô hình — task hoàn thành nhưng kết quả sai vì user intent gốc bị bóp méo dần. "Mỗi hop chỉ có thể MẤT thông tin, không bao giờ THU HỒI lại." Giải pháp không nằm ở prompt engineering mà ở harness-level mitigations.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn

### Hai loại mất mát
- **Token context loss:** Model quên. Thông tin ngầm định, ràng buộc tinh tế, ý định gốc.
- **Operational context loss:** Harness quên. Trạng thái orchestration (locked tools, rejected branches, decision rationale, data provenance).

### Anatomy of a Handoff (8 bước, 4 điểm entropy)
1. Parent emits task
2. SERIALIZATION (1) — thông tin bị truncate
3. Message queue
4. Child bootstrap
5. CONTEXT RECONSTRUCTION (2) — bị distortion khi reconstruct
6. Execution
7. RESULT MARSHALING (3) — decision rationale bị mất
8. PARENT RE-INGESTION (4) — implicit assumptions bị lost

### Structured Handoff Schema (AgentHandoff dataclass)
Thay thế "here's what happened so far" dạng văn xuôi bằng data object có schema version:
- `chain_id` + `hop_number` + `source_agent_id`
- `original_goal` (verdict: GIỮ NGUYÊN VẸN — không diễn giải)
- `decisions_made` (quyết định + lý do)
- `open_assumptions` (các giả định cần biết)
- `tool_state_snapshot` (khóa tool nào, resources nào đang hold)
- `schema_version` (versioning như API contract)

### Mitigations
- **Goal-echo:** Mỗi Agent đọc original_goal VERBATIM trước task description.
- **Fidelity checkpoint:** Agent nhẹ ở hop 3, score semantic similarity với original goal. Alert nếu dưới 0.85.
- **Circuit Breaker:** Dừng chain nếu vượt hop threshold không có human checkpoint.
- **Context Re-Injection Middleware:** Harness prepend original goal + key constraints vào system prompt mỗi lần gọi Agent.

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [3 mô hình kiến trúc Agent](02_atomic_nodes/HAE-concept-three-harness-patterns.md) — Multi-Agent pattern là nguyên nhân gây ra fatigue.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md) — Các sub-agent là nơi fatigue xảy ra ở mỗi hop.
  - [Context Isolation](02_atomic_nodes/HAE-concept-context-isolation.md) — Cô lập context làm vấn đề nghiêm trọng hơn.
  - [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Liên quan tới khả năng duy trì context qua session.
  - [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Bổ sung cơ chế quản lý context cho handoff.

- **Quả chuyển hóa (Derivative Effects):**
  - [Kiến trúc bộ nhớ 3 tầng](02_atomic_nodes/HAE-concept-three-tier-memory-architecture.md) — Giải pháp một phần cho fatigue qua phân tầng memory.
  - [Structured Handoff Schema] — Giải pháp chính cho vấn đề contextual degradation.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Structured Doc: harness-engineering-ai-processed.md](01_structured_docs/harness-engineering-ai-processed.md)
  - [Raw Doc: Phần III](00_raw_docs/harness-engineering-ai.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Báo cáo Tổng hợp](04_distilled/harness-engineering-ai-report.md)
