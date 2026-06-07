# Implementation Plan: EPUB Input Support

Kế hoạch tích hợp trích xuất nội dung từ định dạng tài liệu EPUB vào hệ thống MRP Ingestion Pipeline.

## Proposed Changes

### Dependency Updates

#### [MODIFY] [package.json](file:///home/ka/Repos/github.com/ketoanstax/harness-engineering/package.json)
Thêm thư viện xử lý EPUB:
- `"epub": "^1.2.1"` (hoặc một phiên bản ổn định tương tự).
- `"html-to-text": "^9.0.0"` (để trích xuất text thuần từ XHTML/HTML của sách EPUB).

---

### Infrastructure Layer

#### [MODIFY] [extractors.ts](file:///home/ka/Repos/github.com/ketoanstax/harness-engineering/src/infrastructure/tools/document-reader/extractors.ts)
- Định nghĩa class `EpubExtractor` triển khai `IFileExtractor`.
- Sử dụng thư viện `epub` để đọc file, duyệt qua `epub.flow` và trích xuất HTML từng chương, sau đó dùng `html-to-text` chuyển đổi thành plain text sạch.
- Phương thức `supports(ext: string)` trả về `true` cho `.epub`.

#### [MODIFY] [composition-root.ts](file:///home/ka/Repos/github.com/ketoanstax/harness-engineering/src/presentation/composition-root.ts)
- Khởi tạo `EpubExtractor` và đưa vào danh sách của `DocumentReaderTool`.
  ```typescript
  const epubExtractor = new EpubExtractor(fileSystem);
  const docReader = new DocumentReaderTool([textExtractor, pdfExtractor, docxExtractor, epubExtractor]);
  ```

---

### Application Layer

#### [MODIFY] [ingest-document.use-case.ts](file:///home/ka/Repos/github.com/ketoanstax/harness-engineering/src/application/use-cases/ingest-document.use-case.ts)
- Cập nhật danh sách các đuôi file hỗ trợ quét tự động trong hàm `scanAndSortFiles` (dòng 466):
  ```typescript
  const supportedExts = ['.md', '.txt', '.pdf', '.docx', '.csv', '.epub'];
  ```

## Verification Plan

### Automated Tests
- Tạo file `.epub` kiểm thử giả lập nhỏ.
- Viết unit test cho `EpubExtractor` xác nhận trích xuất chính xác tiêu đề và nội dung.
- Chạy `bun test` và `bunx tsc --noEmit`.

### Manual Verification
- Đặt một tệp sách `.epub` vào thư mục `00_raw_docs/` với trạng thái `status: to-process` (hoặc chạy trực tiếp trên file qua shell).
- Thực thi pipeline `/run` chọn file `.epub` đó để kiểm tra khả năng trích xuất và sinh nốt tự động.
