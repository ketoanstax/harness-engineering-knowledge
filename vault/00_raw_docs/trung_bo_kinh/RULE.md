# 00_raw_docs/trung_bo_kinh/RULE.md — Quy tắc Domain: Giảng giải Trung Bộ Kinh

Quy tắc này quản lý các tài liệu thô thuộc domain **Giảng giải Trung Bộ Kinh (Majjhima Nikaya)**.

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
domain: "trung-bo-kinh"       # BẮT BUỘC: khớp với tên thư mục cha
status: processed | to-process # BẮT BUỘC
---
```

### 2. Đặt tên file
- Định dạng: `mn-{số thứ tự 3 chữ số}.md`
- Ví dụ: `mn-001.md`, `mn-005.md`, `mn-152.md`
- Luôn viết thường, không ký tự đặc biệt, không khoảng trắng.

### 3. Bảo toàn nội dung gốc
- Không chỉnh sửa nội dung giảng giải.
- Không thêm giải thích cá nhân vào file thô.
- Mọi phân tích, chắt lọc phải thực hiện ở Layer 2 (`01_structured_docs/`) trở lên.

---

## 🔗 Pipeline Xử lý

1. File thô tại `00_raw_docs/trung_bo_kinh/`
2. → Chắt lọc cấu trúc tại `01_structured_docs/{slug}-processed.md` (source trỏ về `00_raw_docs/trung_bo_kinh/{file}`)
3. → Phân rã nguyên tử tại `02_atomic_nodes/HAE-concept-{slug}.md`
