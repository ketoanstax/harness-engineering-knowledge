---
id: HAE-concept-clean-state
title: "Nguyên Lý Trạng Thái Sạch Sau Mỗi Phiên Làm Việc"
category: "Guardrails & Safety"
tags:
  - clean-state
  - workspace-hygiene
  - reproducibility
  - harness-concept
date: 2026-05-24
parent: null
---

# Nguyên Lý Trạng Thái Sạch Sau Mỗi Phiên Làm Việc

## 💡 Định nghĩa & Nội dung Cốt lõi
Mỗi phiên làm việc của Agent bắt buộc phải để lại một trạng thái Git và môi trường sạch sẽ, không có rác tích tụ để tránh gây nhiễu nhận thức của Agent tiếp theo hoặc làm hỏng môi trường phát triển.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Dọn dẹp tài nguyên (Resource Cleanup):**  Xóa bỏ toàn bộ các file tạm, file log debug phát sinh, và giết các tiến trình chạy ngầm trước khi bàn giao.
- **Git Hygiene (Vệ sinh Git):**  Trả workspace về trạng thái Git sạch. Nếu có thay đổi, chỉ commit những tệp thực sự cần thiết và loại bỏ các thay đổi không chủ ý.
- **Tính tái lập (Reproducibility):**  Đảm bảo phiên làm việc tiếp theo có thể khởi chạy trên một nền tảng sạch sẽ, ổn định và có thể tái lập kết quả một cách đáng tin cậy.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Internal Observability](02_atomic_nodes/HAE-concept-internal-observability.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Ghi chú cấu trúc: Lecture 12 - Tại sao mỗi phiên làm việc phải để lại trạng thái sạch](01_structured_docs/lecture-12-why-every-session-must-leave-a-clean-state-processed.md)
  - [Ghi chú thô: Lecture 12 - Tại sao mỗi phiên làm việc phải để lại trạng thái sạch](00_raw_docs/lecture-12-why-every-session-must-leave-a-clean-state.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
