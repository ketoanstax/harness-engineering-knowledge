---
id: HAE-concept-blast-radius-isolation
title: "Blast Radius Isolation - Cô lập rủi ro thực thi của Agent"
category: "Guardrails & Safety"
tags:
  - blast-radius
  - sandbox
  - isolation
date: 2026-05-31
parent: agent-overreach
---

# Blast Radius Isolation - Cô lập rủi ro thực thi của Agent

## 💡 Định nghĩa & Nội dung Cốt lõi
Cô lập cứng môi trường thực thi của Agent và giới hạn request mạng để đồng thời bảo toàn Token Budget.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- Dựng container dùng một lần cho các tác vụ nhạy cảm.
- Giới hạn tài nguyên phần cứng để chống Agent lặp vô tận.

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)
- **Nhân gốc (Causal Core)**: [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Khái niệm nền tảng sinh ra khái niệm này.
- **Hội tụ Duyên (Supporting Conditions)**: [Clean State](02_atomic_nodes/HAE-concept-clean-state.md) — Các khái niệm hỗ trợ trực tiếp.
- **Quả chuyển hóa (Derivative Effects)**: [Token Load Control](02_atomic_nodes/HAE-concept-token-load-control.md) — Các giải pháp và hiệu quả kế thừa.

## 🔗 Liên kết Tri thức (Knowledge Connections)
- **Dẫn chứng & Nguồn gốc (Ngược dòng - Evidence & Context)**:
  - [Ghi chú cấu trúc: Lecture 14 Blast Radius Advanced](01_structured_docs/lecture-14-blast-radius-advanced-processed.md)
  - [Ghi chú thô: Lecture 14 Blast Radius Advanced](00_raw_docs/lecture-14-blast-radius-advanced.md)
- **Đúc kết vĩ mô (Xuôi dòng - Distilled Thoughts)**:
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)

- Giới hạn request mạng tối đa ở Sandbox để tránh rò rỉ token.