---
id: HAE-concept-permission-layers
title: "Permission & Safety - Phân Quyền An Toàn Theo Tầng"
category: "Harness Architecture"
tags:
  - permission-layers
  - read-only
  - user-space
  - full-access
  - dynamic-classification
  - harness-primitive
date: 2026-05-24
parent: null
children:
  - dynamic-permission-classification
---

# Permission & Safety - Phân Quyền An Toàn Theo Tầng

## 💡 Định nghĩa & Nội dung Cốt lõi
Lớp cuối cùng và là lớp giúp bạn yên tâm khi Agent làm việc suốt đêm. Không theo kiểu "chặn hết để an toàn", cũng không theo kiểu "cho phép hết để thuận tiện" — mà **phân tầng theo mức độ rủi ro**. Đây là điểm phân biệt Harness thật sự với chatbot wrapper.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **3 Mức Phân Quyền:** ReadOnly (Agent chỉ được đọc, không được ghi), UserSpace (được ghi trong thư mục project, không được đụng ra ngoài), Full (ghi mọi nơi, cần xác nhận tường minh từ người dùng).
- **Phân Loại Động Theo Nội Dung (Dynamic Classification):** Cùng một tool Bash, nhưng lệnh `ls` → tự động cho qua ở mức ReadOnly, lệnh `rm` → phân loại Full và cần xác nhận. Phân loại theo nội dung lệnh, không theo tên tool. Framework không có khái niệm này.
- **So sánh điểm số (Permission Score):** Hệ thống có bảng điểm số để so sánh giữa các mức. Trước khi chạy bất kỳ tool nào → so sánh mức permission của tool với mức được cấp cho Agent → đủ thì chạy, không đủ thì chặn.
- **Framework không có Permission:** Framework cứ chạy là chạy, bạn tự lo phần còn lại. Harness có lớp permission → có thể tin tưởng giao task dài ngày mà không cần ngồi canh liên tục.

## 🌳 Nốt con (Sub-Nodes) — Khi cần đào sâu
- [Dynamic Permission Classification](02_atomic_nodes/HAE-concept-dynamic-permission-classification.md) — Cơ chế phân loại lệnh động và anti-pattern

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Tool Skill Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Permission Layers là cơ chế kỹ thuật để ngăn overreach
  - [Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md) — Permission là thành phần cốt lõi của Harness

- **Quả chuyển hóa (Derivative Effects):**
  - [Dynamic Permission Classification](02_atomic_nodes/HAE-concept-dynamic-permission-classification.md) — Được nốt hiện tại mở đường hoặc trực tiếp thúc đẩy phát sinh.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
