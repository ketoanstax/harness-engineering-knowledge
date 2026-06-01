# 00_nikaya_raw/RULE.md - Quy tắc Vận hành Kinh văn Gốc (Layer 1)

Quy tắc này quản lý cách cào, lưu trữ và bảo vệ Kinh văn nguyên bản (bản dịch của HT Thích Minh Châu) trước khi đưa vào xử lý.

## 📋 Quy tắc Cốt lõi

1. **Bảo toàn nguyên bản tuyệt đối:** 
   - Không được tự ý chỉnh sửa nội dung nguồn của Kinh tạng.
   - Mọi sửa lỗi chính tả hay bổ sung giải thích từ ngữ sẽ được thực hiện ở các layer phía sau.

2. **Cấu trúc YAML Frontmatter:**
   Mỗi file Kinh văn gốc bắt buộc phải có frontmatter để quản lý trạng thái:
   ```yaml
   ---
   id: sutta-mn-{{số_kinh}}
   title: "{{tên_bài_kinh}}"
   category: "Nikaya Raw Sutta"
   tags:
     - raw-source
     - nikaya
     - trung-bo-kinh
   date: 2026-05-25
   status: processed # Hoặc processed sau khi đã cấu trúc hóa
   ---
   ```

3. **Ghi chú về nguồn dịch:**
   Ở cuối file luôn phải ghi rõ: "Bản dịch của Hòa thượng Thích Minh Châu" và nguồn trích dẫn (ví dụ: Kinh Trung Bộ, Viện Nghiên Cứu Phật Học Việt Nam).

4. **Đặt tên file sạch:**
   Sử dụng slug viết thường, nối nhau bằng dấu gạch ngang (ví dụ: `sutta-mn-01.md`). Tuyệt đối không dùng ký tự đặc biệt hoặc khoảng trắng.
