# 00_raw_docs/nikaya_trung_bo/RULE.md — Quy tắc Domain: Kinh điển Nikaya Trung Bộ

Quy tắc này quản lý các tài liệu thô thuộc domain **Kinh điển Nikaya Trung Bộ** (Kinh điển Nikaya dịch bởi Thích Minh Châu).

---

## 📋 Mô tả Domain

- **Nội dung:** Các kinh văn dịch nguyên bản từ Pali sang Việt ngữ.
- **Đặc điểm:** Sách cổ, kinh điển Phật giáo.
- **Vai trò:** Là nguồn đầu vào (Layer 1) cho pipeline MRP.

---

## 📋 Quy tắc Cốt lõi

### 1. YAML Frontmatter
Mỗi file bắt buộc có:

```yaml
---
title: "..."
domain: "nikaya-trung-bo"
status: processed | to-process
---
```

### 2. Đặt tên file
- Định dạng: `sutta-mn-{số thứ tự 3 chữ số}.md`.

---