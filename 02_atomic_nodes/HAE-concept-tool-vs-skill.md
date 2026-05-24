---
id: HAE-concept-tool-vs-skill
title: "Tool vs Skill - Sự Khác Biệt Triết Lý"
category: "Harness Architecture"
tags:
  - tool-vs-skill
  - primitive
  - project-specific
  - universal-vs-contextual
  - harness-primitive
date: 2026-05-24
parent: tool-skill-registry
---

# Tool vs Skill - Sự Khác Biệt Triết Lý

## 💡 Định nghĩa & Nội dung Cốt lõi
Tool và Skill thường bị gộp làm một nhưng có sự khác biệt triết lý sâu sắc. **Tool trả lời: "Tôi có thể làm gì?"** — đó là viên gạch phổ quát. **Skill trả lời: "Làm theo thứ tự nào?"** — đó là bản vẽ riêng cho từng project. Một bên mang tính phổ quát, một bên gắn với ngữ cảnh cụ thể.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Tool là Primitive:** Hành động cơ bản nhất — read file, edit file, bash, web fetch. Mỗi tool có JSON schema mô tả input. Agent gọi bằng cách trả về JSON đúng schema. Dùng được ở mọi project.
- **Skill là Workflow:** File hướng dẫn gắn theo project cụ thể. Ví dụ: skill "chuyển đổi database" gồm Bước 1 sao lưu → Bước 2 chạy migration → Bước 3 verify số dòng. Agent đọc skill → biết thứ tự thực hiện.
- **Registry là Cầu nối:** Lưu tool vào từ điển, mọi đăng ký đều tường minh (không decorator, không magic). Khi Agent cần → hỏi Registry → nhận danh sách đúng ngữ cảnh.
- **Tương đương trong Vault này:** Thư mục `.agent/` (hae-analyzer.md, hae-writer.md, hae-auditor.md) chính là Skills. Các tool (Read, Edit, Bash) là primitives được Harness cung cấp sẵn.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - [Tool Skill Registry](02_atomic_nodes/HAE-concept-tool-skill-registry.md) — Là nền tảng trực tiếp sinh ra khái niệm hiện tại.

- **Hội tụ Duyên (Supporting Conditions):**
  - [Built-in Skills](02_atomic_nodes/HAE-concept-built-in-skills.md) — Built-in skills khác user-defined skills
  - [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md) — Sub-agent sử dụng tool/skill

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
