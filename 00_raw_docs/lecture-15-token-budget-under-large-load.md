---
id: lecture-15-token-budget-under-large-load
title: "Lecture 15 - Quản trị Token Budget dưới tải lớn"
category: "Raw Knowledge Source"
tags:
  - raw-source
  - lecture
date: 2026-05-31
status: processed
---

# Lecture 15 - Quản trị Token Budget dưới tải lớn

Khi xử lý các file mã nguồn khổng lồ hoặc khối lượng tài liệu doanh nghiệp đồ sộ, Token Budget của Agent bị kéo căng đến mức cực hạn.

## 1. Mối liên hệ với Blast Radius Isolation
Để bảo vệ Token Budget không bị cạn kiệt do Agent rơi vào vòng lặp vô tận, chúng ta tích hợp **Blast Radius Isolation** ở lớp mạng lưới. Bằng cách giới hạn số lượng request API tối đa và tổng số token đầu ra của mỗi Agent trong Sandbox cô lập, chúng ta ngăn chặn được 95% sự lãng phí token unsolicited.

---
Nguồn gốc: Giáo trình nâng cao Kỹ nghệ Harness.
URL: https://walkinglabs.github.io/learn-harness-engineering/vi/lecture-15/
