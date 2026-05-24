---
id: HAE-concept-lifecycle-hooks
title: "Lifecycle Hooks - Điểm Can Thiệp Trong Vòng Đời Agent"
category: "Harness Architecture"
tags:
  - lifecycle-hooks
  - pre-tool-call
  - post-tool-call
  - on-error
  - on-compaction
  - harness-primitive
date: 2026-05-24
parent: null
children:
  - four-hook-types
---

# Lifecycle Hooks - Điểm Can Thiệp Trong Vòng Đời Agent

## 💡 Định nghĩa & Nội dung Cốt lõi
Giữa lúc model quyết định gọi một tool và lúc tool thực sự chạy, có một khoảng trống — đó chính là chỗ cài Hook vào. Lifecycle Hooks cho phép Harness can thiệp vào đúng thời điểm giữa các bước, tạo ra khả năng quan sát, kiểm soát và tùy biến mà không sửa logic chính.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **4 Hook Chính:** PreToolCall (trước khi tool chạy), PostToolCall (sau khi tool xong), OnError (khi tool lỗi hoặc model gặp lỗi), OnCompaction (khi context bị nén lại).
- **Ứng dụng thực tiễn:** PreToolCall → ghi log, quét secret, áp rate limit. PostToolCall → cập nhật telemetry, đếm token. OnError → retry với prompt được viết lại hoặc chuyển cho người xử lý. OnCompaction → lưu lịch sử cũ ra file trước khi bị xóa.
- **Hook Đúng Chỗ (Balanced Hooks):** Harness Engineer giỏi là người biết đặt hook đúng chỗ, không thừa không thiếu. Hook thừa → mỗi lần gọi tool phải chạy thêm hàng loạt việc, hệ thống chậm rõ rệt. Hook thiếu → lúc debug lỗi không có nhật ký để lần.
- **Điểm tùy biến doanh nghiệp:** Đây là chỗ doanh nghiệp tùy biến nhiều nhất so với bản mã nguồn mở. Mỗi tổ chức có nhu cầu logging, security scanning, compliance khác nhau.

## 🌳 Nốt con (Sub-Nodes) — Khi cần đào sâu
- [4 Loại Hook Chi Tiết](02_atomic_nodes/HAE-concept-four-hook-types.md) — Phân tích sâu từng loại hook và anti-pattern

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Internal Observability](02_atomic_nodes/HAE-concept-internal-observability.md) — Hooks là cơ chế triển khai observability
  - [Clean State](02_atomic_nodes/HAE-concept-clean-state.md) — PostToolCall hook giúp dọn dẹp tài nguyên

- **Quả chuyển hóa (Derivative Effects):**
  - [Four Hook Types](02_atomic_nodes/HAE-concept-four-hook-types.md) — Được nốt hiện tại mở đường hoặc trực tiếp thúc đẩy phát sinh.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
