# 00_raw_docs/giang_giai_trung_bo_modern/RULE.md — Quy tắc Domain: Giảng giải Trung Bộ Modern

Quy tắc này quản lý các tài liệu thô thuộc domain **Giảng giải Trung Bộ Modern** (Majjhima Nikaya).

---

## 📋 Mô tả Domain

- **Nội dung:** Các bài giảng giải từng bài kinh trong Trung Bộ Kinh (kênh Lắng Nghe Pháp).
- **Đặc điểm:** Đây là bản chép/gỡ băng giảng giải từng bài kinh, không phải bản dịch Pali gốc của HT Thích Minh Châu.
- **Vai trò:** Là nguồn đầu vào (Layer 1) cho pipeline xử lý tri thức Harness.

---

## 📋 Quy tắc Cốt lõi

### 1. YAML Frontmatter
Mỗi file bắt buộc có:

```yaml
---
title: "mn-{số_thứ_tự}"
domain: "giang-giai-trung-bo-modern"
status: processed | to-process
---
```

### 2. Đặt tên file
- Định dạng: `mn-{số thứ tự 3 chữ số}.md`
- Luôn viết thường, không ký tự đặc biệt, không khoảng trắng.

---