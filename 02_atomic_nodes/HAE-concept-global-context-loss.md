---
id: HAE-concept-global-context-loss
title: "Global Context Loss - Mất bối cảnh tổng thể trong Vector DB"
category: "Harness Core Concept"
tags:
  - global-context-loss
  - vector-db
  - context-fragmentation
date: 2026-05-31
parent: harness-definition
---

# Global Context Loss - Mất bối cảnh tổng thể trong Vector DB

## 💡 Định nghĩa & Nội dung Cốt lõi
Vector Database cắt tài liệu thành các chunk nhỏ khiến AI Agent không thể nhìn thấy cấu trúc tổng thể của tài liệu.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- MRP Pipeline khắc phục bằng cách biên dịch tài liệu thành cây tri thức phẳng thay vì chunk rời rạc.
- Backlinks trực tiếp trỏ về dòng, trang cụ thể đảm bảo khả năng truy vết.

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)
- **Nhân gốc (Causal Core)**: [System Of Record](02_atomic_nodes/HAE-concept-system-of-record.md) — Khái niệm nền tảng sinh ra khái niệm này.
- **Hội tụ Duyên (Supporting Conditions)**: [Feature List Primitive](02_atomic_nodes/HAE-concept-feature-list-primitive.md) — Các khái niệm hỗ trợ trực tiếp.
- **Quả chuyển hóa (Derivative Effects)**: [Five Harness Principles](02_atomic_nodes/HAE-concept-five-harness-principles.md) — Các giải pháp và hiệu quả kế thừa.

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Dẫn chứng & Nguồn gốc (Ngược dòng - Evidence & Context)**:
  - [Ghi chú cấu trúc: Lecture 13 Why Mrp Pipeline Triumphs Over Vector Dbs](01_structured_docs/lecture-13-why-mrp-pipeline-triumphs-over-vector-dbs-processed.md)
  - [Ghi chú thô: Lecture 13 Why Mrp Pipeline Triumphs Over Vector Dbs](00_raw_docs/lecture-13-why-mrp-pipeline-triumphs-over-vector-dbs.md)
- **Đúc kết vĩ mô (Xuôi dòng - Distilled Thoughts)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
