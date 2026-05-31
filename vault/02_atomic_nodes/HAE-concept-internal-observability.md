---
id: HAE-concept-internal-observability
title: "Tính Quan Sát Thuộc Về Bên Trong Harness (Telemetry & Logs)"
category: "Guardrails & Safety"
tags:
  - internal-observability
  - logging
  - telemetry
  - debugging
  - harness-concept
date: 2026-05-24
parent: null
---

# Tính Quan Sát Thuộc Về Bên Trong Harness (Telemetry & Logs)

## 💡 Định nghĩa & Nội dung Cốt lõi
Quá trình làm việc của Agent không được phép là một 'hộp đen'. Khả năng tự quan sát (Observability) phải được tích hợp sẵn bên trong Harness để con người và hệ thống có thể theo dõi, đánh giá và debug mọi hành vi của Agent.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Ghi nhật ký lệnh shell (Shell Logging):**  Tự động ghi chép toàn bộ các lệnh CLI mà Agent đã chạy cùng kết quả đầu ra của chúng.
- **Telemetry & Metrics:**  Đo lường số lượng file thay đổi, thời gian chạy công cụ và số lượng token tiêu thụ để phát hiện các vòng lặp vô tận (infinite loops).
- **Tạo hộp kính (Glass Box):**  Biến hoạt động của Agent trở nên minh bạch để con người có thể can thiệp ngay lập tức khi phát hiện Agent đi sai hướng hoặc có hành vi phá hoại vô tình.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [E2E Testing](02_atomic_nodes/HAE-concept-e2e-testing.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Clean State](02_atomic_nodes/HAE-concept-clean-state.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — Hook là cơ chế triển khai observability
  - [4 Loại Hook Chi Tiết](02_atomic_nodes/HAE-concept-four-hook-types.md) — PostToolCall hook cho telemetry

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Ghi chú cấu trúc: Lecture 11 - Tại sao tính quan sát thuộc về bên trong Harness](01_structured_docs/lecture-11-why-observability-belongs-inside-the-harness-processed.md)
  - [Ghi chú thô: Lecture 11 - Tại sao tính quan sát thuộc về bên trong Harness](00_raw_docs/lecture-11-why-observability-belongs-inside-the-harness.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
