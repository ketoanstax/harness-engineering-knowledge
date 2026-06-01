# 00_raw_docs/RULE.md — Quy tắc Tổ chức Tài liệu Thô theo Domain

Quy tắc này quản lý cách tổ chức tài liệu thô trong `00_raw_docs/` theo mô hình **mỗi thư mục con là một domain tri thức độc lập**, mỗi domain có RULE.md riêng.

---

## 🗂️ Kiến trúc Domain Subdirectory

```
00_raw_docs/
├── RULE.md              ← Quy tắc này (tổng quan)
├── domain-A/            ← Thư mục con = 1 domain
│   ├── RULE.md          ← Quy tắc riêng cho domain A
│   └── *.md             ← Tài liệu thô thuộc domain A
├── domain-B/
│   ├── RULE.md
│   └── *.md
└── ...
```

### Nguyên tắc
1. **Mỗi thư mục con = 1 domain tri thức độc lập.** Ví dụ: `phat-hoc/`, `khoa-hoc-may-tinh/`, `tam-ly-hoc/`.
2. **Mỗi thư mục con PHẢI có RULE.md riêng** mô tả:
   - Domain này thu thập tài liệu gì, từ nguồn nào.
   - Yêu cầu frontmatter tối thiểu.
   - Quy tắc đặt tên file.
   - Quy tắc bảo toàn nội dung gốc.
3. **Tài liệu thô KHÔNG được đặt ở root `00_raw_docs/`** — root chỉ chứa RULE.md này.
   - *Ngoại lệ:* Các file legacy hiện tại (`sutta-mn-*.md`, `lecture-*.md`) được giữ nguyên để tránh gãy backlink, nhưng domain mới PHẢI đặt trong subdir.

---

## 📋 Quy tắc Frontmatter Chung (Áp dụng cho MỌI domain)

Mỗi file tài liệu thô PHẢI có YAML frontmatter tối thiểu:

```yaml
---
title: "{{tên-tài-liệu}}"
domain: "{{tên-domain-slug}}"    # BẮT BUỘC: domain: phat-hoc | tam-ly-hoc | ...
status: processed | to-process    # BẮT BUỘC: processed = đã qua xử lý
source: "{{URL-hoặc-mô-tả-nguồn}}" # Khuyến khích
date: {{YYYY-MM-DD}}              # Khuyến khích
---
```

> **Lưu ý:** Trường `domain:` phải khớp với tên thư mục cha. Ví dụ file trong `phat-hoc/` phải có `domain: phat-hoc`.

---

## 🔗 Liên kết & Truy vết

- Khi `01_structured_docs/` hoặc `02_atomic_nodes/` trỏ về tài liệu thô, đường dẫn PHẢI bao gồm subdir:
  - ĐÚNG: `00_raw_docs/phat-hoc/sutta-mn-001.md`
  - SAI: `00_raw_docs/sutta-mn-001.md`

---

## 📂 Danh sách Domain Hiện tại

| Thư mục | Domain | Trạng thái |
|:---|:---|---|
| *(root)* | Legacy: Nikaya + Lecture | 🟡 Di sản (giữ nguyên) |
| `loi_phat_day/` | Giảng giải Phật học (Lời Phật dạy) | 🟢 Hoạt động |
| `trung_bo_kinh/` | Giảng giải Trung Bộ Kinh | 🟢 Hoạt động |

---

## 🛡️ Cơ chế Phát hiện File Sai Domain (Auto-Detect)

**Script:** `scripts/validate_raw_docs.py`

Khi chạy, script sẽ:
1. Quét tất cả file `.md` trong mỗi subdir của `00_raw_docs/`.
2. Kiểm tra trường `domain:` trong frontmatter có khớp với tên thư mục cha không.
3. Báo cáo file nào bị đặt sai thư mục.
4. Đề xuất đường dẫn đúng.

> Script này được gọi tự động trong quy trình kiểm toán (Audit Workflow) của `.agent/hae-auditor.md`.

---

*Quy tắc này đảm bảo `00_raw_docs/` có thể mở rộng theo bất kỳ domain tri thức nào mà không phá vỡ cấu trúc hiện tại.*
