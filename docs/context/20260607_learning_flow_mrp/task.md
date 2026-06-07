# Task Checklist: MRP Learning Flow

- [x] Tạo `src/domain/entities/learning.entity.ts` với `LearningResult` và `DraftNode`
- [x] Cập nhật `INodeRepository` trong `src/domain/interfaces/node-repository.interface.ts`
- [x] Hiện thực `add(node: DraftNode)` trong `FileSystemNodeRepository`
- [x] Tạo `LearningService` trong `src/application/services/learning.service.ts`
- [x] Cập nhật `IngestDocumentUseCase` (sử dụng `tokenize`, tích hợp `LearningService` trong `query`)
- [x] Mở rộng UI / CLI router `src/presentation/ui/shell-router.ts` (thêm các lệnh `/approve-draft`, `/reject-draft` và hiển thị draft)
- [x] Cấu hình DI trong `src/presentation/composition-root.ts`
- [x] Viết test tự động và chạy `bun test`
- [x] Chạy typecheck và kiểm tra thủ công bằng Interactive Shell
- [x] Hoàn thành `walkthrough.md` trong thư mục context
