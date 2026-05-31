---
id: HAE-concept-compaction-strategy
title: "Compaction Strategy - Chiến Lược Nén Ngữ Cảnh"
category: "Harness Architecture"
tags:
  - compaction
  - context-compression
  - summarization
  - message-threshold
  - harness-primitive
date: 2026-05-24
parent: context-manager
---

# Compaction Strategy - Chiến Lược Nén Ngữ Cảnh

## 💡 Định nghĩa & Nội dung Cốt lõi
Khi danh sách tin nhắn vượt ngưỡng (mặc định 18 tin nhắn), Context Manager kích hoạt Compaction — tách phần đầu ra, gọi chính model tóm tắt thành vài dòng, rồi trả về danh sách mới gồm bản tóm tắt đó và 4 tin nhắn gần nhất. Đây là chiến lược cốt lõi giữ Agent tỉnh táo trong phiên dài.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Ngưỡng 18/4 (Threshold):** 18 tin nhắn là ngưỡng kích hoạt. Giữ lại 4 tin gần nhất. Tỉ lệ này cân bằng giữa giải phóng context và không mất mạch suy nghĩ.
- **Tóm tắt bởi chính Model (Self-Summarization):** Gửi context cũ cho model → yêu cầu "tóm tắt 10 dòng quan trọng nhất" → model tóm → thay thế. Bản tóm tắt giữ ngữ nghĩa domain vì chính model hiểu nội dung.
- **3 Chiến lược Song Song:** Giữ nguyên (keep) những gì quan trọng nhất (task hiện tại, kết quả tool gần đây). Tóm tắt (summarize) phần cũ. Loại bỏ (drop) những gì hoàn toàn lỗi thời.
- **Immutability:** Không sửa danh sách cũ tại chỗ. Trả về danh sách mới hoàn toàn → dễ test, dễ debug, tránh side-effect.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Là nền tảng trực tiếp sinh ra khái niệm hiện tại.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Lifecycle Hooks — OnCompaction](02_atomic_nodes/HAE-concept-lifecycle-hooks.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Session Persistence](02_atomic_nodes/HAE-concept-session-persistence.md) — OnCompaction hook lưu lịch sử cũ trước khi xóa

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
