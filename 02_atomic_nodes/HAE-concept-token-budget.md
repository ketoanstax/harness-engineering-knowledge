---
id: HAE-concept-token-budget
title: "Token Budget - Ngân Sách Token Và Cơ Chế Phân Bổ"
category: "Harness Architecture"
tags:
  - token-budget
  - context-window
  - budget-allocation
  - cache-optimization
  - harness-primitive
date: 2026-05-24
parent: context-manager
---

# Token Budget - Ngân Sách Token Và Cơ Chế Phân Bổ

## 💡 Định nghĩa & Nội dung Cốt lõi
Cửa sổ context có giới hạn cứng (200K token). Mọi thành phần (system prompt, tin nhắn, kết quả tool) đều tranh nhau ngân sách này. Token Budget là cơ chế phân bổ ngân sách token cho từng phần, đảm bảo không thành phần nào chiếm quá nhiều và Agent vẫn có đủ không gian để suy nghĩ.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Ngân sách cho Context Động:** Mỗi file CLAUDE.md được gom có ngân sách riêng (mặc định 4000 token/file). Tổng context động có ngân sách chung 12.000 token. Vượt ngưỡng → phần dư bị cắt bớt.
- **Phân bổ ưu tiên:** Task hiện tại + kết quả tool gần đây được ưu tiên cao nhất. Lịch sử hội thoại cũ được tóm tắt hoặc loại bỏ để nhường chỗ.
- **Cache-Friendly Ordering:** Static core prompt đặt đầu (cache hit cao). Context động đặt sau (thay đổi theo project). Thứ tự này ảnh hưởng trực tiếp đến chi phí token.
- **200K nghe lớn nhưng không đủ:** Chạy vài tiếng → context đầy. Không phải vấn đề của model yếu mà là bản chất của phiên làm việc dài. Budget management là kỹ năng sống còn.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Context Manager](02_atomic_nodes/HAE-concept-context-manager.md) — Là nền tảng trực tiếp sinh ra khái niệm hiện tại.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Compaction Strategy](02_atomic_nodes/HAE-concept-compaction-strategy.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md) — Ngân sách token cho system prompt
  - [Instruction File Pitfall](02_atomic_nodes/HAE-concept-instruction-file-pitfall.md) — File hướng dẫn quá lớn ăn hết token budget

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
