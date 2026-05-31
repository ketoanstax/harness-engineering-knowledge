# 00_raw_docs/RULE.md - Quy tắc Vận hành Tài liệu Thô (Layer 1)

Quy tắc này quản lý cách thu thập, lưu trữ và bảo vệ dữ liệu tri thức nguyên bản trước khi đưa vào xử lý.

## 📋 Quy tắc Cốt lõi

1. **Giữ nguyên bản tuyệt đối:** 
   - Không được sửa đổi nội dung nguồn của dữ liệu thô (web scrape, transcript, paper...).
   - Mọi chỉnh sửa, sửa lỗi chính tả hay bổ sung sẽ được thực hiện ở các layer phía sau.

2. **Cấu trúc YAML Frontmatter:**
   Mỗi file thô bắt buộc phải có frontmatter đúng định dạng để quản lý trạng thái:
   ```yaml
   ---
   id: {{source-slug}}
   title: "{{source-title}}"
   category: "Raw Knowledge Source"
   tags:
     - raw-source
     - {{source-type}} (ví dụ: website, video, paper)
   date: 2026-05-24
   status: processed # Hoặc processed sau khi đã cấu trúc hóa
   ---
   ```

3. **Ghi chú về nguồn:**
   Ở cuối file thô luôn phải ghi rõ URL gốc, thời gian cào dữ liệu, hoặc thông tin tác giả để đảm bảo tính minh bạch về nguồn gốc.

4. **Đặt tên file sạch:**
   Sử dụng slug viết thường, nối nhau bằng dấu gạch ngang (ví dụ: `nine-core-harness-components.md`). Tuyệt đối không dùng ký tự đặc biệt hoặc khoảng trắng.

---
*Quy tắc này được thiết lập để đảm bảo tính toàn vẹn của dữ liệu gốc. Tuân thủ tuyệt đối.*
