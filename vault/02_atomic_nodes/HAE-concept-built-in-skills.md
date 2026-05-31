---
id: HAE-concept-built-in-skills
title: "Built-in Skills - Kỹ Năng Tích Hợp Sẵn"
category: "Harness Architecture"
tags:
  - built-in-skills
  - auto-activation
  - vendor-competition
  - harness-concept
date: 2026-05-24
parent: null
---

# Built-in Skills - Kỹ Năng Tích Hợp Sẵn

## 💡 Định nghĩa & Nội dung Cốt lõi
Built-in Skills khác với Skills do người dùng tự định nghĩa cho project. Built-in Skills là phần Harness đã đóng gói sẵn — Agent **tự động kích hoạt khi cần** mà không cần người dùng nhắc. Ví dụ: bộ xử lý PDF khi gặp file PDF, bộ xử lý Excel khi gặp XLS, tra cứu web khi cần, xử lý ảnh khi gặp ảnh.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Tính phổ quát (Universal Applicability):** Built-in skills dùng được trên bất kỳ project nào, không phụ thuộc codebase hay workflow riêng.
- **Tự kích hoạt (Auto-Activation):** Điểm khác biệt quan trọng: Agent tự nhận ra khi nào cần sử dụng skill nào dựa trên loại file hoặc ngữ cảnh gặp phải, không cần prompt rõ ràng từ người dùng.
- **Điểm cạnh tranh giữa các Vendor:** Đây là một trong những điểm khác biệt lớn nhất giữa Claude Code, Cursor và Aider. Không phải vì model mạnh hay yếu mà vì bộ built-in skill rộng hay hẹp. Harness nào có nhiều built-in skill chất lượng hơn → Agent xử lý được nhiều loại task hơn mà không cần người dùng cấu hình thêm.
- **Phân biệt với User Skills:** User Skills (trong `.agent/` hoặc tương đương) là workflow riêng của team/project. Built-in Skills là capability sẵn có của chính Harness.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Tool Skill Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md) — Built-in skills là thành phần của hệ sinh thái Harness

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
