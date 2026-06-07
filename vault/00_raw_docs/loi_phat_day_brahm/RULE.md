# 00_raw_docs/loi_phat_day_brahm/RULE.md — Quy tắc Domain: Lời Phật Dạy Brahm

Quy tắc này quản lý các tài liệu thô thuộc domain **Lời Phật Dạy Brahm** (Các bài giảng của Thiền sư Ajahn Brahm).

---

## 📋 Mô tả Domain

- **Nội dung:** Các bài giảng giải Phật học do Thiền sư Ajahn Brahm trình bày, được dịch sang tiếng Việt.
- **Vai trò:** Là nguồn đầu vào (Layer 1) cho pipeline xử lý tri thức Harness.

---

## 📋 Quy tắc Cốt lõi

### 1. YAML Frontmatter
Mỗi file bắt buộc có:

```yaml
---
title: "..."
domain: "loi-phat-day-brahm"
status: processed | to-process
---
```

### 2. Đặt tên file
- Định dạng: `buoi_{số thứ tự 2 chữ số}.md`

---