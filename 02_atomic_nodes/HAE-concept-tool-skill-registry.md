---
id: HAE-concept-tool-skill-registry
title: "Tool, Skill & Registry - Bộ Ba Năng Lực Của Agent"
category: "Harness Architecture"
tags:
  - tool-registry
  - skill
  - tool-primitive
  - registry-pattern
  - harness-primitive
date: 2026-05-24
parent: null
children:
  - tool-vs-skill
---

# Tool, Skill & Registry - Bộ Ba Năng Lực Của Agent

## 💡 Định nghĩa & Nội dung Cốt lõi
Ba khái niệm thường bị gộp làm một nhưng thực ra rất khác nhau. **Tool** là primitive — hành động cơ bản nhất (read file, edit file, bash, web fetch). **Skill** là file hướng dẫn gắn theo từng project cụ thể. **Registry** biết project có những skill/tool nào và trả về danh sách đúng ngữ cảnh khi Agent cần.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Tool là viên gạch phổ quát:** Mỗi tool có JSON schema mô tả input. Agent gọi tool bằng cách trả về JSON đúng schema. Harness nhận, thực thi và trả kết quả. Tool trả lời: "Tôi có thể làm gì?"
- **Skill là bản vẽ riêng project:** Ví dụ skill "chuyển đổi dữ liệu database" gồm: Bước 1 sao lưu → Bước 2 chạy migration → Bước 3 verify số dòng. Skill trả lời: "Làm theo thứ tự nào?"
- **Registry điều phối ở giữa:** Registry lưu tool vào từ điển, đăng ký tường minh (không dùng decorator, không tự dò code). Ai đọc vào cũng biết hệ thống đang có gì. Khi Agent cần, hỏi Registry → nhận danh sách đúng ngữ cảnh.
- **Đăng ký tường minh (Explicit Registration):** Mọi tool đều phải đăng ký tường minh. Không có magic. Không có auto-discovery. Minh bạch tuyệt đối.

## 🌳 Nốt con (Sub-Nodes) — Khi cần đào sâu
- [Tool vs Skill — Sự Khác Biệt Triết Lý](02_atomic_nodes/HAE-concept-tool-vs-skill.md) — Phân biệt sâu giữa primitive phổ quát và bản vẽ riêng project

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [Outer Loop](02_atomic_nodes/HAE-concept-outer-loop.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Sub-Agent](02_atomic_nodes/HAE-concept-sub-agent.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Built-in Skills](02_atomic_nodes/HAE-concept-built-in-skills.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Permission Layers](02_atomic_nodes/HAE-concept-permission-layers.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Harness Definition](02_atomic_nodes/HAE-concept-harness-definition.md) — Tool/Skill là thành phần của hệ sinh thái Harness

- **Quả chuyển hóa (Derivative Effects):**
  - [Tool Vs Skill](02_atomic_nodes/HAE-concept-tool-vs-skill.md) — Được nốt hiện tại mở đường hoặc trực tiếp thúc đẩy phát sinh.

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Bản chắt lọc: 9 Thành Phần Lõi Harness](01_structured_docs/nine-core-harness-components-processed.md)
  - [Ghi chú thô: 9 Thành Phần Lõi Harness](00_raw_docs/nine-core-harness-components.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
