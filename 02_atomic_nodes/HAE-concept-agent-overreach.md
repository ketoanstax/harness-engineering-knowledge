---
id: HAE-concept-agent-overreach
title: "Kiểm Soát Phạm Vi Ảnh Hưởng & Lỗi Tự Ý Sửa Code (Agent Overreach)"
category: "Guardrails & Safety"
tags:
  - agent-overreach
  - blast-radius
  - code-integrity
  - harness-concept
children:
  - blast-radius-isolation
date: 2026-05-24
parent: null
---

# Kiểm Soát Phạm Vi Ảnh Hưởng & Lỗi Tự Ý Sửa Code (Agent Overreach)

## 💡 Định nghĩa & Nội dung Cốt lõi
Agent thường có xu hướng tự ý refactor các file không liên quan, sửa đổi tràn lan ngoài phạm vi yêu cầu (overreach) hoặc ngược lại, để lại code rỗng hoặc bình luận dang dở (under-finish).

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Hạn chế Blast Radius:**  Thiết lập các luật chỉ định rõ ràng Agent chỉ được phép sửa đúng các tệp tin nằm trong phạm vi kế hoạch đã duyệt.
- **Cấm code dang dở (No under-finish):**  Tuyệt đối cấm Agent sử dụng các comment dạng '// TODO
- **Tập trung tối đa (Targeted Edits):**  Chỉ sửa đúng chỗ được yêu cầu, không thực hiện các chỉnh sửa định dạng, styling unsolicited ở các file xung quanh làm nhiễu git diff.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Initialization Phase](02_atomic_nodes/HAE-concept-initialization-phase.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Feature List Primitive](02_atomic_nodes/HAE-concept-feature-list-primitive.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md) — Cơ chế kỹ thuật ngăn overreach
  - [Context Isolation](02_atomic_nodes/HAE-concept-context-isolation.md) — Cô lập sub-agent giới hạn blast radius

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Ghi chú cấu trúc: Lecture 07 - Tại sao Agent làm quá giới hạn và chưa hoàn thành](01_structured_docs/lecture-07-why-agents-overreach-and-under-finish-processed.md)
  - [Ghi chú thô: Lecture 07 - Tại sao Agent làm quá giới hạn và chưa hoàn thành](00_raw_docs/lecture-07-why-agents-overreach-and-under-finish.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
