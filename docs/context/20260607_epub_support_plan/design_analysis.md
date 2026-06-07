# Design Analysis: EPUB Input Support

## 1. Trạng thái hiện tại
Hiện tại, ứng dụng **chưa hỗ trợ** nạp file định dạng `.epub`.
Hệ thống trích xuất văn bản (`DocumentReaderTool` tại `src/infrastructure/tools/document-reader/`) hiện chỉ có 3 Extractor:
- `TextExtractor` (hỗ trợ `.md`, `.txt`, `.csv`)
- `PdfTextExtractor` (hỗ trợ `.pdf` qua thư viện `pdf-parse`)
- `DocxExtractor` (hỗ trợ `.docx` qua thư viện `mammoth`)

Để nạp được file `.epub` vào hệ thống, chúng ta cần bổ sung thêm một Extractor chuyên biệt cho định dạng này.

## 2. Giải pháp kỹ thuật tối ưu & CLEAN
Để giữ kiến trúc **Clean Architecture** (Dependency Inversion, Separation of Concerns):
- **Domain/Application Layer**: Giữ nguyên vẹn, không cần thay đổi. Các Use Cases chỉ giao tiếp thông qua các Interface trừu tượng.
- **Infrastructure Layer**:
  - Thêm một class mới `EpubExtractor` kế thừa interface `IFileExtractor` trong `src/infrastructure/tools/document-reader/extractors.ts`.
  - Cài đặt thư viện xử lý định dạng EPUB phù hợp.
  - Cập nhật danh sách Extractor được chấp nhận ở `composition-root.ts` và danh sách định dạng hỗ trợ quét tệp trong `ingest-document.use-case.ts`.

### Lựa chọn thư viện EPUB Parser:
Để đảm bảo ứng dụng chạy mượt mà trên môi trường **Bun** mà không gặp lỗi binding thư viện C++ phức tạp:
1. **`epub`**: Thư viện JavaScript thuần (pure-js), dễ cài đặt và ổn định cao trên Node.js/Bun.
2. **`html-to-text`** hoặc dùng regex đơn giản để loại bỏ các thẻ HTML/XHTML thừa sau khi parse nội dung từ chương sách EPUB, giúp văn bản trích xuất được sạch sẽ (clean text).
