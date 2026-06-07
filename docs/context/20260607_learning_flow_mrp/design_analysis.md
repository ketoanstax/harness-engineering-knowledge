# Design Analysis: MRP Learning Flow

## 1. Vấn đề hiện tại
- Khi truy vấn (query) một khái niệm bằng tiếng Việt có dấu, do regex tokenizer cũ chỉ lọc ký tự ASCII (`/\b\w+\b/g`), các từ tiếng Việt bị loại bỏ hoặc phân tách không chính xác.
- Nếu không tìm thấy nốt nào khớp (`relevantNodes.length === 0`), hệ thống trả về ngay câu báo lỗi mà không đề xuất hay học khái niệm mới.

## 2. Giải pháp kiến trúc
- **Tách biệt logic**: Tạo `LearningService` trong tầng `Application` để quản lý logic giao tiếp với LLM nhằm đề xuất khái niệm mới.
- **Tránh phụ thuộc vòng**: `LearningService` phụ thuộc vào `INodeRepository` và `ILLMProvider` (Dependency Inversion).
- **Mở rộng UI trong Presentation**: Thêm các lệnh `/approve-draft` và `/reject-draft` trong `shell-router.ts`. Quản lý một biến trạng thái `activeDraft` để lưu tạm thời nốt đang được đề xuất chờ phản hồi.
- **Hiện thực repository**: Thêm phương thức `add(node: DraftNode): Promise<void>` trong `INodeRepository` và triển khai trong `FileSystemNodeRepository` để chuyển đổi nốt nháp thành Markdown nguyên tử và ghi vào thư mục `02_atomic_nodes/`.
