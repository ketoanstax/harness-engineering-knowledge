---
id: HAE-concept-harness-quantified-metrics
title: "Chỉ số đo lường định lượng về hiệu quả của Harness"
category: "Harness Metrics"
tags:
  - metrics
  - quantified
  - benchmarks
  - roi
date: 2026-05-25
parent: harness-moat-factor80
---

# Chỉ số đo lường định lượng về hiệu quả của Harness

## 💡 Định nghĩa & Nội dung Cốt lõi
Tập hợp tất cả dữ liệu định lượng từ harness-engineering.ai về hiệu quả của Harness Engineering: từ task completion rates (83% lên 96%), compounding failures (chuỗi 20 bước 95% accuracy còn 36%), 40-point difference giữa 2 Harness khác nhau trên cùng model, cho đến chi phí thực tế và giảm token từ checkpoint-resume (30-50%).

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn

### Hiệu quả của Verification Loops
- **83% -> 96%:** Một team tăng task completion bằng cách thêm structured verification. Model không đổi, prompt không đổi.
- **40-point difference:** Hai team dùng cùng model, cùng task, khác Harness design — chênh lệch 40% completion rate.
- **Tool call failures:** 3-15% tool call thất bại trong production — là số 1 reliability killer.

### Compounding Failures
- Chuỗi 20 bước, mỗi bước 95% success: **96%^1 = 96% -> 95%^20 = 36%** tổng completion. Đây là lý do Harness cần verification loops, retry policies, checkpoint-resume.

### Chi phí & Token
- **Checkpoint-resume:** Giảm 30-50% token cost khi phục hồi từ checkpoint thay vì chạy lại từ đầu.
- **Multi-agent token cost:** ~15x single-agent. Single: $0.10-$0.50/task, Multi: $0.50-$5.00/task.
- **Semantic caching:** Stop 20-40% repeat queries, giảm 60% prompt cost.
- **Tool call verification overhead:** 30-50ms per tool call (50% của 50-150ms).
- **Deployment cost:** $3,200-$13,000/tháng cho production deployment.

### Case Studies
- **OpenAI Codex:** 1M+ dòng code, 3 engineer, 5 tháng — họ xây Harness, Agent tự sinh code.
- **Vercel:** Giảm tool từ 15 xuống 2 -> accuracy 80% lên 100%, tokens giảm 37%, speed 3.5x.
- **Manus:** 10x cost reduction nhờ KV-cache + context management. 6 tháng, 5 lần viết lại kiến trúc.
- **Stripe Minions:** 1,000+ merged PRs/tuần qua agents.
- **LangChain Terminal Bench:** 52.8% -> 66.5% task completion chỉ bằng harness improvement, model không đổi.

### Metrics cho Monitoring
- **Task Completion Rate:** Mục tiêu 90-97%. Dưới 85% là serious.
- **Tool Call Success Rate:** Target >97%.
- **Mean Time to Human Escalation:** KPI chính cho HITL layer.
- **Shadow Mode:** 5% shadow window, 10,000 tasks/ngày -> statistically meaningful comparison trong <24h.
- **Observability ROI:** $5-10K upfront -> saves over $30K.

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Harness Moat & 80% Factor](02_atomic_nodes/HAE-concept-harness-moat-factor80.md) — Các metric chứng minh 80% factor empirically.

- **Hội tụ Duyên (Supporting Conditions):**
  - [E2E Testing](02_atomic_nodes/HAE-concept-e2e-testing.md) — Cung cấp khung đo lường evaluation.
  - [Internal Observability](02_atomic_nodes/HAE-concept-internal-observability.md) — Cung cấp cơ chế thu thập metric.
  - [6 lớp kiến trúc Harness](02_atomic_nodes/HAE-concept-six-harness-layers.md) — Metric được tạo ra từ 6 layer hoạt động.

- **Quả chuyển hóa (Derivative Effects):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md) — Tổng hợp các luận điểm từ metric.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Structured Doc: harness-engineering-ai-processed.md](01_structured_docs/harness-engineering-ai-processed.md)
  - [Raw Doc: Phần II, IV, V, VI](00_raw_docs/harness-engineering-ai.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Báo cáo Tổng hợp](04_distilled/harness-engineering-ai-report.md)
