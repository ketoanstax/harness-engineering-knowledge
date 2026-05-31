---
id: HAE-concept-dynamic-permission-classification
title: "Dynamic Permission Classification - Phân Loại Quyền Động Theo Nội Dung Lệnh"
category: "Harness Architecture"
tags:
  - dynamic-classification
  - command-analysis
  - risk-scoring
  - framework-vs-harness
  - harness-primitive
date: 2026-05-24
parent: permission-layers
---

# Dynamic Permission Classification - Phân Loại Quyền Động Theo Nội Dung Lệnh

## 💡 Định nghĩa & Nội dung Cốt lõi
Điểm khác biệt lớn nhất giữa Harness và Framework ở lớp an toàn: **cùng một tool Bash, nhưng lệnh `ls` thì tự động cho qua, lệnh `rm` thì cần xác nhận**. Harness phân loại theo nội dung lệnh, không theo tên tool. Framework không có khái niệm Agent đang chạy ở mức permission nào — cứ chạy là chạy, bạn tự lo phần còn lại.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Phân tích từ khóa đầu lệnh:** Hệ thống tách lệnh bash ra, kiểm tra từ khóa đầu tiên. `ls`, `cat`, `grep` → ReadOnly. `sudo`, `rm`, `kill` → Full. Còn lại → UserSpace.
- **Bảng Điểm Số (Permission Score):** Mỗi mức có điểm số để so sánh. Khi tool yêu cầu mức X nhưng Agent chỉ được cấp mức Y < X → chặn. Không bypass.
- **Framework vs Harness tại điểm này:** Framework không phân loại lệnh. Framework không có khái niệm mức permission. Đây là điểm phân biệt Harness thật sự với chatbot wrapper. Có permission → tin tưởng giao task dài ngày. Không có → phải ngồi canh liên tục.
- **Xác nhận tường minh (Explicit Confirmation):** Ở mức Full, mọi hành động đều cần xác nhận rõ ràng từ người dùng. Không có "auto-approve" ở mức cao nhất.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md) — Là nền tảng trực tiếp sinh ra khái niệm hiện tại.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Dynamic classification ngăn overreach ở mức kỹ thuật
  - [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — PreToolCall hook thực hiện permission check
  - [Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md) — Điểm khác biệt cốt lõi Harness vs Framework

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
