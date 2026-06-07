# Implementation Plan: MRP Learning Flow

Thực hiện luồng tự động học (LEARN) khi truy vấn (query) tìm kiếm khái niệm trong kho tri thức trả về 0 kết quả. Hệ thống sẽ gọi LLM tạo một "nốt nháp" (DraftNode), hiển thị giao diện để người dùng duyệt (Approve/Reject), sau đó ghi vào kho lưu trữ (Vault) dưới dạng nốt nguyên tử mới.

## Proposed Changes

### Domain Layer
- **`src/domain/entities/learning.entity.ts`**: Định nghĩa `LearningResult` enum và interface `DraftNode`.
- **`src/domain/interfaces/node-repository.interface.ts`**: Khai báo `add(node: DraftNode): Promise<void>`.

### Infrastructure Layer
- **`src/infrastructure/repositories/file-system-node-repository.ts`**: Hiện thực `add(node: DraftNode): Promise<void>`. Lưu file với tên `<atomicPrefix><slug>.md` vào `dirAtomic`.

### Application Layer
- **`src/application/services/learning.service.ts`**: Tạo lớp `LearningService` với phương thức `generateDraft(question: string, context: string[]): Promise<DraftNode>`.
- **`src/application/use-cases/ingest-document.use-case.ts`**:
  - Dùng `tokenize` từ `src/core/context-filter.ts` thay thế match regex ASCII ở `query`.
  - Inject `LearningService` và thực hiện luồng sinh draft khi `relevantNodes.length === 0`.

### Presentation Layer
- **`src/presentation/ui/shell-router.ts`**:
  - Quản lý `activeDraft`.
  - Thêm lệnh `/approve-draft` và `/reject-draft` vào danh sách lệnh.
  - Hiển thị draft và hướng dẫn duyệt trong `handleQuery` khi nhận kết quả `status === 'learning'`.
- **`src/presentation/composition-root.ts`**: Khởi tạo `LearningService` và cấu hình DI.

## Verification Plan

### Automated Tests
- Viết unit test cho `LearningService`.
- Chạy `bun test` và `bunx tsc --noEmit`.
