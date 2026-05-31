---
id: lecture-14-blast-radius-advanced
title: "Lecture 14 - Kỹ thuật nâng cao kiểm soát Blast Radius trong Hệ thống AI"
category: "Raw Knowledge Source"
tags:
  - raw-source
  - lecture
date: 2026-05-31
status: processed
---

# Lecture 14 - Kỹ thuật nâng cao kiểm soát Blast Radius trong Hệ thống AI

Khi AI Agent thực thi mã nguồn hoặc gọi các công cụ hệ thống, rủi ro lớn nhất là nó vượt qua ranh giới an toàn cho phép và gây phá hủy. Kỹ nghệ thiết kế Harness hiện đại đòi hỏi một khái niệm nâng cao hơn: **Blast Radius Isolation (Cô lập phạm vi ảnh hưởng)**.

## 1. Bản chất của Blast Radius Isolation
Thay vì chỉ kiểm tra quyền thô sơ, hệ thống áp dụng cơ chế cô lập cứng ở lớp dưới:
- **Sandbox Containerization**: Mỗi Agent thực thi trong một Worktree cô lập của Git hoặc một Docker Container dùng một lần (ephemeral).
- **Hard Resource Quotas**: Giới hạn cứng dung lượng ghi đĩa cứng, dung lượng bộ nhớ CPU để tránh Agent chạy ngầm vô tận.

---
Nguồn gốc: Giáo trình nâng cao Kỹ nghệ Harness.
URL: https://walkinglabs.github.io/learn-harness-engineering/vi/lecture-14/
