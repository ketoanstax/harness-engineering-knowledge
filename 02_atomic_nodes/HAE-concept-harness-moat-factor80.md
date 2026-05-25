---
id: HAE-concept-harness-moat-factor80
title: "Harness Engineering: Định nghĩa, Phân biệt Model vs Harness, và 80% Factor"
category: "Harness Core Definition"
tags:
  - harness-moat
  - 80percent-factor
  - model-vs-harness
  - harness-definition
  - system-design
date: 2026-05-25
parent: harness-definition
children:
  - six-harness-layers
  - five-harness-principles
  - three-harness-patterns
  - five-stage-deployment
  - four-governance-layers
  - context-switch-fatigue-handoff
  - three-tier-memory-architecture
  - harness-quantified-metrics
---

# Harness Engineering: Định nghĩa, Phân biệt Model vs Harness, và 80% Factor

## 💡 Định nghĩa & Nội dung Cốt lõi
Harness Engineering là **kỷ luật hạ tầng (infrastructure layer) bao quanh AI model** — quản lý vòng đời, ngữ cảnh, quyền hạn và tính an toàn của Agent. Khác với Prompt Engineering (tinh chỉnh câu lệnh), Harness là **"80% Factor"** quyết định độ tin cậy của Agent trong production, là lợi thế cạnh tranh cốt lõi (moat) chứ không phải model. Định nghĩa vận hành: **mọi thứ nằm giữa request của user và output cuối cùng của Agent mà không phải bản thân LLM.**

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **80% Factor:** Thay đổi model chỉ mang lại 10-15% cải thiện. Đầu tư vào Harness mang lại bước nhảy 80-90% về tỉ lệ hoàn thành tác vụ.
- **Harness vs Framework:** Framework (LangChain, CrewAI) được viết cho lập trình viên dùng. Harness (Claude Code, Cursor) được viết cho AI dùng để tự động trong runtime. "You build with a framework. You run inside a harness."
- **Cách phân loại thực tế:** Mở codebase, thấy cái gì không phải LLM — đó là Harness. Bao gồm: context window management, tool definitions, permission rules, logging, checkpoint files, cost limits, CI/CD dành riêng cho agent.
- **Kiến trúc tham khảo (CPU-OS):** Dành cho người đã biết lập trình. LLM là CPU, Harness là Operating System — quản lý tài nguyên, định thời, kiểm soát lỗi, giao tiếp ngoại vi.

### Bảng định tuyến đối tượng (Routing Table for AI)
| Đối tượng | Nên đọc node nào trước | Mục đích |
|-----------|------------------------|----------|
| Chưa biết gì về Harness | [Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md) | Hình dung khái niệm qua hình tượng "sàn đấu" |
| Đã biết khái niệm, cần thuyết phục hoặc xây dựng | Node hiện tại (Harness Moat & 80% Factor) | Hiểu tại sao Harness là lợi thế cạnh tranh và bắt đầu từ đâu |
| Đã hiểu, cần triển khai | [6 Layers](02_atomic_nodes/HAE-concept-six-harness-layers.md) | Xây dựng từng lớp hạ tầng cụ thể |

## 🌳 Nốt con (Sub-Nodes)
- [6 lớp kiến trúc Harness](02_atomic_nodes/HAE-concept-six-harness-layers.md) — Tổng quan về 6 thành phần hạ tầng bao quanh Agent.
- [5 nguyên lý cốt lõi Harness](02_atomic_nodes/HAE-concept-five-harness-principles.md) — 5 nguyên lý vận hành kỹ thuật thiết yếu cho Harness.
- [3 mô hình kiến trúc Agent](02_atomic_nodes/HAE-concept-three-harness-patterns.md) — Các mô hình Single-Agent, Two-Agent Supervisor và Multi-Agent.
- [Triển khai sản xuất 5 cổng](02_atomic_nodes/HAE-concept-five-stage-deployment.md) — Quy trình chuyển đổi an toàn từ Eval đến Production.
- [Hệ thống quản trị 4 tầng](02_atomic_nodes/HAE-concept-four-governance-layers.md) — Quản lý danh tính, PEP, audit trail và HITL cho Agent.
- [Context-Switch Fatigue & Handoff](02_atomic_nodes/HAE-concept-context-switch-fatigue-handoff.md) — Sự suy giảm thông tin trong multi-agent và schema giải quyết.
- [Kiến trúc bộ nhớ 3 tầng](02_atomic_nodes/HAE-concept-three-tier-memory-architecture.md) — Phân loại Ephemeral, Working và Archival memory.
- [Chỉ số đo lường hiệu quả](02_atomic_nodes/HAE-concept-harness-quantified-metrics.md) — Tổng hợp các con số định lượng về lợi ích của Harness.

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Định nghĩa Harness gốc](02_atomic_nodes/HAE-concept-harness-definition.md) — Cội nguồn tri thức về khái niệm Harness trong vault.

- **Hội tụ Duyên (Supporting Conditions):**
  - [System Of Record](02_atomic_nodes/HAE-concept-system-of-record.md) — Môi trường lưu trữ trạng thái nguồn sự thật.
  - [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) — Vòng lặp giao tiếp LLM thô.
  - [Harness Engineering Website Processed](01_structured_docs/harness-engineering-ai-processed.md) — Tài liệu cấu trúc chắt lọc từ website.

- **Quả chuyển hóa (Derivative Effects):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md) — Định hình triết lý tổng hợp cấp cao Layer 3.
  - [Báo cáo Tổng hợp harness-engineering.ai](04_distilled/harness-engineering-ai-report.md) — Phân tích chi tiết bằng tiếng Việt.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Structured Doc: harness-engineering-ai-processed.md](01_structured_docs/harness-engineering-ai-processed.md)
  - [Raw Doc: harness-engineering-ai.md](00_raw_docs/harness-engineering-ai.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
  - [Báo cáo Tổng hợp harness-engineering.ai](04_distilled/harness-engineering-ai-report.md)
