---
id: HAE-concept-context-isolation
title: "Context Isolation - Nguyên Tắc Cô Lập Ngữ Cảnh Cho Sub-Agent"
category: "Harness Architecture"
tags:
  - context-isolation
  - minimal-context
  - sub-agent-antipattern
  - task-delegation
  - harness-concept
date: 2026-05-24
parent: sub-agent
---

# Context Isolation - Nguyên Tắc Cô Lập Ngữ Cảnh Cho Sub-Agent

## 💡 Định nghĩa & Nội dung Cốt lõi
Lỗi phổ biến nhất khi sử dụng sub-agent: **truyền toàn bộ context của Agent chính vào sub-agent**. Kết quả: sub quá tải ngay từ đầu, context bị nhiễu bởi những thứ sub-agent không cần biết, output kém chất lượng. Context Isolation là nguyên tắc chỉ truyền đúng những gì sub-agent cần.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Phép ẩn dụ Thực tập sinh:** Bạn không kể cho thực tập sinh cả tuần bạn đang làm gì. Bạn chỉ nói: "File này, task này, xong thì báo." Sub-agent vận hành đúng như vậy.
- **3 Thành Phần Truyền Vào:** Task rõ ràng (mô tả cụ thể cần làm gì), file liên quan (chỉ những file sub cần đụng), permission tối thiểu (chỉ quyền đủ để hoàn thành task).
- **Kết Quả Trả Về Tối Thiểu:** Sub-agent khi xong chỉ trả lại kết quả, KHÔNG trả lại toàn bộ lịch sử làm việc. Giữ context của Agent chính sạch sẽ.
- **Anti-Pattern — Full Context Dump:** Truyền toàn bộ context → sub quá tải → context bị nhiễu → output kém. Đây là lỗi mà 90% người mới mắc phải.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Sub Agent](02_atomic_nodes/HAE-concept-sub-agent.md) — Là nền tảng trực tiếp sinh ra khái niệm hiện tại.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Context management ở cấp sub-agent
  - [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Isolation giúp giới hạn blast radius
  - [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md) — Truyền ít context = tiết kiệm token

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
