---
id: HAE-concept-instruction-file-pitfall
title: "Tránh bẫy File Hướng Dẫn Khổng Lồ"
category: "Cognitive Management"
tags:
  - claudemd-pitfall
  - cognitive-load
  - knowledge-splitting
  - harness-concept
date: 2026-05-24
parent: null
---

# Tránh bẫy File Hướng Dẫn Khổng Lồ

## 💡 Định nghĩa & Nội dung Cốt lõi
Dồn tất cả các quy tắc và hướng dẫn vào một file chỉ dẫn duy nhất (như CLAUDE.md quá lớn) sẽ gây ra tình trạng quá tải nhận thức cho Agent, làm loãng ngữ cảnh và khiến Agent bỏ qua các quy tắc quan trọng.

## ⚙️ Nguyên lý Kỹ thuật & Thực tiễn
- **Giới hạn nhận thức:**  Agent chỉ có khả năng xử lý hiệu quả một lượng từ khóa giới hạn trong mỗi turn. File quá to khiến mô hình bị phân tâm.
- **Phân tách tri thức nguyên tử:**  Chia nhỏ các quy tắc thành các tệp tin chuyên đề độc lập (ví dụ
- **Thiết lập bảng định tuyến:**  Giữ CLAUDE.md ở quy mô nhỏ gọn, chỉ đóng vai trò 'hiến pháp' cốt lõi và chứa liên kết điều hướng tới các nốt kiến thức chi tiết.

---

## 🔗 Mạng lưới Nhân Duyên Quả (Causal Web)

- **Nhân gốc (Causal Core):**
  - *Không có Nhân gốc trực tiếp (Khái niệm nền tảng gốc).*

- **Hội tụ Duyên (Supporting Conditions):**
  - [System Of Record](02_atomic_nodes/HAE-concept-system-of-record.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Session Continuity](02_atomic_nodes/HAE-concept-session-continuity.md) — Đóng vai trò là điều kiện/chất xúc tác hỗ trợ ngữ cảnh.
  - [Token Budget](02_atomic_nodes/HAE-concept-token-budget.md) — File quá lớn ăn hết ngân sách token
  - [Dynamic System Prompt](02_atomic_nodes/HAE-concept-dynamic-system-prompt.md) — Ngân sách 4000 token/file CLAUDE.md

- **Quả chuyển hóa (Derivative Effects):**
  - *Chưa có Quả chuyển hóa trực tiếp (N nốt lá của cây tri thức).*

- **Dẫn chứng & Nguồn gốc (Evidence & Context):**
  - [Ghi chú cấu trúc: Lecture 04 - Tại sao một file hướng dẫn khổng lồ lại thất bại](01_structured_docs/lecture-04-why-one-giant-instruction-file-fails-processed.md)
  - [Ghi chú thô: Lecture 04 - Tại sao một file hướng dẫn khổng lồ lại thất bại](00_raw_docs/lecture-04-why-one-giant-instruction-file-fails.md)

- **Đúc kết vĩ mô (Distilled Thoughts):**
  - [Tuyên ngôn Harness Engineering](04_distilled/harness-engineering-manifesto.md)
