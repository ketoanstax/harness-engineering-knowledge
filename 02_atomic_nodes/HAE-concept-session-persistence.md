---
id: HAE-concept-session-persistence
title: "Session Persistence - Lưu Trữ Phiên Làm Việc Bền Vững"
category: "Harness Architecture"
tags:
  - session-persistence
  - jsonl-append-only
  - crash-recovery
  - event-sourcing
  - harness-primitive
date: 2026-05-24
parent: null
---

# Session Persistence - Lưu Trữ Phiên Làm Việc Bền Vững

## 💡 Định nghĩa & Nội dung Cốt lõi
Một session dài 4 tiếng, máy crash giữa chừng — có mất hết hay không? Với một Harness đúng nghĩa, câu trả lời là **không bao giờ mất**. Mỗi sự kiện (tin nhắn, lần gọi tool, kết quả tool) đều được ghi ngay ra file JSONL theo kiểu append-only — không đợi xong task mới ghi, không giữ trong bộ nhớ, ghi ngay từng dòng một.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **JSONL Append-Only:** Định dạng lý tưởng — append có chi phí O(1) về thời gian, không cần khóa toàn bộ file, crash giữa chừng cũng không làm hỏng dữ liệu đã ghi. Mỗi dòng độc lập.
- **Phục Hồi Từ Điểm Dừng (Event Replay):** Khi khởi động lại sau crash, Agent đọc lại file từ đầu, chạy lại từng sự kiện, dựng lại mảng tin nhắn như cũ và tiếp tục từ đúng chỗ đã dừng. Agent thậm chí không cần biết đã có crash xảy ra.
- **Session Là Lớp Độc Lập:** Trong phiên bản mới nhất, Anthropic đã tách hẳn Session thành lớp độc lập — Session sống tách khỏi tiến trình Harness và có thể tiếp tục từ bất kỳ máy nào có cùng file JSONL đó.
- **Ghi Ngay, Không Buffer:** Không đợi, không batch, không buffer phức tạp. Mỗi event → serialize thành JSON (kể cả datetime và kiểu đặc biệt) → ghi thêm vào cuối file ngay lập tức.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Lifecycle Hooks](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Nguyên lý bảo toàn tính liên tục, Session Persistence là cách triển khai cụ thể
  - [Clean State](02_atomic_nodes/HAE-concept-clean-state.md) — Session Persistence phải tương thích với nguyên lý trạng thái sạch

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
