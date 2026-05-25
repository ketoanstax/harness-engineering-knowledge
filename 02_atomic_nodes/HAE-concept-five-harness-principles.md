---
id: HAE-concept-five-harness-principles
title: "5 nguyên lý cốt lõi của Harness Engineering"
category: "Harness Architecture Principles"
tags:
  - five-principles
  - harness-engineering
  - system-design
date: 2026-05-25
parent: harness-moat-factor80
---

# 5 nguyên lý cốt lõi của Harness Engineering

## 💡 Định nghĩa & Nội dung Cốt lõi
5 nguyên lý này định hình tư duy thiết kế Harness: Context Engineering (kiểm soát đầu vào), Tool Orchestration (kiểm soát hành động), Verification Loops (kiểm soát chất lượng đầu ra), Cost Envelope Management (kiểm soát tài nguyên), và Observability & Evaluation (kiểm soát quan sát). Cả 5 tạo thành vòng tròn hoàn chỉnh: Input -> Action -> Output -> Resource -> Observation.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn

1. **Context Engineering:** Chọn lọc thông tin chính xác thay vì nhồi nhét. Càng chính xác càng tốt. "Too much context and the agent drowns in irrelevant data."

2. **Tool Orchestration:** Quản lý cách Agent tương tác với API ngoại vi. Input validation, xử lý lỗi tool, bảo vệ đầu ra. Constrain tool set để giảm độ phức tạp.

3. **Verification Loops:** Kiểm tra đầu ra trung gian của Agent ở mỗi bước. "The single highest-ROI component of any agent harness." Hai cấp: Simple (schema validation, 50-150ms) và Complex (LLM-as-judge, 1-5 giây).

4. **Cost Envelope Management:** Ngân sách cứng cho mỗi task. Không chỉ là financial cost — còn là token, time, API call limits. Cost envelope cũng là tín hiệu độ tin cậy: vượt envelope = có vấn đề.

5. **Observability & Evaluation:** Structured execution traces, bắt từng bước, từng tool call, từng token. Evaluation pipeline liên tục mới phát hiện behavioral drift. "Without observability, you're operating a non-deterministic system blind."

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md) — 5 principles là biểu hiện nguyên lý của 80% factor.

- **Hội tụ Duyên (Supporting Conditions):**
  - [E2E Testing](02_atomic_nodes/HAE-concept-e2e-testing.md) — Cung cấp evaluation framework cho Observability.
  - [Internal Observability](02_atomic_nodes/HAE-concept-internal-observability.md) — Hỗ trợ nguyên lý Observability & Evaluation.
  - [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md) — Cung cấp cơ sở kỹ thuật cho Cost Envelope Management.
  - [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) — Hỗ trợ Context Engineering với cơ chế tóm tắt.

- **Quả chuyển hóa (Derivative Effects):**
  - [6 lớp kiến trúc Harness](02_atomic_nodes/HAE-concept-six-harness-layers.md) — 5 principles mở rộng thành 6 layers cụ thể hơn.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Structured Doc: harness-engineering-ai-processed.md](01_structured_docs/harness-engineering-ai-processed.md)
  - [Raw Doc: Phần I](00_raw_docs/harness-engineering-ai.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Báo cáo Tổng hợp](04_distilled/harness-engineering-ai-report.md)
