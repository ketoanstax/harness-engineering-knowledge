# 00_raw_docs/loi_phat_day/RULE.md — Quy tắc Domain: Giảng giải Phật học (Lời Phật dạy)

Quy tắc này quản lý các tài liệu thô thuộc domain **Giảng giải Phật học — khóa Lời Phật dạy**.

---

## 📋 Mô tả Domain

- **Nội dung:** Các bài giảng giải kinh điển Phật học từ khóa Lời Phật dạy (giảng sư: HT Viên Minh).
- **Đặc điểm:** Đây là bản chép/gỡ băng giảng giải, không phải bản dịch kinh gốc.
- **Vai trò:** Là nguồn đầu vào (Layer 1) cho pipeline xử lý tri thức Harness.

---

## 📋 Quy tắc Cốt lõi

### 1. YAML Frontmatter
Mỗi file bắt buộc có:

```yaml
---
title: "buoi_{số_thứ_tự}"
domain: "loi-phat-day"       # BẮT BUỘC: khớp với tên thư mục cha
status: processed | to-process # BẮT BUỘC
---
```

### 2. Đặt tên file
- Định dạng: `buoi_{số thứ tự 2 chữ số}.md`
- Ví dụ: `buoi_01.md`, `buoi_15.md`
- Luôn viết thường, không ký tự đặc biệt, không khoảng trắng.

### 3. Bảo toàn nội dung gốc
- Không chỉnh sửa nội dung giảng giải.
- Không thêm giải thích cá nhân vào file thô.
- Mọi phân tích, chắt lọc phải thực hiện ở Layer 2 (`01_structured_docs/`) trở lên.

---

## 🔗 Pipeline Xử lý

1. File thô tại `00_raw_docs/loi_phat_day/`
2. → Chắt lọc cấu trúc tại `01_structured_docs/{slug}-processed.md` (source trỏ về `00_raw_docs/loi_phat_day/{file}`)
3. → Phân rã nguyên tử tại `02_atomic_nodes/HAE-concept-{slug}.md`
