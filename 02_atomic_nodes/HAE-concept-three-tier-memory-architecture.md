---
id: HAE-concept-three-tier-memory-architecture
title: "Kiến trúc bộ nhớ 3 tầng: Ephemeral, Working, Archival"
category: "Agent Memory"
tags:
  - memory
  - ephemeral
  - working
  - archival
  - state-management
date: 2026-05-25
parent: harness-moat-factor80
---

# Kiến trúc bộ nhớ 3 tầng: Ephemeral, Working, Archival

## 💡 Định nghĩa & Nội dung Cốt lõi
Phân loại bộ nhớ Agent thành 3 tầng rõ rệt: **Ephemeral** (trong context, phiên làm việc hiện tại, nhanh nhất, chi phí thấp nhất), **Working** (bộ nhớ đệm dùng chung giữa các Agent trong 1 chain, ngắn hạn), và **Archival** (lưu trữ bền vững xuyên phiên và xuyên user, chậm nhất nhưng durable). Quy tắc routing quan trọng: Không đẩy mọi thứ lên Archival — chỉ đẩy khi cần sống xuyên session.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn

### Ba tầng bộ nhớ
| Tầng | Store | Lifespan | Use Case |
|------|-------|----------|----------|
| Ephemeral | In-context (LLM context window) | Single invocation | Active working memory. Mất ở Agent boundary nếu không persist |
| Working | Redis / in-memory cache | Single chain execution | State nhiều Agent cần đọc. Không sống quá chain hiện tại |
| Archival | Vector DB / Relational DB | Cross-session, cross-user | User preferences, prior outcomes, domain facts |

### Quy tắc Routing
- **Ephemeral -> Working:** Chỉ promote khi thông tin cần sống qua Agent boundary.
- **Working -> Archival:** Chỉ promote khi cần sống xuyên session.
- **Không** đẩy mọi thứ lên Archival — tốn chi phí vector indexing + retrieval.
- **Không** mix stateful và stateless handoff trong cùng chain — "hybrid approaches create the worst of both failure modes."

### Stateful vs Stateless Handoff
- **Stateless message passing** (mỗi handoff self-contained): Đơn giản, best dưới 4 hops.
- **Stateful session store** (Agent đọc shared external state): Thin payloads, phù hợp cho chain dài, nhưng có consistency challenges (stale read).

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Context-Switch Fatigue](02_atomic_nodes/HAE-concept-context-switch-fatigue-handoff.md) — Context-Switch Fatigue là vấn đề, Memory Tier Architecture là một phần giải pháp.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) — Cung cấp cơ chế lưu trữ bền vững cho Archival tier.
  - [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Đảm bảo tính liên tục xuyên session.
  - [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) — Quyết định khi nào đẩy từ Ephemeral xuống Working/Archival.
  - [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md) — Giới hạn tài nguyên cho Ephemeral tier.

- **Quả chuyển hóa (Derivative Effects):**
  - [Chỉ số đo lường hiệu quả](02_atomic_nodes/HAE-concept-harness-quantified-metrics.md) — Memory efficiency là một metric quan trọng.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Structured Doc: harness-engineering-ai-processed.md](01_structured_docs/harness-engineering-ai-processed.md)
  - [Raw Doc: Phần III](00_raw_docs/harness-engineering-ai.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Báo cáo Tổng hợp](04_distilled/harness-engineering-ai-report.md)
