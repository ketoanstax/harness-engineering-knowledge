---
id: HAE-concept-four-hook-types
title: "4 Loại Lifecycle Hook Chi Tiết"
category: "Harness Architecture"
tags:
  - pre-tool-call
  - post-tool-call
  - on-error
  - on-compaction
  - hook-patterns
  - harness-primitive
date: 2026-05-24
parent: lifecycle-hooks
---

# 4 Loại Lifecycle Hook Chi Tiết

## 💡 Định nghĩa & Nội dung Cốt lõi
Lifecycle Hooks có 4 loại, mỗi loại can thiệp vào một thời điểm khác nhau trong vòng đời gọi tool. Mỗi hook có mục đích riêng và anti-pattern riêng. Hiểu đúng → Harness vừa an toàn vừa nhanh. Hiểu sai → chậm hoặc mất khả năng debug.

## ⚙️ 4 Loại Hook & Ứng Dụng

### 1. PreToolCall — Trước khi tool chạy
- **Chạy khi nào:** Ngay trước khi tool thực thi
- **Dùng để:** Ghi log lần gọi tool, quét nội dung xem có lộ secret/key, áp rate limit
- **Anti-pattern:** Cài quá nhiều validation → mỗi lần gọi tool chậm đáng kể

### 2. PostToolCall — Sau khi tool hoàn tất
- **Chạy khi nào:** Ngay sau khi tool trả kết quả
- **Dùng để:** Cập nhật telemetry, đếm số token đã dùng, ghi metric
- **Anti-pattern:** Thực hiện side-effect nặng (gọi API bên ngoài) → chậm vòng lặp

### 3. OnError — Khi tool hoặc model lỗi
- **Chạy khi nào:** Khi tool gặp lỗi hoặc model trả về lỗi
- **Dùng để:** Retry với prompt được viết lại, chuyển sang cho người xử lý, ghi log lỗi
- **Anti-pattern:** Retry vô hạn không có backoff → vòng lặp chết

### 4. OnCompaction — Khi context bị nén
- **Chạy khi nào:** Khi Context Manager kích hoạt compaction
- **Dùng để:** Lưu lịch sử cũ ra file lưu trữ trước khi bị xóa khỏi context
- **Anti-pattern:** Không cài hook này → mất toàn bộ lịch sử cũ khi compaction xảy ra

## ⚖️ Nguyên Tắc Cân Bằng
- **Hook thừa:** Mỗi lần gọi tool phải chạy thêm hàng loạt việc → hệ thống chậm rõ rệt
- **Hook thiếu:** Lúc debug lỗi không có nhật ký để lần → mù hoàn toàn
- **Doanh nghiệp tùy biến nhiều nhất ở đây:** Mỗi tổ chức có nhu cầu logging, security, compliance khác nhau → hook là điểm injection chính

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — Là nền tảng trực tiếp sinh ra khái niệm hiện tại.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Internal Observability](02_atomic_nodes/HAE-concept-internal-observability.md) — Hook là cơ chế triển khai observability
  - [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md) — PreToolCall kiểm tra permission
  - [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) — OnCompaction hook gắn với compaction

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
