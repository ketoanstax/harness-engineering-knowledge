# 01_structured_docs/RULE.md - Quy tắc Vận hành Tài liệu Cấu trúc (Layer 2)

Quy tắc này quản lý cách trích xuất, tóm tắt và chắt lọc kiến thức từ Layer 1 sang Layer 2 để làm sạch tri thức cho AI và Con người.

## 📋 Quy tắc Cốt lõi

1. **YAML Frontmatter bắt buộc:**
   Mỗi tệp cấu trúc phải có YAML frontmatter chỉ định rõ nguồn gốc:
   ```yaml
   ---
   id: {{source-slug}}-processed
   title: "{{source-title}} - Bản Chắt Lọc Cấu Trúc"
   category: "Structured Knowledge"
   tags:
     - structured
     - processed
   date: 2026-05-24
   source: "00_raw_docs/{{source-slug}}.md"
   ---
   ```

2. **Cấu trúc nội dung 3 phần tối thượng:**
   Mỗi tài liệu cấu trúc bắt buộc phải được chia làm 3 phần rõ ràng:
   - **💡 Key Takeaways**: 3-5 đúc kết quan trọng nhất của bài học.
   - **🗝️ Keywords & Core Concepts**: Định nghĩa ngắn gọn các khái niệm cốt lõi xuất hiện trong bài.
   - **📝 AI-Ready Summary**: Bản tóm tắt cấu trúc cực kỳ súc tích, lược bỏ ngôn ngữ thừa thãi để AI đọc nhanh nhất.

3. **Liên kết nguồn (Backlink):**
   Phải có liên kết rõ ràng trỏ ngược về file thô tương ứng ở `00_raw_docs/` để phục vụ việc truy vết dẫn chứng.

4. **Chuẩn bị cho Phân rã:**
   Các Keywords được định nghĩa ở đây chính là nền tảng để tạo ra các Nốt nguyên tử ở `02_atomic_nodes/`. Đảm bảo định nghĩa rõ ràng để việc phân rã chính xác.

---
*Quy tắc này giúp tối ưu hóa dung lượng đọc cho AI, giảm thiểu token lãng phí và tăng tốc độ xử lý.*
