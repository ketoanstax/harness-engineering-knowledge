---
id: HAE-concept-no-accumulation
title: "No Accumulation - Hệ quả không tích lũy tri thức"
category: "Harness Core Concept"
tags:
  - no-accumulation
  - knowledge-merge
  - consistency
date: 2026-05-31
parent: global-context-loss
---

# No Accumulation - Hệ quả không tích lũy tri thức

## 💡 Định nghĩa & Nội dung Cốt lõi
Khi tài liệu thay đổi, VectorDB chỉ chèn thêm vector mới thay vì hợp nhất tri thức, dẫn đến mâuthuẫn.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- Cơ chế MRP Merge thay thế ghi đè, luôn trộn (merge) kiến thức mới vào nốt cũ.
- Phát hiện xung đột ngữ nghĩa tự động bằng Reducer.

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)
- **Nhân gốc (Causal Core)**: [Clean State](02_atomic_nodes/HAE-concept-clean-state.md) — Khái niệm nền tảng sinh ra khái niệm này.
- **Hội tụ Duyên (Supporting Conditions)**: [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) — Các khái niệm hỗ trợ trực tiếp.
- **Quả chuyển hóa (Derivative Effects)**: [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Các giải pháp và hiệu quả kế thừa.

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Dẫn chứng & Nguồn gốc (Ngược dòng - Evidence & Context)**:
  - [Ghi chú cấu trúc: Lecture 13 Why Mrp Pipeline Triumphs Over Vector Dbs](01_structured_docs/lecture-13-why-mrp-pipeline-triumphs-over-vector-dbs-processed.md)
  - [Ghi chú thô: Lecture 13 Why Mrp Pipeline Triumphs Over Vector Dbs](00_raw_docs/lecture-13-why-mrp-pipeline-triumphs-over-vector-dbs.md)
- **Đúc kết vĩ mô (Xuôi dòng - Distilled Thoughts)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
