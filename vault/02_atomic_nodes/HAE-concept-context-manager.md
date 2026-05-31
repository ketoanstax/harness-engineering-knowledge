---
id: HAE-concept-context-manager
title: "Context Manager - Bộ Quản Lý Ngữ Cảnh"
category: "Harness Architecture"
tags:
  - context-manager
  - compaction
  - token-budget
  - context-window
  - harness-concept
date: 2026-05-24
parent: null
children:
  - compaction-strategy
  - token-budget
---

# Context Manager - Bộ Quản Lý Ngữ Cảnh

## 💡 Định nghĩa & Nội dung Cốt lõi
Context Manager là thành phần quản lý cửa sổ ngữ cảnh có hạn (200K token). Khi Agent chạy vài tiếng, context đầy → Agent bắt đầu quên đầu quên đuôi, chất lượng output giảm rõ rệt. Context Manager giải quyết bằng 3 chiến lược: **giữ nguyên** những gì quan trọng, **tóm tắt** phần cũ, **loại bỏ** phần lỗi thời.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Ngưỡng Compaction (Compaction Threshold):** Mặc định 18 tin nhắn. Khi vượt ngưỡng → giữ lại 4 tin nhắn gần nhất, tóm tắt phần còn lại. Tỉ lệ này không ngẫu nhiên: đủ ngắn để giải phóng context, đủ dài để Agent không mất mạch.
- **Tóm tắt bởi chính Model:** Việc tóm tắt được thực hiện bởi chính model (gửi context → yêu cầu tóm tắt 10 dòng quan trọng nhất → thay thế). Nhờ vậy bản tóm tắt vẫn giữ được ngữ nghĩa domain.
- **Immutability (Không sửa tại chỗ):** Context Manager không sửa danh sách tin nhắn cũ tại chỗ. Nó trả về danh sách mới hoàn toàn → dễ test hơn, dễ dò lỗi hơn.
- **Phân biệt Junior vs Senior:** Đây là chỗ phân biệt trình độ. Quyết sai → context đầy đúng lúc Agent đang debug lỗi quan trọng. Quyết đúng → Agent chạy 8 tiếng vẫn tỉnh táo.

## 🌳 Nốt con (Sub-Nodes) — Khi cần đào sâu
- [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) — Chi tiết chiến lược nén context
- [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md) — Ngân sách token và cơ chế phân bổ

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Instruction File Pitfall](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md) — Quá tải context do file hướng dẫn quá lớn
  - [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Bảo toàn bối cảnh dài hạn

- **Quả chuyển hóa (Derivative Effects):**
  - [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) — Được nốt hiện tại mở đường hoặc trực tiếp thúc đẩy phát sinh.
  - [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md) — Được nốt hiện tại mở đường hoặc trực tiếp thúc đẩy phát sinh.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
