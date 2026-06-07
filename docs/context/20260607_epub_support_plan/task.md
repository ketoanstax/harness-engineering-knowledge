# Task Checklist: EPUB Input Support

- [x] Cài đặt các thư viện hỗ trợ: `epub`, `html-to-text` và `@types/html-to-text`
- [x] Triển khai `EpubExtractor` trong `src/infrastructure/tools/document-reader/extractors.ts`
- [x] Cập nhật `DocumentReaderTool` trong `src/presentation/composition-root.ts`
- [x] Bổ sung đuôi `.epub` vào danh sách hỗ trợ của `IngestDocumentUseCase`
- [x] Viết test tự động xác thực `EpubExtractor`
- [x] Chạy `bun test` và `bunx tsc --noEmit`
- [x] Tạo file walkthrough ghi nhận kết quả hoàn thành
