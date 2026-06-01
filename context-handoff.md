# 📑 BIÊN BẢN BÀN GIAO KỸ THUẬT (SESSION HANDOFF)
*(Tái cấu trúc Clean Architecture + UI Enhancement & Graph Healing thành công)*

---

## 1. Trạng thái Hiện tại (Current Status)

*   **Kiến trúc hệ thống mới**:
    - Dự án đã được tái cấu trúc hoàn toàn theo đúng chuẩn **Clean Architecture** (4 layers tách biệt).
    - Toàn bộ class cũ tại `src/models/` và `src/phases/` đã được xoá bỏ hoàn toàn.
    - Code mới chạy type-check xanh 100% (`pnpm tsc --noEmit` pass không lỗi).
*   **Giao diện Shell & CLI Premium**:
    - CLI được lột xác bằng bộ công cụ `@clack/prompts` và `boxen`.
    - **One-shot Readline Shell** hoạt động hoàn hảo, không còn tranh chấp stdin, menu chọn file mượt mà.
    - **Interactive Plan Approval**: Sau phase PLAN, hệ thống tự động hiển thị box plan đẹp mắt và hỏi người dùng bằng phím mũi tên [Approve / Reject / Exit] trực quan, chạy tiếp các phase còn lại ngay lập tức mà không cần thoát CLI.
*   **Verifier - Graph Healing & Auto-Repair (Bất bại)**:
    - Verifier được trang bị tính năng **Tự động vá liên kết hỏng** (Graph Healing) bằng cách tự sinh nốt nguyên tử nháp (placeholder draft) cho các link hỏng phát hiện trong vault.
    - **Vá cấu trúc cây cha-con** (Tree Inconsistency Healing): Tự động sửa YAML frontmatter khi cha thiếu con hoặc con trỏ sai parent.
    - Trả về `0` lỗi sau khi chữa lành giúp pipeline chạy liên tục, không bao giờ bị crash giữa chừng vì lỗi dữ liệu cũ trong vault.

---

## 2. Bản đồ Cấu trúc File mới (Clean Architecture Map)

Tất cả code mới được đặt tại `src/` theo cấu trúc:
- `src/domain/` (Entities & Interfaces độc lập):
  - `entities/`: `source-doc`, `structured-doc`, `atomic-node`, `plan` (chỉ chứa data).
  - `interfaces/`: `file-system`, `llm-provider`, `markdown-generator`.
- `src/application/` (Core Use Cases & Pure Phases):
  - `use-cases/`: `ingest-document.use-case.ts` (State machine + Checkpoint).
  - `phases/`: `mapper`, `reducer`, `planner`, `refiner`, `verifier`, `committer` (pure classes, DI-based).
- `src/infrastructure/` (Hạ tầng cụ thể):
  - `fs/`: `node-file-system.ts` (Implement IFileSystem).
  - `llm/`: `anthropic-sdk`, `anthropic-rest`, `openai`, `gemini`, `mock` (Tương thích Node.js v25 bằng cách loại bỏ parameter properties).
  - `formatters/`: `markdown.generator.ts` (Implement IMarkdownGenerator).
- `src/presentation/` (Giao diện terminal):
  - `cli/`: `commands.ts` (Commander commands run, batch, approve, reject, guide).
  - `ui/`: `file-picker`, `plan-displayer`, `interactive-shell` (`@clack/prompts` wrapper).
  - `composition-root.ts`: Điểm lắp ráp DI container.

---

## 3. Các điểm lưu ý cho Phiên tiếp theo (Key Reminders)

1.  **Chạy Interactive Shell Mode**:
    - Khởi động: `pnpm start` (hoặc `node --experimental-strip-types src/index.ts`).
    - Gõ `run` -> Menu chọn file sẽ hiện ra, dùng phím mũi tên để chọn -> Plan sẽ hiện ra trong khung Boxen cyan -> Chọn `Approve` để chạy tiếp đến khi hoàn tất.
2.  **Các Lệnh CLI Trực tiếp**:
    - `pnpm start run -s <file>`: Chạy trực tiếp.
    - `pnpm start batch --auto-approve`: Chạy batch tự động toàn bộ.
    - `pnpm start guide`: Xem tài liệu hướng dẫn vận hành.
3.  **Tương thích Node.js v25**:
    - Nhắc nhở quan trọng: Node `--experimental-strip-types` (strip-only mode) **không hỗ trợ** TypeScript parameter properties (ví dụ: `constructor(private fs: IFileSystem)`). 
    - Luôn viết tường minh: Khai báo thuộc tính ở trên và gán giá trị `this.fs = fs` trong constructor như hiện tại để không bị lỗi cú pháp khi runtime.

---

## 4. Kế hoạch Hành động Phiên tiếp theo (Next Steps)

1.  **Nạp tiếp Sutta Trung bộ kinh**:
    - Tiến hành nạp các tệp bài kinh `sutta-mn-003.md` tiếp theo bằng Interactive Shell để kiểm tra tính năng đắp thịt (semantic merge) của `Reducer` và `Planner`.
2.  **Giám sát tính năng Graph Healing**:
    - Khi Verifier chạy, xem log terminal để thấy các liên kết hỏng hoặc lỗi cha-con cũ trong vault của bạn được hệ thống tự động vá và khôi phục mượt mà ra sao.
