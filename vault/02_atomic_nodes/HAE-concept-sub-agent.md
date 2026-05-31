---
id: HAE-concept-sub-agent
title: "Sub-Agent - Ủy Quyền Tác Vụ Cô Lập"
category: "Harness Architecture"
tags:
  - sub-agent
  - task-delegation
  - context-isolation
  - explore-general-verify
  - harness-concept
date: 2026-05-24
parent: null
children:
  - context-isolation
---

# Sub-Agent - Ủy Quyền Tác Vụ Cô Lập

## 💡 Định nghĩa & Nội dung Cốt lõi
Khi tác vụ quá lớn (tái cấu trúc toàn bộ phân hệ xác thực, viết kiểm thử, cập nhật tài liệu), Agent chính sẽ quá tải — context đầy nhanh, sự chú ý bị phân tán, Agent bắt đầu làm sai. Sub-Agent là cơ chế sinh ra Agent con nhận task cô lập, chạy trong session riêng, hoàn toàn tách biệt.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Context Tối Thiểu (Minimal Context):** Agent chính KHÔNG giao toàn bộ context cho sub-agent. Chỉ giao đúng: task rõ ràng + file liên quan + permission tối thiểu. Tương tự giao việc cho thực tập sinh: không kể cả tuần bạn đang làm gì, chỉ nói "file này, task này, xong thì báo".
- **Session Cô Lập (Isolated Session):** Sub-agent chạy trong session riêng. Khi xong chỉ trả lại kết quả, không trả lại toàn bộ lịch sử làm việc.
- **Ba Kiểu Dựng Sẵn:** Explore (chỉ quyền đọc, dùng để tìm kiếm), General (quyền UserSpace, thực thi việc chính), Verify (quyền UserSpace + Bash, chạy test xác nhận thay đổi). 3 kiểu này đủ xử lý 90% use case.
- **Lỗi phổ biến nhất:** Truyền toàn bộ context của Agent chính vào sub-agent → sub quá tải ngay từ đầu, context bị nhiễu, output kém chất lượng.

## 🌳 Nốt con (Sub-Nodes) — Khi cần đào sâu
- [Context Isolation — Nguyên Tắc Cô Lập Ngữ Cảnh](02_atomic_nodes/HAE-concept-context-isolation.md) — Lỗi phổ biến và cách truyền context đúng cho sub-agent

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Tool Skill Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Agent Overreach](02_atomic_nodes/HAE-concept-agent-overreach.md) — Sub-agent giúp giới hạn blast radius
  - [Initialization Phase](02_atomic_nodes/HAE-concept-initialization-phase.md) — Plan trước khi ủy quyền sub-agent

- **Quả chuyển hóa (Derivative Effects):**
  - [Context Isolation](02_atomic_nodes/HAE-concept-context-isolation.md) — Được nốt hiện tại mở đường hoặc trực tiếp thúc đẩy phát sinh.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
