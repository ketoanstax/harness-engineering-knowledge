---
id: HAE-concept-feature-list-primitive
title: "Danh Mục Tính Năng (Feature List) - Thực Thể Nguyên Thủy Của Harness"
category: "Workflow Architecture"
tags:
  - feature-list
  - alignment
  - task-tracking
  - harness-concept
date: 2026-05-24
parent: null
---

# Danh Mục Tính Năng (Feature List) - Thực Thể Nguyên Thủy Của Harness

## 💡 Định nghĩa & Nội dung Cốt lõi
Feature List không đơn thuần là một danh sách TODO. Nó là thực thể neo giữ và đồng bộ bối cảnh làm việc giữa Agent và Con người, đảm bảo tính tập trung tuyệt đối vào một nhiệm vụ duy nhất tại một thời điểm.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Nguyên tắc Một Task Duy Nhất (Single Task Rule):**  Tại một thời điểm, chính xác chỉ có duy nhất 1 task trong Feature List được chuyển sang trạng thái `in_progress`.
- **Định nghĩa rõ ràng (Imperative & Active Forms):**  Mọi task phải được mô tả chi tiết cả ở dạng mệnh lệnh (để hiểu yêu cầu) và dạng tiếp diễn (để hiển thị tiến trình đang thực thi).
- **Đồng thuận tuyệt đối:**  Giữ cho danh sách này cập nhật liên tục để người dùng luôn biết Agent đang làm gì và Agent tự kiểm soát được việc không bị xao nhãng.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Early Victory](02_atomic_nodes/HAE-concept-early-victory.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Ghi chú cấu trúc: Lecture 08 - Tại sao Feature List là nguyên lý cốt lõi của Harness](01_structured_docs/lecture-08-why-feature-lists-are-harness-primitives-processed.md)
  - [Ghi chú thô: Lecture 08 - Tại sao Feature List là nguyên lý cốt lõi của Harness](00_raw_docs/lecture-08-why-feature-lists-are-harness-primitives.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
